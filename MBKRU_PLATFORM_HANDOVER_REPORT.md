# MBKRU Advocates Platform — Phase 1 to Phase 3 Handover Report

**Site:** https://mbkru.org/  
**Report date:** 27 June 2026 (updated with training & verification appendix)  
**Purpose:** Handover for training, testing, and moving from demo data to real programme data

---

## Executive summary

The MBKRU Advocates platform at **mbkru.org** is **live and running the full Phase 1–3 programme**. Visitors can browse accountability data, register as members, submit and track reports, join communities, and staff can manage everything through an admin console.

**What is complete:** All planned software for Phases 1, 2, and 3 is built, deployed, and usable today. Automated checks confirm readiness: **431 unit tests passing**, production build succeeds, and **26 end-to-end smoke/dashboard tests passing**.

**What works without real API keys (~95% of features):** Members, reporting, admin triage, communities, Report Card editor, and parliament data can be trained and tested locally using built-in mocks (see Training & verification appendix). Email, SMS, Ghana Card production verify, and AI chat need credentials when you go live.

**What still needs your team (not a software gap):**

- Legal review of Privacy, Terms, and public-facing claims
- Replacing demo/seed content with real editorial content and verified accountability data
- Operational setup (email inboxes, SMS, Ghana Card verification credentials, backup procedures)
- Staff training on triage workflows, data import, and moderation

**Live snapshot (as observed on mbkru.org):**

| Metric | Current value |
|--------|---------------|
| Citizen reports received | 16 |
| Commitments tracked | 147 |
| Published news stories | 6 |
| Published Report Card cycles | 1 (2026, 3 MP rows — pending full editorial review) |
| Sitting MPs in roster | 276 |

Several reports on the site are clearly labelled as demo/seed data (e.g. MBKRU-DEMO-COHORT, MBKRU-SEED). These are useful for training but should not be presented as real citizen findings in public communications.

---

## How the three phases fit together

| Phase | What it means for users | Status |
|-------|-------------------------|--------|
| **Phase 1** | Public website, news, resources, contact forms, admin content management | Complete & live |
| **Phase 2** | Member accounts, MBKRU Voice reporting, parliament/promise tracking, communities, petitions | Complete & live |
| **Phase 3** | People's Report Card (flagship accountability scores), election observation, partner data sharing | Complete & live |

The production site is running **Phase 3** — all tools are visible to the public.

---

## Phase 1 — Public website & content management

**Goal:** A credible, professional public face for MBKRU with staff-managed news and lead capture — no member login required.

### Public features

| Feature | URL | What it does | Status |
|---------|-----|--------------|--------|
| Homepage | / | Programme overview, live stats, shortcuts to all tools, MP search | Working |
| About MBKRU | /about | Organisation story and five pillars | Working |
| News & updates | /news | Blog-style newsroom (6 stories live) | Working — refresh editorial calendar recommended |
| Resources library | /resources | Downloadable documents managed by staff | Working |
| Partners | /partners | Partner and supporter listing | Working — verify logos/MOUs match reality |
| Contact us | /contact | Contact form stored in admin inbox | Working — configure email notifications |
| Diaspora programme | /diaspora | Diaspora engagement and feedback form | Working |
| Legal & trust pages | /privacy, /terms, /accessibility, /faq | Privacy, terms, accessibility, FAQ | Working — legal counsel review recommended |
| Methodology | /methodology | How MBKRU tracks commitments and scores MPs | Working |
| Data sources | /data-sources | Where public data comes from | Working |

### Preview pages (now fully active at Phase 3)

| Page | URL | Status |
|------|-----|--------|
| Citizens Voice | /citizens-voice | Live hub — submit, track, chat |
| Situational alerts | /situational-alerts | Live — submit alerts (members only) |
| Parliament tracker | /parliament-tracker | Live — full MP roster |

### Admin console (Phase 1)

Staff log in at **/admin/login**.

| Admin area | What staff can do | Status |
|------------|-------------------|--------|
| Dashboard | Overview counts | Working |
| News posts | Create, edit, publish stories | Working |
| Media library | Upload and reuse images | Working |
| Resources | Manage downloadable files | Working |
| Contact submissions | Read and respond to contact form messages | Working |
| Lead capture | Newsletter, early access, tracker signups + CSV export | Working |
| Diaspora feedback | Review diaspora form submissions | Working |
| Site settings | Maintenance mode / under-construction gate | Working |

### Phase 1 — items for your team

