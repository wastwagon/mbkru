# MBKRU Advocates - Training Team Handbook

**Platform:** https://mbkru.org/ 
**Document type:** Staff training & programme handover guide (complete feature set) 
**Audience:** Training facilitators, programme operators, community stewards, diaspora ambassadors, new staff 
**Version:** 2.2.2 - July 2026 
**Language of training & chatbot assistance:** **English only** (no translation) 
**Related:** `MBKRU_PLATFORM_HANDOVER_REPORT.md`, `/methodology`, `docs/SECURITY_CHECKLIST.md`, `docs/COMMUNITIES_PUBLIC_GOVERNANCE.md`, `docs/CSV_IMPORT_RUNBOOK.md`, `docs/VOICE_AND_ACCESSIBILITY_GUIDE.md`, `docs/MBKRU_Diaspora_Programme_Integration.pdf`

---

## Document control & leftovers cleanup (v2.2)

| Change | Detail |
|--------|--------|
| Registration | **Ghana Card removed** from registration training - do not teach it as a join step |
| Ghana Card (account) | Optional verify may still appear on `/account`; can gate **MP performance** submit when Hubtel is configured - train as optional/advanced, not registration |
| MBKRU Voice chatbot | Site-wide assistant; **training demos in English only**; product may still show a language control - do not promise multilingual translation |
| Chatbot availability | Works with OpenAI when configured; **FAQ fallback** still answers without API keys |
| Report Card verification | **Public filter live:** Verified / Unverified / All on `/report-card` Voice browse (and regional hubs). Staff set tiers in admin |
| Platform accuracy | **Section 20 audit** - handbook claims checked against frontend, backend, and admin |
| Platform security | **Section 16** - trainer talking points |
| Scope | Full Phase 1-3 feature handover |

---

## How to use this handbook

| If you are... | Start with... |
|-------------|-------------|
| New trainer | Sections 1-2, then modules in order |
| Checking "is this really live?" | **Section 20 Platform accuracy audit** |
| Running a lab | Appendix A (URLs) + Appendix B (drills) |
| Onboarding Queen Mothers | Section 8 Communities |
| Onboarding diaspora ambassadors | Section 12 Diaspora |
| Editorial / accountability staff | Sections 9-11 (incl. verified report filters) |
| Support / front-line staff | Section 5 MBKRU Voice chatbot + Section 4 Voice reports |

---

## Table of contents

1. Platform overview 
2. Who uses the platform (roles) 
3. Member registration & sign-in 
4. MBKRU Voice - citizen reports 
5. **MBKRU Voice chatbot (English assistant)** 
6. Petitions & other public forms 
7. Situational alerts & election observation 
8. Communities & Queen Mother council portal 
9. Parliament tracker - MPs roster 
10. Promises & government tracker 
11. People's Report Card - scorecard methodology 
12. Diaspora programme 
13. Public content, guidance & regional hubs 
14. Member account, notifications & privacy 
15. Staff admin console - full operations map 
16. **Platform security (trainer talking points)** 
17. Trust, safety & boundaries 
18. Suggested training curriculum 
19. Complete feature checklist (leave nothing out) 
20. **Platform accuracy audit (UI / backend / admin)** 
21. Appendices 

---

## 1. Platform overview

### 1.1 What MBKRU Advocates is

**MBKRU Advocates** is Ghana's civic accountability and citizen engagement platform. It helps citizens, traditional leaders, diaspora supporters, researchers, and programme staff to:

- Monitor **MPs** and **government commitments** with cited evidence 
- Submit and track **citizen reports** (MBKRU Voice) 
- Get **English-language assistance** from the **MBKRU Voice chatbot** on how to use the platform 
- Run and sign **petitions** 
- Participate in **community spaces** (including Queen Mother councils) 
- Publish a transparent **People's Report Card** 
- Support **diaspora** engagement with official signposting and feedback 

MBKRU is **evidence-led** and **non-partisan**. It is **not** the Electoral Commission, Parliament, a court, CHRAJ, the police, NIA, or a law firm.

### 1.2 Programme phases (all live)

| Phase | What users see | Status |
|-------|----------------|--------|
| **Phase 1** | Public website, news, resources, partners, contact, diaspora hub | Live |
| **Phase 2** | Members, Voice reporting, chatbot, petitions, parliament/promises, communities | Live |
| **Phase 3** | People's Report Card, election observation, partner data access | Live |

Production: **https://mbkru.org/** runs the full Phase 1-3 programme.

### 1.3 Platform map (teach first)

```text
PUBLIC                         MEMBER                            STAFF ADMIN
-------------------------      -----------------------------     -----------------------------
Home / About / News            Register and login                Content CMS
Resources / Partners / Contact Submit and track reports          Reports triage
Methodology / Data sources     MBKRU Voice chatbot (English)     Voice analytics
Parliamentarians tracker       Petitions                         Petitions
Promises / Government tracker  Communities and forums            Parliament and promises
People's Report Card           Council portal (leaders)          Report Card editor
Diaspora hub and feedback      My account and notifications      Communities and verifications
Town halls / Debates / Regions Privacy export / delete           Diaspora feedback inbox
Whistleblowing / Legal         Accessibility assistive tools     Operators, audit, settings
Transparency (Voice stats)                                       Notification outbox
```

