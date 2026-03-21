# Template Enhancements — Matched

All Consult template enhancements have been reviewed and applied to MBKRU.

---

## 1. Section Spacing

| Template | Value | MBKRU |
|----------|-------|-------|
| `section-padding` | 120px 0 120px | `section-spacing` → 7.5rem (120px) on lg |

**File:** `globals.css`

---

## 2. Button Styles

| Enhancement | Implementation |
|-------------|----------------|
| **Transition** | `duration-[400ms] ease-in-out` (matches template `0.4s ease-in-out`) |
| **Pill variant** | `variant="pill"` — rounded-full (unlock-btn style) |
| **Primary/Outline** | Existing variants with updated transition |

**File:** `Button.tsx`

---

## 3. Card Shadows

| Template | Value | MBKRU |
|----------|-------|-------|
| Service/Case cards | `0px 4px 50px rgba(0,0,0,0.08)` | `--shadow-card` |
| Hover | Stronger shadow | `--shadow-card-hover` |

**Files:** `globals.css`, `page.tsx`, `about/page.tsx`, `Card.tsx`

---

## 4. Dropdown Shadow

| Template | Value | MBKRU |
|----------|-------|-------|
| Mega menu | `0px 20px 30px rgba(0,0,0,0.2)` | `--shadow-dropdown` |

**Files:** `globals.css`, `Header.tsx` (nav dropdown + sticky header)

---

## 5. Back to Top

| Template | Behavior | MBKRU |
|----------|----------|-------|
| `BackToTop.js` | Appears on scroll, smooth scroll to top | `BackToTop.tsx` — visible after 400px |

**Files:** `BackToTop.tsx`, `layout.tsx`

---

## 6. Form Inputs

| Template | Value | MBKRU |
|----------|-------|-------|
| Transition | `0.4s ease-in-out` | `duration-[400ms] ease-in-out` |
| Focus | Border + ring | `focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20` |
| Placeholder | Muted color | `placeholder:text-[var(--muted-foreground)]` |
| Height | 57–60px | `min-h-[48px]` or `py-3.5` |
| Border radius | 2px or 5px | `rounded-xl` (consistent) |

**Files:** `ContactForm.tsx`, `NewsletterForm.tsx`, `EarlyAccessForm.tsx`, `TrackerSignupForm.tsx`

---

## 7. Header

| Enhancement | Implementation |
|-------------|----------------|
| Sticky transition | `duration-[400ms] ease-in-out` |
| Sticky shadow | `shadow-[var(--shadow-dropdown)]` |
| CTA transition | `duration-[400ms] ease-in-out` |

**File:** `Header.tsx`

---

## 8. Prose (Terms/Privacy)

| Enhancement | Implementation |
|-------------|----------------|
| Link color | `prose-a:text-[var(--primary)]` |
| Link hover | `hover:prose-a:underline` |
| Transition | `prose-a:transition-all prose-a:duration-[400ms]` |

**Files:** `terms/page.tsx`, `privacy/page.tsx`

---

## 9. Transitions Summary

All interactive elements use `duration-[400ms] ease-in-out` to match template `transition: all .4s ease-in-out`:

- Buttons
- Header (sticky, CTA)
- Cards (hover)
- Form inputs
- Back to top
- Prose links

---

## 10. CSS Variables Added

```css
--shadow-card: 0 4px 50px rgb(0 0 0 / 0.08);
--shadow-card-hover: 0 8px 40px rgb(0 0 0 / 0.12);
--shadow-dropdown: 0 20px 30px rgb(0 0 0 / 0.2);
```

---

## Files Modified

- `src/app/globals.css` — section spacing, shadow vars
- `src/components/ui/Button.tsx` — pill variant, transition
- `src/components/ui/Card.tsx` — shadow, transition
- `src/components/ui/BackToTop.tsx` — new
- `src/app/(main)/layout.tsx` — BackToTop
- `src/components/layout/Header.tsx` — shadow, transition
- `src/app/(main)/page.tsx` — card shadows, transitions
- `src/app/(main)/about/page.tsx` — card shadows, transitions
- `src/components/forms/ContactForm.tsx` — input styling
- `src/components/forms/NewsletterForm.tsx` — input shadow, transition
- `src/components/forms/EarlyAccessForm.tsx` — input styling
- `src/components/forms/TrackerSignupForm.tsx` — input styling
- `src/app/(main)/terms/page.tsx` — prose link styling
- `src/app/(main)/privacy/page.tsx` — prose link styling

---

*All Consult template enhancements matched. Build verified.*