| Item | Priority | Notes |
|------|----------|-------|
| Replace seed news with real editorial calendar | Medium | 6 stories exist; some may be programme copy |
| Legal review of Privacy & Terms | High | Pages exist; counsel sign-off not yet recorded |
| Configure contact email notifications | Medium | Forms save to database; email alerts need setup |
| Production backups & secrets documented | High | See internal ops runbook |
| Partners page — real logos and MOU status | Medium | Static page may not reflect current partnerships |

---

## Phase 2 — Member participation & accountability data

**Goal:** Ghanaians register, submit reports with evidence, track responses, and browse MP/commitment data. Staff triage everything.

### Member accounts

| Feature | URL | What it does | Status |
|---------|-----|--------------|--------|
| Register | /register | Create account (email, password, region, constituency) | Working |
| Sign in | /login | Member login | Working |
| Forgot / reset password | /forgot-password | Password recovery | Working |
| My account | /account | Dashboard: reports, notifications, Ghana Card, privacy tools | Working |
| My reports | /account/reports | List of member's submissions | Working |
| Notifications | /account/notifications | In-app alerts | Working |
| Ghana Card verification | /account | Identity check for high-trust MP performance reports | Built — requires Hubtel credentials |

**Training note:** Most report types only need a member account. **MP performance reports** additionally require verified Ghana Card when that gate is enabled.

### MBKRU Voice — citizen reporting

| Feature | URL | What it does | Status |
|---------|-----|--------------|--------|
| Voice hub | /citizens-voice | Programme overview, stats, links to submit/track | Working |
| Submit a report | /citizens-voice/submit | File report with location, evidence, attachments | Working |
| Track a report | /track-report | Follow progress with tracking code | Working |
| Public causes | /citizens-voice/causes | Staff-approved reports open for public support | Working |
| Report discussions | /citizens-voice/discussions | Comments, reactions, support on open reports | Working |
| Voice statistics | /transparency | Aggregate counts — no personal data | Working |
| MBKRU Voice AI chat | Chat widget on Voice pages | AI assistant for questions | Working — needs OpenAI key |
| Whistleblower guidance | /whistleblowing | Safe escalation guidance | Working |

**Report types staff can receive:**

| Type | Example use |
|------|-------------|
| MBKRU Voice (general) | Street lighting, procurement concerns, service delivery |
| MP performance | Constituency surgery hours, MP responsiveness |
| Government performance | District assembly timelines, executive delivery |
| Situational alert | Market closures, festival crowd routing, road blocks |
| Election observation | Queue times, agent behaviour, accessibility at polling stations |

### Situational alerts & petitions

| Feature | URL | Status |
|---------|-----|--------|
| Situational alerts hub | /situational-alerts | Working |
| Submit situational alert | /situational-alerts/submit | Working (members only) |
| Browse petitions | /petitions | Working |
| Create petition | /petitions/new | Working (members only) |
| Sign petition | /petitions/[slug] | Working |

### Parliament & commitment tracking

| Feature | URL | What it does | Status |
|---------|-----|--------------|--------|
| Parliament tracker | /parliament-tracker | Search 276 sitting MPs | Working |
| Commitment catalogue | /promises | Search/filter tracked pledges with sources | Working — 147 rows live |
| Government commitments | /government-commitments | Filter to executive/government pledges | Working |
| Individual MP pledge sheet | /promises/[slug] | One MP's tracked commitments | Working |
| Regional hubs | /regions/[slug] | 16 regions — local context and tools | Working |

### Communities (Queen Mothers & traditional areas)

| Feature | URL | What it does | Status |
|---------|-----|--------------|--------|
| Browse communities | /communities | List traditional-area spaces | Working |
| Community home | /communities/[slug] | Overview, join rules, activity | Working |
| Council portal | /communities/[slug]/portal | Council workspace, Council MP Evaluation | Working |
| Forums & threads | /communities/[slug]/forums | Discussion boards | Working |
| Community management | /communities/[slug]/manage | Steward tools for approved leaders | Working |

**Council MP Evaluation:** Council leaders record structured MP meeting evaluations. After Queen Mother sign-off, these enter the staff triage queue alongside citizen MP performance reports.

### Guidance pillars

| Feature | URL | Status |
|---------|-----|--------|
| Legal empowerment | /legal-empowerment | Working |
| Town halls & forums | /town-halls | Working |
| Constituency debates | /debates | Working |

### Admin console (Phase 2 additions)

