# Index2 (Business Consulting 01) — Safe Implementation Plan

## Overview
Port the **index2** layout and structure into MBKRU homepage while **keeping all MBKRU content**. No Bootstrap/Sass—use Tailwind only. No template images—use existing Unsplash URLs from `src/lib/site-content.ts`.

---

## Section Mapping (index2 → MBKRU)

| index2 Section | MBKRU Content | Action |
|----------------|---------------|--------|
| **Welcome2** | Hero | Split layout: text left, image right. MBKRU headline, tagline, CTA |
| **About2** | Mission / About | Image left (3 images or 1), text right. Mission statement, Executive summary |
| **Service2** | Pillars | 6-card grid → 3 pillars (A, B, C). Icon, title, description, Learn more |
| **Company1** | Our Commitment | Progress/objectives. Adapt to 3 objectives with visual treatment |
| **Counter1** | Stats bar | 4 counters: 5 Pillars, 16 Regions, 100% Non-Partisan, SDG 1 |
| **Client2** | How We Work | 3 items (objectives) + intro text. "How it works" → "Our Approach" |
| **Casestudy1** | Pillars (cards) | 3 case cards → 3 pillar cards with images |
| **Pricing1** | — | **Skip** (doesn't fit NGO) |
| **Testimonial2** | — | **Skip** or link to Partners |
| **Blog2** | News | Featured news + list. Link to /news |
| **Contact2** | Contact | Contact form + info. Use existing NewsletterForm or ContactForm |
| **Cta3** | Newsletter | "Stay Informed" + NewsletterForm |

---

## Safe Implementation Steps

1. **Backup** — Current `page.tsx` preserved in git / copy
2. **Hero** — Light background, split: left (headline, tagline, CTA), right (image)
3. **About** — Image + mission text
4. **Services/Pillars** — 3 cards (or 5 if we surface pillars D and E from `site-content` pillar map)
5. **Objectives** — Company1-style or Client2-style
6. **Counter** — Reintroduce stats bar (5, 16, 100%, SDG 1)
7. **Pillar cards** — Casestudy1-style image cards
8. **Newsletter** — Cta3-style at bottom
9. **No external deps** — Tailwind + Framer Motion only
10. **Content** — All MBKRU copy unchanged

---

## Design Notes (index2 style)

- **Hero**: Light bg, dark text, accent color #184E77 (similar to our primary)
- **Layout**: Max-width container, generous padding
- **Typography**: Clear hierarchy, eyebrow labels
- **Cards**: Icon + title + description + link
