# MBKRU Design Gap Analysis

**Purpose:** Thorough review against World-Class Civic & Advocacy Design Patterns. No gaps left behind.

---

## Executive Summary

| Principle | Status | Gap Severity |
|-----------|--------|--------------|
| 1. Clarity Over Clutter | Partial | Medium |
| 2. Typography as Lead | Partial | Medium |
| 3. Impact Metrics Up Front | **Gap** | High |
| 4. Action-Oriented CTAs | Partial | Low |
| 5. Full Bleed, Immersive Hero | Partial | Medium |
| 6. Quiet Minimalism | Partial | Medium |
| 7. Subtle Motion | Partial | Low |
| 8. Color & Trust | Partial | Low |
| Top Bar + Header + Hero Unity | Partial | Medium |
| Editorial Layouts | **Gap** | Medium |
| Data Visualization | **Gap** | Medium |
| Photography Authenticity | **Gap** | Medium |
| Accessibility & Trust Signals | Partial | Low |

---

## 1. Clarity Over Clutter

### Principle
- One main idea in hero
- Short supporting line, not paragraphs
- Restraint and clear hierarchy

### Current State
- **Hero:** Headline is strong but subhead is long: "Advocate for the Disenfranchised • Watchdog for Accountability • Catalyst for Poverty Eradication" (3 phrases)
- **Eyebrow:** "My Brother's Keeper Restoration United" — full name adds length
- **Motto:** "For the People, By the People, With the People" — separate line, adds visual weight
- **Pillar cards in hero:** 3 cards with icon + title only — good, but compete with main message

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Subhead too long | Hero | Shorten to "Advocate • Watchdog • Catalyst" (one line) |
| Eyebrow verbose | Hero | Consider "MBKRU" or "My Brother's Keeper" only |
| Motto competes | Hero | Integrate into subhead or move below CTAs |
| Pillar cards in hero | Hero | Consider moving below fold OR reducing to 3 one-liners |

---

## 2. Typography as Lead

### Principle
- Large, confident headlines
- Serif for authority, sans for clarity
- Typography as identity

### Current State
- **Fonts:** Kumbh Sans (body), Lora (display), Playfair (logo)
- **Hero H1:** `text-3xl sm:text-4xl lg:text-5xl` — adequate but not "oversized"
- **Section H2s:** `text-2xl sm:text-3xl` — consistent but not bold enough
- **Reference:** Transparency International uses massive CPI headline; VoteRiders uses marquee typography

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Hero H1 undersized | page.tsx L99 | Bump to `text-4xl sm:text-5xl lg:text-6xl xl:text-7xl` |
| No display font for hero | Hero | Consider Playfair for H1 (authority) vs Lora |
| Section H2s tame | All sections | Increase to `text-3xl sm:text-4xl` for key sections |
| Letter-spacing | Hero H1 | Add `tracking-tight` or `-tracking-tight` for impact |

---

## 3. Impact Metrics Up Front — **CRITICAL GAP**

### Principle
- Lead with numbers: 5 pillars, 16 regions, 100% non-partisan
- Transparency International: "250,000+ people helped"
- BudgIT: "22m citizens reached"
- Stats early and clearly

### Current State
- **Stats section:** Exists but is **below** About, Pillars, Objectives — appears at ~60% scroll
- **Stats:** 5 Pillars, 16 Regions, 100% Non-Partisan, SDG 1 — good content
- **Placement:** Buried mid-page

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Stats too low | page.tsx | Move stats INTO hero (footer of hero) or directly below hero |
| Stats not prominent | Counter section | Consider inline in hero: "5 Pillars • 16 Regions • 100% Non-Partisan" |
| No data viz | Site-wide | Add simple visual (e.g. 16 regions map, pillar count) |
| No "people helped" metric | — | Add when available: "X Citizens Reached" or "X Complaints Addressed" |

---

## 4. Action-Oriented CTAs

### Principle
- One primary, one secondary
- Clear, visible
- Common Cause: Take Action, Donate, Join
- VoteRiders: Donate, Volunteer, Subscribe

### Current State
- **Hero:** Get in Touch (primary), Learn More (secondary) ✓
- **Take Action section:** Join Us Now, Learn More ✓
- **About section:** Learn About Us ✓
- **Pillars:** View All Pillars (A–E) ✓

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| No "Take Action" in nav | Header | Consider adding "Take Action" as nav item or CTA label |
| Newsletter CTA weak | Newsletter | "Stay informed" — consider "Join the Movement" or "Get Updates" |
| No donate/volunteer | — | If MBKRU accepts donations/volunteers, add to TopBar or Header |

