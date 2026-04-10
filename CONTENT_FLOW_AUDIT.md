# Content Accuracy & Consistency Flow Audit

**Date:** March 2026  
**Scope:** All project pages — content accuracy, consistency, and arrangement

---

## 1. Pillar Naming & Mapping (A–E)

| Pillar | Full Name | Dedicated Page | Nav Label | Status |
|--------|-----------|----------------|----------|--------|
| **A** | Digital Platform — MBKRU Voice | `/citizens-voice` | MBKRU Voice | ✓ |
| **B** | Physical Engagement Network | `/situational-alerts` | Engagement | ✓ |
| **C** | Legal Empowerment Desk | — | — | ⚠️ No dedicated page; links to /parliament-tracker |
| **D** | Accountability & Electoral Watch | `/parliament-tracker` | Accountability | ✓ |
| **E** | Direct Presidential Interface | — | — | ✓ About page only |

**Phase 1:** Only 3 preview pages (Citizens Voice, Situational Alerts, Parliament Tracker). Pillar C (Legal Empowerment) has no dedicated page — links to `/parliament-tracker` as fallback. Content is described on About page.

---

## 2. Content Accuracy

### ✅ Accurate

- **Mission:** Restorative justice, reparations, tangible benefits — consistent across About, Homepage, Footer
- **Tagline:** "A Direct Voice Between the President and People of Ghana" — consistent
- **Core objectives:** 5 items — same on About
- **Stats:** 5 pillars, 16 regions, 100% non-partisan, SDG 1 — consistent
- **Acronyms:** MBKRU, MDCE, MP, CHRAJ, FOI, SDG 1, NGO — defined on About
- **Platform pages:** Content matches pillar descriptions

### ⚠️ Baseline copy (Phase 1 — edit in `site-content`)

- **Contact / Footer:** `content.officeDetails`, `content.contactDetails`, `content.address`, `content.email` in `src/lib/site-content.ts`
- **Phone in top bar:** Shown only when `NEXT_PUBLIC_CONTACT_PHONE` is set

---

## 3. Consistency & Flow Issues

### Issue 1: Homepage duplicate pillars

- **"Key Operational Pillars"** (icon cards) and **"Explore our operational pillars"** (image cards) both show the same 3 pillars (A, B, C). Redundant.
- **Recommendation:** Remove one section; keep a single, stronger pillars block.

### Issue 2: Pillar C link mismatch

- Homepage pillar C (Legal Empowerment) → links to `/parliament-tracker` (which is Pillar D)
- **Recommendation:** Link to `/about` for Legal Empowerment until a dedicated page exists, or add a note that C is described on About.

### Issue 3: Resources not in nav/footer

- Resources page exists but is not linked from Header or Footer.
- **Recommendation:** Add Resources to Footer "Useful Links".

### Issue 4: Partners & Supporters missing

- Phase 1 deliverable #8 but no `/partners` page exists.
- **Recommendation:** Create Partners page or document as deferred.

### Issue 5: Terminology variants

| Concept | Variants | Recommendation |
|---------|----------|----------------|
| Digital platform | MBKRU Voice, Citizen Voice, Digital Platform — MBKRU Voice | Nav: MBKRU Voice; page title: Digital Platform — MBKRU Voice ✓ |
| Physical engagement | Engagement, Physical Engagement Network | Nav: Engagement ✓ |
| Accountability | Accountability, Accountability & Electoral Watch | Nav: Accountability ✓ |

---

## 4. Page Arrangement

### Homepage flow

1. Hero
2. About (intro + CTA)
3. Key Operational Pillars (icon cards)
4. Stats counter
5. Strategic objectives (objectives list + commitment)
6. **Explore our operational pillars** (image cards) ← **duplicate**
7. Take Action CTA
8. Newsletter

**Recommendation:** Remove section 6 (duplicate pillars) to avoid repetition.

### Inner pages

- Consistent: PageHeader + `section-spacing` + `max-w-4xl` (or `max-w-7xl` for About)
- About: Long-form with 10 sections — logical flow

### Nav order

- Home → About Us → News → MBKRU Voice → Engagement → Accountability
- CTA: Get in Touch (Contact)

---

## 5. Summary of Fixes (Applied)

| # | Fix | Status |
|---|-----|--------|
| 1 | Remove duplicate pillars section on homepage | ✓ Done |
| 2 | Add Resources and Partners to footer Useful Links | ✓ Done |
| 3 | Pillar C: Link to /about for Legal Empowerment (no dedicated page) | ✓ Done |
| 4 | Create Partners & Supporters page (Phase 1 deliverable) | ✓ Done |
| 5 | About page: Legal Empowerment links → /about (not /parliament-tracker) | ✓ Done |

