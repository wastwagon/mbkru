#!/usr/bin/env python3
"""Build MBKRU_PROGRAMME_FEE_AND_DELIVERY.pdf - stakeholder payment statement.

Requires: pip install fpdf2
Fonts: scripts/fonts/DejaVuSans.ttf (+ Bold)
"""

from __future__ import annotations

from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "MBKRU_PROGRAMME_FEE_AND_DELIVERY.pdf"
FONT_DIR = ROOT / "scripts" / "fonts"
FONT_REG = FONT_DIR / "DejaVuSans.ttf"
FONT_BOLD = FONT_DIR / "DejaVuSans-Bold.ttf"

COL_TEAL = (13, 107, 92)
COL_TEAL_LIGHT = (232, 246, 241)
COL_GOLD = (212, 160, 23)
COL_TEXT = (30, 58, 79)
COL_MUTED = (91, 107, 125)
COL_WHITE = (255, 255, 255)
COL_ROW = (248, 251, 250)
COL_LINE = (220, 230, 225)

LM = 16.0
CONTENT_W = 178.0


def register_fonts(pdf: FPDF) -> None:
    if not FONT_REG.is_file() or not FONT_BOLD.is_file():
        raise SystemExit(f"Missing fonts under {FONT_DIR}.")
    pdf.add_font("DejaVu", "", str(FONT_REG))
    pdf.add_font("DejaVu", "B", str(FONT_BOLD))
    pdf.add_font("DejaVu", "I", str(FONT_REG))
    pdf.add_font("DejaVu", "BI", str(FONT_BOLD))


