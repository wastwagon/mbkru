# Full platform implementation plan — dependency order (no scope trim)

**Audience:** Engineering, product, legal/comms, data editors.  
**Intent:** Implement **the complete vision** in the repo: accountability data lineage, government/opposition promise surfaces, strengthened citizen reporting positioning, and **Queen Mothers / communities** at **production** depth (moderation, verification, search, notifications, admin).  

This is **not** an “MVP then iterate” product plan. Work is grouped in **dependency order**: each **workstream** is shippable and **feature-complete** for its domain. You may still **onboard partners gradually** after the software is ready.

**Prerequisites already in repo:** Phase 2/3 (Voice, reports admin, MPs/promises, report card, member auth, SMS/email hooks, `src/proxy.ts`).  

**Companion docs:** [`PLATFORM_EXPANSION_PLAN.md`](./PLATFORM_EXPANSION_PLAN.md) · [`DATA_SOURCES.md`](./DATA_SOURCES.md) · [`PHASE_TASKS.md`](./PHASE_TASKS.md) · [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## 1. Scope — “all” means

| Domain | Full delivery |
|--------|----------------|
| **Accountability data** | `ManifestoDocument` registry; `CampaignPromise` extended with `electionCycle`, `partySlug`, optional `manifestoDocumentId`; public **Government commitments** + **All parties** views; admin import helpers and validation. |
| **Parliament data ops** | EC-aligned **constituency seed** (migration or documented seed); **reconciliation runbook** + optional `POST /api/admin/parliament-members/reconcile` (dry-run diff vs last import snapshot). |
| **Citizen / whistleblower** | Dedicated **`/whistleblowing`** page (copy + official signposts); optional link from Voice; **aggregate analytics** API (admin) for non-identifying stats. |
| **Communities** | Full **social layer**: `Community`, membership roles, posts (concerns + general + announcements), **Queen Mother verification** workflow, **moderation** queue, **user reports** on posts, **membership bans**, **appeals** stub, **search** (Postgres FTS), **notifications** (email + optional SMS for announcements), **admin** CRUD + verification + moderation dashboards. |
| **Quality** | Vitest for new libs + critical API handlers; rate limits on all new public POSTs; Redis where multi-instance. |

**Out of scope for this plan (separate programmes):** native mobile apps, on-prem video hosting, blockchain attestation, PMO bill-tracking (stretch from Phase 3 doc).

---

## 2. Architecture choices (lock before build)

| Topic | Decision |
|-------|----------|
| **Identity** | Reuse **`Member`** for community users; communities are **member-only** for posting (guests read public communities if you allow `visibility = PUBLIC_READ`). |
| **Search** | **PostgreSQL** `tsvector` + GIN indexes on `Community` (name, description) and `CommunityPost` (body); unified search API `GET /api/communities/search?q=` returning mixed results. |
| **Files** | Queen Mother verification documents: reuse **`Media`** or new `CommunityVerificationAsset` with `storagePath` under `public/uploads` + mime/size limits (mirror report attachments). |
| **Realtime** | **Phase 1:** polling or SWR refresh; **optional later:** Pusher/Ably — not required for “full” v1. |
| **Notifications** | Table `Notification` (memberId, type, payload JSON, readAt); email via Resend patterns; SMS reuse `send-report-status-sms` style helper for `COMMUNITY_ANNOUNCEMENT`. |

---

## 3. Database — new / extended Prisma (full)

### 3.1 Extend existing

**`CampaignPromise`** (additive migrations):

- `electionCycle` `String` (e.g. `2024-general`) — indexed  
- `partySlug` `String` (e.g. `npp`, `ndc`) — indexed  
- `manifestoDocumentId` `String?` → `ManifestoDocument`  
- `manifestoPageRef` `String?` (human citation)  
- `isGovernmentProgramme` `Boolean` @default(false) — editorial flag for “treat as governing party commitment” for filters  

**`ParliamentMember`** (optional):

- `lastVerifiedAt` `DateTime?`  
- `externalSourceKey` `String?` (e.g. parliament.gh id if known)  

### 3.2 New: manifesto registry

**`ManifestoDocument`**

- `id`, `title`, `partySlug`, `electionCycle`  
- `sourceUrl` `String` @db.Text  
- `sha256` `String?` (file fingerprint if you hash a downloaded PDF)  
- `publishedAt` `DateTime?`  
- `notes` `String?` @db.Text (internal)  
- `createdAt`, `updatedAt`  

### 3.3 New: communities core

**`Community`**

- `id`, `slug` @unique, `name`, `description` @db.Text  
- `regionId` `String?` → `Region`  
- `traditionalAreaName` `String?`  
- `visibility` enum: `PUBLIC`, `PUBLIC_READ`, `MEMBERS_ONLY`  
- `joinPolicy` enum: `OPEN`, `APPROVAL_REQUIRED`  
- `status` enum: `DRAFT`, `ACTIVE`, `ARCHIVED`  
- `coverMediaId` `String?` → `Media`  
- `createdAt`, `updatedAt`  
- Indexes: `regionId`, `status`, FTS later via raw migration or Prisma `@@index` on generated column if using SQL  

**`CommunityMembership`**

- `id`, `communityId`, `memberId`  
- `role` enum: `MEMBER`, `MODERATOR`, `QUEEN_MOTHER_VERIFIED`  
- `status` enum: `ACTIVE`, `PENDING_JOIN`, `SUSPENDED`, `BANNED`  
- `joinedAt`, `updatedAt`  
- `@@unique([communityId, memberId])`  
- Indexes: `communityId`, `memberId`, `role`  

**`CommunityPost`**

- `id`, `communityId`, `authorMemberId`  
- `kind` enum: `GENERAL`, `CONCERN`, `ANNOUNCEMENT`  
- `body` @db.Text  
- `moderationStatus` enum: `PENDING`, `PUBLISHED`, `REJECTED`, `HIDDEN`  
- `pinned` `Boolean` @default(false) — announcements from QM often pinned  
- `moderatedAt` `DateTime?`, `moderatedByAdminId` `String?` (nullable FK to `Admin` if you add relation)  
- `rejectionReason` `String?` @db.Text  
- `createdAt`, `updatedAt`  
- Indexes: `communityId`, `createdAt`, `moderationStatus`, author  

**`CommunityPostReport`** (user flags)

- `id`, `postId`, `reporterMemberId`, `reason` enum + optional `details`  
- `status` enum: `OPEN`, `REVIEWED`, `DISMISSED`  
- `createdAt`  

**`CommunityVerificationRequest`**

- `id`, `communityId`, `memberId`  
- `status` enum: `SUBMITTED`, `APPROVED`, `REJECTED`  
- `documentMediaIds` — use `Json` array of media ids or join table `CommunityVerificationAttachment`  
- `reviewedByAdminId`, `reviewedAt`, `reviewNotes`  
- `createdAt`, `updatedAt`  

**`CommunityMembershipBan`** (audit)

- `id`, `communityId`, `memberId`, `reason` @db.Text  
- `bannedByAdminId` or `bannedByMemberId` (moderator) — store both as optional strings + enum `bannedByType`  
- `expiresAt` `DateTime?`  
- `createdAt`  

**`Notification`**

- `id`, `memberId`, `type` `String`, `payload` `Json`, `readAt` `DateTime?`, `createdAt`  
- Index: `memberId`, `readAt`  

### 3.4 Migrations strategy

- One migration per logical group (manifesto extensions; communities core; FTS indexes via raw SQL in migration).  
- Backfill scripts in `scripts/` for `electionCycle` / `partySlug` on existing promises if any.

---

## 4. API surface — complete list

### 4.1 Accountability (new / extended)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/manifestos` | List `ManifestoDocument` (phase-gated, rate-limited) |
| GET | `/api/promises` | Extend query: `?partySlug=&electionCycle=&governmentOnly=` |
| GET | `/api/government-commitments` | Thin alias or filter preset over promises JSON |

Admin (session):

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/manifestos` | Create manifesto metadata |
| PATCH | `/api/admin/manifestos/[id]` | Update |
| POST | `/api/admin/parliament-members/reconcile` | Body: snapshot or `dryRun` — returns diff JSON |

### 4.2 Communities (all new, member + admin)

**Public / member (cookie session + rate limit):**

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/communities` | Paginated list, filters `regionId`, `q` |
| GET | `/api/communities/search` | FTS communities + posts snippet |
| GET | `/api/communities/[slug]` | Detail + membership summary |
| POST | `/api/communities/[slug]/join` | Join or request join |
| POST | `/api/communities/[slug]/leave` | Leave |
| GET | `/api/communities/[slug]/posts` | Cursor pagination |
| POST | `/api/communities/[slug]/posts` | Create post (role + kind rules) |
| GET | `/api/communities/[slug]/posts/[id]` | Single post |
| PATCH | `/api/communities/[slug]/posts/[id]` | Author edit window or mod |
| POST | `/api/communities/posts/[id]/report` | Flag post |
| POST | `/api/communities/[slug]/verification` | Submit QM verification package |
| GET | `/api/me/notifications` | List notifications |
| PATCH | `/api/me/notifications/[id]` | Mark read |

**Admin:**

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/communities` | List all |
| POST | `/api/admin/communities` | Create community |
| PATCH | `/api/admin/communities/[id]` | Update status, visibility, join policy |
| GET | `/api/admin/communities/verifications` | Queue |
| POST | `/api/admin/communities/verifications/[id]/approve` | Approve QM |
| POST | `/api/admin/communities/verifications/[id]/reject` | Reject |
| GET | `/api/admin/communities/moderation/posts` | Pending posts global |
| POST | `/api/admin/communities/posts/[id]/moderate` | Publish/reject/hide |
| POST | `/api/admin/communities/memberships/[id]/ban` | Ban |

### 4.3 Analytics

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/analytics/citizen-reports` | Aggregates by region/kind/month (no PII) |

---

## 5. Public UI — routes (App Router)

| Route | Purpose |
|-------|---------|
| `/government-commitments` | Filtered promise browser (government programme flag + cycle) |
| `/promises/parties/[partySlug]` | Optional party-specific view or query-param on existing `/promises` |
| `/whistleblowing` | Full page: MBKRU vs official channels |
| `/communities` | Directory + search |
| `/communities/[slug]` | Home: about, join, pinned announcements, feed tabs |
| `/communities/[slug]/post/[id]` | Deep link to post |
| `/account/notifications` | Notification centre |
| `/account/communities` | My communities |

Header nav: add **Communities** when `platformFeatures.communities` (new flag, phase ≥ 2 or 3 per your policy).

---

## 6. Admin UI — pages

| Route | Purpose |
|-------|---------|
| `/admin/manifestos` | CRUD manifesto documents |
| `/admin/communities` | List communities, create/edit |
| `/admin/communities/verifications` | QM queue |
| `/admin/communities/moderation` | Post moderation |
| `/admin/communities/[id]` | Members list, ban, promote moderator |
| `/admin/analytics/citizen-reports` | Charts/tables from aggregates API |

---

## 7. Config & feature flags

**`src/config/platform.ts`**

- Add `communities: (phase) => phase >= 2` (or 3).  
- Add `manifestoRegistry: (phase) => phase >= 3` if you want tighter gate.

**Env**

- Reuse `RESEND_*`, `SMS_PROVIDER`, `REDIS_URL`, `MEMBER_SESSION_SECRET`.  
- Optional: `COMMUNITY_MAX_POST_LENGTH`, `COMMUNITY_VERIFICATION_MAX_FILES`.

---

## 8. Business rules (implement in server validators)

1. **ANNOUNCEMENT** posts: only `QUEEN_MOTHER_VERIFIED` or `MODERATOR` (configurable).  
2. **CONCERN** / **GENERAL**: any `ACTIVE` member if `moderationStatus` workflow = pre-moderate or post-moderate — **full implementation** = **pre-moderation** for new communities until trust score exists (config flag `COMMUNITY_PREMODERATE_DEFAULT=true`).  
3. **Join `APPROVAL_REQUIRED`**: membership `PENDING_JOIN` until mod/admin approves.  
4. **QM verification**: at least one document; admin approves → role upgrade + optional welcome notification.

---

## 9. Implementation sequence — workstreams (full slices)

Execute **in order**; parallelise only where noted.

| ID | Workstream | Delivers | Depends on |
|----|------------|----------|------------|
| **A** | Legal/comms + copy | Manifesto citation policy; whistleblowing page copy; community terms template | — (parallel) |
| **B** | Prisma: manifesto + promise extensions | Migrations, seed backfill script | A (policy) |
| **C** | Admin + API: manifestos | `/admin/manifestos`, CRUD APIs | B |
| **D** | Public: government commitments | `/government-commitments`, API filters | B, C |
| **E** | Constituency + reconciliation | Seed/migration + admin reconcile endpoint + runbook update | — |
| **F** | Prisma: communities full | All community tables + Notification | — |
| **G** | Validation + rate limits | `src/lib/validation/communities.ts`, Redis keys | F |
| **H** | Community APIs (member) | All `/api/communities/*` + notifications | F, G |
| **I** | Community APIs (admin) | All `/api/admin/communities/*` | H |
| **J** | Public UI communities | Directory, detail, feed, post forms | H |
| **K** | Admin UI communities | All admin pages | I |
| **L** | Postgres FTS | Migration SQL + search API | F |
| **M** | Notifications + email/SMS | Notification writes on approve/announcement; digest job or on-write send | H |
| **N** | Whistleblowing + analytics pages | `/whistleblowing`, admin analytics API + UI | — |
| **O** | Tests + security pass | Vitest, checklist, load smoke | All |

**Estimated engineering calendar (indicative, 2–4 devs):** B–D ~1–2 weeks; E ~3–5 days; F–M ~4–8 weeks; N ~1 week; O ~1–2 weeks. Adjust with team size.

---

## 10. Definition of done (whole programme)

- [ ] All migrations applied; `prisma validate` in CI.  
- [ ] All new routes behind phase flags; documented in README.  
- [ ] Rate limits on every new `POST`; Turnstile where abuse seen.  
- [ ] Admin can run full lifecycle: create community → verify QM → moderate posts → ban member.  
- [ ] Member can discover 200+ communities via search + region filters.  
- [ ] `SECURITY_CHECKLIST.md` re-run; privacy policy updated for communities + notifications.  
- [ ] Runbook: backup, moderation SLA, escalation.

---

## 11. Tracking in repo

- Checkbox execution: add a section to [`PHASE_TASKS.md`](./PHASE_TASKS.md) **Phase 4 — Full platform** linking here, or track in GitHub Projects with one issue per workstream **A–O**.  
- On merge of each workstream, update [`SPRINT_BACKLOG.md`](./SPRINT_BACKLOG.md) or release notes.

---

*This plan is the authoritative implementation map for “full” scope. Execute workstreams A→O in dependency order.*
