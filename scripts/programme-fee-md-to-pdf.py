#!/usr/bin/env python3
"""Build MBKRU_PROGRAMME_FEE_AND_DELIVERY.pdf from MBKRU_PROGRAMME_FEE_AND_DELIVERY.md.

Requires: pip install fpdf2 markdown
Fonts: scripts/fonts/DejaVuSans.ttf (+ Bold) — bundled in repo for Unicode + layout.
"""

from __future__ import annotations

import html as html_module
import re
import sys
from pathlib import Path

import markdown
from fpdf import FPDF
from fpdf.enums import XPos, YPos
from fpdf.fonts import FontFace, TextStyle

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "MBKRU_PROGRAMME_FEE_AND_DELIVERY.md"
OUT_PATH = ROOT / "MBKRU_PROGRAMME_FEE_AND_DELIVERY.pdf"
FONT_DIR = ROOT / "scripts" / "fonts"
FONT_REG = FONT_DIR / "DejaVuSans.ttf"
FONT_BOLD = FONT_DIR / "DejaVuSans-Bold.ttf"

# MBKRU palette (from src/app/globals.css)
COL_TEAL = (13, 107, 92)
COL_TEAL_LIGHT = (232, 246, 241)
COL_GOLD = (212, 160, 23)
COL_TEXT = (30, 58, 79)
COL_MUTED = (91, 107, 125)
COL_WHITE = (255, 255, 255)


def to_unicode_safe_html(html: str) -> str:
    repl = {
        "\u2014": "\u2014",
        "\u2013": "\u2013",
    }
    for k, v in repl.items():
        html = html.replace(k, v)
    return html


def flatten_table_cells(html: str) -> str:
    def repl(m: re.Match) -> str:
        tag, attrs, body = m.group(1), m.group(2) or "", m.group(3)
        text = re.sub(r"<[^>]+>", "", body)
        text = html_module.unescape(text)
        return f"<{tag}{attrs}>{text}</{tag}>"

    return re.sub(r"<(th|td)((?:\s[^>]*)?)>(.*?)</\1>", repl, html, flags=re.S | re.I)


def strip_first_h1(html: str) -> str:
    return re.sub(r"<h1[^>]*>.*?</h1>\s*", "", html, count=1, flags=re.S | re.I)


def strip_style_tags(html: str) -> str:
    return re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S | re.I)


def register_fonts(pdf: FPDF) -> None:
    if not FONT_REG.is_file() or not FONT_BOLD.is_file():
        raise SystemExit(
            f"Missing fonts under {FONT_DIR}. Expected DejaVuSans.ttf and DejaVuSans-Bold.ttf."
        )
    pdf.add_font("DejaVu", "", str(FONT_REG))
    pdf.add_font("DejaVu", "B", str(FONT_BOLD))
    pdf.add_font("DejaVu", "I", str(FONT_REG))
    pdf.add_font("DejaVu", "BI", str(FONT_BOLD))


