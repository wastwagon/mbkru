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

- `AdminStatTileLink`: top dashboard snapshot tiles
- `AdminMetricCard`: metric blocks (`surface="cell"` or `surface="tile"`)
- `AdminListPanel`: bordered row lists with dividers
- `AdminTablePanel`: bordered, scroll-safe table shell
- `AdminSectionCard`: bordered section shell for grouped analytics/details
- `AdminEmptyState`: muted empty-state text
- Prefer shared UI primitives for new controls:
  - `<Button density="admin" />` / `variant="surface"` (or `adminPrimaryButtonClass` / `adminSecondaryButtonClass`)
  - `<Input density="admin" />` / `<Textarea density="admin" />` / `<Select density="admin" />` / `<FormField>`
  - `<Dialog>` / `<ConfirmDialog>` for overlays
  - Class tokens remain for layout shells, queue action chips, and inline compact selects

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