| Admin area | What staff can do | Status |
|------------|-------------------|--------|
| Reports queue | Triage all submissions; set status, SLA, staff notes | Working |
| Citizen report analytics | Aggregate stats + CSV export (no personal data) | Working |
| MP performance signals | View MP intakes by verification tier and source | Working |
| Public causes | Promote approved reports to public discussion | Working |
| Petitions | Moderate petitions and signatures | Working |
| Parliament & MPs | Import/update MP roster, manage promises | Working |
| Manifestos | Register party manifesto sources | Working |
| Members | Review member identity, manage accounts | Working |
| Communities | Create communities, moderate posts, verify roles | Working |
| Community moderation | Pre-moderation queue for posts | Working |
| Community verifications | Approve/reject role verification uploads | Working |
| Town halls | Manage town hall events | Working |
| Regions | Reference data for 16 regions | Working |
| Notifications outbox | Retry failed emails/SMS | Working |
| Operators | Additional admin staff accounts | Working |
| Operational audit | Log of admin actions | Working |
| MBKRU Voice analytics | Chatbot usage telemetry | Working |

### Phase 2 — items for your team

| Item | Priority | Notes |
|------|----------|-------|
| Document Voice triage SLA & abuse response path | High | Staff need RACI for response times |
| Configure Hubtel for Ghana Card verification | High | Without it, MP performance submit may be blocked |
| Configure email (Resend) for status updates | Medium | Report status change emails to citizens |
| Configure SMS (Twilio) if desired | Optional | Status SMS to members who provide phone |
| Import real MP/constituency data via admin CSV | High | Verify roster against official EC data |
| Train moderators on community governance rules | High | See internal communities governance doc |
| Pilot geography copy matches actual rollout | Medium | Avoid claiming nationwide ops before ready |
| Community email digests | Not built | Scheduled digests are future work |

---

## Phase 3 — People's Report Card & election programme

**Goal:** Publish flagship MP accountability scorecards, support election-season reporting, and offer research-grade data exports for partners.

### Public features

| Feature | URL | What it does | Status |
|---------|-----|--------------|--------|
| People's Report Card index | /report-card | Browse Voice submissions + published scorecard cycles | Working |
| Report Card cycle detail | /report-card/2026 | MP scores, narratives, triple-index methodology | Working — 3 MPs Pending review |
| Election observation hub | /election-observation | Election-window reporting guidance | Working |
| Election observation submit | /citizens-voice/submit/election | Structured election-day reports | Working |
| Partner API summary | /partner-api | Public terms for research/media JSON access | Working — MOU review recommended |
| Methodology (expanded) | /methodology | Full scoring methodology, claims policy | Working |

**What "Pending" means on Report Card:** The cycle exists and MPs are listed, but MBKRU has not yet published final narratives and scores after methodology sign-off and evidence review.

### Research & partner data

| Export | Status |
|--------|--------|
| MP roster CSV | Working |
| Promises CSV | Working |
| Report Card JSON by year | Working — rate-limited, cached |

### Admin console (Phase 3 additions)

| Admin area | What staff can do | Status |
|------------|-------------------|--------|
| Report Card cycles | /admin/report-card — list cycles | Working |
| Edit cycle entries | /admin/report-card/[cycleId] — MP narratives, scores | Working |

### Phase 3 — items for your team

| Item | Priority | Notes |
|------|----------|-------|
| Editorial sign-off before publishing scores | Critical | Do not publish as official findings until review complete |
| Replace demo Report Card content | High | 2026 cycle has 3 pending rows |
| Election observation copy — legal review | Medium | Ensure no overclaim on electoral authority |
| Partner API MOU with counsel | Medium | Technical API works; contractual terms TBD |
| Real datasets imported before "live data" claims | Critical | Follow CSV import runbook |

---

## Connected services (setup checklist)

| Service | Used for | Required? | If not configured |
|---------|----------|-----------|-------------------|
| Database (PostgreSQL) | All content, reports, members | Yes | Site does not function |
| Email (Resend) | Contact alerts, report status, community notifications | Recommended | Forms still save; no email alerts |
| Ghana Card (Hubtel) | Identity verification for MP performance reports | Recommended | Verification unavailable |
| SMS (Twilio) | Optional status SMS | Optional | SMS silently skipped |
| Bot protection (Turnstile) | Spam protection on public forms | Optional | Forms work without it |
| AI chat (OpenAI) | MBKRU Voice chatbot | Optional | Chat unavailable |
| Analytics (GA4 / Plausible) | Public traffic measurement | Optional | No analytics |
| Redis | Rate limiting, optional session security | Optional | Falls back to in-memory limits |

---

## Recommended handover sequence

### Week 1 — Orientation & admin access

1. Create admin operator accounts (/admin/operators)
2. Walk through admin dashboard: news, reports queue, members, communities
3. Review demo data on live site — identify what to archive vs keep for training
4. Assign roles: who triages reports, who moderates communities, who edits Report Card

