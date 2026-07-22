#!/usr/bin/env python3
"""Validate the Phase 6 optional Field Maps interaction contract."""

from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PAGE = ROOT / "field-maps/olympic-peninsula/index.html"
SCRIPT = ROOT / "js/field-maps.js"
STYLESHEET = ROOT / "css/living-watershed-field-maps.css"

EXPECTED_SOURCES = {"trail-maps", "terrain-maps", "vehicle-access"}
EXPECTED_SHEETS = {
    "usgs-us-topo-7165-20230817": (
        "[-124.750015, 48.375005]",
        "[-124.625015, 48.500005]",
    ),
    "usgs-us-topo-30739-20230818": (
        "[-123.750015, 47.750005]",
        "[-123.625015, 47.875005]",
    ),
    "usgs-us-topo-36018-20230815": (
        "[-123.500015, 48.000006]",
        "[-123.375015, 48.125006]",
    ),
}


class ExplorerParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.sources: set[str] = set()
        self.hrefs: set[str] = set()
        self.attributes: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        self.attributes.update(name for name, _ in attrs)
        if values.get("data-field-map-source"):
            self.sources.add(values["data-field-map-source"] or "")
        if values.get("href"):
            self.hrefs.add(values["href"] or "")


def require(text: str, needles: tuple[str, ...], label: str, errors: list[str]) -> None:
    for needle in needles:
        if needle not in text:
            errors.append(f"{label}: missing {needle!r}")


def main() -> int:
    errors: list[str] = []
    for path in (PAGE, SCRIPT, STYLESHEET):
        if not path.is_file():
            errors.append(f"missing required file: {path.relative_to(ROOT)}")
    if errors:
        return report(errors)

    page = PAGE.read_text(encoding="utf-8")
    script = SCRIPT.read_text(encoding="utf-8")
    stylesheet = STYLESHEET.read_text(encoding="utf-8")

    parser = ExplorerParser()
    parser.feed(page)
    if parser.sources != EXPECTED_SOURCES:
        errors.append(f"regional explorer sources differ: {sorted(parser.sources)}")
    for source in EXPECTED_SOURCES:
        if f"#{source}" not in parser.hrefs:
            errors.append(f"source card does not link to full record: #{source}")

    require(
        page,
        (
            "data-field-map-explorer",
            "data-field-map-search",
            "data-field-map-job=\"all\"",
            "data-field-map-layer=\"sources\"",
            "data-field-map-layer=\"sheets\"",
            "data-field-map-sheet",
            "data-sheet-state=\"compact\"",
            "data-field-map-placeholder",
            "data-field-map-retry",
            "The map does not request your location.",
            "Orientation only.",
        ),
        "regional page",
        errors,
    )

    require(
        script,
        (
            "basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
            "field-map-source-points",
            "verified-sheets-fill",
            "applyFilters",
            "selectSource",
            "url.searchParams.set(\"job\"",
            "url.searchParams.set(\"source\"",
            "url.searchParams.set(\"q\"",
            "prefers-reduced-motion: reduce",
        ),
        "browser script",
        errors,
    )
    for sheet_id, bounds in EXPECTED_SHEETS.items():
        require(script, (sheet_id, *bounds), f"verified sheet {sheet_id}", errors)

    prohibited_script_terms = (
        "navigator.geolocation",
        "localStorage",
        "sessionStorage",
        "googleapis.com/maps",
        "maps.googleapis.com",
        "api.mapbox.com",
        "tiles.mapbox.com",
        "server.arcgisonline.com",
    )
    for term in prohibited_script_terms:
        if term.casefold() in script.casefold():
            errors.append(f"browser script contains prohibited dependency or state: {term}")

    require(
        stylesheet,
        (
            ".fm-explorer-layout",
            ".fm-results-sheet[data-sheet-state=\"expanded\"]",
            "@media (max-width: 760px)",
            "@media (prefers-reduced-motion: reduce)",
            ".fm-map-placeholder[hidden]",
            ".field-maps-page .fm-explorer-section",
        ),
        "stylesheet",
        errors,
    )

    if errors:
        return report(errors)
    print("Phase 6 map-experience validation passed.")
    print("Sources checked: 3")
    print("Contract: synchronized optional map, official USGS basemap, no location or storage")
    return 0


def report(errors: list[str]) -> int:
    print("Phase 6 map-experience validation failed:")
    for error in errors:
        print(f"- {error}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
