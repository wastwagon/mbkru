#!/usr/bin/env python3
"""Generate MBKRU + Diaspora programme integration PDF from programme docs."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(__file__).resolve().parents[1] / "docs" / "MBKRU_Diaspora_Programme_Integration.pdf"


def bullet_list(items: list[str], style) -> ListFlowable:
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=12) for t in items],
        bulletType="bullet",
        start="•",
    )


def build_pdf() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="MBKRU and Diaspora Programme Integration",
        author="MBKRU Advocates",
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontSize=22,
        spaceAfter=6,
        textColor=colors.HexColor("#0B3D2E"),
    )
    subtitle = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#475569"),
        spaceAfter=20,
    )
    h1 = ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontSize=14,
        spaceBefore=14,
        spaceAfter=8,
        textColor=colors.HexColor("#0B3D2E"),
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontSize=12,
        spaceBefore=10,
        spaceAfter=6,
        textColor=colors.HexColor("#14532D"),
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10.5,
        leading=14,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
    )
    small = ParagraphStyle(
        "Small",
        parent=body,
        fontSize=9,
        textColor=colors.HexColor("#64748B"),
    )

    story: list = []
    story.append(Paragraph("MBKRU &amp; Diaspora Programme", title))
    story.append(
        Paragraph(
            "Integration plan — merge model, aims, work plan &amp; support<br/>"
            "<i>My Brother's Keeper Restoration United (MBKRU) Advocates</i>",
            subtitle,
        )
    )
    story.append(
        Paragraph(
            "Document version: May 2026 · Source: mbkru-website programme docs, public site copy, "
            "ROADMAP_2028_ELECTION.md, EARLY_RECOGNITION_LAUNCH_PLAN.md",
            small,
        )
    )
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("1. Executive summary", h1))
    story.append(
        Paragraph(
            "The Diaspora programme is not a separate product. It is <b>Pillar E</b> of MBKRU — the bridge between "
            "Ghana's global community and the same citizen accountability platform used at home. On the website, "
            "diaspora content lives under <b>/diaspora</b> and <b>/diaspora/feedback</b>, shares the platform phase "
            "rollout (<b>NEXT_PUBLIC_PLATFORM_PHASE</b>), and unlocks accountability tools in step with Phases 2 and 3 "
            "of the main programme.",
            body,
        )
    )
    story.append(
        Paragraph(
            "The policy framing of the global Ghanaian community as a <b>\"17th region\"</b> (alongside the sixteen "
            "regions on the map) is explained in programme news content; the Diaspora hub focuses on practical "
            "signposting, accountability participation, and structured feedback — not on replacing embassies, NIA, or courts.",
            body,
        )
    )

    story.append(Paragraph("2. Aim and purpose", h1))
    story.append(Paragraph("2.1 Programme aim (MBKRU overall)", h2))
    story.append(
        Paragraph(
            "<b>Vision:</b> A Ghana where no citizen feels powerless, where government listens, responds, and delivers, "
            "and where poverty is treated as a national emergency rather than an acceptable condition.",
            body,
        )
    )
    story.append(
        Paragraph(
            "<b>Mission:</b> To serve as a trusted, non-partisan conduit between citizens and governance — giving voice "
            "to the voiceless, protecting the vulnerable, and enforcing accountability at every level, including through "
            "restorative justice and development partnerships.",
            body,
        )
    )
    story.append(Paragraph("2.2 Diaspora programme purpose", h2))
    story.append(
        bullet_list(
            [
                "<b>Signpost</b> Ghanaians abroad to official channels (Ghana Card / NIA, passport / MFA, immigration / GIS) "
                "with clear limits: MBKRU educates; it does not process ID or passports.",
                "<b>Enable accountability from abroad</b> using the same public commitment catalogue, petitions (when enabled), "
                "and People's Report Card methodology as citizens in Ghana.",
                "<b>Listen systematically</b> via structured feedback (recent visit vs. abroad-only supporter) to improve "
                "the hub, partnerships, and rollout priorities.",
                "<b>Connect</b> diaspora associations, professionals, and faith groups to non-partisan accountability work "
                "through /partners and programme staff — without partisan campaigning.",
            ],
            body,
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        Paragraph(
            "<b>North-star calendar anchor:</b> Accountability Scorecards published 90 days before the Ghana 2028 general "
            "election (Aug–Sep 2028), with diaspora voices contributing evidence and pressure throughout the cycle.",
            body,
        )
    )

    story.append(Paragraph("3. How MBKRU and the Diaspora programme merge", h1))
    story.append(Paragraph("3.1 One platform, one phase gate", h2))
    story.append(
        Paragraph(
            "Diaspora surfaces use the same <b>platform phase</b> as the rest of mbkru.org.gh. The "
            "<i>DiasporaProgrammePhaseNotice</i> on /diaspora tells visitors what is live on this deployment:",
            body,
        )
    )
    phase_data = [
        ["Phase", "Diaspora hub", "Shared MBKRU platform"],
        [
            "1 — Foundation",
            "Signposting, policy context, structured feedback, methodology link",
            "Public site, CMS, contact/lead, no live accountability DB on catalogue",
        ],
        [
            "2+ — Accountability data",
            "Government commitments card; petitions when Voice platform enabled; same methodology as home",
            "MBKRU Voice, promise catalogue, Report Card collection, town halls, legal desk pilots",
        ],
        [
            "3 — Election readiness",
            "Full Ghana v1 methodology on public report card; partner JSON; optional MP rubric on Voice",
            "Scorecards, situational alerts, partner API, election observatory features",
        ],
    ]
    t = Table(phase_data, colWidths=[3.2 * cm, 5.5 * cm, 7.5 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3D2E")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("3.2 Three paths on the Diaspora hub (visitor journeys)", h2))
    story.append(
        bullet_list(
            [
                "<b>Official documentation</b> — Ghana Card, passport, nationality: verified links to NIA, MFA, GIS; "
                "users must confirm fees and rules on .gov.gh.",
                "<b>Accountability from abroad</b> — browse government commitments and MP-linked promises when Phase 2+ "
                "data is enabled; otherwise /methodology explains rollout.",
                "<b>Tell us your experience</b> — /diaspora/feedback with engagement kind RECENT_VISIT or ABROAD_SUPPORTER.",
            ],
            body,
        )
    )

    story.append(Paragraph("3.3 Data and operations merge", h2))
    story.append(
        bullet_list(
            [
                "Feedback stored in <b>DiasporaFeedbackSubmission</b> (Postgres) with admin triage at /admin/diaspora-feedback.",
                "Optional <b>Resend</b> auto-acknowledgement email on submit when RESEND_API_KEY is configured; human follow-up still required.",
                "<b>MBKRU Voice</b> chatbot can guide diaspora users to hub content, accountability tools, and contact — not consular case work.",
                "Comms, youth outreach, and partner liaisons remain <b>programme/GTM</b> work layered on the same digital spine.",
            ],
            body,
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("4. Work plan", h1))
    story.append(
        Paragraph(
            "The work plan has two linked tracks: <b>engineering phases</b> (what ships on the website) and "
            "<b>recognition phases R0–R4</b> (when the programme is safe to promote publicly). Diaspora aligns with both.",
            body,
        )
    )

    story.append(Paragraph("4.1 Engineering phases (summary)", h2))
    eng = [
        ["When", "Engineering", "Diaspora-relevant deliverables"],
        ["Mar 2026 — Phase 1 ✓", "Website & foundation", "/diaspora hub, feedback form, phase notice, 17th Region briefing"],
        ["Q2 2026 — Phase 2 start", "Voice MVP, Accra town hall", "Accountability cards go live with DB; petitions if enabled"],
        ["Q3–Q4 2026", "National Voice rollout", "Diaspora uses same catalogue; feedback drives signposting priorities"],
        ["Q1–Q2 2027", "Report Card Year 1", "Diaspora can cite published baselines; partner outreach"],
        ["Q3 2028", "Scorecards (90-day rule)", "Global promotion of pre-election scorecards; media/CSO partnerships"],
        ["Q4 2028", "Election", "Post-election catalogue updates; continued diaspora feedback loop"],
    ]
    t2 = Table(eng, colWidths=[3.5 * cm, 4 * cm, 8.7 * cm])
    t2.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#14532D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(t2)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("4.2 Recognition phases R0–R4 (programme / GTM)", h2))
    story.append(
        bullet_list(
            [
                "<b>R0 — Trust baseline:</b> Legal templates, ops checklist, monitored contact; diaspora copy must not over-promise live data.",
                "<b>R1 — Discoverable:</b> SEO, newsroom, resources; diaspora briefing and FAQ kept current.",
                "<b>R2 — Credible surfaces:</b> Vetted promise/report card import or clearly labelled demo; methodology matches exports.",
                "<b>R3 — Participatory pilot:</b> Voice submit + triage in named pilot regions; diaspora feedback SLA (5 business days, Ghana/GMT).",
                "<b>R4 — Partnership scale:</b> Partner API terms public; scorecard pilot year if claiming scores; diaspora associations co-brand.",
            ],
            body,
        )
    )

    story.append(Paragraph("4.3 Next 90 days (example sequencing)", h2))
    story.append(
        bullet_list(
            [
                "Complete R0 — name content owner; audit NIA/MFA/GIS links quarterly.",
                "Run R1 in parallel — publish 2–4 news items/month; refresh partners page.",
                "Staging R2 — import dry-run OR keep demo with no EC-verified implication.",
                "Pilot R3 — one region beta for Voice; match diaspora five-day acknowledgement commitment.",
                "Press moment only after R2 exit criteria.",
                "Launch outbound diaspora campaign + partner liaisons (still open in programme plan).",
            ],
            body,
        )
    )

    story.append(Paragraph("5. Support model", h1))
    story.append(Paragraph("5.1 What MBKRU provides", h2))
    story.append(
        bullet_list(
            [
                "Digital hub at /diaspora with official signposting and accountability entry points.",
                "Structured feedback channel and admin triage workflow.",
                "MBKRU Voice guidance (site navigation, programme context) for users anywhere in the world.",
                "Non-partisan accountability data (when phase-enabled): government commitments, promises, Report Card methodology.",
                "Partnership pathway via /partners for associations and media aligned with accountability.",
                "Contact: info@mbkruadvocates.org — target response within two business days (general contact).",
            ],
            body,
        )
    )
    story.append(Paragraph("5.2 What MBKRU does not provide", h2))
    story.append(
        bullet_list(
            [
                "Consular services, visa decisions, or passport/Ghana Card processing.",
                "Legal advice — users need qualified counsel for nationality and immigration complexity.",
                "Guaranteed government outcomes — MBKRU is an independent watchdog, not a ministry.",
                "Replacement for embassy/high commission urgent matters.",
            ],
            body,
        )
    )
    story.append(Paragraph("5.3 Operational support & SLAs", h2))
    story.append(
        Paragraph(
            "<b>Diaspora feedback:</b> acknowledge within <b>five business days (Ghana / GMT)</b>. Auto-email ack (if Resend "
            "configured) does not replace human follow-up. Update sitewide copy if ops cannot meet this SLA.",
            body,
        )
    )
    story.append(
        Paragraph(
            "<b>Technical support (platform):</b> Docker/Coolify deployment, Postgres migrations on container start, "
            "phase flags for staging vs production. Programme fee delivery documented separately (Phases 1–3 engineering, GHS 84,000 programme cap).",
            body,
        )
    )
    story.append(Paragraph("5.4 Partnerships & external support", h2))
    story.append(
        bullet_list(
            [
                "CHRAJ / FOI liaison for evidence-based reporting (Phase 2 roadmap).",
                "Media and CSO partnerships for scorecard broadcast (Phase 3).",
                "Diaspora associations, professional networks, faith groups — programme outreach (not yet fully automated on site).",
                "Youth channel — separate GTM line item; not a clone of diaspora-only content.",
            ],
            body,
        )
    )

    story.append(Paragraph("6. Five pillars — where Diaspora fits", h1))
    pillars = [
        "A — Digital platform (MBKRU Voice)",
        "B — Physical engagement (town halls, forums)",
        "C — Legal empowerment desk",
        "D — Accountability & electoral watch (Report Card, promise catalogue)",
        "E — Diaspora bridge & leadership listening ← integrated programme",
    ]
    story.append(bullet_list(pillars, body))

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("7. References on the live platform", h1))
    story.append(
        bullet_list(
            [
                "https://mbkru.org.gh/diaspora (or your deployment host)",
                "/diaspora/feedback · /methodology · /partners · /faq",
                "News: Diaspora & 17th Region briefing",
                "Repository docs: ROADMAP_2028_ELECTION.md, docs/EARLY_RECOGNITION_LAUNCH_PLAN.md §2.5",
            ],
            body,
        )
    )
    story.append(Spacer(1, 0.5 * cm))
    story.append(
        Paragraph(
            "<i>This document summarises programme intent from MBKRU's published materials and codebase. "
            "It does not constitute legal advice or government endorsement. Confirm live features on your deployment phase before external communications.</i>",
            small,
        )
    )

    doc.build(story)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build_pdf()