def draw_cover(pdf: FPDF) -> None:
    w = pdf.w
    band_h = 56.0

    pdf.set_fill_color(*COL_TEAL)
    pdf.rect(0, 0, w, band_h, "F")

    pdf.set_text_color(*COL_WHITE)
    pdf.set_font("DejaVu", "B", 26)
    pdf.set_xy(18, 16)
    pdf.cell(0, 12, "MBKRU", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("DejaVu", "", 10)
    pdf.set_text_color(230, 245, 242)
    pdf.set_x(18)
    pdf.cell(0, 5, "Website programme", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("DejaVu", "B", 17)
    pdf.set_text_color(*COL_WHITE)
    pdf.set_x(18)
    pdf.cell(0, 10, "Programme fee & delivery", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("DejaVu", "", 12)
    pdf.set_x(18)
    pdf.cell(0, 6, "Summary for sponsors and finance", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_draw_color(*COL_GOLD)
    pdf.set_line_width(0.8)
    pdf.line(18, band_h - 2, w - 18, band_h - 2)

    y = band_h + 14
    pdf.set_xy(18, y)
    pdf.set_text_color(*COL_MUTED)
    pdf.set_font("DejaVu", "", 9)
    pdf.multi_cell(
        w - 36,
        4.5,
        "Audience: programme sponsors, finance, and delivery partners · April 2026",
        align="L",
    )

    y = pdf.get_y() + 6
    pdf.set_xy(18, y)
    box_w = (w - 36 - 8) / 3
    facts = [
        ("Agreed programme total (Ph 1–3)", "GHS 84,000"),
        ("Received to date (confirmed)", "GHS 20,000"),
        ("Balance due (programme)", "GHS 64,000"),
    ]
    pdf.set_font("DejaVu", "", 7.5)
    for i, (label, value) in enumerate(facts):
        x = 18 + i * (box_w + 4)
        pdf.set_xy(x, y)
        pdf.set_fill_color(*COL_TEAL_LIGHT)
        pdf.set_draw_color(220, 230, 225)
        pdf.rect(x, y, box_w, 18, "DF")
        pdf.set_xy(x + 3, y + 2)
        pdf.set_text_color(*COL_MUTED)
        pdf.multi_cell(box_w - 6, 3.5, label, align="L")
        pdf.set_x(x + 3)
        pdf.set_text_color(*COL_TEAL)
        pdf.set_font("DejaVu", "B", 11)
        pdf.multi_cell(box_w - 6, 5, value, align="L")
        pdf.set_font("DejaVu", "", 7.5)

    y = y + 22
    pdf.set_xy(18, y)
    pdf.set_text_color(*COL_MUTED)
    pdf.set_font("DejaVu", "I", 8)
    pdf.multi_cell(
        w - 36,
        4,
        "Source: MBKRU_PROGRAMME_FEE_AND_DELIVERY.md · Engineering: mbkru-website · "
        "Phase 1 ref.: references/OceanCyber_Phase1_Proposal.pdf (OC-WEB-2025-001).",
        align="L",
    )

    pdf.set_text_color(*COL_TEXT)


class DesignedPDF(FPDF):
    def __init__(self) -> None:
        super().__init__(unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=18)
        self._cover_page = 1

    def header(self) -> None:
        if self.page_no() <= self._cover_page:
            return
        self.set_font("DejaVu", "", 8)
        self.set_text_color(*COL_TEAL)
        self.cell(95, 5, "MBKRU · Programme fee & delivery", align="L")
        self.set_text_color(*COL_MUTED)
        self.cell(
            95,
            5,
            "Summary · April 2026",
            align="R",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        self.set_draw_color(*COL_GOLD)
        self.set_line_width(0.35)
        self.line(self.l_margin, 18, self.w - self.r_margin, 18)
        self.ln(6)

    def footer(self) -> None:
        if self.page_no() <= self._cover_page:
            return
        self.set_y(-14)
        self.set_draw_color(230, 235, 238)
        self.set_line_width(0.2)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(2)
        self.set_font("DejaVu", "", 7.5)
        self.set_text_color(*COL_MUTED)
        left = "MBKRU Website · Programme document"
        self.cell(95, 4, left, align="L")
        self.cell(
            95,
            4,
            f"Page {self.page_no()} of {{nb}}",
            align="R",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )


def build_html(md: str) -> str:
    html = markdown.markdown(
        md,
        extensions=["tables", "fenced_code", "sane_lists"],
        output_format="html5",
    )
    html = to_unicode_safe_html(html)
    html = flatten_table_cells(html)
    html = re.sub(r"</?thead>", "", html, flags=re.I)
    html = re.sub(r"</?tbody>", "", html, flags=re.I)
    html = strip_first_h1(html)
    html = strip_style_tags(html)
    return html


def main() -> int:
    if not MD_PATH.is_file():
        print(f"Missing {MD_PATH}", file=sys.stderr)
        return 1

    md = MD_PATH.read_text(encoding="utf-8")
    html = build_html(md)

    pdf = DesignedPDF()
    register_fonts(pdf)
    pdf.alias_nb_pages()

    pdf.set_margins(18, 28, 18)
    pdf.add_page()
    draw_cover(pdf)

    pdf.set_margins(18, 28, 18)
    pdf.add_page()
    pdf.set_font("DejaVu", "", 10)
    pdf.set_text_color(*COL_TEXT)

    tag_styles = {
        "h1": TextStyle(
            font_family="DejaVu",
            font_style="B",
            font_size_pt=15,
            color="#0d6b5c",
            t_margin=6,
            b_margin=4,
        ),
        "h2": TextStyle(
            font_family="DejaVu",
            font_style="B",
            font_size_pt=12,
            color="#0d6b5c",
            t_margin=5,
            b_margin=3,
        ),
        "h3": TextStyle(
            font_family="DejaVu",
            font_style="B",
            font_size_pt=10,
            color="#1e3a4f",
            t_margin=4,
            b_margin=2,
        ),
        "p": TextStyle(
            font_family="DejaVu",
            font_size_pt=10,
            color="#1e3a4f",
            t_margin=2,
            b_margin=2,
        ),
        "ul": TextStyle(font_family="DejaVu", t_margin=3, b_margin=2),
        "ol": TextStyle(font_family="DejaVu", t_margin=3, b_margin=2),
        "li": TextStyle(font_family="DejaVu", t_margin=1, b_margin=1, l_margin=5),
        "strong": FontFace(family="DejaVu", emphasis="BOLD", color="#1a3652"),
        "em": FontFace(family="DejaVu", emphasis="ITALICS", color="#5b6b7d"),
        "a": FontFace(family="DejaVu", color="#0d6b5c", emphasis="UNDERLINE"),
        "code": FontFace(family="DejaVu", size_pt=9, color="#0d4a42"),
    }

    pdf.write_html(
        html,
        font_family="DejaVu",
        tag_styles=tag_styles,
        li_prefix_color=COL_TEAL,
        table_line_separators=True,
    )
    pdf.output(str(OUT_PATH))
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
