# Phase 4 — public launch polish

Set **`NEXT_PUBLIC_PLATFORM_PHASE=4`** at **build time** (Coolify build args + env). Phase 4 includes all Phase 3 accountability and Voice features, plus:

| Area | Change |
|------|--------|
| MBKRU Voice | Removes Early Access waitlist; actions first, single process diagram |
| Situational alerts | Removes Early Access block |
| Parliament tracker | Removes email waitlist signup card |
| Homepage | One primary hero CTA; text links for hub/About; hides duplicate trust strip + accountability preview |
| Footer | Compact CTA row (Submit a report + Contact) |
| Auth / account | Hides floating Voice chatbot |
| SEO | Default `og:image` + Twitter large card; neutral meta description |

Pre-launch behaviour (waitlist, verbose footer) remains on phases **1–3**.

### Also in phase 4 (continued polish)

- **JSON-LD** Organization + WebSite in root layout
- **Neutral default** browser title when built at phase 4
- **Shorter** dismissible site trust notice (`siteTrustNotice.compactBody`)
- **Focused member routes** (`/login`, `/register`, `/account/*`): hide gold TopBar + mobile bottom nav; compact footer (no link grid)
- **Home participate hub** capped at six action cards
- **Removed** unused `RoadmapModal` component