---

## 5. Full Bleed, Immersive Hero

### Principle
- Full-width, not boxed
- Image + overlay as environment
- Editorial feel

### Current State
- **Hero:** Full bleed ✓, `min-h-[90vh]` ✓, extends behind header ✓
- **Overlay:** Gradient from section-dark ✓
- **Content:** Max-w-7xl container — constrains width (acceptable for readability)
- **Image:** Generic Unsplash (people, landscape) — not Ghana-specific

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Image generic | Hero | Replace with Ghana-specific, civic, or community imagery |
| No editorial asymmetry | Hero layout | Consider asymmetric grid (e.g. 60/40) |
| Pillar cards feel "cardy" | Hero right | Simplify to icon + one line; less frosted glass |

---

## 6. Quiet Minimalism

### Principle
- Few elements, each justified
- Generous spacing
- No decorative clutter

### Current State
- **Hero:** Eyebrow + H1 + subhead + motto + 2 CTAs + 3 pillar cards — 7 distinct elements
- **Spacing:** `mt-6`, `mt-10` — reasonable
- **Sections:** Multiple badges ("About Us", "Our Platform", "Our Commitment") — add visual noise

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Too many hero elements | Hero | Reduce: combine motto into subhead; consider removing eyebrow or shortening |
| Badge overload | Sections | Use badges sparingly (1–2 per page max) |
| Pillar cards in hero | Hero | If kept, reduce to minimal: icon + title only (no extra line) |

---

## 7. Subtle Motion

### Principle
- Soft fades, light transitions
- Guides eye, doesn't distract
- Premium feel

### Current State
- **Hero:** Framer Motion stagger, fadeInUp ✓
- **Sections:** whileInView with opacity/x/y ✓
- **Pillar cards:** Hover border/background ✓
- **Header:** Transition on scroll ✓

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Stagger delay short | page.tsx L62 | `delayChildren: 0.12` — consider 0.15–0.2 for calmer feel |
| No scroll-triggered hero motion | Hero | Consider parallax on background image (subtle) |
| CTA hover could be refined | Buttons | Add subtle scale or shadow transition |

---

## 8. Color & Trust

### Principle
- Advocacy Through Walls: warm cream + dark
- MBKRU: teal + gold + warm accent
- Tight, intentional palette

### Current State
- **Palette:** section-dark, primary, accent-gold, accent-warm ✓
- **Usage:** Gold in hero, warm in pillars/objectives ✓
- **Footer:** accent-warm on social hover ✓
- **TopBar:** Gold accent line ✓

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Warm cream underused | globals.css | `--section-light-cream` exists but rarely used — consider for alternate sections |
| Logo colors in UI | Site-wide | Ensure all 4 logo colors (teal, blue, gold, warm) appear meaningfully |

---

## 9. Top Bar + Header + Hero Unity

### Principle
- One dark "canopy"
- No hard edges
- Gold accent as continuous thread
- Header: light glass (backdrop-blur)

### Current State
- **TopBar:** Soft gradient fade at bottom ✓, gold line ✓
- **Header:** Gradient to section-dark/30, backdrop-blur-[2px] ✓
- **Hero:** Gold accent line at 8.25rem ✓
- **Layout:** main has `pt-16` — may cause gap when header is relative

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| TopBar/Header/hero heights | Layout | Verify -mt-[8.5rem] and pt-[8.5rem] match actual combined height |
| Gold line visibility | Hero | Gold line at 8.25rem may be too subtle — consider 50% opacity |
| TopBar gradient | TopBar | `from-black/20` — ensure it blends with section-dark |

---

## 10. Editorial Layouts — **GAP**

### Principle
- Magazine-style sections
- Strong typography + refined imagery
- Asymmetry, curated storytelling

### Current State
- **About section:** Standard 2-col grid (image left, text right)
- **Pillars:** 3-col card grid — conventional
- **Objectives:** 2-col with list left, CTA right
- **No editorial spreads:** No full-bleed image + overlay text, no asymmetric layouts

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| No editorial hero variant | Hero | Consider: full-bleed image with text overlay (centered or offset) |
| Sections too uniform | All | Vary: some full-width image, some split, some centered |
| No pull quotes | — | Add testimonial or mission quote as large typography block |