### 1.4 One-sentence pitch for trainers

> MBKRU gives Ghanaians a trusted place to ask for help in English, report what they experience, follow commitments with evidence, organise in communities, and see MP accountability scores - without replacing official institutions.

---

## 2. Who uses the platform (roles)

| Actor | Login? | What they can do |
|-------|--------|------------------|
| **Public visitor** | No | Browse all public pages; use **MBKRU Voice chatbot**; track reports with a code; sign some petitions |
| **Member (citizen)** | `/login` | Reports, petitions, communities, account |
| **Community member** | Yes + membership | Forums (subject to moderation) |
| **Community moderator** | Yes + role | Approve joins, moderate posts, manage members |
| **Queen Mother (verified)** | Yes + verified role | Moderator tools + **sign Council MP Evaluations** |
| **Admin / operator** | `/admin/login` | Full staff console (**separate** from member login) |
| **MP** | No login | Appears as data only |
| **Diaspora supporter** | No special role | Public pages + optional member account |

**Critical:** `/login` is not the same as `/admin/login`.

---

## 3. Member registration & sign-in

### 3.1 Registration policy (current)

| Item | Rule |
|------|------|
| **Ghana Card at registration** | **Not used. Do not teach it.** |
| Required | Email, password (at least 8 characters), confirm password, **region** |
| Optional | Display name, constituency |
| After success | Redirect to `/account` (or intended next page) |

### 3.2 Register - steps

1. Open https://mbkru.org/register 
2. Enter email 
3. Create and confirm password 
4. Optional display name 
5. Select **region** (required) 
6. Optional constituency 
7. Submit -> land on **My Account**

### 3.3 Sign-in & recovery

| Action | URL |
|--------|-----|
| Sign in | `/login` |
| Forgot password | `/forgot-password` |
| My account | `/account` |
| My reports | `/account/reports` |
| Notifications | `/account/notifications` |

### 3.4 Identity messaging for trainers

- Joining MBKRU **does not** require Ghana Card. 
- Official **NIA Ghana Card** guidance for diaspora lives on `/diaspora` as **government signposting**, not as MBKRU registration. 
- **Optional:** `/account` may still offer Ghana Card verify for programme trust features. When Hubtel is configured, **MP performance** report submit can require a verified card - other report types do not. 
- Do not revive old training slides that list Ghana Card as a **registration** field.

---

## 4. MBKRU Voice - citizen reports

### 4.1 What Voice reporting is

Citizen reporting channel with evidence and tracking. Staff triage. Approved items may become public **causes**.

| Page | URL |
|------|-----|
| Hub | `/citizens-voice` |
| Submit | `/citizens-voice/submit` |
| Election submit | `/citizens-voice/submit/election` |
| Track | `/track-report` |
| Public causes | `/citizens-voice/causes` |
| Discussion (per report) | `/citizens-voice/discussions/[reportId]` - **no standalone discussions index** |
| Transparency stats | `/transparency` |

### 4.2 Report types (teach all five)

| Type | Example | Notes |
|------|---------|-------|
| MBKRU Voice (general) | Street lighting, procurement, service delivery | Member account |
| MP performance | Surgery hours, responsiveness, casework | May require Ghana Card on account when Hubtel is on |
| Government performance | Assembly timelines, executive delivery | Member account |
| Situational alert | Market closures, road blocks | Member account |
| Election observation | Queue times, accessibility | Phase 3 feature flag |

### 4.3 Submit a report - steps

1. Sign in 
2. Go to `/citizens-voice/submit` 
3. Choose report type 
4. Complete title, description, location, related MP/institution if relevant, attachments 
5. Submit and **save the tracking code** 
6. Confirm under **My Account -> Reports**

### 4.4 Track a report

1. Open `/track-report` 
2. Enter tracking code 
3. Read status 

| Status | Meaning |
|--------|---------|
| RECEIVED | Logged |
| UNDER_REVIEW | Staff assessing |
| ESCALATED | Further action |
| CLOSED | Complete |
| ARCHIVED | Retained, not active |

### 4.5 Staff triage

Admin: `/admin/reports`

1. Open queue -> read submission + attachments 
2. Assess credibility / safety / duplicates 
3. Update status + staff notes 
4. Promote suitable items to **public causes** 
5. Monitor `/admin/analytics/citizen-reports` and MP performance signals 

**Council evaluations** (Queen Mother sign-off) arrive as intake source **Council evaluation**.

### 4.6 Public causes & discussions

- Staff promote approved reports to `/citizens-voice/causes` 
- Public can discuss on discussion pages with comments and reactions (Like / Thank / Insight) 
- Do not publish personal data from private reports without policy consent 

---

## 5. MBKRU Voice chatbot (English assistant)

