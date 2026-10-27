# Civic UX patterns (MBKRU phase 4)

Patterns aligned with common civic-tech guidance (SeeClickFix / Civicist, UNDP accountability loops, public-sector form design labs):

| Pattern | MBKRU implementation |
|--------|-------------------------|
| One primary action per screen | Phase 4 hero + Voice hub: Submit first; secondary links as text |
| Closed feedback loop | `ParticipationFeedbackLoop` on Voice (phase 4) and Track report |
| Plain-language limits | `AccountabilityDisclaimerCallout` compact mode at phase 4; `trackReport` variant |
| Receipt + status | Tracking codes; track page explains what updates mean |
| No black box | Methodology links in loop, disclaimers, and footer trust line |
| Less pre-launch noise | `PreLaunchLeadCaptureSection` + dynamic form chunks when `!publicLaunchPolish` |
| One trust backstop | Phase 4: compact footer trust line; tool disclaimers omit duplicate legal links |
| Slimmer global chrome | Footer: single platform column, no engagement gallery at phase 4 |

## References (external)

- [UNDP — Social accountability](https://www.undp.org/acceleratorlabs/blog/social-accountability) — transparency and follow-through
- [Civicist — SeeClickFix and 311](https://civicist.org/) — report → acknowledge → resolve loops
- [Public Policy Lab — Forms](https://publicpolicylab.org/) — plain language and expectation-setting at each step

## Code map

- `src/components/civic/ParticipationFeedbackLoop.tsx`
- `src/components/forms/PreLaunchLeadCapturePanel.tsx`
- `src/lib/platform/pre-launch-lead-capture.ts`
- `docs/PHASE_4_LAUNCH_POLISH.md`
