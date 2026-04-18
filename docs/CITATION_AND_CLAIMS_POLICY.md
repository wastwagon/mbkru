# Citation, sourcing, and public claims policy

**Audience:** Editors, admins, partners, and comms.  
**Companion:** Public summary on **`/methodology#claims-and-citations`** · [`DATA_SOURCES.md`](./DATA_SOURCES.md) · [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md)

---

## 1. What MBKRU publishes

| Surface | Nature of claim | Must be true |
|---------|-----------------|--------------|
| Catalogue rows (tracked commitments) | Editorial record of **documented** pledges + status workflow | Every row traceable to a cited source or manifesto link where required by internal QA |
| People’s Report Card / scorecard entries | **Explanatory** assessment | Methodology published; limitations visible; not framed as court or EC findings |
| Voice & situational summaries (public) | Triage / advocacy context | No raw PII; moderated where policy says so |

---

## 2. Language we use (and avoid)

**Use:** “We record”, “status in our catalogue”, “explanatory score”, “based on sources dated…”, “pending verification”.  
**Avoid:** “Court finds”, “EC confirms”, “guilty”, “corrupt” (unless quoting a named public judgment with link).

---

## 3. Promise and commitment rows

1. **Source:** Prefer primary URLs (manifesto PDF, Hansard, official press). Store in fields the admin UI exposes.  
2. **Government vs opposition:** `isGovernmentProgramme` and filters must match editorial definitions — document any change in release notes.  
3. **Status changes:** Log in admin workflow; significant public-facing batch changes deserve a short News post.  
4. **CSV / bulk import:** Never ship to production without dry-run + sign-off per runbook.

---

## 4. Report card and scorecards

- Scores are **not** statutory audits.  
- Partner JSON and HTML must share the same **methodology version** string when you version methodology (future: add explicit `methodologyVersion` in API).

---

## 5. Voice and whistleblowing

- MBKRU Voice is **not** a statutory whistleblower channel. Cross-link **`/whistleblowing`** when Phase 2+.  
- Public statistics are **aggregates only** — see Transparency page copy.

---

## 6. Counsel and sign-off

This document is **operating policy** until counsel marks it as reviewed. Privacy/Terms remain the binding legal layer for users.

---

## Changelog

| Date | Note |
|------|------|
| 2026-04 | Initial publication in repo |
