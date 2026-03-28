# syntax=docker/dockerfile:1
# MBKRU — Next.js standalone + Prisma (Postgres)

# Hoisted deps for Prisma CLI (@prisma/config → effect, c12, …) — not all are in Next standalone.
# Pin prisma version to match package-lock "node_modules/prisma".version when you upgrade Prisma.
FROM node:20-alpine AS prisma-cli-deps
WORKDIR /pcd
RUN apk add --no-cache libc6-compat openssl \
  && printf '%s\n' '{"private":true,"dependencies":{"prisma":"6.19.2"}}' > package.json \
  && npm install --omit=dev --ignore-scripts

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
# postinstall runs `prisma generate` — schema must exist before npm ci
COPY prisma ./prisma
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SITE_URL=https://mbkruadvocates.org
ARG NEXT_PUBLIC_PLATFORM_PHASE=1
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_PLATFORM_PHASE=$NEXT_PUBLIC_PLATFORM_PHASE

# Prisma generate runs via npm run build (postinstall also generates).
# Do not use Compose/runtime DATABASE_URL here — host `postgres` is unreachable during `docker build`.
RUN DATABASE_URL="" npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Standalone only traces @prisma/client — merging COPY can leave a broken tree and
# `Cannot find module '@prisma/engines'` for migrate/seed. Replace Prisma dirs wholesale.
RUN rm -rf /app/node_modules/.prisma /app/node_modules/@prisma /app/node_modules/prisma

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Merge Prisma CLI hoisted deps (effect, c12, …). Always overwrite by name.
# Use COPY + RUN (not RUN --mount=from=…): some builders resolve that mount to an empty dir,
# so nothing merged and `require('effect')` from @prisma/config still failed.
# Do not replace @prisma / prisma / .prisma / bcryptjs (those come from the builder + COPY above).
COPY --from=prisma-cli-deps /pcd/node_modules /tmp/pcm
RUN sh -euc 'cd /tmp/pcm && for p in *; do \
      [ -d "$$p" ] || continue; \
      case "$$p" in @prisma|prisma|.prisma|bcryptjs) continue ;; esac; \
      rm -rf "/app/node_modules/$$p" && cp -a "$$p" /app/node_modules/; \
    done' \
  && rm -rf /tmp/pcm

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app/prisma /app/node_modules

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["/app/docker-entrypoint.sh"]