> **Training standard:** Demos and answers for this handover are **English only**. The assistant answers **relevant questions** about using MBKRU. It is **not a translation service**. If the product UI still shows a language control, trainers should leave it on **English (Ghana)** and not teach multilingual translation as a programme promise.

### 5.1 What it is

**MBKRU Voice** is the always-available floating chat assistant on the public site (site-wide launcher). It helps visitors and members find the right page, understand how to report, track commitments, join communities, use diaspora signposting, and navigate the platform safely.

It is **guidance**, not legal advice, emergency response, or an official government desk.

### 5.2 Where to find it

| Entry point | How |
|-------------|-----|
| Floating **MBKRU Voice** button | Bottom of most public pages |
| Citizens Voice page CTA | "Open MBKRU Voice chat" |
| Mobile / header Voice control | Opens the same chat panel |
| Accessibility tools | Can hand a spoken transcript into the chat |

### 5.3 What it can help with (relevant questions)

Train staff to steer users toward these topics:

| Topic | Example user question | Typical help |
|-------|----------------------|--------------|
| Reporting | "How do I submit a report?" | Links to Citizens Voice / submit / track |
| Petitions | "How do I start a petition?" | Browse / create petition links |
| Accountability | "Where do I see MP promises?" | Promises, government tracker, parliament, Report Card |
| Communities | "How do I join a Queen Mother community?" | Communities / town halls |
| Diaspora | "I live abroad - where do I start?" | Diaspora hub + official .gov.gh signposting |
| Contact / policy | "How do I contact MBKRU?" | Contact, FAQ, data sources, privacy |

### 5.4 What it must not do (teach this)

| Do not | Instead |
|--------|---------|
| Translate pages or chat into other languages (training scope) | Answer in **English** |
| Give legal strategy or litigation advice | Point to `/legal-empowerment` and qualified professionals |
| Give emergency / crisis / violence instructions | Direct to local emergency services + `/whistleblowing` / `/contact` |
| Issue Ghana Cards, passports, or book missions | Signpost to NIA / MFA / GIS via `/diaspora` |
| Invent election results or court findings | Point to methodology and official sources |
| Replace staff triage of reports | Guide the user to submit / track correctly |

### 5.5 How the assistant works (for trainers)

1. User opens chat and types a question in **English** 
2. Safety guardrails check for emergency / self-harm / legal-strategy prompts 
3. When OpenAI is configured, the assistant uses site knowledge (and optional web search if enabled) to answer 
4. When OpenAI is not configured, **built-in FAQ / intent fallbacks** still reply with useful English guidance and links 
5. Replies may include **suggested links** to the right MBKRU pages 
6. Optional: attach image / `.txt` / PDF for context; optional read-aloud of replies (assistive) 

### 5.6 Features to demonstrate in training

| Feature | Trainer note |
|---------|----------------|
| Text Q&A | Keep demo questions in English |
| Suggested links | Click through to prove navigation help |
| Quick prompts | Use for first-time users |
| Clear chat | Reset between trainee demos |
| Attachments (image / text / PDF) | Optional - for interpreting evidence context, not for filing a formal report |
| "Search the web" (if enabled) | Optional live context; still not official government advice |
| Fallback mode | Unplug / unset API key in staging to show FAQ still works |
| Rate limiting | Rapid spam may return "too many requests" |

### 5.7 Staff analytics

| Admin page | Purpose |
|------------|---------|
| `/admin/analytics/mbkru-voice` | Chatbot usage summary |
| `/admin/analytics/mbkru-voice/events` | Raw telemetry event log |
| Export | CSV/JSON export from analytics tools |

### 5.8 Chatbot practice script (lab)

1. Open mbkru.org -> open **MBKRU Voice** 
2. Ask: "How do I submit a citizen report?" -> follow suggested link 
3. Ask: "Where can I track government commitments?" 
4. Ask: "I am in the diaspora - how do I get Ghana Card help?" -> confirm it **signposts**, does not process ID 
5. Ask a legal-strategy style question -> confirm safe refusal + Legal empowerment link 
6. Clear chat and repeat with a second trainee 

---

## 6. Petitions & other public forms

### 6.1 Petitions

| Action | Who | URL |
|--------|-----|-----|
| Browse | Anyone | `/petitions` |
| Create | Members | `/petitions/new` |
| Sign | Anyone (guest may confirm email) | `/petitions/[slug]` |
| Moderate | Staff | `/admin/petitions` |

**Create:** sign in -> `/petitions/new` -> title, problem, ask -> submit -> share link. 
**Sign:** open petition -> complete form -> confirm email if prompted. 
**Admin:** moderate visibility/status; review pending signature analytics.

### 6.2 Other forms

| Form | URL | Admin inbox |
|------|-----|-------------|
| Contact | `/contact` | Contact submissions |
| Newsletter / early access / tracker signup | Site CTAs | Lead capture |
| Diaspora feedback | `/diaspora/feedback` | Diaspora feedback |
| Community verification upload | Community membership panel | Community verifications |
| Report attachments | Voice submit | Attached to report |

Always show the **citizen -> admin inbox -> response** loop.

---

## 7. Situational alerts & election observation

### 7.1 Situational alerts

