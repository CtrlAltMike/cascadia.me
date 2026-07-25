#!/usr/bin/env python3
"""Generate the builder-facing Resilience Network brand and voice handbook."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.fonts import addMapping
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    CondPageBreak,
    HRFlowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "resilience-network-brand-and-voice-handbook.pdf"

PAGE_W, PAGE_H = letter
MARGIN_X = 0.66 * inch
MARGIN_TOP = 0.68 * inch
MARGIN_BOTTOM = 0.66 * inch
CONTENT_W = PAGE_W - (2 * MARGIN_X)

INK = colors.HexColor("#18323B")
OCEAN = colors.HexColor("#07556B")
OCEAN_DARK = colors.HexColor("#073C4B")
SPRUCE = colors.HexColor("#42654E")
CORAL = colors.HexColor("#C95E48")
SUN = colors.HexColor("#D7A93A")
CREAM = colors.HexColor("#F8F4EA")
PAPER = colors.HexColor("#FCFAF5")
SAND = colors.HexColor("#E8DFCE")
MIST = colors.HexColor("#DCE8E6")
GRAY = colors.HexColor("#607077")
WHITE = colors.white


def register_fonts():
    font_dir = Path("/System/Library/Fonts/Supplemental")
    pdfmetrics.registerFont(TTFont("Georgia", str(font_dir / "Georgia.ttf")))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", str(font_dir / "Georgia Bold.ttf")))
    pdfmetrics.registerFont(TTFont("Georgia-Italic", str(font_dir / "Georgia Italic.ttf")))
    pdfmetrics.registerFont(TTFont("Arial", str(font_dir / "Arial.ttf")))
    pdfmetrics.registerFont(TTFont("Arial-Bold", str(font_dir / "Arial Bold.ttf")))
    pdfmetrics.registerFont(TTFont("Arial-Italic", str(font_dir / "Arial Italic.ttf")))
    addMapping("Georgia", 0, 0, "Georgia")
    addMapping("Georgia", 1, 0, "Georgia-Bold")
    addMapping("Georgia", 0, 1, "Georgia-Italic")
    addMapping("Arial", 0, 0, "Arial")
    addMapping("Arial", 1, 0, "Arial-Bold")
    addMapping("Arial", 0, 1, "Arial-Italic")


register_fonts()
BASE = getSampleStyleSheet()

STYLES = {
    "cover_kicker": ParagraphStyle(
        "cover_kicker",
        parent=BASE["Normal"],
        fontName="Arial-Bold",
        fontSize=9,
        leading=12,
        textColor=MIST,
        tracking=1.8,
        spaceAfter=16,
    ),
    "cover_title": ParagraphStyle(
        "cover_title",
        parent=BASE["Title"],
        fontName="Georgia-Bold",
        fontSize=34,
        leading=38,
        textColor=WHITE,
        spaceAfter=18,
    ),
    "cover_subtitle": ParagraphStyle(
        "cover_subtitle",
        parent=BASE["Normal"],
        fontName="Georgia",
        fontSize=15,
        leading=21,
        textColor=CREAM,
        spaceAfter=30,
    ),
    "cover_doctrine": ParagraphStyle(
        "cover_doctrine",
        parent=BASE["Normal"],
        fontName="Georgia-Italic",
        fontSize=17,
        leading=23,
        textColor=WHITE,
        leftIndent=14,
        borderColor=SUN,
        borderWidth=0,
        borderPadding=0,
        spaceAfter=20,
    ),
    "cover_meta": ParagraphStyle(
        "cover_meta",
        parent=BASE["Normal"],
        fontName="Arial",
        fontSize=8.5,
        leading=12,
        textColor=MIST,
    ),
    "section_kicker": ParagraphStyle(
        "section_kicker",
        parent=BASE["Normal"],
        fontName="Arial-Bold",
        fontSize=8,
        leading=10,
        textColor=CORAL,
        tracking=1.6,
        spaceAfter=7,
    ),
    "h1": ParagraphStyle(
        "h1",
        parent=BASE["Heading1"],
        fontName="Georgia-Bold",
        fontSize=24,
        leading=29,
        textColor=OCEAN_DARK,
        spaceAfter=12,
        keepWithNext=True,
    ),
    "h2": ParagraphStyle(
        "h2",
        parent=BASE["Heading2"],
        fontName="Georgia-Bold",
        fontSize=15,
        leading=19,
        textColor=OCEAN_DARK,
        spaceBefore=13,
        spaceAfter=6,
        keepWithNext=True,
    ),
    "h3": ParagraphStyle(
        "h3",
        parent=BASE["Heading3"],
        fontName="Arial-Bold",
        fontSize=9,
        leading=12,
        textColor=SPRUCE,
        tracking=0.6,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    ),
    "body": ParagraphStyle(
        "body",
        parent=BASE["BodyText"],
        fontName="Arial",
        fontSize=9.2,
        leading=13.6,
        textColor=INK,
        spaceAfter=7,
    ),
    "body_small": ParagraphStyle(
        "body_small",
        parent=BASE["BodyText"],
        fontName="Arial",
        fontSize=8,
        leading=11.3,
        textColor=INK,
        spaceAfter=5,
    ),
    "lead": ParagraphStyle(
        "lead",
        parent=BASE["BodyText"],
        fontName="Georgia",
        fontSize=12,
        leading=17,
        textColor=INK,
        spaceAfter=13,
    ),
    "quote": ParagraphStyle(
        "quote",
        parent=BASE["BodyText"],
        fontName="Georgia-Italic",
        fontSize=13,
        leading=18,
        textColor=OCEAN_DARK,
        leftIndent=10,
        rightIndent=10,
        alignment=TA_LEFT,
    ),
    "label": ParagraphStyle(
        "label",
        parent=BASE["Normal"],
        fontName="Arial-Bold",
        fontSize=7.3,
        leading=9,
        textColor=CORAL,
        tracking=1.2,
        spaceAfter=4,
    ),
    "sample": ParagraphStyle(
        "sample",
        parent=BASE["BodyText"],
        fontName="Georgia",
        fontSize=10.2,
        leading=14.7,
        textColor=INK,
        spaceAfter=4,
    ),
    "note": ParagraphStyle(
        "note",
        parent=BASE["BodyText"],
        fontName="Arial-Italic",
        fontSize=7.6,
        leading=10.5,
        textColor=GRAY,
    ),
    "table_head": ParagraphStyle(
        "table_head",
        parent=BASE["Normal"],
        fontName="Arial-Bold",
        fontSize=7.7,
        leading=10,
        textColor=WHITE,
    ),
    "table_body": ParagraphStyle(
        "table_body",
        parent=BASE["Normal"],
        fontName="Arial",
        fontSize=7.8,
        leading=10.7,
        textColor=INK,
    ),
    "table_body_bold": ParagraphStyle(
        "table_body_bold",
        parent=BASE["Normal"],
        fontName="Arial-Bold",
        fontSize=7.8,
        leading=10.7,
        textColor=INK,
    ),
    "folio": ParagraphStyle(
        "folio",
        parent=BASE["Normal"],
        fontName="Arial",
        fontSize=7,
        leading=9,
        textColor=GRAY,
    ),
}


def p(text, style="body"):
    return Paragraph(text, STYLES[style])


def bullet_list(items, level=0, bullet_color=SPRUCE):
    bullet_style = ParagraphStyle(
        f"bullet_{level}_{len(items)}",
        parent=STYLES["body"],
        leftIndent=0,
        firstLineIndent=0,
        spaceAfter=0,
    )
    return ListFlowable(
        [
            ListItem(
                Paragraph(item, bullet_style),
                leftIndent=12,
                bulletColor=bullet_color,
                bulletFontName="Arial-Bold",
                bulletFontSize=7,
            )
            for item in items
        ],
        bulletType="bullet",
        start="circle",
        leftIndent=16 + (level * 10),
        bulletFontName="Arial-Bold",
        bulletFontSize=7,
        spaceAfter=8,
    )


def numbered_list(items):
    return ListFlowable(
        [
            ListItem(
                Paragraph(item, STYLES["body"]),
                leftIndent=17,
                bulletColor=CORAL,
                bulletFontName="Arial-Bold",
                bulletFontSize=8,
            )
            for item in items
        ],
        bulletType="1",
        leftIndent=20,
        bulletFontName="Arial-Bold",
        bulletFontSize=8,
        spaceAfter=8,
    )


def section(number, title, lead=None, include_in_contents=True):
    heading = p(title, "h1")
    heading._bookmark_name = f"section-{number.lower().replace(' ', '-').replace('/', '-')}"
    heading._outline_title = title
    if include_in_contents:
        heading._toc_label = f"{number}&#160;&#160;&#160;{title}"
    result = [
        CondPageBreak(2.35 * inch),
        Spacer(1, 0.04 * inch),
        p(f"SECTION {number}", "section_kicker"),
        heading,
        HRFlowable(
            width=CONTENT_W,
            thickness=0.7,
            color=SAND,
            spaceBefore=0,
            spaceAfter=10,
        ),
    ]
    if lead:
        result.append(p(lead, "lead"))
    return result


class HandbookDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        bookmark_name = getattr(flowable, "_bookmark_name", None)
        if not bookmark_name:
            return
        outline_title = getattr(flowable, "_outline_title", "")
        self.canv.bookmarkPage(bookmark_name)
        self.canv.addOutlineEntry(outline_title, bookmark_name, level=0, closed=False)
        toc_label = getattr(flowable, "_toc_label", None)
        if toc_label:
            self.notify(
                "TOCEntry",
                (0, toc_label, self.page, bookmark_name),
            )


def callout(label, body, color=OCEAN, background=CREAM):
    data = [
        [Paragraph(label.upper(), STYLES["label"])],
        [Paragraph(body, STYLES["quote"])],
    ]
    table = Table(data, colWidths=[CONTENT_W - 24], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.6, SAND),
                ("LINEBEFORE", (0, 0), (0, -1), 4, color),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
                ("TOPPADDING", (0, 1), (-1, 1), 2),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 12),
            ]
        )
    )
    return table


def sample_block(label, body, note=None, accent=SPRUCE):
    rows = [
        [Paragraph(label.upper(), STYLES["label"])],
        [Paragraph(body, STYLES["sample"])],
    ]
    if note:
        rows.append([Paragraph(note, STYLES["note"])])
    table = Table(rows, colWidths=[CONTENT_W - 26], hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("BOX", (0, 0), (-1, -1), 0.55, SAND),
        ("LINEBEFORE", (0, 0), (0, -1), 3, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 13),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13),
        ("TOPPADDING", (0, 0), (-1, 0), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 3),
        ("TOPPADDING", (0, 1), (-1, -1), 3),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
    ]
    table.setStyle(TableStyle(commands))
    return KeepTogether([table, Spacer(1, 8)])


def two_col_cards(left_title, left_body, right_title, right_body):
    cell_style = STYLES["body_small"]
    data = [
        [
            Paragraph(left_title, STYLES["h3"]),
            Paragraph(right_title, STYLES["h3"]),
        ],
        [
            Paragraph(left_body, cell_style),
            Paragraph(right_body, cell_style),
        ],
    ]
    table = Table(
        data,
        colWidths=[(CONTENT_W - 12) / 2, (CONTENT_W - 12) / 2],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CREAM),
                ("BOX", (0, 0), (-1, -1), 0.6, SAND),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, SAND),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def comparison_table(rows, widths=None):
    widths = widths or [CONTENT_W * 0.28, CONTENT_W * 0.36, CONTENT_W * 0.36]
    data = [
        [
            Paragraph("CONTEXT", STYLES["table_head"]),
            Paragraph("POSTURE", STYLES["table_head"]),
            Paragraph("HUMOR", STYLES["table_head"]),
        ]
    ]
    for row in rows:
        data.append(
            [
                Paragraph(row[0], STYLES["table_body_bold"]),
                Paragraph(row[1], STYLES["table_body"]),
                Paragraph(row[2], STYLES["table_body"]),
            ]
        )
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), OCEAN_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.45, SAND),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]
    for row_index in range(1, len(data)):
        if row_index % 2 == 0:
            style.append(("BACKGROUND", (0, row_index), (-1, row_index), CREAM))
    table.setStyle(TableStyle(style))
    return table


def brand_table(rows):
    data = [
        [
            Paragraph("INTERNAL / AVOID", STYLES["table_head"]),
            Paragraph("READER-FACING / PREFER", STYLES["table_head"]),
        ]
    ]
    for avoid, prefer in rows:
        data.append(
            [
                Paragraph(avoid, STYLES["table_body"]),
                Paragraph(prefer, STYLES["table_body"]),
            ]
        )
    table = Table(
        data,
        colWidths=[CONTENT_W * 0.43, CONTENT_W * 0.57],
        repeatRows=1,
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), OCEAN_DARK),
                ("GRID", (0, 0), (-1, -1), 0.45, SAND),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#F4E9E3")),
                ("BACKGROUND", (1, 1), (1, -1), colors.HexColor("#EDF3ED")),
            ]
        )
    )
    return table


def task_map_table(rows):
    data = [
        [
            Paragraph("IF YOU ARE...", STYLES["table_head"]),
            Paragraph("START WITH...", STYLES["table_head"]),
        ]
    ]
    for task, sections in rows:
        data.append(
            [
                Paragraph(task, STYLES["table_body_bold"]),
                Paragraph(sections, STYLES["table_body"]),
            ]
        )
    table = Table(
        data,
        colWidths=[CONTENT_W * 0.43, CONTENT_W * 0.57],
        repeatRows=1,
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), OCEAN_DARK),
                ("GRID", (0, 0), (-1, -1), 0.45, SAND),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("BACKGROUND", (0, 2), (-1, 2), CREAM),
                ("BACKGROUND", (0, 4), (-1, 4), CREAM),
                ("BACKGROUND", (0, 6), (-1, 6), CREAM),
            ]
        )
    )
    return table


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(OCEAN_DARK)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(OCEAN)
    canvas.circle(PAGE_W - 0.35 * inch, PAGE_H - 0.4 * inch, 2.25 * inch, fill=1, stroke=0)
    canvas.setStrokeColor(SUN)
    canvas.setLineWidth(4)
    canvas.line(MARGIN_X, PAGE_H - 1.23 * inch, MARGIN_X + 0.7 * inch, PAGE_H - 1.23 * inch)
    canvas.setStrokeColor(MIST)
    canvas.setLineWidth(0.45)
    for offset in range(0, 8):
        y = 0.42 * inch + (offset * 0.12 * inch)
        canvas.line(PAGE_W - 2.1 * inch, y, PAGE_W - 0.55 * inch, y + 0.48 * inch)
    canvas.restoreState()


def body_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(SAND)
    canvas.setLineWidth(0.55)
    canvas.line(MARGIN_X, PAGE_H - 0.43 * inch, PAGE_W - MARGIN_X, PAGE_H - 0.43 * inch)
    canvas.line(MARGIN_X, 0.42 * inch, PAGE_W - MARGIN_X, 0.42 * inch)
    canvas.setFont("Arial-Bold", 7)
    canvas.setFillColor(OCEAN_DARK)
    canvas.drawString(MARGIN_X, PAGE_H - 0.31 * inch, "THE RESILIENCE NETWORK")
    canvas.setFont("Arial", 7)
    canvas.setFillColor(GRAY)
    canvas.drawRightString(
        PAGE_W - MARGIN_X,
        PAGE_H - 0.31 * inch,
        "BRAND & VOICE HANDBOOK",
    )
    canvas.drawString(MARGIN_X, 0.24 * inch, "VERSION 1.0  |  JULY 25, 2026")
    canvas.drawRightString(PAGE_W - MARGIN_X, 0.24 * inch, str(doc.page))
    canvas.restoreState()


def build_story():
    story = []

    # Cover
    story.extend(
        [
            Spacer(1, 1.35 * inch),
            p("BUILDER EDITION  |  VERSION 1.0", "cover_kicker"),
            p("The Resilience Network<br/>Brand &amp; Voice Handbook", "cover_title"),
            p(
                "The shared strategy, writing standard, and review system for NowWePlan.com, "
                "Cascadia.me, HurricaneCoast.me, and SanAndreas.me.",
                "cover_subtitle",
            ),
            p("Prepare for consequences, not for causes.", "cover_doctrine"),
            Spacer(1, 1.34 * inch),
            p(
                "Built from The Resilience Network Constitution, the Editorial "
                "Handbook, and the canonical essay Resilience.<br/>"
                "Built for writers, designers, editors, researchers, and site builders.",
                "cover_meta",
            ),
            PageBreak(),
        ]
    )

    # Start here
    story.extend(section("01", "Start here"))
    story.append(
        p(
            "This handbook gives everyone building a Resilience Network site the same "
            "starting point. It defines what the network means, how it should relate to "
            "readers, how that relationship sounds, and how to tell whether the work is ready.",
            "lead",
        )
    )
    story.append(p("Use it when you are...", "h2"))
    story.append(
        bullet_list(
            [
                "planning a site, section, page family, or campaign;",
                "writing or revising editorial, guidance, interface, or promotional copy;",
                "choosing imagery, interaction patterns, calls to action, or a NowWePlan bridge;",
                "reviewing work for trust, usefulness, accessibility, and consistency.",
            ]
        )
    )
    story.append(p("The foundation", "h2"))
    story.append(
        callout(
            "Organizing principle",
            "Prepare for consequences, not for causes.",
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        two_col_cards(
            "Voice test",
            "Use a natural cadence. Would someone actually say this across a kitchen table?",
            "Relationship test",
            "Would you say it this way to someone you care about who is already carrying a lot?",
        )
    )
    story.append(p("Six rules to carry into every build", "h2"))
    story.append(
        numbered_list(
            [
                "<b>Begin with ordinary life.</b> Risk matters because daily life matters.",
                "<b>Recognize before advising.</b> Name the real friction, then offer help.",
                "<b>Make one useful move feel possible.</b> Confidence comes from fit, not slogans.",
                "<b>Assume unequal capacity.</b> Cost, tenure, disability, health, transport, space, and time belong in the main guidance.",
                "<b>Keep authority visible.</b> Official instructions and qualified professionals retain their proper role.",
                "<b>Let the reader stop.</b> Preparation should have an ending.",
            ]
        )
    )
    story.append(PageBreak())

    # Navigation and authority
    story.extend(section("01 / CONTINUED", "Find what you need", include_in_contents=False))
    story.append(
        p(
            "You do not need to read this handbook front to back before beginning. "
            "Use the route that matches the work in front of you, then use the final "
            "checklist before anything ships.",
            "lead",
        )
    )
    story.append(
        task_map_table(
            [
                ("Starting a new site or major section", "02 Platform, 03 Beliefs, 04 Relationship, 05 Domains, 12 Visual direction"),
                ("Planning a page or page family", "08 Content structure, 09 Tone by context, 13 Review checklist"),
                ("Writing or revising copy", "04 Relationship, 06 Voice, 07 Humor, 10 Samples"),
                ("Writing buttons, links, forms, or banners", "09 Tone by context, 11 Interface language"),
                ("Working on live-event or safety content", "09 Immediate action, 11 Interface language, 13 Trust"),
                ("Reviewing work before launch", "13 Builder review checklist"),
            ]
        )
    )
    story.append(p("Authority", "h2"))
    story.append(
        numbered_list(
            [
                "<b>The Constitution</b> sets binding rules.",
                "<b>The Brand Platform</b> defines shared meaning and reader relationship.",
                "<b>The Voice Standard</b> defines cadence and writing practice.",
                "<b>This handbook</b> brings the platform and voice standard together for builders.",
                "<b>Domain systems</b> define local visual and editorial expression.",
                "<b>Page briefs</b> apply the system to a specific task.",
            ]
        )
    )
    story.append(
        p(
            "If two documents conflict, follow that order. Current local instructions "
            "always take precedence during a live event.",
            "note",
        )
    )
    story.append(p("What is inside", "h2"))
    toc = TableOfContents()
    toc.dotsMinLevel = 0
    toc.levelStyles = [
        ParagraphStyle(
            "toc_level_0",
            parent=STYLES["table_body"],
            fontName="Arial",
            fontSize=8.6,
            leading=12,
            textColor=INK,
            leftIndent=0,
            firstLineIndent=0,
            spaceBefore=0,
            spaceAfter=0,
        )
    ]
    toc.tableStyle = TableStyle(
        [
            ("LINEBELOW", (0, 0), (-1, -1), 0.35, SAND),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]
    )
    story.append(toc)
    story.append(PageBreak())

    # Platform
    story.extend(
        section(
            "02",
            "Platform at a glance",
            "The doctrine organizes the work. The reader promise defines the relationship. "
            "Neither needs to become a slogan repeated across the network.",
        )
    )
    story.append(p("Purpose", "h2"))
    story.append(
        p(
            "Help ordinary people make the lives they already have less brittle: "
            "understand the places where they live, prepare for interruptions without "
            "organizing life around fear, recover faster when systems fail, and build "
            "the relationships that make recovery possible."
        )
    )
    story.append(callout("Organizing principle", "Prepare for consequences, not for causes."))
    story.append(p("Human truth", "h2"))
    story.append(
        p(
            "Most people don't need another reason to worry. They need help making sense "
            "of a large subject, recognizing what matters in their own lives, and finding "
            "one useful action that fits their circumstances."
        )
    )
    story.append(p("Reader promise", "h2"))
    story.append(
        p(
            "We will help you understand what your place can do, make a few useful "
            "choices, and know who can help. We will be honest about serious risk "
            "without asking you to live in a state of alarm."
        )
    )
    story.append(p("Desired outcome", "h2"))
    story.append(
        bullet_list(
            [
                "recognized before being advised;",
                "clearer about what matters;",
                "capable of one useful next move;",
                "less alone;",
                "free to set the subject down and return to ordinary life.",
            ]
        )
    )
    story.append(
        sample_block(
            "What this means",
            "The network does not tell readers to feel capable. It gives them reasons to believe they may be.",
            "Confidence is earned by fit, clarity, and a manageable action.",
            accent=CORAL,
        )
    )
    # Beliefs
    story.extend(section("03", "What the brand believes"))
    belief_rows = [
        (
            "Ordinary life is the point",
            "Risk matters because water, medication, school, work, animals, routes, homes, and neighbors matter.",
        ),
        (
            "Recognition comes before instruction",
            "Advice becomes useful after the page notices what may make it difficult, expensive, awkward, or outside the reader's control.",
        ),
        (
            "Preparation should have an ending",
            "The network does not seek vigilance or identity. A reader should be able to understand, act, and stop.",
        ),
        (
            "Other people are part of the answer",
            "Family, friends, neighbors, organizations, public agencies, health workers, and utility crews all affect what happens next.",
        ),
        (
            "Seriousness does not require solemnity",
            "Warmth and mild humor can make unglamorous subjects easier to approach without making light of danger or loss.",
        ),
        (
            "Unequal capacity is assumed",
            "Cost, tenure, disability, health, storage, transport, work, language, and caregiving belong in the main guidance.",
        ),
        (
            "Authority stays visible",
            "Official agencies issue alerts and instructions. Qualified professionals assess buildings, health, insurance, and other specialized questions.",
        ),
        (
            "Trust comes before conversion",
            "Every regional site is complete on its own. NowWePlan is optional continuity, not the missing payoff.",
        ),
    ]
    for title, body in belief_rows:
        story.append(two_col_cards(title, body, "Builder implication", {
            "Ordinary life is the point": "Open with the function being protected, not destruction.",
            "Recognition comes before instruction": "Name the friction specifically. Skip generic empathy language.",
            "Preparation should have an ending": "Offer one adjacent move, then let the page finish.",
            "Other people are part of the answer": "Show who can help, share, decide, or hold authority.",
            "Seriousness does not require solemnity": "Use humor only when the moment is low stakes.",
            "Unequal capacity is assumed": "Do not bury alternatives in an accessibility appendix.",
            "Authority stays visible": "Make the handoff explicit and easy to reach.",
            "Trust comes before conversion": "Complete the public task before mentioning a private tool.",
        }[title]))
        story.append(Spacer(1, 7))
    # Relationship
    story.extend(
        section(
            "04",
            "The reader relationship",
            "The network is a knowledgeable person across a kitchen table. It is not a coach, a campaign, or an institution performing warmth.",
        )
    )
    story.append(p("The reader may arrive...", "h2"))
    story.append(
        bullet_list(
            [
                "curious, skeptical, tired, frightened, or busy;",
                "short on money, space, time, transport, or control over a building;",
                "caring for a child, older adult, animal, or someone with medical needs;",
                "comfortable with risk information or actively avoiding it;",
                "during a quiet afternoon or a frightening night.",
            ]
        )
    )
    story.append(p("The emotional movement", "h2"))
    story.append(
        numbered_list(
            [
                "<b>Recognition:</b> This understands the life I actually have.",
                "<b>Orientation:</b> I can see what matters and what doesn't.",
                "<b>Choice:</b> There is something useful I could do.",
                "<b>Support:</b> I don't have to solve every part alone.",
                "<b>Release:</b> I have done enough for now.",
            ]
        )
    )
    story.append(p("What changes in the writing", "h2"))
    story.append(
        brand_table(
            [
                ("We know this can feel overwhelming.", "The list gets long quickly, especially when every item seems to need money or somewhere to store it."),
                ("You have got this.", "A few bottles won't cover a long outage, but they're a useful beginning."),
                ("Take control of your preparedness.", "Write down the medication and the dose."),
                ("Protect what matters most.", "Keep medication cold during an outage."),
                ("Start your resilience journey.", "Choose a meeting place."),
            ]
        )
    )
    story.append(Spacer(1, 10))
    story.append(
        callout(
            "The standard",
            "Connect first. Clarify second. Encourage only when it has been earned.",
            color=CORAL,
            background=colors.HexColor("#F7EEE8"),
        )
    )
    # Domains
    story.extend(
        section(
            "05",
            "Domain expressions",
            "The domains share a doctrine and a relationship with readers. They do not share a costume or a stack of slogans.",
        )
    )
    domain_rows = [
        (
            "NowWePlan.com",
            "Keep the plan alive",
            "Most plans don't disappear because people don't care. They disappear under everything else.",
            "Practical, companionable, good at remembering, and respectful of incomplete progress.",
        ),
        (
            "Cascadia.me",
            "Understand the place",
            "Cascadia is beautiful, complicated, and capable of interrupting ordinary life in several overlapping ways.",
            "Geographically observant, explanatory, and attentive to land, water, weather, infrastructure, buildings, routes, and communities.",
        ),
        (
            "HurricaneCoast.me",
            "Live through the season",
            "By late summer, people may be tired of being told to prepare or still recovering from the last event.",
            "Seasonally aware, unsensational, and honest about leaving, return, insurance, housing, heat, transport, and repeated recovery.",
        ),
        (
            "SanAndreas.me",
            "Prepare without an appointment",
            "Earthquakes offer no annual moment when attention naturally becomes available.",
            "Matter-of-fact, building-literate, attentive to immediate action and long domestic consequences, and resistant to countdowns.",
        ),
    ]
    for domain, role, tension, expression in domain_rows:
        block = [
            p(domain, "h2"),
            p(f"<b>Role:</b> {role}", "body"),
            p(f"<b>Reader tension:</b> {tension}", "body"),
            p(f"<b>Expression:</b> {expression}", "body"),
        ]
        story.append(KeepTogether(block))
    story.append(p("Four sample openings", "h2"))
    story.append(
        sample_block(
            "NowWePlan.com",
            "Most plans don't fail because nobody cared. They get buried under work, school, appointments, and the rest of the week. This is a place to find the loose ends and decide what's worth doing next.",
        )
    )
    story.append(
        sample_block(
            "Cascadia.me",
            "Most days, Cascadia works quietly around us. The tap runs, the road is open, the lights come on, and the river stays where we expect it. This site is about the days one of those things doesn't happen, and the few choices that can make those days easier.",
        )
    )
    story.append(
        sample_block(
            "HurricaneCoast.me",
            "By August, nobody needs another reminder that it's hurricane season. The useful question is what would make leaving, staying, or coming home a little less difficult this time.",
        )
    )
    story.append(
        sample_block(
            "SanAndreas.me",
            "Earthquakes don't offer a season to get ready. That's inconvenient, but it also means you don't need to treat preparation as an annual performance. Fix what matters, make a few arrangements, and revisit them when life changes.",
        )
    )
    # Voice
    story.extend(
        section(
            "06",
            "Voice and cadence",
            "Natural cadence is not casual decoration. It is how the network avoids sounding computed, institutional, or evangelistic.",
        )
    )
    story.append(p("Use contractions", "h2"))
    story.append(
        p(
            "Contractions are the default in reader-facing prose: you're, don't, can't, "
            "it's, that's, won't, you'll, and we've. Keep an uncontracted form only when "
            "it adds deliberate emphasis or preserves an exact quotation."
        )
    )
    story.append(
        brand_table(
            [
                ("You do not need to finish everything today.", "You don't need to finish everything today."),
                ("This will not fit every household.", "This won't fit every household."),
                ("If that is not workable...", "If that isn't workable..."),
                ("You cannot solve all of that in advance.", "You can't solve all of that in advance."),
            ]
        )
    )
    story.append(p("Stop when the line lands", "h2"))
    story.append(
        two_col_cards(
            "Overstretched",
            'Write down medication names, doses, and prescribers. "The small white one" is a poor description even on an ordinary Tuesday.',
            "Natural",
            'Write down medication names, doses, and prescribers. "The small white one" is a poor description.',
        )
    )
    story.append(p("Sentence habits", "h2"))
    story.append(
        bullet_list(
            [
                "Prefer concrete nouns and direct verbs.",
                "Vary sentence length for a reason.",
                "Use second person for relevance, not blame or presumed emotion.",
                "Make room for different choices and real tradeoffs.",
                "Read important copy aloud at normal speed.",
                "Cut a sentence when you would say it more simply to a real person.",
            ]
        )
    )
    story.append(p("Words that usually need a second look", "h2"))
    story.append(
        brand_table(
            [
                ("facilitate, empower, operationalize", "help, make, decide, record"),
                ("leverage, optimize, activate", "use, improve, begin"),
                ("dependent reunification protocol", "where the household will meet"),
                ("increase household water resilience", "keep water where you can reach it"),
                ("navigate uncertainty", "decide what to do with incomplete information"),
            ]
        )
    )
    # Humor
    story.extend(
        section(
            "07",
            "Mild conversational humor",
            "Humor can make awkward, unglamorous subjects easier to approach. The situation may be inconvenient, awkward, or faintly absurd. The reader is never the joke.",
        )
    )
    story.append(p("Good subjects", "h2"))
    story.append(
        bullet_list(
            [
                "containers that need somewhere to live;",
                "paperwork and the number of mugs in a cupboard;",
                "chargers that haven't been charged;",
                "bags that are too heavy;",
                "food nobody in the household likes;",
                "the awkwardness of beginning a neighbor conversation;",
                "the fact that toilets require systems.",
            ]
        )
    )
    story.append(p("Off limits", "h2"))
    story.append(
        bullet_list(
            [
                "active danger, evacuation, and shelter instructions;",
                "injury, death, grief, displacement, or material loss;",
                "poverty, disability, illness, immigration status, or housing insecurity;",
                "a reader's lack of preparation;",
                "official warnings, uncertainty, or harmful institutional failure.",
            ],
            bullet_color=CORAL,
        )
    )
    story.append(p("Samples", "h2"))
    humor_samples = [
        ("Water", "Water takes up a surprising amount of space for something that normally arrives through a wall. Decide where it'll live before buying containers."),
        ("Sanitation", "This is the part everyone hopes another guide will cover. Unfortunately, the toilet won't become self-sufficient."),
        ("Medication", 'Write down medication names, doses, and prescribers. "The small white one" is a poor description.'),
        ("Power", "Check the battery pack occasionally. A backup at three percent is mostly a rectangle."),
        ("Food", "Store food your household already eats. An outage isn't a good time to introduce everyone to lentils."),
        ("Neighbors", "You don't need a committee or a clipboard. A name, a phone number, and a short conversation will do."),
    ]
    for label, body in humor_samples:
        story.append(sample_block(label, body, accent=SUN))
    story.append(p("Delivery", "h2"))
    story.append(
        bullet_list(
            [
                "Keep the useful information intact.",
                "Use understatement rather than a setup and punchline.",
                "Usually allow no more than one light line in a section.",
                "Do not call attention to the joke.",
                "Do not add a second phrase after it lands.",
                "Remove humor that competes with clarity or may not translate.",
            ]
        )
    )
    # Content structure
    story.extend(
        section(
            "08",
            "How content carries meaning",
            "This is a meaning hierarchy, not a mandatory page template. Repeating the same verbal structure across every page will make the network sound manufactured.",
        )
    )
    story.append(
        numbered_list(
            [
                "<b>Ordinary life:</b> Begin with the recognizable function, place, routine, or constraint.",
                "<b>Recognition:</b> Name why the issue may be difficult, easy to postpone, or different across households.",
                "<b>Explanation:</b> Clarify the physical system, consequence, or decision.",
                "<b>Useful action:</b> Offer a proportionate next move and explain why it helps.",
                "<b>Fit:</b> Include alternatives for cost, tenure, mobility, space, health, caregiving, transport, and time.",
                "<b>Connection:</b> Identify who else may help, share, decide, repair, or hold authority.",
                "<b>Evidence:</b> Show the source, boundary, uncertainty, and review date.",
                "<b>Release:</b> Let the reader stop or choose one adjacent move.",
            ]
        )
    )
    story.append(p("Public questions, not internal taxonomy", "h2"))
    story.append(
        brand_table(
            [
                ("Capability model", "How do I keep water available?"),
                ("Consequence library", "What if the power stays out?"),
                ("Journey stage", "What should I do first?"),
                ("Structural mitigation", "What should I ask about my building?"),
                ("Continuity layer", "How will we remember the next step?"),
                ("Authority directory", "Who is responsible for this place?"),
            ]
        )
    )
    story.append(
        sample_block(
            "A useful ending",
            "If you know where the water will go and have filled the first container, you can leave the rest for another day.",
            "End when the thought is complete. Do not add inspiration because the page is ending.",
        )
    )
    # Context
    story.extend(section("09", "Tone by context"))
    story.append(
        comparison_table(
            [
                (
                    "Evergreen editorial",
                    "Observant, explanatory, and companionable. Natural paragraphs with varied sentence length.",
                    "Available in small amounts.",
                ),
                (
                    "Household guidance",
                    "Specific, realistic, and nonjudgmental. Clear action with enough explanation to support judgment.",
                    "Useful when it reduces awkwardness.",
                ),
                (
                    "Immediate action",
                    "Direct, brief, and explicit. Current official instruction takes precedence.",
                    "None.",
                ),
                (
                    "Recovery and loss",
                    "Patient, honest, and restrained. Give difficult facts room. Do not rush toward uplift.",
                    "Usually none. Never near grief or material loss.",
                ),
                (
                    "Buildings and health",
                    "State the limit, then help the reader ask a better question.",
                    "Rare.",
                ),
                (
                    "Interface copy",
                    "Plain and quiet. Familiar labels over branded language.",
                    "Only in low-stakes, reversible moments, if at all.",
                ),
            ]
        )
    )
    story.append(p("Immediate-action sample", "h2"))
    story.append(
        sample_block(
            "Earthquake",
            "If the ground is moving, Drop, Cover, and Hold On. If you're near the coast and the shaking is strong or lasts a long time, move inland or to high ground as soon as you can do so safely. Follow current local instructions.",
            "No humor. No campaign language. The official action and handoff stay clear.",
            accent=CORAL,
        )
    )
    story.append(p("Recovery sample", "h2"))
    story.append(
        sample_block(
            "Month three",
            "Recovery is often a series of ordinary problems made harder: finding a place to stay, reaching work, replacing medication, documenting damage, and telling the same story to another office. You can't solve all of that in advance. You may be able to remove one or two complications.",
            "The passage does not hurry toward inspiration.",
        )
    )
    story.append(p("Technical-boundary sample", "h2"))
    story.append(
        sample_block(
            "Building",
            "A map can't tell you whether this building is safe. It can help you identify the ground conditions and the questions to take to a qualified professional.",
            "State the limit, then preserve usefulness.",
            accent=OCEAN,
        )
    )
    # Samples
    story.extend(
        section(
            "10",
            "Copy samples",
            "These samples demonstrate the relationship and cadence. They are not mandatory network copy.",
        )
    )
    story.append(
        sample_block(
            "Cascadia.me homepage opening",
            "<b>Living here comes with a few things worth knowing.</b><br/><br/>"
            "Most days, the tap runs, the road is open, the lights come on, and the river stays where we expect it. "
            "This site is about the days one of those things doesn't happen, and the few choices that can make those days easier.<br/><br/>"
            "<b>Links:</b> See what happens here &nbsp;&nbsp; Start with the household",
            "The opening begins with ordinary function. It does not ask the reader to join a movement.",
            accent=OCEAN,
        )
    )
    story.append(
        sample_block(
            "Water",
            "<b>Where will the water go?</b><br/><br/>"
            "Storing water sounds simple until you picture the containers: where they'll fit, whether you can lift them, and how much they cost. "
            "Start with the space you actually have. A few bottles in a cupboard won't cover a long outage, but they're more useful than an ideal supply you have nowhere to keep.<br/><br/>"
            "<b>First step:</b> Fill one clean container and choose where it'll live.",
            "Recognition precedes the action. The encouragement is proportionate.",
            accent=SPRUCE,
        )
    )
    story.append(
        sample_block(
            "Medication",
            "<b>Make the instructions easy to find.</b><br/><br/>"
            'Write down medication names, doses, and prescribers. "The small white one" is a poor description. '
            "Add the pharmacy, allergies, and anything that must stay cold or powered. Keep a copy where another person could find it.",
            "The humor is brief and contained inside useful guidance.",
            accent=SUN,
        )
    )
    story.append(
        sample_block(
            "People nearby",
            "<b>Start with one person.</b><br/><br/>"
            "Talking with a neighbor about emergencies can feel oddly intimate, especially if you usually exchange little more than a wave. "
            "You don't need a committee or a clipboard. A name, a phone number, and a short conversation will do.",
            "The page acknowledges the awkwardness instead of covering it with encouragement.",
            accent=SPRUCE,
        )
    )
    story.append(
        sample_block(
            "Live-event banner",
            "<b>Current instructions for this area</b><br/><br/>"
            "You don't need to sort through this alone. [Authority] has the current instructions for [place].<br/><br/>"
            "<b>Action:</b> Read the official notice",
            "No humor. No paraphrased order. The authority handoff comes first.",
            accent=CORAL,
        )
    )
    # Interface
    story.extend(
        section(
            "11",
            "Interface and action language",
            "Buttons should describe a real task. They should not supply emotion that the surrounding copy has failed to earn.",
        )
    )
    story.append(
        brand_table(
            [
                ("Learn more", "Read what this map can show"),
                ("Get started", "Choose a meeting place"),
                ("Take action", "Find your local alert service"),
                ("Be ready", "Print the medication page"),
                ("Keep exploring", "Show official sources"),
                ("Unlock your plan", "Save the next step"),
                ("No data", "No recent report found"),
            ]
        )
    )
    story.append(p("Calls to action", "h2"))
    story.append(
        bullet_list(
            [
                "Write the task on the button or link.",
                "Use a button only when the reader is genuinely changing tasks.",
                "Let ordinary continuation remain a text link or the next paragraph.",
                "Do not turn every section into a conversion opportunity.",
                "Complete the public task before offering NowWePlan.",
            ]
        )
    )
    story.append(p("NowWePlan bridge sample", "h2"))
    story.append(
        sample_block(
            "Optional continuity",
            "If you want help keeping track of owners, next steps, review dates, and practice, NowWePlan can hold the plan. The guidance here remains complete without it.",
            "Trust before conversion. No household information moves without explicit action.",
            accent=OCEAN,
        )
    )
    story.append(p("Share-language sample", "h2"))
    story.append(
        sample_block(
            "Neutral default",
            "I found this Cascadia.me page useful. It explains [page subject] and links to the sources responsible for this place.",
            "Prefer page-specific language when available. Avoid describing every surface as a guide.",
            accent=SPRUCE,
        )
    )
    # Visual
    story.extend(section("12", "Visual and experience direction"))
    story.append(p("Shared meaning, local expression", "h2"))
    story.append(
        p(
            "The regional sites share doctrine, research standards, accessibility, and "
            "technical infrastructure. They should still feel native to their places. "
            "Cascadia is not California with different mountains. Hurricane country is "
            "not a generic coastline."
        )
    )
    story.append(p("Show", "h2"))
    story.append(
        bullet_list(
            [
                "ordinary life before spectacle;",
                "place as lived environment, not scenery;",
                "people doing recognizable things rather than performing preparedness;",
                "useful objects in context rather than equipment displays;",
                "recovery through domestic and civic life;",
                "diagrams that clarify dependencies, time, and authority;",
                "clear visual distinction between editorial explanation and official information.",
            ]
        )
    )
    story.append(p("Avoid", "h2"))
    story.append(
        bullet_list(
            [
                "disaster imagery chosen mainly to frighten;",
                "tactical or militarized aesthetics;",
                "gear arranged as competence or identity;",
                "heroic households untouched by loss;",
                "generic regional scenery applied to generic advice;",
                "interface density used to imply authority;",
                "a shared network costume that flattens local difference.",
            ],
            bullet_color=CORAL,
        )
    )
    story.append(p("Reachability", "h2"))
    story.append(
        p(
            "Essential content must remain useful on old devices, poor connections, and "
            "paper. Pages should work without images and remain comprehensible without "
            "color. Interactive tools need meaningful static fallbacks. Live or official "
            "material must show source identity and recency."
        )
    )
    story.append(
        callout(
            "Experience principle",
            "A page that cannot be read during an outage has failed at the thing it exists to do.",
            color=CORAL,
            background=colors.HexColor("#F7EEE8"),
        )
    )
    # Checklist
    story.extend(
        section(
            "13",
            "Builder review checklist",
            "Read the page once for meaning, once aloud for cadence, and once as a reader with less control than the builder assumed.",
        )
    )
    checklist_groups = [
        (
            "Relationship",
            [
                "Does the page recognize before it advises?",
                "Does it sound adult to adult?",
                "Does it leave room for skepticism, ambivalence, and different choices?",
                "Does it avoid manufacturing intimacy or encouragement?",
            ],
        ),
        (
            "Cadence",
            [
                "Are contractions used where someone would naturally use them?",
                "Does sentence length vary for a reason?",
                "Can any sentence stop earlier?",
                "Has a joke, image, or conclusion been explained after it landed?",
                "Would these words be said across a kitchen table?",
            ],
        ),
        (
            "Usefulness",
            [
                "Is the first useful action proportionate?",
                "Does the reader know why it helps?",
                "Are alternatives available for money, space, tenure, mobility, health, transport, caregiving, and time?",
                "Is institutional responsibility visible where household action is not enough?",
            ],
        ),
        (
            "Humor",
            [
                "Is the situation the subject rather than the reader?",
                "Is the moment low stakes?",
                "Does the line survive without a second explanatory phrase?",
                "Would removing it make the instruction clearer or kinder?",
            ],
        ),
        (
            "Trust",
            [
                "Are official instruction, guidance, evidence, history, interpretation, and fiction distinct?",
                "Are uncertainty and source limits stated plainly?",
                "Does current local authority clearly take precedence?",
                "Can the reader act and then set the subject down?",
            ],
        ),
    ]
    for title, items in checklist_groups:
        story.append(p(title, "h2"))
        story.append(bullet_list(items))
    story.append(
        callout(
            "Final decision",
            "If the work passes the constitutional test but fails the relationship test, it is not ready.",
            color=OCEAN,
        )
    )
    story.append(Spacer(1, 12))
    story.append(p("Source documents", "h2"))
    story.append(
        p(
            "The Resilience Network Constitution, version 1.0; The Resilience Network "
            "Editorial Handbook, version 1.0; and Resilience, the canonical network essay. "
            "The Constitution governs wherever the documents conflict.",
            "body_small",
        )
    )

    return story


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = HandbookDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=MARGIN_X,
        leftMargin=MARGIN_X,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        title="The Resilience Network Brand & Voice Handbook",
        author="The Resilience Network",
        subject="Builder-facing brand strategy, voice standard, and review system",
        creator="The Resilience Network",
    )
    doc.multiBuild(build_story(), onFirstPage=cover_page, onLaterPages=body_page)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
