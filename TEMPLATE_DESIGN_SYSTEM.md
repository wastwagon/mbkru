# MBKRU × Consult Template — Design System Guide

This document maps **every layout, color, and button style** from the Consult (index2) template to MBKRU pages. Use it to apply the template consistently across all pages.

---

## 1. Color System

### Template → MBKRU Mapping

| Template Variable / Class | Template Value | MBKRU Variable | Usage |
|---------------------------|----------------|----------------|-------|
| `--text-color` | `#002147` | `--foreground` (#0c1222) | Headings, body text |
| `--main-color` | `#1D2940` | `--primary-dark` (#062a3d) | Dark sections, footer bg |
| `--secondary-color` | `#6083A9` | `--secondary` (#0369a1) | Secondary buttons |
| `--button-linner` | gradient `#1252DE → rgba(109,15,221,0.53)` | `--primary` (#0c4a6e) | Primary buttons (MBKRU uses solid) |
| `#0B111F` | Dark navy | `--foreground` | Dark text |
| `#1A237E` | Indigo | `--primary` | Accent, links |
| `#184E77` | Teal-blue | `--primary` | Eyebrow labels |
| `#044E7C` | Deep blue | `--primary` | Buttons, accents |
| `#F6F7FA` / `#F4F4F4` | Light gray | `--muted` (#f1f5f9) | Section backgrounds |
| `#F6F6F6` | Off-white | `--muted` | Alternate sections |
| `rgba(24,78,119,0.10)` | Light teal tint | `bg-[var(--primary)]/10` | Eyebrow badges |
| `#141B2C` | Dark | `--foreground` | Footer text |

### MBKRU Brand Colors (Keep)

- **Primary:** `#0c4a6e` — main brand, buttons, links
- **Primary Dark:** `#062a3d` — hover states, dark sections
- **Accent Gold:** `#d4a017` — highlights, nav pills
- **Muted:** `#f1f5f9` — section backgrounds
- **Muted Foreground:** `#475569` — body text

---

## 2. Typography

### Template Fonts → MBKRU

| Template | MBKRU | Usage |
|----------|-------|-------|
| **Lora** | `font-display` | Headings (h1, h2, h3, .font-display) |
| **Kumbh Sans** | `font-sans` | Body text, nav, buttons |

### Type Scale (Template → Tailwind)

| Template Class | Size | MBKRU Equivalent |
|----------------|------|-------------------|
| `.font-14` | 14px | `text-sm` |
| `.font-16` | 16px | `text-base` |
| `.font-18` | 18px | `text-lg` |
| `.font-20` | 20px | `text-xl` |
| `.font-22` | 22px | `text-2xl` |
| `.font-24` | 24px | `text-2xl` |
| `.font-30` | 30px | `text-3xl` |
| `.font-36` | 36px | `text-4xl` |
| `.font-48` | 48px | `text-5xl` |

### Eyebrow Labels (Template Style)

```tsx
<span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
  Label
</span>
```

Template uses: `span.maximum`, `span.succes`, `span.finance1`, `span.trust` — all map to this pattern.

---

## 3. Button Styles

### Template Button Types → MBKRU Button Variants

| Template Class | Style | MBKRU Variant | Tailwind Equivalent |
|----------------|-------|---------------|---------------------|
| `theme-btn5` | Solid primary, hover fill reverse | `primary` | `bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]` |
| `theme-get-tex` | Gradient fill, hover expand | `primary` | Use solid for simplicity |
| `unlock-btn` | Solid, rounded-full, hover white fill | `primary` | `rounded-full` variant |
| `contact3` | Outline, rounded-full, hover fill | `outline` | `rounded-full border-2` |
| `shedule-btn2` | Secondary color, hover white | `secondary` | `bg-[var(--secondary)]` |
| `theme-btn11` | Header CTA style | Header "Get in Touch" | `rounded-xl px-5 py-2.5` |
| `button13` | Form submit | Form buttons | `rounded-lg bg-[var(--primary)]` |

### MBKRU Button Component — Template-Aligned

```tsx
// Primary (theme-btn5 / theme-get-tex)
<Button variant="primary" href="/contact">Get in Touch</Button>

// Outline (contact3)
<Button variant="outline" href="/about">Learn More</Button>

// Secondary
<Button variant="secondary">Submit</Button>

// CTA on dark (white button)
<Button className="bg-white text-[var(--primary)] hover:bg-blue-50">Join Us Now</Button>

// Outline on dark
<Button className="border-2 border-white text-white hover:bg-white/10">Learn More</Button>
```

### Button Sizes (Template)

- **Small:** `h-9 px-4 text-sm` (sm)
- **Medium:** `h-11 px-6 text-base` (md) — default
- **Large:** `h-12 px-8 text-base` (lg)
- **Rounded-full (unlock-btn):** `rounded-full px-6 py-3`

---

## 4. Section Layouts (Template → MBKRU Pages)

### Layout Patterns from Template

| Template Section | Layout | Use On |
|------------------|--------|--------|
| **Welcome2** | Split: text left, image right. Light bg. Eyebrow + H1 + p + CTA | Home hero |
| **About2** | Split: image left, text right. Eyebrow + H2 + p + CTA | About, pillar pages |
| **Welcome3** | Light gray bg, split, rounded pill buttons | Alternate hero |
| **Service2** | Centered heading, 3–6 card grid. Icon + title + desc + link | Home pillars, Services |
| **Counter1** | Dark bg, 4-column stats, centered numbers | Home stats |
| **Client2** | Split: list left, intro right. Icon + title + desc per item | Home objectives |
| **Casestudy1** | Card grid, image + overlay + title + link | Home pillar cards |
| **Cta3** | Split: headline left, form right. Border-top | Home newsletter |
| **Contact2** | Form left, contact info right | Contact page |
| **Page Header (inner)** | Muted bg, H1 + description, border-bottom | All inner pages |

### Section Spacing (Template)

| Template Class | Padding | MBKRU |
|----------------|---------|-------|
| `section-padding` | 120px 0 120px | `section-spacing` (4–6rem) |
| `section-padding2` | 50px 0 50px | `py-12 sm:py-16` |
| `section-padding4` | 60px 0 60px | `py-16` |
| `section-padding5` | 100px 0 100px | `py-20 sm:py-24` |

---

## 5. Page-by-Page Layout Guide

### Home (`/`)

| Section | Template Source | Current | Status |
|---------|-----------------|---------|--------|
| Hero | Welcome2 | Split, light, CTA | ✅ Done |
| About | About2 | Image left, text right | ✅ Done |
| Pillars (cards) | Service2 | 3 icon cards | ✅ Done |
| Counter | Counter1 | 4 stats, dark bg | ✅ Done |
| Objectives | Client2 | List + intro | ✅ Done |
| Pillar cards | Casestudy1 | Image cards | ✅ Done |
| CTA | Custom | Primary CTA | ✅ Done |
| Newsletter | Cta3 | Split, form right | ✅ Done |

### About (`/about`)

| Section | Template Source | Action |
|---------|-----------------|--------|
| Page header | Inner page header | Use `PageHeader` (muted bg, border-b) |
| Mission | About2 | Split: image right, text left |
| Our Mission | Card / About2 | Bordered card, white bg |
| Executive Summary | About2 | Split: image left, text right (swap on lg) |
| Tagline bar | Counter1 style | Dark primary bg, centered text |
| Vision / Objectives | Simple section | `max-w-4xl`, `space-y-16` |
| Pillars (A–E) | Casestudy1 + Service2 | Image + text cards, alternating |
| Conclusion | About2 | Split card with image |
| Acronyms | Simple grid | 2-col grid, bordered items |
| CTA | Button primary | Bottom |

### Contact (`/contact`)

| Section | Template Source | Action |
|---------|-----------------|--------|
| Page header | Inner | `PageHeader` |
| Layout | Contact2 | Form left, info right (`lg:grid-cols-2`) |
| Form | Template form style | Rounded inputs, `button13`-style submit |
| Info blocks | Simple | H2 + p per block |

### Platform Pages (Citizens Voice, Situational Alerts, Parliament Tracker)

| Section | Template Source | Action |
|---------|-----------------|--------|
| Page header | Inner | `PageHeader` |
| Main content | About2 | Split: image + text (swap order per page) |
| Form block | Card style | `rounded-2xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-8` |
| Submit button | `button13` | `Button variant="primary"` |

### News (`/news`)

| Section | Template Source | Action |
|---------|-----------------|--------|
| Page header | Inner | `PageHeader` |
| Intro | Simple | `max-w-4xl`, p |
| Featured image | Full-width | `aspect-[21/9] rounded-2xl` |
| List (when added) | Blog2 | Card grid, image + title + excerpt + date |

### Resources (`/resources`)

| Section | Template Source | Action |
|---------|-----------------|--------|
| Page header | Inner | `PageHeader` |
| Intro | Simple | p |
| Hero image | Full-width | `aspect-[21/9] rounded-2xl` |
| Document list (future) | Service2 / Card grid | Icon + title + link |

### Partners (`/partners`)

| Section | Template Source | Action |
|---------|-----------------|--------|
| Page header | Inner | `PageHeader` |
| Funding model | About2 | Split: text left, image right |
| CTA card | Card + Cta3 | Bordered, muted bg, Button |

### Legal (Terms, Privacy)

| Section | Template Source | Action |
|---------|-----------------|--------|
| Page header | Inner | `PageHeader` |
| Content | Simple | `max-w-4xl`, prose-style |

---

## 6. Component Checklist

### PageHeader (Inner Pages)

- Background: `bg-[var(--muted)]`
- Border: `border-b border-[var(--border)]`
- Padding: `py-16 sm:py-20 lg:py-24`
- Max-width: `max-w-4xl` (or `max-w-2xl` for title)
- Optional: subtle gradient overlay, gold accent line

### Cards (Service2 / Casestudy1)

- Border: `border border-[var(--border)]`
- Radius: `rounded-2xl`
- Shadow: `shadow-sm` default, `shadow-lg` hover
- Padding: `p-6 sm:p-8`
- Hover: `hover:border-[var(--primary)]/20 hover:shadow-lg`

### Form Blocks

- Background: `bg-[var(--muted)]`
- Border: `border-2 border-[var(--primary)]/20`
- Radius: `rounded-2xl`
- Padding: `p-8`

### CTA Sections

- Background: `bg-[var(--primary)]` or image + overlay
- Text: white, `text-lg`
- Buttons: white primary + outline white

---

## 7. Container & Spacing Standards

| Element | Class | Value |
|---------|-------|-------|
| Page container | `max-w-7xl` (home) / `max-w-4xl` (inner) | 1280px / 896px |
| Section padding X | `px-6 sm:px-8` | 24px / 32px |
| Section padding Y | `section-spacing` | 4–6rem |
| Grid gap | `gap-12 lg:gap-16` | 48px / 64px |
| Card gap | `gap-8` | 32px |

---

## 8. Implementation Order

1. **globals.css** — Ensure all template colors mapped to CSS variables ✅
2. **Button.tsx** — Add `rounded-full` variant if needed for unlock-btn style
3. **PageHeader.tsx** — Match template inner page header (muted, border-b) ✅
4. **Home** — Already index2-aligned ✅
5. **About** — Apply About2 splits, card styles, tagline bar
6. **Contact** — Apply Contact2 layout
7. **Platform pages** — Apply About2 split + form card
8. **News, Resources, Partners** — Apply inner header + template layouts
9. **Terms, Privacy** — Simple prose, PageHeader

---

## 9. Quick Reference: Template → Tailwind

| Template | Tailwind |
|----------|----------|
| `section-padding` | `section-spacing` or `py-16 sm:py-20 lg:py-24` |
| `theme-btn5` | `Button variant="primary"` |
| `contact3` | `Button variant="outline"` |
| `span.maximum` | `rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]` |
| `welcome2-section-area` | `bg-[var(--muted)]` or light section |
| `welcome4-section-area` | `bg-[var(--primary)]` dark section |
| `main-imgs` | `rounded-xl object-cover` |
| `mega-menu` dropdown | `rounded-lg border border-[var(--border)] bg-white py-2 shadow-lg` |

---

*Last updated: Design system extraction from Consult template (index2) for MBKRU Advocates.*
