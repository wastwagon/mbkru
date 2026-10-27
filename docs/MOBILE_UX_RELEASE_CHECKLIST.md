# Mobile & UX release checklist

Use before stakeholder demos or production promotion. Complements automated gates (`npm run verify:release-gates`) and [`LAUNCH_VERIFICATION_PHASES.md`](./LAUNCH_VERIFICATION_PHASES.md).

## Automated (CI / local)

```bash
npm run verify:release-gates   # prisma validate, tsc, vitest
npm run test:e2e:smoke         # critical routes + mobile shell + footer credit + display theme (needs dev server or PLAYWRIGHT_BASE_URL)
```

## Phone viewport (390×844 or iPhone SE class)

| Area | Check |
|------|--------|
| **Bottom tab bar** | Home, Voice, Tracker, Communities, Account — no overlap on compact mobile footer |
| **Scroll / flicker** | Gold top bar stays fixed height while scrolling; trust notice uses reserved height on first paint |
| **Voice submit** | Sticky submit clears tab bar; disclaimer checkbox reachable (main layout handles bottom inset — no extra section padding) |
| **Track report** | Tracking code field + sticky **Check status** |
| **Promises browse** | Quick chips visible; **Filter commitments** disclosure expands |
| **Report card** | Voice/scores filter disclosure; swipe lifecycle on Voice hub diagram |
| **Citizens Voice hub** | Submit + Track prominent; secondary tools swipe row |
| **Communities** | Filter disclosure + sticky **Show communities** |
| **Petitions (new)** | Sticky **Publish petition** clears tab bar |
| **Diaspora feedback** | Sticky **Submit feedback** + disclaimer text |
| **Parliament tracker** | Find-your-MP card readable in dark mode |
| **Accessibility** | Display theme (system / light / dark) persists after reload |

## Dark appearance

| Area | Check |
|------|--------|
| **Cards & forms** | No bright white panels on home, login, promises browse, admin queues (admin sections use `--card`) |
| **Header + tab bar** | Use `--card` surface, readable text |
| **Admin queue actions** | Warning / success / delete buttons legible on dark |
| **Brand bands** | Footer teal, gold top bar, Voice intake band unchanged |

## Trust & partner

| Item | Check |
|------|--------|
| **Footer credit** | “Designed & developed by” → [OceanCyber](https://oceancyber.net/) opens in new tab |
| **Social icons** | Set `NEXT_PUBLIC_FACEBOOK_URL`, `LINKEDIN`, `TWITTER` in prod `.env` (else icons → `/contact`) |
| **PWA** | Install banner on mobile; `/offline` loads |

## Sign-off

- [ ] Product / MBKRU stakeholder walkthrough on real device  
- [ ] `NEXT_PUBLIC_SITE_URL` matches production HTTPS origin  
- [ ] Construction gate off (`npm run ops:construction:status`) when going live  
