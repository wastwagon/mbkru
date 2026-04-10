# syntax=docker/dockerfile:1
# MBKRU — Next.js standalone + Prisma (Postgres)

# `deps` = full `npm ci` (never touched by `next build`). `builder`’s node_modules can be
# pruned/altered by Next 16 / Turbopack — do NOT copy Prisma CLI hoisted deps from builder.

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
ARG NEXT_PUBLIC_PLATFORM_PHASE=3
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
ARG NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_PLATFORM_PHASE=$NEXT_PUBLIC_PLATFORM_PHASE
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ENV NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=$NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL

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

# Standalone only traces @prisma/client — replace Prisma dirs with full copies from builder.
RUN rm -rf /app/node_modules/.prisma /app/node_modules/@prisma /app/node_modules/prisma

COPY --from=builder /app/prisma ./prisma
# Required for `prisma db seed` — seed command lives in prisma.config.ts (not package.json).
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# prisma.config.ts imports dotenv (devDependency in package.json — present in deps stage).
COPY --from=deps /app/node_modules/dotenv ./node_modules/dotenv

# @prisma/config / prisma CLI — hoisted siblings must come from `deps`, not `builder`
# (Next build can remove them from builder’s node_modules).
COPY --from=deps /app/node_modules/@standard-schema ./node_modules/@standard-schema
COPY --from=deps /app/node_modules/effect ./node_modules/effect
COPY --from=deps /app/node_modules/fast-check ./node_modules/fast-check
COPY --from=deps /app/node_modules/pure-rand ./node_modules/pure-rand
COPY --from=deps /app/node_modules/c12 ./node_modules/c12
COPY --from=deps /app/node_modules/deepmerge-ts ./node_modules/deepmerge-ts
COPY --from=deps /app/node_modules/empathic ./node_modules/empathic
COPY --from=deps /app/node_modules/confbox ./node_modules/confbox
COPY --from=deps /app/node_modules/defu ./node_modules/defu
COPY --from=deps /app/node_modules/destr ./node_modules/destr
COPY --from=deps /app/node_modules/exsolve ./node_modules/exsolve
COPY --from=deps /app/node_modules/giget ./node_modules/giget
COPY --from=deps /app/node_modules/jiti ./node_modules/jiti
COPY --from=deps /app/node_modules/ohash ./node_modules/ohash
COPY --from=deps /app/node_modules/pathe ./node_modules/pathe
COPY --from=deps /app/node_modules/perfect-debounce ./node_modules/perfect-debounce
COPY --from=deps /app/node_modules/pkg-types ./node_modules/pkg-types
COPY --from=deps /app/node_modules/rc9 ./node_modules/rc9
COPY --from=deps /app/node_modules/citty ./node_modules/citty
COPY --from=deps /app/node_modules/consola ./node_modules/consola
COPY --from=deps /app/node_modules/node-fetch-native ./node_modules/node-fetch-native
COPY --from=deps /app/node_modules/nypm ./node_modules/nypm
COPY --from=deps /app/node_modules/tinyexec ./node_modules/tinyexec

# Fail the image build if Prisma CLI cannot load (catches missing hoisted deps early).
RUN cd /app && node -e "require('effect'); require('@prisma/config');"

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app/prisma /app/prisma.config.ts /app/node_modules

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["/app/docker-entrypoint.sh"]
