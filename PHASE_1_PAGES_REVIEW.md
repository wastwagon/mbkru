# Phase 1 Pages Review — MBKRU Website

**Purpose:** Review all existing pages and define Phase 1 scope. Use placeholders and public images; replace content later.

---

## 1. Phase 1 Page Inventory

### Nav-Linked Pages (Primary)

| Route | Label | Status | Images | Placeholders |
|-------|-------|--------|--------|--------------|
| `/` | Home | ✓ Complete | 3 Unsplash | Hero, About, CTA, pillars |
| `/about` | About Us | ✓ Complete | 6+ Unsplash | Mission, pillars, objectives |
| `/news` | News & Updates | ✓ Skeleton | 1 Unsplash | Single section |
| `/citizens-voice` | MBKRU Voice | ✓ Complete | 1 Unsplash | Pillar A page |
| `/situational-alerts` | Engagement | ✓ Complete | 1 Unsplash | Pillar B page |
| `/parliament-tracker` | Accountability | ✓ Complete | 1 Unsplash | Pillar D page |
| `/contact` | Get in Touch (CTA) | ✓ Complete | 0 | Form + contact placeholders |

### Footer-Linked Pages

| Route | Label | Status | Images | Placeholders |
|-------|-------|--------|--------|--------------|
| `/resources` | Resources | ✓ Skeleton | 1 Unsplash | Single section |
| `/partners` | Partners & Supporters | ✓ Complete | 1 Unsplash | Partnership content |
| `/privacy` | Privacy Policy | ✓ Complete | 0 | Legal prose |
| `/terms` | Terms of Use | ✓ Complete | 0 | Legal prose |

### Dynamic / Future

| Route | Status | Notes |
|-------|--------|-------|
| `/news/[slug]` | 404 | Returns notFound; no article template yet |

### Not in Nav/Footer

| Route | Notes |
|-------|-------|
| `/studio/[[...index]]` | Sanity Studio (if used) |

---

## 2. Image Usage Summary

| Page | Image Count | Source | Sizes |
|------|-------------|--------|-------|
| Home | 3 (hero, about, CTA) + 3 pillar thumbnails | Unsplash | 1920, 800, 600 |
| About | 6+ (mission, platform, pillars, testimonials) | Unsplash | 800, 400 |
| News | 1 | Unsplash | 1200 |
| Citizens Voice | 1 | Unsplash | 800 |
| Situational Alerts | 1 | Unsplash | 800 |
| Parliament Tracker | 1 | Unsplash | 800 |
| Partners | 1 | Unsplash | 800 |
| Resources | 1 | Unsplash | 1200 |

**Total unique Unsplash IDs in use:** ~10

---

## 3. Content Placeholder Status

### Text Placeholders (Replace Later)

| Location | Content | Replace With |
|----------|---------|--------------|
| TopBar | `+233 XX XXX XXXX` | Real phone number |
| Contact | "Office details to be added" | Address |
| Contact | "Contact details to be added" | Email, phone |
| Footer | "Office details to be added" | Address |
| Privacy | "[add contact email]" | Contact email |
| Social links | `href="#"` | Facebook, LinkedIn, Twitter URLs |

### Structural Placeholders (OK for Phase 1)

| Location | Content | Notes |
|----------|---------|-------|
| News | "We will share updates..." | Single intro; no article list |
| News `[slug]` | 404 | No article template |
| Resources | "Reports, policy briefs..." | Single intro; no document list |
| Partners | "Partner With Us" CTA | No partner logos yet |

---

## 4. Phase 1 Scope Definition

### In Scope (Must Work)

- [x] Home — hero, about, pillars, stats, objectives, CTA, newsletter
- [x] About — mission, platform, pillars A–E, objectives, testimonials
- [x] Citizens Voice (Pillar A) — content + Early Access form
- [x] Situational Alerts (Pillar B) — content
- [x] Parliament Tracker (Pillar D) — content + Tracker signup form
- [x] Contact — form + placeholder contact info
- [x] News — landing page
- [x] Resources — landing page
- [x] Partners — content + CTA
- [x] Privacy — legal
- [x] Terms — legal