- Hub: `/situational-alerts` 
- Submit: `/situational-alerts/submit` (members) 
- Time-sensitive local situations; triaged with Voice reports 

### 7.2 Election observation

- Hub: `/election-observation` 
- Structured submit: `/citizens-voice/submit/election` 
- Observe process and accessibility - **do not** declare winners or act as EC 

---

## 8. Communities & Queen Mother council portal

### 8.1 What a community is

Bounded space (often traditional area / geography) for announcements, forums, concerns, and council workspace. **Not** a replacement for courts, police, CHRAJ, or customary dispute processes outside the platform.

### 8.2 Admin - register a community

**Path:** `/admin/communities`

1. Admin login 
2. Create community with: slug, name, description, region, traditional area, visibility (`PUBLIC` / `MEMBERS_ONLY`), join policy (`OPEN` / `APPROVAL_REQUIRED`) 
3. Starts as **DRAFT** 
4. **Activate** -> **ACTIVE** when ready 
5. Only **ACTIVE + PUBLIC** appear in the public directory 

Also: provision stewards, set default MP if used, review verifications (`/admin/community-verifications`), moderate posts (`/admin/communities/moderation`), handle post reports (`/admin/community-reports`).

### 8.3 Users join - steps & benefits

1. Browse `/communities` 
2. Open `/communities/[slug]` 
3. Sign in / register 
4. Join now (**OPEN**) or request (**APPROVAL_REQUIRED**) 
5. Use forums; leaders use portal / manage 

**Benefits:** local moderated discussion; announcements & concerns; reply notifications; path to traditional-role verification; council MP evaluations feeding programme accountability.

### 8.4 Queen Mother / council portal

**URL:** `/communities/[slug]/portal`

| Area | Purpose |
|------|---------|
| Concerns | Council issue capture |
| Announcements | Leadership communications |
| Council discussion | Internal conversation |
| Presence | Who is active |
| Membership | Join / verification |
| **Council MP Evaluation** | Structured MP meeting evaluation |

**Evaluation path:** draft -> Queen Mother **sign-off** -> Citizen Report (Council evaluation) -> `/admin/reports`.

**Manage:** `/communities/[slug]/manage` - approve joins, roles, bans, moderate posts.

### 8.5 Forum vocabulary

Forum -> Thread -> Reply / Pending (awaiting moderation) / Locked forum 

---

## 9. Parliament tracker - MPs roster

### 9.1 Public

- `/parliament-tracker` - search sitting MPs 
- `/regions/[slug]` - regional hubs 

### 9.2 Staff load MPs

Admin: `/admin/parliament`

1. Ensure regions exist 
2. Import constituencies CSV first 
3. **Dry-run reconcile** MP CSV 
4. Review creates / updates / errors 
5. Import MP CSV 
6. Spot-check public tracker 

MP CSV headers: `name,slug,role,party,constituency_slug,active` 
Detail: `docs/CSV_IMPORT_RUNBOOK.md`, `docs/DATA_SOURCES.md`.

---

## 10. Promises & government tracker

### 10.1 Public views

| Page | Shows |
|------|--------|
| `/promises` / browse | Tracked pledges |
| `/promises/[slug]` | One promise / MP pledge sheet |
| `/government-commitments` | Government programme filter |

Statuses: TRACKING / IN_PROGRESS / FULFILLED / BROKEN / DEFERRED / BLOCKED 

### 10.2 Staff upload / edit promises

1. `/admin/parliament` -> select MP 
2. Create promise with title, source/citation, government-programme flag, status 
3. Update status + evidence over time 
4. Confirm on public catalogue 

**Rule:** Citizen reports illustrate problems; they do **not alone** mark a promise fulfilled.

### 10.3 Manifestos & exports

- Admin -> Manifestos for source registry 
- Exports: MPs CSV, promises CSV 
- Partner API summary: `/partner-api` 

---

## 11. People's Report Card - scorecard methodology

### 11.1 Public pages

- `/report-card` / `/report-card/[year]` / `/methodology` / `/data-sources` 

**Two browse tabs on `/report-card` (when both are enabled):**

| Tab | What users see | Filters |
|-----|----------------|---------|
| **Voice submissions** | Citizen reports feeding accountability | Region, report type, **Verification (All / Verified / Unverified)**, title search |
| **Programme scores** | Published MP scorecard rows | Year, region, search |

### 11.1a Verified vs unverified reports (live)

Staff set an **experience verification tier** on each report in `/admin/reports/[id]`:

| Staff tier | Public label |
|------------|--------------|
| UNVERIFIED (default) | **Unverified** |
| CORROBORATED | **Verified** |
| DOCUMENTED | **Verified** |

Council MP evaluations signed by a Queen Mother typically enter the queue already **CORROBORATED** (shown as Verified).

**Public filter (train this):** On the Report Card Voice tab (and regional hubs), users choose:

1. **All reports** 
2. **Verified only** - staff-corroborated or documented 
3. **Unverified only** - not yet corroborated 

