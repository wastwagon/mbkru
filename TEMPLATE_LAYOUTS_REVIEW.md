# Consult Template Layouts — Review for MBKRU

**Purpose:** Identify interesting layouts from the Consult template that depict MBKRU's civic advocacy purpose and recommend which to apply across all pages.

---

## 1. Template Layouts That Fit MBKRU's Purpose

### Civic / Advocacy Alignment

| Layout | Template Source | Why It Fits | MBKRU Use |
|--------|-----------------|-------------|-----------|
| **Split + Stats** | About page | Mission + inline stats (959+, 250+, etc.) builds trust | About mission section |
| **Icon List + Intro** | Client2, About "Law Provide" | Icon + title + desc per item; intro + CTA right | Objectives, Platform features |
| **Featured + List** | Blog2 | Large featured article left, 2 stacked right | News page |
| **Form + Info Blocks** | Contact2 | Form left; icon blocks (clock, phone, email) right | Contact page |
| **Headline + Form** | Cta3 | Bold headline left, compact form right | Newsletter |
| **3-Column Cards** | Casestudy1 | Image + title + short desc + Learn more | Pillars, Resources |
| **Dual CTA** | Cta5, About CTA | Headline + 2 buttons (primary + outline) | Take Action, Partners |
| **Tabs** | About "Vision" | Vision / History / Why Choose Us — switchable content | Could use for Pillars A–E |
| **Service Detail** | servicemiddle | Hero image + H2 + paragraphs + approach cards (icon + title) + checklist + "View more" grid | Platform pages (Citizens Voice, etc.) |
| **Numbered Cards** | Company3/works9 | 01, 02, 03 + icon + title + desc | Objectives as steps |

---

## 2. Current MBKRU Pages vs Template Layouts

| Page | Current Layout | Template Match | Recommendation |
|------|----------------|----------------|----------------|
| **Home** | Hero + stats + About + Pillars + Objectives + CTA + Newsletter | index2-aligned | ✓ Already strong; keep |
| **About** | 10 sections, mission, pillars, objectives, testimonials | About + Law Provide + Mission + Vision + Team + CTA | ✓ Rich; consider tabs for Vision/History |
| **News** | PageHeader + intro + single image | Blog2 (featured + list) | **Upgrade:** Featured article + 2 preview cards |
| **Citizens Voice** | PageHeader + split (image + list) + form card | Service detail (image + content + approach) | **Upgrade:** Add approach/benefits cards |
| **Situational Alerts** | PageHeader + split (text + image) | Same | **Upgrade:** Add "How it works" steps |
| **Parliament Tracker** | PageHeader + split + form | Same | **Upgrade:** Add accountability steps |
| **Contact** | PageHeader + form left, 3 info blocks right | Contact2 | ✓ Already matches; refine info blocks |
| **Resources** | PageHeader + intro + image | Blog2 / Casestudy1 | **Upgrade:** Card grid when docs exist |
| **Partners** | PageHeader + split + CTA card | About2 + Cta5 | ✓ Good; add partner logos grid (future) |
| **Privacy / Terms** | PageHeader + prose | — | ✓ Keep simple |

---

## 3. Layout Patterns to Adopt

### A. News Page — Blog2 Pattern

**Template:** Featured article (large image + overlay text) left; 2 smaller articles stacked right.

**MBKRU adaptation:**
- Left: Featured "Latest Update" — image + date + headline + excerpt + Learn more
- Right: 2 preview cards (date + headline + excerpt + link)
- When no articles: Show empty state / “Coming soon” cards or a single intro block

### B. Platform Pages — Service Detail Pattern

**Template:** Hero image + H2 + paragraphs; approach cards (icon + title + desc); checklist; "View more" grid.

**MBKRU adaptation (Citizens Voice, Situational Alerts, Parliament Tracker):**
- Keep: PageHeader + split (image + content)
- Add: "How it works" or "Key benefits" — 2–3 cards with icon + title + short desc
- Add: Checklist of features (e.g. "Secure registration", "Geo-tagged complaints")
- Form block: Keep as is

### C. Contact Page — Contact2 Refinement

**Template:** Form left; right column has icon blocks (clock/location, phone, email) — each with icon + heading + text.

**MBKRU adaptation:**
- Form: Already good
- Info blocks: Use icon + H3 + content; style consistently (border or card)
- Add: "Our response time" line if desired

### D. Resources Page — Casestudy1 / Card Grid

**Template:** Centered heading; 3-column cards (image + title + desc + link).

**MBKRU adaptation (when docs exist):**
- Card grid: Icon or thumbnail + title + short desc + "Download" or "Read more"
- Until downloads ship: Keep current intro + image; optional category cards as static layout

### E. Newsletter — Cta3 Pattern

**Template:** Bold headline + supporting text left (60%); email form right (40%).

**MBKRU adaptation:**
- Already similar; ensure headline is bold ("Join the Movement")
- Form: Single email + Subscribe button

---

## 4. Layout Components to Create

| Component | Purpose | Used On |
|-----------|---------|---------|
| `FeaturedArticleCard` | Large image + overlay content | News |
| `ArticlePreviewCard` | Date + headline + excerpt + link | News |
| `ApproachCard` | Icon + title + description | Platform pages |
| `ContactInfoBlock` | Icon + heading + content | Contact |
| `DocumentCard` | Icon/thumb + title + desc + link | Resources (future) |

---

## 5. Implementation Priority

| Priority | Page | Layout Change |
|----------|------|---------------|
| **P1** | News | Blog2: Featured + 2 preview cards (CMS or seed content) |
| **P2** | Platform pages | Add "Key benefits" or "How it works" cards |
| **P3** | Contact | Refine info blocks (icon + heading style) |
| **P4** | Resources | Card grid for future document list |
| **P5** | About | Optional: Tabs for Vision/History (if content exists) |

---

## 6. Civic-Specific Considerations

- **Trust:** Stats, numbered steps, and clear CTAs build trust (Transparency International, BudgIT).
- **Clarity:** Icon + title + short desc is scannable for busy citizens.
- **Action:** Every page should have at least one CTA (Get in Touch, Subscribe, Learn More).
- **Data:** Use RegionsViz, stats, and future dashboards to show impact.

---

## 7. Summary

| Layout | Best For |
|--------|----------|
| **Blog2** (featured + list) | News |
| **Service detail** (content + approach cards) | Citizens Voice, Situational Alerts, Parliament Tracker |
| **Contact2** (form + icon blocks) | Contact |
| **Cta3** (headline + form) | Newsletter |
| **Casestudy1** (card grid) | Resources, Partners (logos) |
| **Company3** (numbered cards) | Objectives as "How it works" |

---

*Review complete. Apply layouts per priority above.*