---

## 11. Data Visualization — **GAP**

### Principle
- Transparency International: CPI, 182 countries
- BudgIT: infographics, dashboards, state rankings
- Data builds trust

### Current State
- **Stats:** Plain text numbers (5, 16, 100%, SDG 1)
- **No charts, maps, or viz**
- **Regions:** 16 regions mentioned but not visualized

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| No data viz | Site-wide | Add: simple Ghana map with 16 regions, or pillar diagram |
| Stats as numbers only | Counter section | Consider icons + numbers + short labels in visual row |
| No "impact" dashboard | Future | Plan for: complaints filed, responses received, etc. |

---

## 12. Photography Authenticity — **GAP**

### Principle
- Editorial, authentic imagery
- Ghana-specific where possible
- Avoid generic stock

### Current State
- **Hero:** `photo-1529156069898-49953e39b3ac` — generic group/landscape
- **About:** Same image
- **Take Action:** Same image
- **All from Unsplash** — not Ghana-specific

### Gaps
| Gap | Location | Fix |
|-----|----------|-----|
| Generic imagery | Hero, About, CTA | Replace with Ghana community, civic engagement, or Accra imagery |
| Same image repeated | 3 sections | Use different images per section |
| No alt text strategy | Images | Ensure meaningful alt text for accessibility |

---

## 13. Additional Gaps (Cross-Cutting)

### Content & Messaging
| Gap | Fix |
|-----|-----|
| "Advocates" in metadata/some copy | Align with "MBKRU" only where appropriate |
| Phone placeholder "+233 XX XXX XXXX" | Replace with real number or remove |
| Footer "Office details to be added" | Complete or remove |
| Social links "#" | Add real URLs |

### Accessibility
| Gap | Fix |
|-----|-----|
| Hero image alt="" | Add descriptive alt or role="presentation" with aria |
| Focus states | Verify focus-visible on all interactive elements |
| Color contrast | Audit gold/white on teal for WCAG AA |

### Technical / UX
| Gap | Fix |
|-----|-----|
| main pt-16 when header relative | May create unwanted gap on homepage — review |
| Mobile menu over hero | Ensure contrast when isHomeHero |
| BackToTop | Verify visibility on dark sections |

---

## Priority Implementation Order

### P0 — Critical (Do First) ✅ DONE
1. [x] **Move stats into hero** — Impact metrics in hero footer (5 Pillars • 16 Regions • 100% Non-Partisan • SDG 1)
2. [x] **Shorten hero subhead** — "Advocate • Watchdog • Catalyst" (one line)
3. [x] **Increase hero H1 size** — text-4xl → text-7xl, font-logo (Playfair) for authority

### P1 — High ✅ DONE
4. [x] **Hero pillar cards** — Icon + title only (unchanged; already minimal)
5. [x] **Reduce hero elements** — Eyebrow shortened to "MBKRU"; motto moved below subhead
6. [ ] **Ghana-specific imagery** — Deferred; using placeholders

### P2 — Medium ✅ DONE
7. [x] **Editorial layout** — Asymmetric grid (55/45) on About section
8. [x] **Data viz** — Stats in hero; 16 Regions grid component added (RegionsViz)
9. [x] **TopBar/Header/hero** — Already unified

### P3 — Polish ✅ DONE
10. [x] **Warm cream** — Objectives section uses section-light-cream
11. [x] **Motion** — Stagger 0.1/0.15 for calmer feel
12. [x] **Newsletter CTA** — "Join the Movement" (action-oriented)

---

## Checklist: World-Class Alignment

- [x] Stats in or directly below hero
- [x] Hero subhead one line ("Advocate • Watchdog • Catalyst")
- [x] Hero H1 oversized (text-5xl to text-7xl)
- [x] Hero elements reduced (≤5 distinct)
- [x] Pillar cards simplified (icon + title)
- [ ] Ghana-specific hero image (placeholder for now)
- [x] At least one editorial/asymmetric section
- [x] Simple data viz — 16 Regions grid (RegionsViz component)
- [x] TopBar + Header + Hero seamless
- [ ] All placeholder content replaced
- [ ] Accessibility audit passed

---

*Generated from DESIGN_INSPIRATION_BRIEF.md and current codebase review.*