Cards show a **Verified** or **Unverified** badge. Index C of the scorecard methodology remains an **editorial** use of citizen experience - publishing MP scores is still a staff Report Card workflow, separate from the public Voice browse filter.

### 11.2 Triple index (Ghana v1)

| Index | Focus | Weight |
|-------|--------|--------|
| A - Legislative duty | Official parliamentary record | ~50% |
| B - Constituency representation | Reachability, casework pathways, documented transparency | ~35% |
| C - Citizen-verified experience | Triaged Voice / council signal (capped) | ~15% |

Evidence ladder: Tier A official -> Tier B secondary -> Tier C moderated citizen experience.

### 11.3 Government tracker vs Report Card

| Product | Focus |
|---------|--------|
| Report Card | MP as legislator / representative |
| Government tracker | Programme / manifesto commitments with evidence |

### 11.4 Publish process (staff)

1. `/admin/report-card` - create cycle 
2. Edit MP narratives + scores 
3. Editorial + methodology review 
4. Optional dispute window for official-data facts 
5. Publish only after sign-off 
6. Verify public page 

**"Pending"** is not final findings.

---

## 12. Diaspora programme

### 12.1 Overview

Hub `/diaspora` helps Ghanaians abroad and returnees with:

1. Signposting to official channels (NIA, passport, nationality) 
2. Accountability collaboration (commitments, petitions, feedback) 
3. Structured diaspora feedback (`/diaspora/feedback`) 

Admin review: `/admin/diaspora-feedback` 
Context: "17th Region" news briefing 

**MBKRU does not** replace embassies, NIA, GIS, MFA, or lawyers.

### 12.2 How diaspora access the platform

No special diaspora login. Use public site; register as member for Voice/petitions/communities.

| Need | Path |
|------|------|
| ID / passport / nationality guidance | `/diaspora` -> official links |
| Track government commitments | `/government-commitments` |
| Petitions | `/petitions` |
| Feedback | `/diaspora/feedback` |
| Civic reports | Register -> Voice submit |
| Ask "how do I...?" | **MBKRU Voice chatbot (English)** |
| Partners | `/partners`, `/contact` |

### 12.3 Benefits

- Official signposting (avoid unofficial "agents") 
- Same transparency tools as residents 
- Amplify petitions; structured feedback into the programme 
- Optional full member participation 
- Non-partisan engagement with Ghana's accountability agenda 

---

## 13. Public content, guidance & regional hubs

Trainers should walk these even if not "transactional":

| Area | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Programme overview, stats, shortcuts |
| About | `/about` | Organisation & pillars |
| News | `/news` | Editorial updates |
| Resources | `/resources` | Downloadable documents |
| Partners | `/partners` | Partners & collaboration |
| Contact | `/contact` | Enquiries |
| FAQ | `/faq` | Common questions |
| Privacy / Terms / Accessibility | `/privacy`, `/terms`, `/accessibility` | Trust pages |
| Methodology | `/methodology` | How scoring & tracking work |
| Data sources | `/data-sources` | Where data comes from |
| Legal empowerment | `/legal-empowerment` | Signposting (not legal advice) |
| Whistleblowing | `/whistleblowing` | Safe escalation guidance |
| Town halls | `/town-halls` | Programme events / forums |
| Debates | `/debates` | Constituency debate surface |
| Regions | `/regions/[slug]` | 16 regional hubs |
| Partner API | `/partner-api` | Research/media data terms |
| Transparency | `/transparency` | Aggregate Voice statistics |

### 13.1 Accessibility assistive tools (related to Voice)

Floating accessibility controls can: read page summary, read selection, speech-to-text, hand transcript to chatbot, adjust speech rate.

**Training note:** Demonstrations and chatbot answers for this handover remain **English**. Do not present translation of the site or chatbot replies as a trained programme capability.

---

## 14. Member account, notifications & privacy

| Feature | URL / location | Notes |
|---------|----------------|-------|
| Account home | `/account` | Reports, explore links, status |
| My reports | `/account/reports` | Personal submissions |
| Notifications | `/account/notifications` | In-app alerts (replies, status, community) |
| Password recovery | `/forgot-password` | Needs email configured to deliver |
| Privacy export / delete | Account privacy tools | Support staff must know the path |
| Email / SMS outbox | Admin notifications | Status updates when Resend/Twilio configured |

---

## 15. Staff admin console - full operations map

**Login:** `/admin/login` / Operators: `/admin/operators` / Audit: `/admin/operational-audit`

| Group | Areas |
|-------|--------|
| **Overview** | Dashboard |
| **Content** | News posts, media library, resources, manifestos, partners & leadership |
| **Voice & inbound** | Citizen reports, report analytics, MP performance signals, MBKRU Voice analytics & event log, petitions, petition pending analytics, public causes, contact, leads, diaspora feedback |
| **Accountability** | Parliament & promises, Report Card, town halls |
| **Communities** | Communities, post moderation, community reports, verifications, members |
| **System** | Operators, regions, notification outbox, operational audit, site settings (maintenance) |

### Daily operator checklist

