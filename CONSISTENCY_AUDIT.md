# Consistency Audit — MBKRU Website

Audit completed and fixes applied for font colors, titles, sizes, section layout, and content presentation.

---

## 1. Font Colors

### Before → After

| Location | Before | After |
|----------|--------|-------|
| Counter stats label | `text-blue-100/90` | `text-[var(--primary-on-dark-muted)]` |
| CTA section body | `text-blue-100/90` | `text-[var(--primary-on-dark-muted)]` |
| Footer background | `#1a2234` hardcoded | `var(--footer-bg)` |
| Button primary hover | `#0a3d5c` hardcoded | `var(--primary-dark)` |
| Button secondary hover | `#0284c7` hardcoded | `var(--primary)` |

### New CSS Variables (globals.css)

- `--primary-on-dark`: rgba(255, 255, 255, 0.9)
- `--primary-on-dark-muted`: rgba(255, 255, 255, 0.75)
- `--footer-bg`: #1a2234

---

## 2. Typography

### Heading Hierarchy (Standardized)

| Level | Usage | Classes |
|-------|-------|---------|
| **H1** | Page titles (PageHeader) | `font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[var(--foreground)]` |
| **H2** | Section headings | `font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl` |
| **H3** | Subsection / card titles | `font-display text-lg font-semibold text-[var(--foreground)]` |
| **Body** | Paragraphs | `text-[var(--muted-foreground)] leading-relaxed` |
| **Eyebrow** | Section labels | `rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]` |

### Fixes Applied

- **About:** All pillar H3s now use `font-display` (A–E)
- **Contact:** Main heading "Send a Message" → `text-2xl font-bold`; info blocks → `h3 text-lg font-semibold`
- **Form blocks** (citizens-voice, parliament-tracker, partners): H2 → `text-2xl font-bold`
- **Terms/Privacy:** Prose headings use `font-display` and `text-[var(--foreground)]`

---

## 3. Eyebrow Labels

### Standard Pattern

```tsx
<span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
  Label
</span>
```

### Fixes

- **About "Mission":** Changed from `text-xs uppercase tracking-widest` to the standard eyebrow pattern

---

## 4. Section Layout

### Container Widths

| Page Type | Max Width | Padding |
|-----------|-----------|---------|
| Home | `max-w-7xl` | `px-6 sm:px-8` |
| Inner pages | `max-w-4xl` | `px-6 sm:px-8` |

### Section Spacing

- All sections use `section-spacing` (4rem / 5rem / 6rem on breakpoints)
- Terms/Privacy: Switched from custom `px-4 py-16` to `section-spacing px-6 sm:px-8`

---

## 5. PageHeader & Legal Pages

### Before

- Terms/Privacy: Custom header with `text-4xl sm:text-5xl`, no `font-display`, different padding

### After

- Terms/Privacy: Use `PageHeader` component (same as all inner pages)
- Prose: `prose-headings:font-display prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)]`

---

## 6. Content Presentation

### Section Backgrounds (Home)

- Hero: `bg-[var(--muted)]`
- About: `bg-white`
- Pillars: `bg-[var(--muted)]`
- Counter: `bg-[var(--primary)]`
- Objectives: `bg-white`
- Pillar cards: `bg-[var(--muted)]`
- CTA: `bg-[var(--primary)]`
- Newsletter: `bg-white` + `border-t`

### Form Blocks (Platform Pages, Partners)

- `rounded-2xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-8`
- H2: `font-display text-2xl font-bold text-[var(--foreground)]`

---

## 7. Summary of Files Changed

- `src/app/globals.css` — CSS variables
- `src/app/(main)/page.tsx` — Counter/CTA text colors
- `src/components/layout/Footer.tsx` — Footer bg
- `src/components/ui/Button.tsx` — Hover colors
- `src/app/(main)/contact/page.tsx` — Heading hierarchy
- `src/app/(main)/citizens-voice/page.tsx` — Form block H2
- `src/app/(main)/parliament-tracker/page.tsx` — Form block H2
- `src/app/(main)/partners/page.tsx` — Form block H2
- `src/app/(main)/about/page.tsx` — Eyebrow, pillar H3s
- `src/app/(main)/terms/page.tsx` — PageHeader, section spacing, prose
- `src/app/(main)/privacy/page.tsx` — PageHeader, section spacing, prose

---

*Audit completed. Build verified.*