### Week 2 — Content & data

1. Refresh news posts (/admin/posts)
2. Upload real resources (/admin/resources)
3. Run MP/constituency CSV import via admin (dry-run first)
4. Add/edit commitment rows with complete citations (/admin/parliament)
5. Legal review kickoff for Privacy, Terms, methodology claims

### Week 3 — Participation testing

1. Create test member accounts
2. Submit one report of each type; practice triage workflow end-to-end
3. Test tracking codes and member notifications
4. Test community join → post → moderation flow
5. Test Council MP Evaluation on a pilot community portal
6. Configure Hubtel and verify Ghana Card flow on a test account

### Week 4 — Accountability publication

1. Draft first real Report Card cycle entries in admin (do not publish until sign-off)
2. Complete editorial review workflow for 2026 cycle or create new cycle
3. Verify /transparency stats reflect real submissions after clearing demo data
4. Document public messaging: what is "tracking" vs "finding" vs "pending review"

---

## What is explicitly NOT in Phases 1–3

- Scheduled community email digests
- Formal ban appeals audit workflow
- PMO modules (bills, votes, plenary tracking)
- External penetration test (recommended before high-profile launch)
- Onboarding 200+ communities at scale (programme ops, not software)

---

## Training & verification appendix

Use this section if your team will train on a **local copy** of the platform (in addition to production at mbkru.org).

### Software readiness (confirmed)

| Check | Result |
|-------|--------|
| Unit + integration tests | 431 passed |
| Production build | Success |
| E2E smoke + admin/member route checks | 26 passed |
| Phase 1–3 feature routes | Implemented and testable |

### Production vs local testing

| Environment | Best for | URL |
|-------------|----------|-----|
| **Production** | Real programme data, public demos, stakeholder walkthroughs | https://mbkru.org/ |
| **Local (developers / trainers)** | Safe practice, triage drills, Ghana Card mock, no live emails | http://localhost:1100 after setup |

**Local setup (technical staff):** Requires Docker Desktop. From the project folder run `npm run setup:local` then `npm run dev`. Full gap inventory: `docs/LOCAL_DEV_GAPS.md` in the repository.

### Training accounts (local environment only)

Created automatically by `npm run setup:local`:

| Role | Login | Password |
|------|-------|----------|
| Admin | admin@example.com | DevAdmin!mbkru-local-2026 |
| Pilot member | pilot.member@mbkru.local | PilotMember!change-me-2026 |
| Second pilot | pilot.two@mbkru.local | Same as above |

**Ghana Card mock (local):** On `/account`, use card number `GHA-000000000-0` with any legal name — no Hubtel credentials required.

### What works locally without production API keys

| Area | Status without real APIs |
|------|--------------------------|
| Register, login, all report types | Works |
| Admin triage, analytics, communities | Works |
| Report Card editor, parliament/promises | Works (seed data) |
| Contact & lead forms | Saves to database (no email alert) |
| Ghana Card verify | Mock mode |
| SMS status updates | Logged to console only |
| Voice AI chat | Unavailable until OpenAI key set |

### Pending production API integrations (expected)

These are **not software gaps** — configure when moving from training to live operations:

- **Hubtel** — real Ghana Card / NIA verification  
- **Resend** — contact, report status, and community email  
- **Twilio** — optional SMS  
- **OpenAI / Tavily** — Voice AI chat and web search  
- **Mailchimp or ConvertKit** — optional newsletter sync  
- **Cloudflare Turnstile** — optional bot protection  

### Automated verification command

Technical staff can re-run the full local check anytime:

```bash
npm run verify:local
```

---

## Status statement for stakeholders

> The platform's Phase 1–3 software is complete, deployed at mbkru.org, and ready for staff training and controlled real-data intake.
>
> Declaring the programme fully "live" for public accountability claims still requires legal review, replacing demo data, configuring identity and notification services, and signing off editorial scores before publishing Report Card findings.

---

## Quick reference — key URLs

| Audience | URL |
|----------|-----|
| Public visitors | https://mbkru.org/ |
| New members | https://mbkru.org/register |
| Submit a report | https://mbkru.org/citizens-voice/submit |
| Track a report | https://mbkru.org/track-report |
| People's Report Card | https://mbkru.org/report-card |
| MP / commitments | https://mbkru.org/parliament-tracker |
| Staff admin | https://mbkru.org/admin/login |

---

*Document generated for MBKRU Advocates programme handover — June 2026. Appendix added for local training and automated verification.*