- [ ] Triage new citizen reports 
- [ ] Petitions moderation 
- [ ] Community posts & verifications 
- [ ] Contact + diaspora feedback inboxes 
- [ ] Notification outbox stuck jobs 
- [ ] Spot-check public pages after publishes 
- [ ] (Weekly) Review MBKRU Voice analytics for friction themes 

---

## 16. Platform security (trainer talking points)

> **Trainer message:** MBKRU was built with **enterprise-grade security controls** across login, forms, admin, uploads, and public APIs. You can tell cohorts - with confidence - that the platform is **secure by design**: separate staff and citizen sessions, hardened cookies, rate limits, bot protection, validated inputs, private evidence storage, audit trails, and modern browser security headers on every page.

### 16.1 One-minute pitch (memorise this)

> "MBKRU protects citizens and staff with layered security. Member and admin logins are completely separate. Passwords are hashed, sessions use secure httpOnly cookies, public forms are rate-limited and can use bot protection, every API input is validated, report attachments are stored privately with size and type limits, and the site ships with strong security headers (including HTTPS enforcement and clickjacking protection). Sensitive admin actions can be audited. The chatbot and Voice tools also refuse unsafe emergency or legal-strategy prompts."

### 16.2 Security controls trainers should explain

| Layer | What is in place | Plain-language line for trainees |
|-------|------------------|----------------------------------|
| **Separate login worlds** | Member `/login` and staff `/admin/login` use **different session secrets** | Staff access cannot be confused with a citizen account |
| **Strong passwords** | Passwords stored with **bcrypt hashing** (never plain text) | Even database staff cannot "read" your password |
| **Secure sessions** | Cookies are **httpOnly**, **Secure** in production, **SameSite=lax** | Scripts in the browser cannot steal your session cookie easily |
| **Admin lock-down** | Admin routes require a **valid admin session**; login is **rate-limited** | Brute-force guessing of staff passwords is throttled |
| **Bot & abuse protection** | **Rate limits** on contact, auth, reports, chatbot, partner reads; optional **Cloudflare Turnstile** | Spammers and scrapers are slowed or blocked |
| **Input validation** | **Zod** schemas on JSON bodies; **Prisma** parameterized queries (no raw user SQL) | Classic injection-style attacks are designed out |
| **Upload safety** | Report / media uploads respect **size and MIME limits**; private storage paths are sanitised | Evidence files cannot be arbitrary malware dumps |
| **Privacy of presence** | Peer display names on hubs/presence only when the viewer is **signed in** | Guests do not get a free list of who is online by name |
| **Privacy tools** | Members can **export** or **delete** account data (with safeguards) | Users keep control of their personal data |
| **Chatbot safety** | Guardrails block emergency / self-harm / legal-strategy prompts | The assistant will not give dangerous advice |
| **Browser hardening** | Global headers: **CSP**, **HSTS**, **X-Frame-Options**, and related protections | Pages resist clickjacking and force HTTPS in production |
| **Operational audit** | Sensitive admin actions can be reviewed in **Operational audit** | Programme can see who did what in the staff console |
| **Notification outbox** | Email/SMS jobs are queued and retryable - not ad-hoc scripts | Delivery is controlled and observable |

### 16.3 What "secure" means for each audience

| Audience | Reassure them that... |
|----------|----------------------|
| **Citizens / members** | Their login is protected; reports and attachments are handled under programme controls; tracking codes do not expose other people's data |
| **Queen Mothers / stewards** | Community manage tools require verified membership roles; moderation and bans are intentional leadership actions, not open to every joiner |
| **Diaspora users** | Feedback and forms are rate-limited; MBKRU signposts official .gov.gh sites and does not harvest passport/ID processing |
| **Staff / admins** | Admin is a closed surface; operators are managed deliberately; heavy exports are rate-limited per session |
| **Partners / media** | Public partner reads are rate-limited; research exports follow programme access rules |

### 16.4 Demo script for the security module (10-15 min)

1. Show member login vs admin login URLs - emphasise **two different doors**. 
2. In browser DevTools (trainer only), show a session cookie flagged **HttpOnly** (and Secure on production). 
3. Submit the contact or chatbot form rapidly in staging to show **rate limiting** if configured. 
4. Open `/admin/operational-audit` (staff) and explain that sensitive actions leave a trail. 
5. Ask the chatbot a legal-strategy or crisis-style question and show the **safe refusal**. 
6. Point to `/privacy` and account privacy tools - security includes **user rights**, not only locks. 
7. Close with: "Security is layered - no single control does everything; MBKRU stacks many controls together."

### 16.5 Trainer do's and don'ts

| Do | Don't |
|----|-------|
| Say the platform is **built with strong, layered security** suitable for civic data | Claim MBKRU is "unhackable" or that no further review will ever be needed |
| Name concrete controls (separate sessions, hashing, rate limits, headers, audit) | Share production secrets, admin passwords, or API keys in class |
| Point trainees to `/privacy` and safe reporting habits | Ask trainees to paste real national ID numbers into chat or demos |
| Encourage strong unique passwords and logging out on shared devices | Use the same password for admin and personal email in demos |

