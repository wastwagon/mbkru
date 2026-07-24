# Admin UI Conventions

This guide keeps admin pages visually and structurally consistent.

## Page Structure

- Wrap pages with `AdminPageContainer`.
- Use `AdminPageHeader` for title, description, and back navigation.
- Prefer `AdminBackLink` (default in `AdminPageHeader`) for dashboard return.
- Use `backSlot` only for detail pages that should return to a specific list.

## Width Rules

Use `src/lib/admin/admin-page-layout.ts`:

- `default` (`max-w-5xl`): most dashboards and list pages
- `narrow` (`max-w-4xl`): medium forms and mixed content
- `form` (`max-w-3xl`): long single-column editors
- `compact` (`max-w-2xl`): short detail/status pages
- `wide` (`max-w-6xl`): table-heavy pages

## Shared Components

- `AdminStatTileLink`: top dashboard snapshot tiles (optional `delta` / `deltaTone` / `hint`)
- `AdminAttentionList`: prioritized “needs attention” queue alerts on `/admin`
- `AdminMetricCard`: metric blocks (`surface="cell"` or `surface="tile"`; optional `subline` / `delta` / `hint`)
- `AdminWindowFilterChips`: shared period chips for analytics windows (`months`, `days`, …)
- `AdminListPanel`: bordered row lists with dividers
- `AdminTablePanel`: bordered, scroll-safe table shell
- `AdminSectionCard`: bordered section shell for grouped analytics/details
- `AdminEmptyState`: plain muted text by default; richer dashed panel when `title` / `action` are set
- Dashboard viz (shared with public transparency): `StatBarList`, `StatusDonut`, `MonthTrendBars`, `Sparkline` in `src/components/viz/`
- Home snapshot data: `getAdminHomeSnapshot()` in `src/lib/server/admin-home-attention.ts`
- Prefer shared UI primitives for new controls:
  - `<Button density="admin" />` / `variant="surface"` (or `adminPrimaryButtonClass` / `adminSecondaryButtonClass`)
  - `<Input density="admin" />` / `<Textarea density="admin" />` / `<Select density="admin" />` / `<FormField>`
  - `<Dialog>` / `<ConfirmDialog>` for overlays
  - `<Tooltip>` for metric label hints (CSS hover/focus)
  - Class tokens remain for layout shells, queue action chips, and inline compact selects

## Dashboard viz policy

Prefer **CSS-first** charts (`src/components/viz/`, Ghana SVG heat map) over adding Recharts/Nivo/Chart.js. Add a chart library only if product needs interactive multi-series or complex axes that CSS cannot cover. Geo paths stay generated (`d3-geo` in build scripts only — not a runtime dashboard dependency).

## Shared Class Tokens

From `src/lib/admin/admin-ui-classes.ts`:

- `adminKickerClass`
- `adminStatTileLinkClass`
- `adminMetricCardClass`
- `adminMetricTileClass`
- `adminToolLinkCardClass`
- `adminListPanelClass`
- `adminTablePanelClass`
- `adminPrimaryButtonClass` / `adminSecondaryButtonClass` (backed by `buttonClass()`)
- `adminFormFieldClass`

## Copy Guidance

- Keep intros in two short lines max:
  - what this page is for
  - what action the admin should take
- Prefer consistent terms:
  - "Citizen Voice" for report channel context
  - "MBKRU Voice" for chatbot product context
- Empty states should be direct and action-oriented where possible.
