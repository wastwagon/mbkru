# Local development gaps — inventory & closure status

**Purpose:** What is still open in Phases 1–3, what works locally without real API keys, and how to verify everything on your machine.

**Quick start**

```bash
npm run setup:local    # .env + Docker Postgres/Redis + migrate + seed + API mocks
npm run verify:local   # release gates + Playwright smoke/dashboards
npm run dev            # http://localhost:1100
```

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| **Works locally today** (with `setup:local`) | ~95% of Phase 1–3 features | Train & test |
| **Needs real API keys** (works with mocks locally) | 6 integrations | Configure in staging/prod only |
| **Ops / legal / content** (not code) | 15+ items | Organisation sign-off |
| **Deferred code (Phase 4+)** | 4 items | Not required for handover |

---

## A. Works locally (no real API keys)

These features are **fully testable** after `npm run setup:local`:

### Phase 1 — public site & admin CMS

| Feature | Route | Local status |
|---------|-------|--------------|
| Homepage, About, FAQ, legal pages | `/`, `/about`, `/faq`, … | ✓ |
| News CMS | `/admin/posts`, `/news` | ✓ |
| Resources | `/admin/resources`, `/resources` | ✓ |
| Contact form | `/contact` → `/admin/contact-submissions` | ✓ (saves to DB; no email without Resend) |
| Lead capture | Newsletter, early access, tracker | ✓ |
| Diaspora feedback | `/diaspora/feedback` | ✓ |
| Media library | `/admin/media` | ✓ |
| Site maintenance gate | `/admin/settings` | ✓ |

### Phase 2 — members & Voice

| Feature | Route | Local status |
|---------|-------|--------------|
| Register / login | `/register`, `/login` | ✓ |
| Pilot accounts | `pilot.member@mbkru.local` / `PilotMember!change-me-2026` | ✓ (seeded) |
| Submit Voice report | `/citizens-voice/submit` | ✓ |
| Track report | `/track-report` | ✓ |
| All report kinds | Voice, MP, gov, situational, election | ✓ |
| Ghana Card verify | `/account` | ✓ with **`HUBTEL_GHANA_CARD_MOCK=1`** — use card `GHA-000000000-0` |
| MP performance submit gate | After mock verify | ✓ |
| Public causes & discussions | `/citizens-voice/causes` | ✓ (demo data seeded) |
| Petitions | `/petitions`, `/petitions/new` | ✓ |
| Parliament / promises | `/parliament-tracker`, `/promises` | ✓ (276 MPs + demo pledges) |
| Communities | `/communities`, portal, forums | ✓ (demo communities seeded) |
| Council MP evaluation | `/communities/[slug]/portal` | ✓ |
| Admin reports queue | `/admin/reports` | ✓ |
| Admin analytics | `/admin/analytics/*` | ✓ |
| Member notifications | `/account/notifications` | ✓ (in-app; email/SMS log-only locally) |

### Phase 3 — Report Card & election

| Feature | Route | Local status |
|---------|-------|--------------|
| People's Report Card | `/report-card`, `/report-card/2026` | ✓ |
| Admin Report Card editor | `/admin/report-card` | ✓ |
| Election observation | `/election-observation`, submit flow | ✓ |
| Partner JSON API | `GET /api/report-card/[year]` | ✓ |
| CSV exports | `/api/export/mps-csv`, `promises-csv` | ✓ |

### Automated tests (all passing)

| Check | Command | Status |
|-------|---------|--------|
| Prisma + TypeScript + 431 unit tests | `npm run verify:release-gates` | ✓ |
| Production build | `npm run build` | ✓ |
| E2E smoke + dashboards | `npm run verify:local` | Run after setup |

---

## B. Pending real API integrations (mocked locally)

These are **expected gaps** until production credentials are supplied. Local mocks let you test the UI and workflows anyway.