### 16.6 Related ops documents (for advanced trainers)

- `docs/SECURITY_CHECKLIST.md` - living release / quarterly security checklist 
- `docs/OPS_RUNBOOK.md` - production operations 
- `docs/ARCHITECTURE.md` - how systems fit together 

---

## 17. Trust, safety & boundaries

| MBKRU does | MBKRU does not |
|------------|----------------|
| Host moderated citizen reports | Replace police / CHRAJ / courts |
| Answer relevant questions in English via chatbot | Act as translator or emergency desk |
| Track commitments with citations | Declare election winners |
| Publish methodology-based scores | Issue legal rulings or national IDs |
| Signpost diaspora to official sites | Provide immigration legal advice |
| Support traditional council digital workspace | Replace customary dispute forums entirely |
| Protect accounts, forms, and admin with layered security | Replace users' own password hygiene or device safety |

Demo/seed content must never be presented as real citizen findings in public communications.

---

## 18. Suggested training curriculum

| Week | Focus | Outcomes |
|------|--------|----------|
| **1** | Overview, roles, registration (no Ghana Card), **security pitch**, **MBKRU Voice chatbot English lab** | Register; explain security layers; use chatbot; admin accounts |
| **2** | Voice reports, causes, petitions, contact, diaspora feedback | One of each form + triage |
| **3** | Communities, portal, Queen Mother evaluation | Pilot community end-to-end |
| **4** | MPs CSV, promises, government tracker, Report Card draft | Sample promise + draft scorecard (no premature publish) |

### Half-day agenda

1. Platform story & roles - 25 min 
2. Registration lab - 15 min 
3. **Platform security talking points + mini-demo** - 15 min 
4. **MBKRU Voice chatbot lab (English)** - 30 min 
5. Voice reports + tracking - 40 min 
6. Petitions & forms - 25 min 
7. Communities & Queen Mother portal - 50 min 
8. Parliament / promises / government tracker - 40 min 
9. Scorecard methodology - 40 min 
10. Diaspora programme - 25 min 
11. Admin ops, analytics, trust boundaries - 25 min 
12. Assessment drill - 20 min 

---

## 19. Complete feature checklist (leave nothing out)

Use this as the master "have we trained it?" list:

- [ ] Homepage, About, News, Resources, Partners, Contact, FAQ 
- [ ] Privacy, Terms, Accessibility 
- [ ] Member register / login / forgot password / account / reports / notifications / privacy tools 
- [ ] **MBKRU Voice chatbot (English Q&A, links, fallback, guardrails, analytics)** 
- [ ] Accessibility assistive panel (read / dictate - English demos) 
- [ ] Citizens Voice hub, submit (all kinds), track, causes, discussions, transparency 
- [ ] Situational alerts hub + submit 
- [ ] Election observation hub + election submit 
- [ ] Petitions browse / create / sign / admin 
- [ ] Contact, leads, diaspora feedback forms 
- [ ] Communities browse / join / forums / portal / manage 
- [ ] Admin create community DRAFT->ACTIVE, verifications, moderation, community reports 
- [ ] Council MP Evaluation -> reports queue 
- [ ] Parliament tracker + CSV import dry-run 
- [ ] Promises catalogue + government commitments + manifesto registry 
- [ ] People's Report Card + methodology + data sources + admin publish flow 
- [ ] **Report Card Voice filter: All / Verified / Unverified** + badges on cards 
- [ ] Staff set experience verification tier on `/admin/reports/[id]` 
- [ ] Diaspora hub + journeys + feedback + admin review 
- [ ] Town halls, debates, regional hubs 
- [ ] Legal empowerment, whistleblowing 
- [ ] Partner API page + CSV/JSON exports awareness 
- [ ] Admin full nav groups + operators + audit + settings + notification outbox 
- [ ] **Platform security pitch** (separate sessions, hashing, rate limits, headers, audit, chatbot guardrails) 
- [ ] Optional Ghana Card on `/account` / MP performance gate (when Hubtel on) 
- [ ] What MBKRU is **not** + demo-data hygiene 

---

## 20. Platform accuracy audit (UI / backend / admin)

Reviewed against the live codebase (July 2026). Use this when someone asks: "Is everything in the handbook actually built?"

### 20.1 Confirmed live (frontend + backend + admin where claimed)

| Area | Status |
|------|--------|
| Registration without Ghana Card; login; forgot password; account; reports; notifications; privacy export/delete | Live |
| Voice reports (5 kinds), track, causes, discussion threads, transparency | Live |
| MBKRU Voice chatbot (site-wide), FAQ fallback, attachments, optional web search, admin analytics | Live |
| Accessibility assistive tools | Live |
| Petitions browse / create / sign / admin | Live |
| Situational alerts; election observation (Phase 3 flag) | Live |
| Communities browse/join/portal/manage; admin DRAFT->ACTIVE; verifications; moderation | Live |
| Council MP Evaluation -> reports queue | Live |
| Parliament tracker; CSV import; promises; government commitments; manifestos | Live |
| Report Card public + admin cycles; methodology; data sources | Live |
| **Verified / Unverified public filter on Report Card Voice browse** | Live |
| Diaspora hub + feedback + admin | Live |
| Town halls, debates, regions, legal, whistleblowing, partner API page | Live |
| Full admin nav (content, Voice, accountability, communities, system) | Live |
| Security controls in Section 16 (sessions, bcrypt, rate limits, headers, audit, etc.) | Live (some optional: Turnstile, Redis, Hubtel) |