### Out of Scope (Phase 2+)

- [ ] News article detail (`/news/[slug]`) — needs CMS or static data
- [ ] Resources document list/downloads
- [ ] Partner logos grid
- [ ] Ghana-specific imagery (use placeholders)

---

## 5. Centralized Placeholder Strategy

### Image Source

- **Primary:** Unsplash (already in `next.config` remotePatterns)
- **URL pattern:** `https://images.unsplash.com/photo-{id}?w={width}&q=80`
- **Config:** `src/lib/placeholders.ts` — single source of truth

### Image Categories

| Category | Use Case | Example IDs |
|----------|----------|-------------|
| `hero` | Homepage hero, CTA | Community, people |
| `civic` | Citizen engagement, democracy | Hands, voting |
| `digital` | MBKRU Voice, tech | Laptop, dashboard |
| `community` | Town hall, engagement | Meeting, crowd |
| `legal` | Legal Empowerment | Justice, scales |
| `accountability` | Parliament tracker | Government, capitol |
| `partnership` | Partners page | Collaboration |
| `news` | News & Updates | Media, press |
| `resources` | Resources | Documents, library |

### Content Placeholders

- Contact: `PLACEHOLDER_OFFICE`, `PLACEHOLDER_PHONE`, `PLACEHOLDER_EMAIL`
- Social: `PLACEHOLDER_FACEBOOK`, etc. — or keep `#` for now

---

## 6. Implementation Checklist

### Phase 1 Setup

1. [x] Create `src/lib/placeholders.ts` with image URLs
2. [x] Update all pages to import from placeholders
3. [x] Replace hardcoded Unsplash URLs with placeholders
4. [x] Add `alt` text for all images (placeholder-friendly)
5. [x] Document placeholder replacement (see below)

### Page-by-Page Updates

| Page | Status |
|------|--------|
| Home | ✓ Uses `images.hero`, `images.about`, `pillarImages` |
| About | ✓ Uses `images.*`, `pillarImages` |
| News | ✓ Uses `images.news` |
| Citizens Voice | ✓ Uses `images.digital` |
| Situational Alerts | ✓ Uses `images.community` |
| Parliament Tracker | ✓ Uses `images.accountability` |
| Partners | ✓ Uses `images.partnership` |
| Resources | ✓ Uses `images.resources` |
| TopBar, Footer, Contact, Privacy | ✓ Uses `content.*` |

### Replacing Placeholders Later

**Images:** Edit `src/lib/placeholders.ts` — change Unsplash URLs to your own (local `/public` paths or CDN). Example:
```ts
hero: "/images/hero.jpg",  // local
// or
hero: "https://your-cdn.com/hero.jpg",  // CDN
```

**Content:** Edit `content` in `placeholders.ts` — phone, email, address, officeDetails, social URLs, privacyContact.

---

## 7. File Structure

```
src/
├── lib/
│   └── placeholders.ts    # NEW: Centralized images + content placeholders
├── app/(main)/
│   ├── page.tsx           # Home
│   ├── about/page.tsx
│   ├── news/page.tsx
│   ├── news/[slug]/page.tsx  # 404 for now
│   ├── citizens-voice/page.tsx
│   ├── situational-alerts/page.tsx
│   ├── parliament-tracker/page.tsx
│   ├── contact/page.tsx
│   ├── resources/page.tsx
│   ├── partners/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
```

---

## 8. Summary

| Metric | Count |
|--------|-------|
| **Phase 1 pages** | 11 |
| **Nav pages** | 7 |
| **Footer pages** | 4 |
| **Images to centralize** | ~15 |
| **Text placeholders** | 6 |
| **Pages not yet implemented** | 0 (all exist) |

All Phase 1 pages exist. The main work is:
1. Centralize images in `placeholders.ts`
2. Update pages to use config
3. Replace text placeholders when real content is available
