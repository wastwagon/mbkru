#!/usr/bin/env python3
"""Generate MBKRU platform handover PDF from structured content."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "MBKRU_PLATFORM_HANDOVER_REPORT.pdf"

MARGIN = 2 * cm
PAGE_W, PAGE_H = A4
CONTENT_W = PAGE_W - 2 * MARGIN


def build_styles():
    base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "DocTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            spaceAfter=14,
            textColor=colors.HexColor("#1a365d"),
        ),
        "subtitle": ParagraphStyle(
            "DocSubtitle",
            parent=base["Normal"],
            fontSize=11,
            leading=14,
            spaceAfter=6,
            textColor=colors.HexColor("#4a5568"),
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            spaceBefore=18,
            spaceAfter=10,
            textColor=colors.HexColor("#1a365d"),
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            spaceBefore=14,
            spaceAfter=8,
            textColor=colors.HexColor("#2c5282"),
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            leftIndent=14,
            spaceAfter=4,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=10,
            leading=14,
            leftIndent=18,
            rightIndent=18,
            spaceBefore=8,
            spaceAfter=8,
            textColor=colors.HexColor("#2d3748"),
            backColor=colors.HexColor("#f7fafc"),
            borderPadding=8,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontSize=8,
            textColor=colors.HexColor("#718096"),
            alignment=TA_CENTER,
        ),
        "th": ParagraphStyle(
            "TH",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=colors.white,
        ),
        "td": ParagraphStyle(
            "TD",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
        ),
    }
    return styles


def p(text, style):
    return Paragraph(text.replace("\n", "<br/>"), style)


def make_table(headers, rows, styles):
    data = [[p(h, styles["th"]) for h in headers]]
    for row in rows:
        data.append([p(str(c), styles["td"]) for c in row])

    col_count = len(headers)
    col_w = CONTENT_W / col_count
    if col_count == 4:
        widths = [col_w * 0.9, col_w * 0.7, col_w * 1.5, col_w * 0.9]
    elif col_count == 3:
        widths = [col_w * 1.1, col_w * 1.4, col_w * 0.5]
    elif col_count == 2:
        widths = [col_w * 0.55, col_w * 1.45]
    else:
        widths = [CONTENT_W / col_count] * col_count

    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c5282")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#718096"))
    canvas.drawCentredString(PAGE_W / 2, 1.2 * cm, f"MBKRU Advocates — Platform Handover Report — Page {doc.page}")
    canvas.restoreState()


def build_story(styles):
    s = styles
    story = []

    story.append(p("MBKRU Advocates Platform", s["title"]))
    story.append(p("Phase 1 to Phase 3 Handover Report", s["title"]))
    story.append(Spacer(1, 0.3 * cm))
    story.append(p("<b>Site:</b> https://mbkru.org/", s["subtitle"]))
    story.append(p("<b>Report date:</b> 27 June 2026 (updated — training & verification appendix)", s["subtitle"]))
    story.append(
        p(
            "<b>Purpose:</b> Handover for training, testing, and moving from demo data to real programme data",
            s["subtitle"],
        )
    )
    story.append(Spacer(1, 0.4 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e0")))
    story.append(Spacer(1, 0.4 * cm))

    # Executive summary
    story.append(p("Executive summary", s["h1"]))
    story.append(
        p(
            "The MBKRU Advocates platform at <b>mbkru.org</b> is <b>live and running the full Phase 1–3 programme</b>. "
            "Visitors can browse accountability data, register as members, submit and track reports, join communities, "
            "and staff can manage everything through an admin console.",
            s["body"],
        )
    )
    story.append(p("<b>What is complete:</b> All planned software for Phases 1, 2, and 3 is built, deployed, and usable today. Automated checks: <b>431 unit tests passing</b>, production build succeeds, <b>26 E2E tests passing</b>.", s["body"]))
    story.append(
        p(
            "<b>Without real API keys (~95% of features):</b> Reporting, admin, communities, and Report Card can be trained locally using built-in mocks (see Training & verification appendix).",
            s["body"],
        )
    )
    story.append(p("<b>What still needs your team (not a software gap):</b>", s["body"]))
    for item in [
        "Legal review of Privacy, Terms, and public-facing claims",
        "Replacing demo/seed content with real editorial content and verified accountability data",
        "Operational setup (email inboxes, SMS, Ghana Card verification credentials, backup procedures)",
        "Staff training on triage workflows, data import, and moderation",
    ]:
        story.append(p(f"• {item}", s["bullet"]))

    story.append(p("Live snapshot (as observed on mbkru.org):", s["h2"]))
    story.append(
        make_table(
            ["Metric", "Current value"],
            [
                ["Citizen reports received", "16"],
                ["Commitments tracked", "147"],
                ["Published news stories", "6"],
                ["Published Report Card cycles", "1 (2026, 3 MP rows — pending editorial review)"],
                ["Sitting MPs in roster", "276"],
            ],
            styles,
        )
    )
    story.append(Spacer(1, 0.3 * cm))
    story.append(
        p(
            "Several reports on the site are demo/seed data (e.g. MBKRU-DEMO-COHORT, MBKRU-SEED). "
            "Useful for training — do not present as real citizen findings in public communications.",
            s["body"],
        )
    )

    story.append(p("How the three phases fit together", s["h1"]))
    story.append(
        make_table(
            ["Phase", "What it means for users", "Status"],
            [
                ["Phase 1", "Public website, news, resources, contact forms, admin CMS", "Complete & live"],
                ["Phase 2", "Member accounts, MBKRU Voice, parliament/promise tracking, communities, petitions", "Complete & live"],
                ["Phase 3", "People's Report Card, election observation, partner data sharing", "Complete & live"],
            ],
            styles,
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(p("The production site is running <b>Phase 3</b> — all tools are visible to the public.", s["body"]))

    # Phase 1
    story.append(PageBreak())
    story.append(p("Phase 1 — Public website & content management", s["h1"]))
    story.append(
        p(
            "<b>Goal:</b> A credible public face for MBKRU with staff-managed news and lead capture — no member login required.",
            s["body"],
        )
    )

    story.append(p("Public features", s["h2"]))
    story.append(
        make_table(
            ["Feature", "URL", "What it does", "Status"],
            [
                ["Homepage", "/", "Programme overview, live stats, MP search", "Working"],
                ["About MBKRU", "/about", "Organisation story and five pillars", "Working"],
                ["News & updates", "/news", "Blog-style newsroom (6 stories live)", "Working — refresh content"],
                ["Resources library", "/resources", "Downloadable documents", "Working"],
                ["Partners", "/partners", "Partner listing", "Working — verify MOUs"],
                ["Contact us", "/contact", "Contact form → admin inbox", "Working"],
                ["Diaspora programme", "/diaspora", "Engagement and feedback", "Working"],
                ["Legal & trust", "/privacy, /terms, etc.", "Privacy, terms, FAQ", "Working — legal review needed"],
                ["Methodology", "/methodology", "Tracking and scoring approach", "Working"],
                ["Data sources", "/data-sources", "Data provenance", "Working"],
            ],
            styles,
        )
    )

    story.append(Spacer(1, 0.3 * cm))
    story.append(p("Admin console (Phase 1) — staff login at /admin/login", s["h2"]))
    story.append(
        make_table(
            ["Admin area", "What staff can do", "Status"],
            [
                ["Dashboard", "Overview counts", "Working"],
                ["News posts", "Create, edit, publish stories", "Working"],
                ["Media library", "Upload and reuse images", "Working"],
                ["Resources", "Manage downloadable files", "Working"],
                ["Contact submissions", "Read contact form messages", "Working"],
                ["Lead capture", "Newsletter, early access + CSV export", "Working"],
                ["Diaspora feedback", "Review diaspora submissions", "Working"],
                ["Site settings", "Maintenance / under-construction gate", "Working"],
            ],
            styles,
        )
    )

    story.append(Spacer(1, 0.3 * cm))
    story.append(p("Phase 1 — items for your team", s["h2"]))
    story.append(
        make_table(
            ["Item", "Priority", "Notes"],
            [
                ["Replace seed news with real editorial calendar", "Medium", "6 stories exist"],
                ["Legal review of Privacy & Terms", "High", "Counsel sign-off not yet recorded"],
                ["Configure contact email notifications", "Medium", "Forms save to DB; email needs setup"],
                ["Production backups & secrets", "High", "See internal ops runbook"],
                ["Partners page — real logos/MOUs", "Medium", "May not reflect current partnerships"],
            ],
            styles,
        )
    )

    # Phase 2
    story.append(PageBreak())
    story.append(p("Phase 2 — Member participation & accountability data", s["h1"]))
    story.append(
        p(
            "<b>Goal:</b> Ghanaians register, submit reports with evidence, track responses, and browse MP/commitment data.",
            s["body"],
        )
    )

    story.append(p("Member accounts", s["h2"]))
    story.append(
        make_table(
            ["Feature", "URL", "What it does", "Status"],
            [
                ["Register", "/register", "Create account", "Working"],
                ["Sign in", "/login", "Member login", "Working"],
                ["Password reset", "/forgot-password", "Password recovery", "Working"],
                ["My account", "/account", "Dashboard, Ghana Card, privacy tools", "Working"],
                ["My reports", "/account/reports", "Member submissions list", "Working"],
                ["Notifications", "/account/notifications", "In-app alerts", "Working"],
                ["Ghana Card verification", "/account", "Identity check for MP performance reports", "Built — needs Hubtel"],
            ],
            styles,
        )
    )
    story.append(
        p(
            "<b>Training note:</b> Most report types need only a member account. MP performance reports also require verified Ghana Card when enabled.",
            s["body"],
        )
    )

    story.append(p("MBKRU Voice — citizen reporting", s["h2"]))
    story.append(
        make_table(
            ["Feature", "URL", "Status"],
            [
                ["Voice hub", "/citizens-voice", "Working"],
                ["Submit a report", "/citizens-voice/submit", "Working — 16 reports live"],
                ["Track a report", "/track-report", "Working"],
                ["Public causes", "/citizens-voice/causes", "Working"],
                ["Report discussions", "/citizens-voice/discussions", "Working"],
                ["Voice statistics", "/transparency", "Working"],
                ["MBKRU Voice AI chat", "Chat widget", "Working — needs OpenAI key"],
                ["Whistleblower guidance", "/whistleblowing", "Working"],
            ],
            styles,
        )
    )

    story.append(Spacer(1, 0.2 * cm))
    story.append(p("Report types:", s["body"]))
    for item in [
        "MBKRU Voice (general) — street lighting, procurement, service delivery",
        "MP performance — constituency surgery hours, MP responsiveness",
        "Government performance — district assembly timelines",
        "Situational alert — market closures, road blocks, festival routing",
        "Election observation — queue times, agent behaviour, polling accessibility",
    ]:
        story.append(p(f"• {item}", s["bullet"]))

    story.append(p("Parliament & commitment tracking", s["h2"]))
    story.append(
        make_table(
            ["Feature", "URL", "Status"],
            [
                ["Parliament tracker", "/parliament-tracker", "Working — 276 MPs"],
                ["Commitment catalogue", "/promises", "Working — 147 rows"],
                ["Government commitments", "/government-commitments", "Working"],
                ["Regional hubs", "/regions/[slug]", "Working — 16 regions"],
            ],
            styles,
        )
    )

    story.append(p("Communities (Queen Mothers & traditional areas)", s["h2"]))
    story.append(
        make_table(
            ["Feature", "URL", "Status"],
            [
                ["Browse communities", "/communities", "Working"],
                ["Council portal", "/communities/[slug]/portal", "Working — includes Council MP Evaluation"],
                ["Forums & threads", "/communities/[slug]/forums", "Working"],
                ["Community management", "/communities/[slug]/manage", "Working"],
            ],
            styles,
        )
    )
    story.append(
        p(
            "<b>Council MP Evaluation:</b> Council leaders record structured MP meeting evaluations. "
            "After Queen Mother sign-off, these enter the staff triage queue alongside citizen reports.",
            s["body"],
        )
    )

    story.append(p("Key admin areas (Phase 2)", s["h2"]))
    story.append(
        make_table(
            ["Admin area", "What staff can do", "Status"],
            [
                ["Reports queue", "Triage submissions; status, SLA, notes", "Working"],
                ["Citizen report analytics", "Aggregates + CSV export", "Working"],
                ["MP performance signals", "Intakes by tier and source", "Working"],
                ["Parliament & MPs", "Import roster, manage promises", "Working"],
                ["Members", "Review identity, manage accounts", "Working"],
                ["Communities", "Moderate posts, verify Queen Mother roles", "Working"],
                ["Notifications outbox", "Retry failed emails/SMS", "Working"],
            ],
            styles,
        )
    )

    story.append(p("Phase 2 — items for your team", s["h2"]))
    story.append(
        make_table(
            ["Item", "Priority", "Notes"],
            [
                ["Voice triage SLA & abuse path", "High", "Staff need RACI for response times"],
                ["Configure Hubtel (Ghana Card)", "High", "MP performance gate may block without it"],
                ["Configure email (Resend)", "Medium", "Status update emails"],
                ["Import real MP/constituency CSV", "High", "Verify against EC data"],
                ["Train community moderators", "High", "See governance doc"],
                ["Community email digests", "Not built", "Future work"],
            ],
            styles,
        )
    )

    # Phase 3
    story.append(PageBreak())
    story.append(p("Phase 3 — People's Report Card & election programme", s["h1"]))
    story.append(
        p(
            "<b>Goal:</b> Publish flagship MP accountability scorecards, election-season reporting, and partner data exports.",
            s["body"],
        )
    )

    story.append(
        make_table(
            ["Feature", "URL", "Status"],
            [
                ["People's Report Card", "/report-card", "Working"],
                ["Report Card 2026", "/report-card/2026", "Working — 3 MPs Pending review"],
                ["Election observation hub", "/election-observation", "Working"],
                ["Election submit", "/citizens-voice/submit/election", "Working"],
                ["Partner API summary", "/partner-api", "Working — MOU review recommended"],
            ],
            styles,
        )
    )
    story.append(
        p(
            "<b>Pending</b> on Report Card means the cycle exists but final narratives and scores await editorial sign-off — "
            "do not present as official findings.",
            s["body"],
        )
    )

    story.append(p("Phase 3 — items for your team", s["h2"]))
    story.append(
        make_table(
            ["Item", "Priority", "Notes"],
            [
                ["Editorial sign-off before publishing scores", "Critical", "Not official until review complete"],
                ["Replace demo Report Card content", "High", "2026 cycle has 3 pending rows"],
                ["Election observation copy review", "Medium", "Avoid overclaim"],
                ["Partner API MOU", "Medium", "Technical API works; legal TBD"],
                ["Real datasets before 'live data' claims", "Critical", "Follow CSV import runbook"],
            ],
            styles,
        )
    )

    # Services & handover
    story.append(p("Connected services (setup checklist)", s["h1"]))
    story.append(
        make_table(
            ["Service", "Used for", "Required?", "If not configured"],
            [
                ["PostgreSQL", "All content, reports, members", "Yes", "Site does not function"],
                ["Resend (email)", "Alerts, status updates", "Recommended", "Forms save; no email"],
                ["Hubtel", "Ghana Card verification", "Recommended", "Verification unavailable"],
                ["Twilio (SMS)", "Status SMS", "Optional", "SMS skipped"],
                ["Turnstile", "Bot protection", "Optional", "Forms work without it"],
                ["OpenAI", "Voice chatbot", "Optional", "Chat unavailable"],
                ["Redis", "Rate limiting", "Optional", "In-memory fallback"],
            ],
            styles,
        )
    )

    story.append(p("Recommended handover sequence", s["h1"]))
    for week, items in [
        (
            "Week 1 — Orientation",
            [
                "Create admin operator accounts",
                "Walk through admin dashboard",
                "Review demo data — archive vs training",
                "Assign triage, moderation, Report Card roles",
            ],
        ),
        (
            "Week 2 — Content & data",
            [
                "Refresh news posts and resources",
                "Run MP/constituency CSV import (dry-run first)",
                "Add commitment rows with complete citations",
                "Legal review kickoff",
            ],
        ),
        (
            "Week 3 — Participation testing",
            [
                "Submit one report of each type",
                "Practice triage end-to-end",
                "Test community join → post → moderation",
                "Configure Hubtel and test Ghana Card",
            ],
        ),
        (
            "Week 4 — Accountability publication",
            [
                "Draft Report Card entries (do not publish until sign-off)",
                "Clear demo data from public stats",
                "Document messaging: tracking vs finding vs pending",
            ],
        ),
    ]:
        story.append(p(week, s["h2"]))
        for item in items:
            story.append(p(f"• {item}", s["bullet"]))

    story.append(PageBreak())
    story.append(p("Training & verification appendix", s["h1"]))
    story.append(
        p(
            "Use this section if your team trains on a <b>local copy</b> of the platform in addition to production at mbkru.org.",
            s["body"],
        )
    )

    story.append(p("Software readiness (confirmed)", s["h2"]))
    story.append(
        make_table(
            ["Check", "Result"],
            [
                ["Unit + integration tests", "431 passed"],
                ["Production build", "Success"],
                ["E2E smoke + route checks", "26 passed"],
                ["Phase 1–3 features", "Implemented and testable"],
            ],
            styles,
        )
    )

    story.append(p("Production vs local testing", s["h2"]))
    story.append(
        make_table(
            ["Environment", "Best for", "URL"],
            [
                ["Production", "Real data, public demos", "https://mbkru.org/"],
                ["Local", "Safe practice, mocks, no live email", "http://localhost:1100"],
            ],
            styles,
        )
    )
    story.append(
        p(
            "Local setup requires Docker Desktop. Run <b>npm run setup:local</b> then <b>npm run dev</b>. "
            "Technical gap list: <b>docs/LOCAL_DEV_GAPS.md</b> in the repository.",
            s["body"],
        )
    )

    story.append(p("Training accounts (local only)", s["h2"]))
    story.append(
        make_table(
            ["Role", "Login", "Password"],
            [
                ["Admin", "admin@example.com", "DevAdmin!mbkru-local-2026"],
                ["Pilot member", "pilot.member@mbkru.local", "PilotMember!change-me-2026"],
                ["Second pilot", "pilot.two@mbkru.local", "Same as above"],
            ],
            styles,
        )
    )
    story.append(
        p(
            "<b>Ghana Card mock (local):</b> On /account use card <b>GHA-000000000-0</b> with any legal name — no Hubtel needed.",
            s["body"],
        )
    )

    story.append(p("Works locally without production API keys", s["h2"]))
    for item in [
        "Register, login, all report types — works",
        "Admin triage, analytics, communities — works",
        "Report Card editor, parliament/promises — works (seed data)",
        "Contact & lead forms — saves to DB (no email alert)",
        "Ghana Card — mock mode; SMS — console log only; Voice AI — needs OpenAI key",
    ]:
        story.append(p(f"• {item}", s["bullet"]))

    story.append(p("Pending production API integrations (expected)", s["h2"]))
    for item in [
        "Hubtel — real Ghana Card verification",
        "Resend — email delivery",
        "Twilio — optional SMS",
        "OpenAI / Tavily — Voice AI chat",
        "Mailchimp / ConvertKit — newsletter sync",
        "Cloudflare Turnstile — bot protection",
    ]:
        story.append(p(f"• {item}", s["bullet"]))

    story.append(p("Automated verification: npm run verify:local", s["body"]))

    story.append(p("Status statement for stakeholders", s["h1"]))
    story.append(
        p(
            "The platform's Phase 1–3 software is complete, deployed at mbkru.org, and ready for staff training "
            "and controlled real-data intake. Declaring the programme fully 'live' for public accountability claims "
            "still requires legal review, replacing demo data, configuring services, and editorial sign-off on Report Card scores.",
            s["quote"],
        )
    )

    story.append(p("Quick reference — key URLs", s["h1"]))
    story.append(
        make_table(
            ["Audience", "URL"],
            [
                ["Public visitors", "https://mbkru.org/"],
                ["New members", "https://mbkru.org/register"],
                ["Submit a report", "https://mbkru.org/citizens-voice/submit"],
                ["Track a report", "https://mbkru.org/track-report"],
                ["People's Report Card", "https://mbkru.org/report-card"],
                ["MP / commitments", "https://mbkru.org/parliament-tracker"],
                ["Staff admin", "https://mbkru.org/admin/login"],
            ],
            styles,
        )
    )

    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
    story.append(Spacer(1, 0.2 * cm))
    story.append(p("Document generated for MBKRU Advocates programme handover — June 2026. Appendix: local training & verification.", s["footer"]))

    return story


def main():
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN + 0.5 * cm,
        title="MBKRU Platform Handover Report",
        author="MBKRU Advocates",
    )
    doc.build(build_story(styles), onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