### 20.2 Caveats trainers must state accurately

| Topic | Accurate line |
|-------|----------------|
| Ghana Card | **Not** on registration. May still appear on **My Account**; can gate **MP performance** when Hubtel is configured |
| Chatbot language | **Train in English.** Product may show a language control - do not promise translation |
| Discussions | Per-report URLs only - no `/citizens-voice/discussions` index page |
| Partner API | Public terms page + rate-limited CSV/JSON - not a private partner console |
| Phase flags | Confirm production runs Phase 3 so election observatory and full scorecard depth are visible |
| Town halls / debates | Live directories; often programme/planning surfaces rather than full interactive debate tools |
| Security pitch | Strong layered controls - do not claim "unhackable" |

### 20.3 How verified reports flow (end-to-end)

1. Citizen or council submits a report  
2. Staff triage at `/admin/reports`  
3. Staff set experience verification tier: UNVERIFIED, CORROBORATED, or DOCUMENTED  
4. Public `/report-card` Voice tab can filter: All, Verified, or Unverified (badge on each card)  
5. Separately, editors may use verified experience in Index C when publishing scores in `/admin/report-card`
### 20.4 Staff how-to - mark a report verified

1. Open `/admin/reports` -> select report 
2. Set **Experience verification** to Corroborated or Documented 
3. Save 
4. On https://mbkru.org/report-card (Voice tab), choose **Verified only** - the report should appear with a **Verified** badge 

---

## Appendices

### Appendix A - Quick URL reference

| Audience | URL |
|----------|-----|
| Public home | https://mbkru.org/ |
| Register | https://mbkru.org/register |
| Member login | https://mbkru.org/login |
| Submit report | https://mbkru.org/citizens-voice/submit |
| Track report | https://mbkru.org/track-report |
| Petitions | https://mbkru.org/petitions |
| Communities | https://mbkru.org/communities |
| Parliament tracker | https://mbkru.org/parliament-tracker |
| Promises | https://mbkru.org/promises |
| Government commitments | https://mbkru.org/government-commitments |
| Report Card | https://mbkru.org/report-card |
| Methodology | https://mbkru.org/methodology |
| Diaspora | https://mbkru.org/diaspora |
| Diaspora feedback | https://mbkru.org/diaspora/feedback |
| Transparency | https://mbkru.org/transparency |
| Staff admin | https://mbkru.org/admin/login |

### Appendix B - Competency drills

Trainee is competent when they can:

1. Register **without** mentioning Ghana Card 
2. Open **MBKRU Voice chatbot** and get English help for report + diaspora + commitments questions 
3. Explain chatbot is **not** a translator / lawyer / emergency service 
4. Submit a Voice report and retrieve via tracking code 
5. Create and sign a petition (incl. guest email confirm) 
6. As admin, create DRAFT community, activate, join as member 
7. Explain OPEN vs APPROVAL_REQUIRED 
8. Describe Council MP Evaluation -> reports queue 
9. Add/update a promise on the correct public tracker 
10. Explain triple-index scorecard in plain English 
11. Walk diaspora hub -> official signpost -> feedback 
12. Name three things MBKRU is **not** 
13. Find MBKRU Voice analytics in admin 
14. Deliver the **one-minute security pitch** and name at least five concrete controls 
15. On `/report-card`, filter **Verified only** and **Unverified only**, and explain staff tiers 
16. As admin, change a report's experience verification tier and confirm the public filter updates 

### Appendix C - Connected services

| Service | Used for | If missing |
|---------|----------|------------|
| PostgreSQL | All data | Site cannot run |
| Email (Resend) | Alerts | Forms still save |
| SMS (Twilio) | Optional SMS | Skipped |
| Turnstile | Bot protection | Forms still work |
| OpenAI | Rich chatbot answers, optional speech | **FAQ fallback still works** |
| Tavily | Optional web context in chat | Chat works without it |
| Redis | Shared rate limits | In-memory fallback |

### Appendix D - Document control

| Field | Value |
|-------|--------|
| Owner | MBKRU programme operations / training lead |
| Version | 2.2.2 - July 2026 |
| Chatbot language | **English-only training demos (no translation promise)** |
| Registration policy | **No Ghana Card at registration** |
| Report Card Voice | **Verified / Unverified public filter live** |
| Security module | **Section 16 - layered platform security for trainers** |
| Accuracy audit | **Section 20 - UI / backend / admin verification** |
| PDF companion | `docs/MBKRU_TRAINING_TEAM_HANDBOOK.pdf` |

---

*End of Training Team Handbook v2.2.2 - MBKRU Advocates. Prepared for professional staff training and full feature handover.*
