#!/usr/bin/env python3
"""Validate the Phase 5 closed-commerce Field Maps handoff."""

from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
PAGES = (
    Path("field-maps/index.html"),
    Path("field-maps/olympic-peninsula/index.html"),
    Path("field-maps/offline-field-guide/index.html"),
)
ALLOWED_HANDOFF_KEYS = {"src", "entry", "region"}
EXPECTED_HANDOFF_VALUES = {
    "src": ["cascadia"],
    "entry": ["field-maps"],
    "region": ["olympic-peninsula"],
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.h1_count = 0
        self.title_count = 0
        self.canonical_count = 0
        self.description_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if values.get("href"):
            self.hrefs.append(values["href"] or "")
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.title_count += 1
        if tag == "link" and values.get("rel") == "canonical":
            self.canonical_count += 1
        if tag == "meta" and values.get("name") == "description":
            self.description_count += 1


def local_target(source: Path, href: str) -> tuple[Path, str] | None:
    parsed = urlsplit(href)
    if parsed.scheme or parsed.netloc:
        return None
    if not parsed.path:
        return source, unquote(parsed.fragment)
    relative = unquote(parsed.path)
    target = ROOT / relative.lstrip("/") if relative.startswith("/") else source.parent / relative
    if relative.endswith("/") or target.is_dir():
        target /= "index.html"
    return target.resolve(), unquote(parsed.fragment)


def ids_for(path: Path) -> set[str]:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return set(parser.ids)


def validate_page(relative: Path, errors: list[str]) -> PageParser | None:
    path = ROOT / relative
    if not path.is_file():
        errors.append(f"missing page: {relative}")
        return None
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    if parser.h1_count != 1:
        errors.append(f"{relative}: expected one h1, found {parser.h1_count}")
    if parser.title_count != 1:
        errors.append(f"{relative}: expected one title, found {parser.title_count}")
    if parser.canonical_count != 1:
        errors.append(f"{relative}: expected one canonical, found {parser.canonical_count}")
    if parser.description_count != 1:
        errors.append(f"{relative}: expected one description, found {parser.description_count}")
    if len(parser.ids) != len(set(parser.ids)):
        errors.append(f"{relative}: duplicate HTML id")
    for href in parser.hrefs:
        target_info = local_target(path, href)
        if target_info is None:
            continue
        target, fragment = target_info
        try:
            display = target.relative_to(ROOT)
        except ValueError:
            errors.append(f"{relative}: internal link escapes site root: {href}")
            continue
        if not target.is_file():
            errors.append(f"{relative}: broken internal link {href} -> {display}")
            continue
        if fragment and target.suffix.casefold() in {".html", ".htm"}:
            if fragment not in ids_for(target):
                errors.append(f"{relative}: missing fragment #{fragment} in {display}")
    return parser


def validate_handoff(errors: list[str]) -> None:
    home = (ROOT / PAGES[0]).read_text(encoding="utf-8")
    region = (ROOT / PAGES[1]).read_text(encoding="utf-8")
    guide = (ROOT / PAGES[2]).read_text(encoding="utf-8")
    lower_combined = f"{home}\n{region}".casefold()
    for stale in (
        "sale territories have not completed review",
        "territory review is incomplete",
    ):
        if stale in lower_combined:
            errors.append(f"stale Phase 3 territory language remains: {stale}")
    if "checkout closed" not in home.casefold() or "checkout closed" not in region.casefold():
        errors.append("closed-checkout status must appear on the Field Maps home and regional page")
    if "nowweplan.com" in guide.casefold():
        errors.append("offline guide must remain a complete free task without a NowWePlan handoff")

    parser = PageParser()
    parser.feed(region)
    handoffs = [href for href in parser.hrefs if urlsplit(href).hostname == "nowweplan.com"]
    if len(handoffs) != 2:
        errors.append(f"regional page must have exactly two NowWePlan handoffs, found {len(handoffs)}")
        return

    paths = {urlsplit(href).path for href in handoffs}
    if paths != {"/maps", "/start"}:
        errors.append(f"map-record and planning handoffs must remain separate, found {sorted(paths)}")
    for href in handoffs:
        query = parse_qs(urlsplit(href).query, keep_blank_values=True)
        if set(query) != ALLOWED_HANDOFF_KEYS:
            errors.append(f"handoff contains unexpected query fields: {href}")
        if query != EXPECTED_HANDOFF_VALUES:
            errors.append(f"handoff context does not match the approved public contract: {href}")

    official_last = max(
        region.find("https://www.nps.gov/"),
        region.find("https://prd-tnm.s3.amazonaws.com/"),
        region.find("https://www.fs.usda.gov/"),
    )
    first_handoff = region.find("https://nowweplan.com/")
    if official_last < 0 or first_handoff < 0 or first_handoff < official_last:
        errors.append("NowWePlan handoffs must follow the official free-source task")


def main() -> int:
    errors: list[str] = []
    for page in PAGES:
        validate_page(page, errors)
    stylesheet = ROOT / "css/living-watershed-field-maps.css"
    if not stylesheet.is_file() or "@media print" not in stylesheet.read_text(encoding="utf-8"):
        errors.append("Field Maps print rules are missing")
    validate_handoff(errors)
    if errors:
        print("Phase 5 site-readiness validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Phase 5 site-readiness validation passed.")
    print("Pages checked: 3")
    print("Contract: free source first, checkout closed, map records and planning separate")
    return 0


if __name__ == "__main__":
    sys.exit(main())
