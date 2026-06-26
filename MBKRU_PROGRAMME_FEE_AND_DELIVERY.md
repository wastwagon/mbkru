# MBKRU — Programme fee and delivery summary

**For:** Sponsors, finance, and delivery partners  
**Period:** April 2026  
**Repository:** `mbkru-website` (engineering source of truth)  
**Phase 1 quotation:** [`references/OceanCyber_Phase1_Proposal.pdf`](references/OceanCyber_Phase1_Proposal.pdf) — OceanCyber **OC-WEB-2025-001** (March 2025)

---

## At a glance

| | GHS |
|--|----:|
| **Total agreed fee (Phases 1 + 2 + 3)** | **84,000.00** |
| **Cash received to date** | **39,850.00** |
| **Amount still due (whole programme)** | **44,150.00** |

---

## 1. Agreed fees by phase

The **GHS 84,000** line is the **full programme price** for the three delivery phases. **Phase 1** matches the signed Phase 1 subtotal on OC-WEB-2025-001. **Phases 2 and 3** share the remainder (**69,150**) with **more weight on Phase 2** (auth, Voice, accountability, admin stack); **Phase 3** is the balance under the same cap.

| Phase | What it covers | Fee (GHS) | **Payment status** |
|------:|----------------|----------:|--------------------|
| **1** | Public site, core pages, Postgres news CMS, contact/lead flows, Docker baseline — see PHASE1_SCOPE.md | **14,850.00** | **Paid** |
| **2** | Member auth, MBKRU Voice, APIs, promises/report card/transparency, admin queues, rate limits — see docs/PHASES_2_3_IMPLEMENTATION.md | **40,650.00** | **Part paid** — GHS 25,000 received; **GHS 15,650 pending** |
| **3** | Election-readiness, partner JSON, Phase 3 surfaces as defined for this programme | **28,500.00** | **Pending** |
| | **Total** | **84,000.00** | |

**Phase 1 detail (from OC-WEB-2025-001):** milestones **50% / 30% / 20%** = **7,425.00**, **4,455.00**, **2,970.00**; VAT **0%** on that quotation.

**Context:** The proposal also gave **indicative** ranges for later phases (**22,000 – 35,000** and **32,000 – 50,000**). The table above is the **agreed programme split** to **GHS 84,000**, not a recalculation of those ranges line by line.

---

## 2. Money in: receipts

| Receipt | GHS | Applied to | Status |
|---------|----:|------------|--------|
| Tranche 1 (Phase 1 settlement) | **14,850.00** | Phase 1 | **Confirmed — Phase 1 paid** |
| Tranche 2 (Phase 2 part payment) | **25,000.00** | Phase 2 | **Confirmed** |
| **Total received so far** | **39,850.00** | | |

---

## 3. How receipts are applied

| Applied to | Fee (GHS) | Received (GHS) | **Balance due (GHS)** | Status |
|------------|----------:|-----------------:|----------------------:|--------|
| Phase 1 | 14,850.00 | 14,850.00 | **0.00** | **Paid** |
| Phase 2 | 40,650.00 | 25,000.00 | **15,650.00** | **Part paid — balance pending** |
| Phase 3 | 28,500.00 | 0.00 | **28,500.00** | **Pending** |
| **Total** | **84,000.00** | **39,850.00** | **44,150.00** | |

---

## 4. Balance due by phase

**Balance** = fee (Section 1) minus amount received (Section 3).

| Phase | Fee (GHS) | Received (GHS) | **Balance due (GHS)** | Status |
|------:|----------:|----------------:|----------------------:|--------|
| 1 | 14,850.00 | 14,850.00 | **0.00** | Paid |
| 2 | 40,650.00 | 25,000.00 | **15,650.00** | **Pending** |
| 3 | 28,500.00 | 0.00 | **28,500.00** | Pending |
| **Total** | **84,000.00** | **39,850.00** | **44,150.00** | |

**Next payment priority:** Phase 2 balance (**GHS 15,650.00**) before Phase 3 close-out and launch milestones.

---

## 5. Delivery status (technical)

This is **what the codebase and docs describe**, not legal sign-off or a production go-live decision.

- **Phase 1 — complete (engineering):** See PHASE1_SCOPE.md and docs/PHASE1_STATUS.md.
- **Phase 2 — large scope in the repo; programme gates remain:** See docs/PHASES_2_3_IMPLEMENTATION.md — auth, Voice, accountability flows, hardening. Legal review, secrets, and data sign-off sit outside “code complete” alone (PHASE_GAPS_CLOSURE_QUEUE.md, EARLY_RECOGNITION_LAUNCH_PLAN.md).
- **Phase 3 — much implemented; turning it on in production** follows your launch plan and gap queue, not only feature presence.

---

## 6. Suggested actions

1. Match **Sections 2–3** to **banked receipts and invoices**.  
2. Schedule the **GHS 15,650** Phase 2 balance, then **GHS 28,500** Phase 3, against delivery milestones (Phase 2 close-out, Phase 3, pilot, legal clearance).  
3. For auditors: point to **docs/PHASE1_STATUS.md**, **docs/PHASES_2_3_IMPLEMENTATION.md**, and **references/OceanCyber_Phase1_Proposal.pdf**.

---

## Document record

| Ver. | Date | Note |
|-----:|------|------|
| **2.0** | 2026-04-19 | New document: MBKRU_PROGRAMME_FEE_AND_DELIVERY — fees **84,000** total; Phase 2 **40,650**; Phase 3 **28,500**; receipts **20,000** |
| **2.1** | 2026-06-21 | Phase 1 **paid**; Phase 2 **GHS 20,000** received (**GHS 20,650** balance pending); total received **34,850**; programme balance **49,150** |
| **2.2** | 2026-06-21 | Phase 2 payment updated to **GHS 25,000** received (**GHS 15,650** balance pending); total received **39,850**; programme balance **44,150** |

**Also read:** PHASE1_SCOPE.md · docs/PHASE1_STATUS.md · docs/PHASES_2_3_IMPLEMENTATION.md · ROADMAP_2028_ELECTION.md