| Integration | Used for | Local mock | Production env vars |
|-------------|----------|------------|---------------------|
| **Hubtel** | Ghana Card / NIA verify | `HUBTEL_GHANA_CARD_MOCK=1` (auto in setup) | `HUBTEL_CLIENT_ID`, `HUBTEL_CLIENT_SECRET` |
| **Resend** | Contact, report status, community email | Skipped — rows save to DB | `RESEND_API_KEY`, `CONTACT_INBOX_EMAIL` |
| **Twilio** | SMS status updates | `SMS_PROVIDER=log` (auto in setup) | `SMS_PROVIDER=twilio`, `TWILIO_*` |
| **OpenAI** | Voice AI chat, transcribe, TTS | Chat returns 503 | `OPENAI_API_KEY` |
| **Tavily** | Voice web search | Skipped | `TAVILY_API_KEY` |
| **Mailchimp / ConvertKit** | Newsletter ESP sync | Skipped — DB only | `MAILCHIMP_*` or `CONVERTKIT_*` |
| **Cloudflare Turnstile** | Bot protection on forms | Widget hidden when unset | `NEXT_PUBLIC_TURNSTILE_*`, `TURNSTILE_SECRET_KEY` |

**Optional but recommended in staging:** `REDIS_URL` (rate limits), `CRON_SECRET` (cron endpoints — auto-generated locally).

---

## C. Organisation gaps (not fixable in code)

These appear in [`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md) — track with your programme team, not engineering sprints.

| Tier | Item | Owner |
|------|------|-------|
| 0 | Production backups, secrets rotation | Ops |
| 0 | Legal review: Privacy, Terms, Voice disclosures | Counsel |
| 0 | Real accountability data import + editorial sign-off | Editorial + ops |
| 1 | Replace seed news with live calendar | Content |
| 1 | Real resources & partner logos | Content |
| 2 | Voice triage SLA & abuse path documented | Ops |
| 2 | Community governance acknowledged by moderators | Ops |
| 3 | Partner API MOU language | Legal |
| 3 | Election observation copy review | Legal + comms |

---

## D. Deferred software (explicitly out of Phase 1–3 scope)

| Item | Notes |
|------|-------|
| Community email digests | Scheduled batch emails — not built |
| Ban appeals audit table | Baseline ban fields exist; formal appeals workflow not built |
| PMO modules (bills, votes, plenary) | Stretch / separate product |
| Prisma 7 migration | Planned spike, not a launch blocker |
| External penetration test | Recommended before high-profile launch |
| Full Vitest matrix (every route handler) | Partial coverage today; 112 test files pass |

---

## E. Local test walkthrough (manual, ~30 min)

After `npm run setup:local` and `npm run dev`:

1. **Admin** — `/admin/login` → dashboard → open Reports, Members, Communities, Report Card
2. **Member** — login as pilot → `/account` → verify Ghana Card with `GHA-000000000-0` → submit MP performance report
3. **Voice** — submit general Voice report → copy tracking code → `/track-report`
4. **Communities** — browse `/communities` → open portal → submit council MP evaluation (if steward access)
5. **Accountability** — `/parliament-tracker` → search MP → `/promises` → `/report-card/2026`
6. **Cron (optional)** — `curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:1100/api/cron/notifications-outbox`

---

## F. Troubleshooting

| Problem | Fix |
|---------|-----|
| `503 Database not configured` | Run `npm run setup:local`; check `DATABASE_URL` port `55432` |
| `503` on `/login` | Set `MEMBER_SESSION_SECRET` in `.env` (setup-local generates it) |
| Ghana Card verify unavailable | Ensure `HUBTEL_GHANA_CARD_MOCK=1` and **not** `NODE_ENV=production` locally |
| Voice chat does not open | Set `OPENAI_API_KEY` or accept 503 — reporting still works |
| E2E fails | Run `npm run verify:local` (starts its own server on port 1101) |
| Empty `/promises` | Re-seed: `SEED_ACCOUNTABILITY_DEMO=1 npx prisma db seed` |

---

*Last updated: June 2026 — run `npm run verify:local` to refresh automated status.*