class DesignedPDF(FPDF):
    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_font("DejaVu", "", 8)
        self.set_text_color(*COL_TEAL)
        self.cell(95, 5, "MBKRU  -  Payment statement", align="L")
        self.set_text_color(*COL_MUTED)
        self.cell(95, 5, "OC-WEB-2025-001  -  September 2026", align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*COL_GOLD)
        self.set_line_width(0.35)
        self.line(self.l_margin, 18, self.w - self.r_margin, 18)
        self.ln(6)

    def footer(self) -> None:
        self.set_y(-14)
        self.set_draw_color(230, 235, 238)
        self.set_line_width(0.2)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(2)
        self.set_font("DejaVu", "", 7.5)
        self.set_text_color(*COL_MUTED)
        self.cell(95, 4, "OceanCyber  -  MBKRU website programme", align="L")
        self.cell(95, 4, f"Page {self.page_no()} of {{nb}}", align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def heading(pdf: FPDF, text: str) -> None:
    pdf.set_font("DejaVu", "B", 13)
    pdf.set_text_color(*COL_TEAL)
    pdf.cell(0, 8, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(*COL_GOLD)
    pdf.set_line_width(0.4)
    pdf.line(LM, pdf.get_y(), LM + CONTENT_W, pdf.get_y())
    pdf.ln(4)


def body(pdf: FPDF, text: str, size: float = 9.5) -> None:
    pdf.set_font("DejaVu", "", size)
    pdf.set_text_color(*COL_TEXT)
    pdf.multi_cell(CONTENT_W, 4.6, text)
    pdf.ln(2)


def bullets(pdf: FPDF, items: list[str]) -> None:
    pdf.set_font("DejaVu", "", 9.5)
    pdf.set_text_color(*COL_TEXT)
    for item in items:
        pdf.multi_cell(CONTENT_W, 4.6, f"- {item}")
        pdf.ln(0.4)
    pdf.ln(2)


def draw_table(pdf: FPDF, headers: list[str], rows: list[list[str]], widths: list[float], aligns: list[str] | None = None) -> None:
    aligns = aligns or ["L"] * len(headers)
    line_h = 5.2
    pdf.set_font("DejaVu", "B", 8)
    pdf.set_fill_color(*COL_TEAL)
    pdf.set_text_color(*COL_WHITE)
    x0 = LM
    y = pdf.get_y()
    h_header = 8
    for i, (h, w) in enumerate(zip(headers, widths)):
        pdf.set_xy(x0 + sum(widths[:i]), y)
        pdf.rect(x0 + sum(widths[:i]), y, w, h_header, "F")
        pdf.set_xy(x0 + sum(widths[:i]) + 1.5, y + 1.6)
        pdf.cell(w - 3, 5, h, align=aligns[i])
    y += h_header

    pdf.set_font("DejaVu", "", 8)
    for r_i, row in enumerate(rows):
        # measure wrapped height
        heights = []
        for i, (cell, w) in enumerate(zip(row, widths)):
            pdf.set_font("DejaVu", "B" if r_i == len(rows) - 1 and row[0].startswith("Total") else "", 8)
            heights.append(max(line_h, pdf.get_string_width(cell) and 0 or 0))
        # compute actual wrap
        wrap_h = line_h
        for i, (cell, w) in enumerate(zip(row, widths)):
            n = max(1, int(pdf.get_string_width(cell) / max(w - 3, 8)) + 1)
            wrap_h = max(wrap_h, 4.4 * n + 2.2)
        wrap_h = min(wrap_h, 22)
        # simpler: always 8mm unless last total
        rh = 9 if max(len(c) for c in row) < 42 else 14
        if y + rh > pdf.h - 22:
            pdf.add_page()
            y = pdf.get_y()
        fill = COL_ROW if r_i % 2 == 0 else COL_WHITE
        pdf.set_fill_color(*fill)
        pdf.set_draw_color(*COL_LINE)
        for i, (cell, w) in enumerate(zip(row, widths)):
            pdf.set_xy(x0 + sum(widths[:i]), y)
            pdf.rect(x0 + sum(widths[:i]), y, w, rh, "DF")
            pdf.set_text_color(*COL_TEXT)
            pdf.set_font("DejaVu", "B" if r_i == len(rows) - 1 and "total" in row[0].lower() else "", 8)
            pdf.set_xy(x0 + sum(widths[:i]) + 1.4, y + 1.4)
            pdf.multi_cell(w - 2.8, 3.8, cell, align=aligns[i])
        y += rh
    pdf.set_y(y + 3)


def draw_cover(pdf: FPDF) -> None:
    w = pdf.w
    band_h = 42.0
    pdf.set_fill_color(*COL_TEAL)
    pdf.rect(0, 0, w, band_h, "F")
    pdf.set_text_color(*COL_WHITE)
    pdf.set_font("DejaVu", "B", 22)
    pdf.set_xy(LM, 10)
    pdf.cell(0, 9, "MBKRU", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("DejaVu", "", 10)
    pdf.set_x(LM)
    pdf.cell(0, 5, "Website programme   -   OceanCyber Company Limited", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("DejaVu", "B", 15)
    pdf.set_x(LM)
    pdf.cell(0, 8, "Payment statement - proposed phase fees and coverage", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(*COL_GOLD)
    pdf.set_line_width(0.8)
    pdf.line(LM, band_h - 2, w - LM, band_h - 2)

    pdf.set_xy(LM, band_h + 8)
    pdf.set_text_color(*COL_MUTED)
    pdf.set_font("DejaVu", "", 8.5)
    pdf.multi_cell(
        CONTENT_W,
        4.2,
        "For sponsors and finance   -   Quotation OC-WEB-2025-001 (March 2025)   -   Statement 5 September 2026   -   Total paid GHS 40,000",
    )

    y = pdf.get_y() + 4
    box_w = (CONTENT_W - 8) / 3
    facts = [
        ("Agreed programme (Ph 1-3)", "GHS 84,000"),
        ("Total paid", "GHS 40,000"),
        ("Remaining due", "GHS 44,000"),
    ]
    for i, (label, value) in enumerate(facts):
        x = LM + i * (box_w + 4)
        pdf.set_fill_color(*COL_TEAL_LIGHT)
        pdf.set_draw_color(*COL_LINE)
        pdf.rect(x, y, box_w, 16, "DF")
        pdf.set_xy(x + 3, y + 2)
        pdf.set_font("DejaVu", "", 7.5)
        pdf.set_text_color(*COL_MUTED)
        pdf.cell(box_w - 6, 4, label)
        pdf.set_xy(x + 3, y + 7)
        pdf.set_font("DejaVu", "B", 12)
        pdf.set_text_color(*COL_TEAL)
        pdf.cell(box_w - 6, 6, value)
    pdf.set_y(y + 20)

    heading(pdf, "Proposed phase fees (from OC-WEB-2025-001)")
    draw_table(
        pdf,
        ["Phase", "Original proposal", "Agreed fee", "Paid", "Remaining"],
        [
            ["1 Brand launch", "GHS 14,850 (fixed, signed)", "14,850", "14,850", "0"],
            ["2 Voice & alerts", "Indicative 22,000 - 35,000", "40,650", "25,150", "15,500"],
            ["3 Accountability tracker", "Indicative 32,000 - 50,000", "28,500", "0", "28,500"],
            ["Total programme", "Phase 1 quoted; 2-3 later agreed", "84,000", "40,000", "44,000"],
        ],
        [36, 52, 30, 30, 30],
        ["L", "L", "R", "R", "R"],
    )
    body(
        pdf,
        "The March 2025 quotation priced Phase 1 only. Phases 2 and 3 were indicative ranges. "
        "The agreed programme price is GHS 84,000: Phase 2 GHS 40,650 (above the original range because Voice, auth, report card and admin were specified in full) and Phase 3 GHS 28,500 (lower end of the original range). VAT on Phase 1 was 0%.",
        9,
    )

    heading(pdf, "What each phase fee covers")
    draw_table(
        pdf,
        ["Phase", "Fee (GHS)", "What the money is for"],
        [
            [
                "1",
                "14,850",
                "Discovery, UI/UX, 10-page public site, CMS, SEO, analytics, QA, deploy, training, 30-day support",
            ],
            [
                "2",
                "40,650",
                "Registration, reports, tracking, admin, notifications, Queen Mother community spaces (directory, join, verification, forums)",
            ],
            [
                "3",
                "28,500",
                "MP tracker, report card, partner API, Queen Mother council evaluations signed into the scorecard",
            ],
        ],
        [18, 28, 132],
        ["L", "R", "L"],
    )


def draw_phase1(pdf: FPDF) -> None:
    heading(pdf, "Phase 1 - GHS 14,850 (paid in full)")
    body(
        pdf,
        "Quoted and signed in OC-WEB-2025-001 section 6. Tranche 1 of GHS 14,850 settles this phase. "
        "Payment schedule on the quotation: 50% deposit 7,425 / 30% mid-point 4,455 / 20% final 2,970.",
    )
    heading(pdf, "Quoted line items - what GHS 14,850 paid for")
    draw_table(
        pdf,
        ["#", "Deliverable / service", "GHS"],
        [
            ["1", "Project discovery, research & strategy", "1,150.00"],
            ["2", "UI/UX design - wireframes, Figma mockups & design system", "2,500.00"],
            ["3", "Frontend development - 10 pages (Next.js, TypeScript, Tailwind)", "5,200.00"],
            ["4", "CMS integration - news/blog, resources, team", "1,650.00"],
            ["5", "SEO setup - on-page, technical SEO, sitemap, Search Console", "1,050.00"],
            ["6", "Analytics, newsletter & third-party integrations", "820.00"],
            ["7", "QA, testing, performance & accessibility audit", "860.00"],
            ["8", "Deployment, domain configuration & SSL", "650.00"],
            ["9", "Client CMS training (1 hour, remote)", "380.00"],
            ["10", "Post-launch support & bug fixing (30 days)", "590.00"],
            ["", "Phase 1 total", "14,850.00"],
        ],
        [12, 132, 34],
        ["C", "L", "R"],
    )
    heading(pdf, "Ten pages included in that fee")
    bullets(
        pdf,
        [
            "Homepage - mission, pillars, early-access CTA",
            "About Us - story, values, leadership",
            "Citizens Voice (preview) - upcoming reporting feature + early access",
            "Situational Alerts (preview) - alert categories and teaser",
            "Parliament & Ministers Tracker (preview) - scorecard concept + signup",
            "News & Updates / Blog - CMS-managed",
            "Resources - reports and policy documents",
            "Partners & Supporters",
            "Contact Us - form and enquiries",
            "Privacy Policy & Terms",
        ],
    )


def draw_phase2(pdf: FPDF) -> None:
    heading(pdf, "Phase 2 - agreed GHS 40,650 (part paid)")
    draw_table(
        pdf,
        ["Item", "GHS"],
        [
            ["Original proposal (indicative range)", "22,000 - 35,000"],
            ["Agreed Phase 2 fee", "40,650.00"],
            ["Paid to date (part of the GHS 40,000 total)", "25,150.00"],
            ["Still due to close Phase 2", "15,500.00"],
        ],
        [128, 50],
        ["L", "R"],
    )
    heading(pdf, "What the Phase 2 fee covers (proposal section 8)")
    body(pdf, "Citizens Reporting & Alerting Platform - original quotation:")
    bullets(
        pdf,
        [
            "User registration and authentication",
            "Complaint / citizen-report submission forms",
            "Geolocation tagging",
            "Status tracking",
            "Admin dashboard",
            "Notification system",
            "Categorised reporting by sector (health, education, utilities, and related)",
        ],
    )
    body(
        pdf,
        "Same fee also covers the agreed programme build: member accounts, MBKRU Voice, situational and election intake, "
        "promises / People's Report Card browse, admin queues, APIs, rate limits, and platform hardening.",
    )
    heading(pdf, "Queen Mothers in Phase 2 (community layer)")
    body(
        pdf,
        "Split so Phase 2 is not overloaded. Queen Mother work that needs member login sits here, inside the existing GHS 40,650 fee (no extra phase fee).",
    )
    bullets(
        pdf,
        [
            "Community directory at /communities and join / leave",
            "Queen Mother (verified) and moderator roles",
            "Forums, posts, and moderation",
            "Community manage dashboard for leadership",
        ],
    )


def draw_phase3_and_paid(pdf: FPDF) -> None:
    heading(pdf, "Phase 3 - agreed GHS 28,500 (unpaid)")
    draw_table(
        pdf,
        ["Item", "GHS"],
        [
            ["Original proposal (indicative range)", "32,000 - 50,000"],
            ["Agreed Phase 3 fee", "28,500.00"],
            ["Paid to date", "0.00"],
            ["Still due for Phase 3", "28,500.00"],
        ],
        [128, 50],
        ["L", "R"],
    )
    heading(pdf, "What the Phase 3 fee covers (proposal section 8)")
    body(pdf, "Parliamentary & Ministerial Accountability Tracker - original quotation:")
    bullets(
        pdf,
        [
            "MP and minister profiles",
            "Promise tracking",
            "Voting records and attendance logs (as data becomes available)",
            "Constituency project tracker",
            "Public rating and comment system",
            "Data visualisation dashboards",
            "Media / Hansard-style integration where licensed",
        ],
    )
    body(
        pdf,
        "Same fee also covers published People's Report Card, partner JSON API, methodology, and election-observation surfaces.",
    )
    heading(pdf, "Queen Mothers in Phase 3 (accountability layer)")
    body(
        pdf,
        "The council-to-scorecard work sits in Phase 3 so workload balances with the unpaid GHS 28,500 tracker fee. It uses Phase 2 login and roles.",
    )
    bullets(
        pdf,
        [
            "Council portal at /communities/[slug]/portal",
            "Queen Mother sign-off on Council MP Evaluations",
            "Signed evaluations enter Voice / Report Card as corroborated (verified) signals",
        ],
    )

    heading(pdf, "How the GHS 40,000 paid was applied")
    draw_table(
        pdf,
        ["Payment", "GHS", "Applied to", "What it covered"],
        [
            ["Tranche 1", "14,850", "Phase 1 in full", "All Phase 1 line items and 10 pages"],
            ["Tranche 2", "25,150", "Phase 2 part (61.9%)", "Auth, Voice, tracking, admin queue"],
            ["Total paid", "40,000", "", ""],
        ],
        [32, 28, 42, 76],
        ["L", "R", "L", "L"],
    )

    heading(pdf, "Remaining due")
    draw_table(
        pdf,
        ["Next payment", "GHS", "Purpose"],
        [
            ["Phase 2 close-out", "15,500", "Voice, alerts, admin, Queen Mother community spaces"],
            ["Phase 3", "28,500", "Tracker, election-readiness, Queen Mother council evaluations"],
            ["Total remaining", "44,000", "Completes the GHS 84,000 programme"],
        ],
        [48, 32, 98],
        ["L", "R", "L"],
    )
    body(
        pdf,
        "Match these figures to bank receipts. Live site: https://mbkru.org/   -   Payee: OceanCyber Company Limited, enquiries@oceancyber.net",
        9,
    )


def main() -> int:
    pdf = DesignedPDF()
    register_fonts(pdf)
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(LM, 22, LM)

    pdf.add_page()
    draw_cover(pdf)

    pdf.add_page()
    draw_phase1(pdf)

    pdf.add_page()
    draw_phase2(pdf)

    pdf.add_page()
    draw_phase3_and_paid(pdf)

    pdf.output(str(OUT_PATH))
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
