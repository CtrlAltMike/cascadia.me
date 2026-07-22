#!/usr/bin/env python3
"""Validate the Phase 3 Field Maps public-site contract."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
PAGE_PATHS = (
    Path("field-maps/index.html"),
    Path("field-maps/olympic-peninsula/index.html"),
    Path("field-maps/offline-field-guide/index.html"),
)
EXPECTED_SITEMAP_URLS = {
    "https://cascadia.me/field-maps/",
    "https://cascadia.me/field-maps/olympic-peninsula/",
    "https://cascadia.me/field-maps/offline-field-guide/",
}
PROHIBITED_PUBLIC_TERMS = (
    "avenza",
    "strava",
    "ridewithgps",
    "google maps",
    "mapbox",
)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.h1_count = 0
        self.title_count = 0
        self.canonical_count = 0
        self.description_count = 0
        self.in_primary_nav = 0
        self.primary_nav_text: list[str] = []
        self.in_footer = 0
        self.footer_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.append(element_id)
        href = values.get("href")
        if href:
            self.hrefs.append(href)
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.title_count += 1
        if tag == "link" and values.get("rel") == "canonical":
            self.canonical_count += 1
        if tag == "meta" and values.get("name") == "description":
            self.description_count += 1
        if tag == "nav" and values.get("aria-label") == "Primary navigation":
            self.in_primary_nav += 1
        if tag == "footer":
            self.in_footer += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "nav" and self.in_primary_nav:
            self.in_primary_nav -= 1
        if tag == "footer" and self.in_footer:
            self.in_footer -= 1

    def handle_data(self, data: str) -> None:
        if self.in_primary_nav:
            self.primary_nav_text.append(data)
        if self.in_footer:
            self.footer_text.append(data)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def local_target(source: Path, href: str) -> tuple[Path, str] | None:
    parsed = urlsplit(href)
    if parsed.scheme or parsed.netloc:
        return None
    if not parsed.path:
        return source, unquote(parsed.fragment)

    relative = unquote(parsed.path)
    if relative.startswith("/"):
        target = ROOT / relative.lstrip("/")
    else:
        target = source.parent / relative
    if relative.endswith("/") or target.is_dir():
        target /= "index.html"
    return target.resolve(), unquote(parsed.fragment)


def page_ids(path: Path) -> set[str]:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return set(parser.ids)


def validate_page(relative: Path, errors: list[str]) -> None:
    path = ROOT / relative
    if not path.is_file():
        fail(errors, f"missing page: {relative}")
        return

    source = path.read_text(encoding="utf-8")
    lower = source.casefold()
    parser = PageParser()
    parser.feed(source)

    if parser.h1_count != 1:
        fail(errors, f"{relative}: expected one h1, found {parser.h1_count}")
    if parser.title_count != 1:
        fail(errors, f"{relative}: expected one title, found {parser.title_count}")
    if parser.canonical_count != 1:
        fail(errors, f"{relative}: expected one canonical link, found {parser.canonical_count}")
    if parser.description_count != 1:
        fail(errors, f"{relative}: expected one meta description, found {parser.description_count}")
    if len(parser.ids) != len(set(parser.ids)):
        fail(errors, f"{relative}: duplicate HTML id")
    if "field maps" in " ".join(parser.primary_nav_text).casefold():
        fail(errors, f"{relative}: Field Maps must not be added to primary navigation in the pilot")
    if "field maps" not in " ".join(parser.footer_text).casefold():
        fail(errors, f"{relative}: Field Maps is missing from the footer")
    if "nowweplan" in lower:
        fail(errors, f"{relative}: premature store or planning handoff found")
    for term in PROHIBITED_PUBLIC_TERMS:
        if term in lower:
            fail(errors, f"{relative}: prohibited public provider term found: {term}")

    required_social = (
        'property="og:image"',
        'name="twitter:image"',
        "field-maps-social.jpg",
    )
    for token in required_social:
        if token not in source:
            fail(errors, f"{relative}: missing social-preview metadata: {token}")

    json_blocks = re.findall(
        r'<script\s+type="application/ld\+json">(.*?)</script>', source, flags=re.DOTALL
    )
    if not json_blocks:
        fail(errors, f"{relative}: missing JSON-LD")
    for index, block in enumerate(json_blocks, start=1):
        try:
            json.loads(block)
        except json.JSONDecodeError as exc:
            fail(errors, f"{relative}: invalid JSON-LD block {index}: {exc}")

    for href in parser.hrefs:
        target_info = local_target(path, href)
        if target_info is None:
            continue
        target, fragment = target_info
        try:
            display = target.relative_to(ROOT)
        except ValueError:
            fail(errors, f"{relative}: internal link escapes site root: {href}")
            continue
        if not target.is_file():
            fail(errors, f"{relative}: broken internal link {href} -> {display}")
            continue
        if fragment and target.suffix.casefold() in {".html", ".htm"}:
            if fragment not in page_ids(target):
                fail(errors, f"{relative}: missing fragment #{fragment} in {display}")


def validate_site_contract(errors: list[str]) -> None:
    stylesheet = ROOT / "css/living-watershed-field-maps.css"
    script = ROOT / "js/field-maps.js"
    social = ROOT / "assets/living-watershed/field-maps/field-maps-social.jpg"
    for path in (stylesheet, script, social):
        if not path.is_file():
            fail(errors, f"missing Phase 3 asset: {path.relative_to(ROOT)}")
    if stylesheet.is_file() and "@media print" not in stylesheet.read_text(encoding="utf-8"):
        fail(errors, "Field Maps stylesheet is missing print rules")

    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    for url in EXPECTED_SITEMAP_URLS:
        if f"<loc>{url}</loc>" not in sitemap:
            fail(errors, f"sitemap missing {url}")

    context_links = {
        Path("index.html"): 'href="field-maps/"',
        Path("guides.html"): 'href="field-maps/"',
        Path("atlas.html"): 'href="field-maps/"',
        Path("signals/index.html"): 'href="../field-maps/"',
        Path("earthquake.html"): 'href="field-maps/"',
        Path("wildfire.html"): 'href="field-maps/"',
    }
    for relative, token in context_links.items():
        if token not in (ROOT / relative).read_text(encoding="utf-8"):
            fail(errors, f"missing contextual Field Maps link in {relative}")

    for relative in (Path("index.html"), Path("atlas.html"), Path("signals/index.html")):
        parser = PageParser()
        parser.feed((ROOT / relative).read_text(encoding="utf-8"))
        if "field maps" in " ".join(parser.primary_nav_text).casefold():
            fail(errors, f"{relative}: Field Maps was added to primary navigation")


def main() -> int:
    errors: list[str] = []
    for page in PAGE_PATHS:
        validate_page(page, errors)
    validate_site_contract(errors)

    if errors:
        print("Phase 3 site validation failed:")
        for message in errors:
            print(f"- {message}")
        return 1

    print("Phase 3 site validation passed.")
    print(f"Pages checked: {len(PAGE_PATHS)}")
    print("Contract: official free path, contextual pilot entry, offline print support")
    return 0


if __name__ == "__main__":
    sys.exit(main())
