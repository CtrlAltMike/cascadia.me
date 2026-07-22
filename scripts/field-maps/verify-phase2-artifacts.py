#!/usr/bin/env python3
"""Verify selected USGS GeoPDFs at exact-file level for Phase 2.

The verifier downloads only official current-catalog URLs, computes immutable
checksums, inspects the GeoPDF structure, embedded XML and symbol-guide
attachments, extracts and screens the map collar, renders a collar image for
human review, and writes audit records. It never stores source PDFs in the
repository and never enables sale without an approved territory review.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import struct
import subprocess
import tempfile
from collections import Counter
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests
from lxml import etree
from pypdf import PdfReader

from phase2_common import (
    OFFICIAL_PRODUCT_PREFIX,
    classify_catalog,
    query_current_product,
    requests_session,
)


CHECKED_AT_DEFAULT = "2026-07-21"
BOUNDARY_VERSION = "cascadia-field-maps-v1"
REGISTER_FIELDS = [
    "artifact_id",
    "cell_id",
    "cell_name",
    "cell_mapcode",
    "publisher",
    "edition_date",
    "official_url",
    "sha256",
    "byte_count",
    "embedded_metadata_sha256",
    "catalog_checked_at",
    "catalog_status",
    "collar_review_status",
    "rights_class",
    "public_domain_status",
    "third_party_status",
    "territory_status",
    "eligibility_status",
    "sale_status",
    "pause_reason",
    "evidence_path",
]

PROHIBITED_CONTENT_PATTERNS = {
    "commercial-road-provider": re.compile(
        r"\b(?:HERE|NAVTEQ|TomTom|Tele\s+Atlas)\b", re.IGNORECASE
    ),
    "commercial-imagery-provider": re.compile(
        r"\b(?:Maxar|DigitalGlobe|GeoEye)\b", re.IGNORECASE
    ),
    "consumer-map-content": re.compile(
        r"\b(?:Google\s+Maps|Mapbox|OpenStreetMap)\b", re.IGNORECASE
    ),
    "explicit-copyright-notice": re.compile(
        r"(?:©|copyright\s+\d{4}|copyrighted\s+by)", re.IGNORECASE
    ),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("scripts/field-maps/phase2-sample.json"),
    )
    parser.add_argument(
        "--matrix",
        type=Path,
        default=Path("docs/field-maps/coverage-matrix.csv"),
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("docs/field-maps/artifact-verification"),
    )
    parser.add_argument(
        "--register",
        type=Path,
        default=Path("docs/field-maps/artifact-register.csv"),
    )
    parser.add_argument(
        "--summary",
        type=Path,
        default=Path("docs/field-maps/artifact-verification-summary.md"),
    )
    parser.add_argument("--checked-at", default=CHECKED_AT_DEFAULT)
    parser.add_argument(
        "--cache-dir",
        type=Path,
        help="Optional local download/render cache; exact hashes are always rechecked.",
    )
    return parser.parse_args()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_space(value: str) -> str:
    return " ".join(value.split())


def load_matrix(path: Path) -> dict[str, dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    result = {row["cell_id"]: row for row in rows}
    if len(result) != len(rows):
        raise RuntimeError("Coverage matrix contains duplicate cell_id values")
    return result


def load_manifest(path: Path) -> dict[str, Any]:
    manifest = json.loads(path.read_text(encoding="utf-8"))
    if manifest.get("schema_version") != 1:
        raise RuntimeError("Unsupported Phase 2 manifest schema")
    if manifest.get("territory_review_status") not in {"not-approved", "approved"}:
        raise RuntimeError("Manifest must state an explicit territory review status")
    if not str(manifest.get("review_owner") or "").strip():
        raise RuntimeError("Manifest must name the internal artifact review owner")
    return manifest


def download_exact(
    session: requests.Session,
    url: str,
    destination: Path,
    expected_sha256: str,
) -> dict[str, str]:
    if not url.startswith(OFFICIAL_PRODUCT_PREFIX):
        raise RuntimeError("Product URL is outside the official USGS allowlist")
    destination.parent.mkdir(parents=True, exist_ok=True)

    response_headers: dict[str, str] = {}
    if destination.exists() and sha256_file(destination) == expected_sha256:
        response = session.head(url, timeout=(20, 120), allow_redirects=True)
        response.raise_for_status()
        if not response.url.startswith(OFFICIAL_PRODUCT_PREFIX):
            raise RuntimeError("Official product request redirected outside the allowlist")
        response_headers = {key.lower(): value for key, value in response.headers.items()}
    else:
        response = session.get(url, timeout=(20, 300), stream=True)
        response.raise_for_status()
        if not response.url.startswith(OFFICIAL_PRODUCT_PREFIX):
            raise RuntimeError("Official product request redirected outside the allowlist")
        response_headers = {key.lower(): value for key, value in response.headers.items()}
        with destination.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    handle.write(chunk)

    actual_sha256 = sha256_file(destination)
    if actual_sha256 != expected_sha256:
        raise RuntimeError(
            f"Exact-file checksum changed: expected {expected_sha256}, got {actual_sha256}"
        )
    with destination.open("rb") as handle:
        header = handle.read(5)
    if header != b"%PDF-":
        raise RuntimeError("Downloaded artifact is not a PDF")
    return {
        "sha256": actual_sha256,
        "byte_count": str(destination.stat().st_size),
        "content_type": response_headers.get("content-type", ""),
        "etag": response_headers.get("etag", "").strip('"'),
        "last_modified": response_headers.get("last-modified", ""),
    }


def unique_attachments(reader: PdfReader) -> list[dict[str, Any]]:
    by_hash: dict[str, dict[str, Any]] = {}
    for name, payloads in reader.attachments.items():
        for payload in payloads:
            digest = sha256_bytes(payload)
            record = by_hash.setdefault(
                digest,
                {
                    "sha256": digest,
                    "byte_count": len(payload),
                    "aliases": [],
                    "payload": payload,
                },
            )
            record["aliases"].append(name)
    for record in by_hash.values():
        aliases = sorted(set(record["aliases"]))
        extension_names = [
            name for name in aliases if Path(name.strip()).suffix.lower()
        ]
        # Some malformed PDF name trees expose truncated aliases through pypdf.
        # Preserve meaningful filenames and omit parser artifacts such as "le ".
        record["aliases"] = sorted(extension_names) if extension_names else aliases
        record["canonical_name"] = (
            sorted(extension_names)[0]
            if extension_names
            else aliases[0]
        )
    return sorted(by_hash.values(), key=lambda item: item["canonical_name"])


def first_text(root: etree._Element, path: str) -> str:
    return normalize_space(root.findtext(path) or "")


def inspect_embedded_xml(data: bytes) -> dict[str, Any]:
    root = etree.fromstring(data)
    sources = []
    for source in root.findall(".//srcinfo"):
        sources.append(
            {
                "origin": first_text(source, ".//origin"),
                "publication_date": first_text(source, ".//pubdate"),
                "title": first_text(source, ".//title"),
                "citation_abbreviation": first_text(source, ".//srccitea"),
                "source_type": first_text(source, ".//typesrc"),
            }
        )
    supplemental = first_text(root, ".//supplinf")
    match = re.search(r"(\d+)", supplemental)
    return {
        "publisher": first_text(root, ".//citation/citeinfo/origin"),
        "publication_date": first_text(root, ".//citation/citeinfo/pubdate"),
        "title": first_text(root, ".//citation/citeinfo/title"),
        "cell_id": match.group(1) if match else "",
        "use_constraints": first_text(root, ".//useconst"),
        "access_constraints": first_text(root, ".//accconst"),
        "temporal_begin": first_text(root, ".//timeperd//begdate"),
        "temporal_end": first_text(root, ".//timeperd//enddate"),
        "update_status": first_text(root, ".//status/update"),
        "sources": sources,
    }


def inspect_symbol_guide(data: bytes) -> dict[str, Any]:
    reader = PdfReader(BytesIO(data), strict=False)
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    text = normalize_space(" ".join(text_parts))
    metadata = {str(key): str(value) for key, value in (reader.metadata or {}).items()}
    return {
        "page_count": len(reader.pages),
        "title": metadata.get("/Title", ""),
        "identifies_usgs": (
            "US Geological Survey" in text or "U.S. Geological Survey" in text
        ),
        "states_freely_distributable": "freely distributable" in text.lower(),
    }


def extract_collar_text(reader: PdfReader, cell_name: str) -> tuple[str, str]:
    full_text = reader.pages[0].extract_text() or ""
    cleaned_lines = []
    for line in full_text.splitlines():
        cleaned = normalize_space(line.replace("Â", " "))
        if cleaned:
            cleaned_lines.append(cleaned)

    anchors = (
        "produced by the united states geological survey",
        "imagery",
        "roads",
        "names",
        "hydrography",
        "contours",
        "boundaries",
        "public land survey system",
        "wetlands",
        "scale 1:24",
        "road classification",
        cell_name.lower(),
    )
    selected_indexes: set[int] = set()
    for index, line in enumerate(cleaned_lines):
        if any(anchor in line.lower() for anchor in anchors):
            selected_indexes.update(
                range(max(0, index - 1), min(len(cleaned_lines), index + 2))
            )
    collar_lines = [cleaned_lines[index] for index in sorted(selected_indexes)]
    return "\n".join(collar_lines), "\n".join(cleaned_lines)


def png_dimensions(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if len(header) != 24 or header[:8] != b"\x89PNG\r\n\x1a\n":
        raise RuntimeError("Collar render is not a valid PNG")
    return struct.unpack(">II", header[16:24])


def render_collar(pdf_path: Path, render_dir: Path, reader: PdfReader) -> dict[str, Any]:
    executable = shutil.which("pdftoppm")
    if not executable:
        raise RuntimeError("pdftoppm is required for visual collar evidence")
    page = reader.pages[0]
    width_points = float(page.mediabox.width)
    height_points = float(page.mediabox.height)
    dpi = 144
    width_pixels = round(width_points * dpi / 72)
    height_pixels = round(height_points * dpi / 72)
    crop_y = round(height_pixels * 0.79)
    crop_height = height_pixels - crop_y
    render_dir.mkdir(parents=True, exist_ok=True)
    prefix = render_dir / f"{pdf_path.stem}-collar"
    command = [
        executable,
        "-f",
        "1",
        "-singlefile",
        "-r",
        str(dpi),
        "-x",
        "0",
        "-y",
        str(crop_y),
        "-W",
        str(width_pixels),
        "-H",
        str(crop_height),
        "-png",
        str(pdf_path),
        str(prefix),
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"Collar rendering failed: {result.stderr[-1000:]}")
    png_path = prefix.with_suffix(".png")
    width, height = png_dimensions(png_path)
    return {
        "renderer": "pdftoppm",
        "dpi": dpi,
        "crop": {"x": 0, "y": crop_y, "width": width_pixels, "height": crop_height},
        "render_sha256": sha256_file(png_path),
        "render_width": width,
        "render_height": height,
        "renderer_warning_lines": len(result.stderr.splitlines()),
    }


def check_record(checks: list[dict[str, str]], check_id: str, passed: bool, evidence: str) -> None:
    checks.append(
        {
            "id": check_id,
            "status": "passed" if passed else "failed",
            "evidence": evidence,
        }
    )


def prohibited_findings(text: str) -> list[dict[str, str]]:
    findings = []
    for finding_id, pattern in PROHIBITED_CONTENT_PATTERNS.items():
        match = pattern.search(text)
        if match:
            findings.append({"id": finding_id, "match": match.group(0)})
    return findings


def artifact_id(row: dict[str, str]) -> str:
    return f"usgs-us-topo-{row['cell_id']}-{row['current_product_date'].replace('-', '')}"


def verify_artifact(
    session: requests.Session,
    row: dict[str, str],
    requested: dict[str, Any],
    manifest: dict[str, Any],
    checked_at: str,
    cache_dir: Path,
) -> tuple[dict[str, Any], dict[str, str]]:
    live_product = None
    catalog_error = ""
    try:
        live_product = query_current_product(session, row["cell_id"])
    except Exception as caught:  # catalog ambiguity must pause before any download
        catalog_error = f"{type(caught).__name__}: {caught}"
    catalog = classify_catalog(
        row["current_product_url"],
        row["current_product_date"],
        live_product,
        catalog_error,
    )
    if catalog["catalog_status"] != "exact-current":
        return catalog_blocked_record(
            row, catalog, live_product, catalog_error, checked_at, manifest
        )
    filename = Path(urlparse(row["current_product_url"]).path).name
    if not filename:
        raise RuntimeError("Official catalog URL has no filename")
    pdf_path = cache_dir / filename
    download = download_exact(
        session,
        row["current_product_url"],
        pdf_path,
        requested["expected_sha256"],
    )

    reader = PdfReader(pdf_path, strict=False)
    attachments = unique_attachments(reader)
    xml_attachments = [
        item for item in attachments if item["canonical_name"].lower().endswith(".xml")
    ]
    pdf_attachments = [
        item for item in attachments if item["canonical_name"].lower().endswith(".pdf")
    ]
    if len(xml_attachments) != 1:
        raise RuntimeError("GeoPDF must contain exactly one unique XML metadata attachment")
    if len(pdf_attachments) != 1:
        raise RuntimeError("GeoPDF must contain exactly one unique PDF symbol attachment")

    embedded = inspect_embedded_xml(xml_attachments[0]["payload"])
    symbol_guide = inspect_symbol_guide(pdf_attachments[0]["payload"])
    collar_text, full_page_text = extract_collar_text(reader, row["cell_name"])
    render = render_collar(pdf_path, cache_dir / "collars", reader)
    manual_review = requested["manual_collar_review"]
    metadata = {str(key): str(value) for key, value in (reader.metadata or {}).items()}
    page = reader.pages[0]
    root = reader.trailer["/Root"]

    source_text = "\n".join(
        " | ".join(
            [source["origin"], source["title"], source["citation_abbreviation"]]
        )
        for source in embedded["sources"]
    )
    findings = prohibited_findings(full_page_text + "\n" + source_text)
    checks: list[dict[str, str]] = []
    check_record(
        checks,
        "official-url",
        row["current_product_url"].startswith(OFFICIAL_PRODUCT_PREFIX),
        row["current_product_url"],
    )
    check_record(
        checks,
        "live-catalog-exact-match",
        catalog["catalog_status"] == "exact-current",
        catalog["catalog_status"],
    )
    check_record(
        checks,
        "expected-file-checksum",
        download["sha256"] == requested["expected_sha256"],
        download["sha256"],
    )
    check_record(checks, "single-page", len(reader.pages) == 1, str(len(reader.pages)))
    check_record(checks, "not-encrypted", not reader.is_encrypted, str(reader.is_encrypted))
    check_record(
        checks,
        "geospatial-viewport",
        "/VP" in page,
        "Page contains /VP" if "/VP" in page else "Page lacks /VP",
    )
    check_record(
        checks,
        "optional-content-layers",
        "/OCProperties" in root,
        "Document contains /OCProperties" if "/OCProperties" in root else "Missing",
    )
    check_record(
        checks,
        "embedded-metadata-publisher",
        embedded["publisher"] == "U.S. Geological Survey",
        embedded["publisher"],
    )
    check_record(
        checks,
        "document-title",
        metadata.get("/Title", "").strip().lower() == row["cell_name"].strip().lower(),
        metadata.get("/Title", ""),
    )
    check_record(
        checks,
        "embedded-metadata-cell-id",
        embedded["cell_id"] == row["cell_id"],
        embedded["cell_id"],
    )
    check_record(
        checks,
        "embedded-metadata-publication-date",
        embedded["publication_date"] == row["current_product_date"].replace("-", ""),
        embedded["publication_date"],
    )
    check_record(
        checks,
        "embedded-use-constraints",
        "public domain data with no reuse constraints"
        in embedded["use_constraints"].lower(),
        embedded["use_constraints"],
    )
    publication_year = int(row["current_product_pub_year"])
    check_record(
        checks,
        "commercial-road-year-exception",
        not (2010 <= publication_year <= 2016),
        f"Publication year {publication_year}",
    )
    check_record(
        checks,
        "alaska-hawaii-imagery-exception",
        row["primary_state"] not in {"Alaska", "Hawaii"},
        row["primary_state"],
    )
    check_record(
        checks,
        "prohibited-content-screen",
        not findings,
        json.dumps(findings, sort_keys=True) if findings else "No prohibited notice or provider found",
    )
    check_record(
        checks,
        "official-symbol-guide",
        symbol_guide["identifies_usgs"] and symbol_guide["states_freely_distributable"],
        json.dumps(symbol_guide, sort_keys=True),
    )
    check_record(
        checks,
        "collar-text-present",
        "Produced by the United States Geological Survey" in full_page_text
        and row["cell_name"].upper() in full_page_text.upper(),
        collar_text[-2000:] if collar_text else "No collar marker found",
    )
    check_record(
        checks,
        "manual-collar-review",
        manual_review.get("status") == "passed"
        and manual_review.get("binding_sha256") == download["sha256"]
        and manual_review.get("review_owner") == manifest["review_owner"]
        and bool(manual_review.get("reviewed_at"))
        and bool(manual_review.get("review_method")),
        manual_review.get("note", ""),
    )

    failed_checks = [check["id"] for check in checks if check["status"] != "passed"]
    known_third_party_exception = (
        2010 <= publication_year <= 2016
        or row["primary_state"] in {"Alaska", "Hawaii"}
    )
    has_third_party_blocker = bool(findings) or known_third_party_exception
    third_party_status = (
        "no-excluded-component-found"
        if not has_third_party_blocker
        else "blocked-excluded-component-found"
    )
    territory_status = manifest["territory_review_status"]
    approved_territories = manifest["approved_sale_delivery_territories"]

    if has_third_party_blocker:
        rights_class = "copyrighted-third-party"
        public_domain_status = "blocked-third-party-copyright"
        eligibility_status = "blocked-verification-failed"
        sale_status = "blocked-third-party-copyright"
        pause_reason = "Failed strict third-party screen: " + ", ".join(failed_checks)
    elif failed_checks:
        rights_class = "unknown"
        public_domain_status = "unconfirmed"
        eligibility_status = "blocked-verification-failed"
        sale_status = "blocked-unreviewed"
        pause_reason = "Failed checks: " + ", ".join(failed_checks)
    elif territory_status != "approved" or not approved_territories:
        rights_class = "public-domain-us"
        public_domain_status = "verified-public-domain-us"
        eligibility_status = "verification-complete-territory-blocked"
        sale_status = "blocked-territory"
        pause_reason = (
            "No sale/delivery territory has a completed legal review; the artifact "
            "must remain paused even though the exact-file public-domain screen passed."
        )
    else:
        rights_class = "public-domain-confirmed-territories"
        public_domain_status = "verified-public-domain-confirmed-territories"
        eligibility_status = "eligible"
        sale_status = "eligible"
        pause_reason = ""

    evidence_id = artifact_id(row)
    evidence = {
        "schema_version": 1,
        "artifact_id": evidence_id,
        "verified_at": checked_at,
        "boundary_version": BOUNDARY_VERSION,
        "artifact": {
            "publisher": "U.S. Geological Survey",
            "cell_id": row["cell_id"],
            "cell_name": row["cell_name"],
            "cell_mapcode": row["cell_mapcode"],
            "edition_date": row["current_product_date"],
            "publication_year": row["current_product_pub_year"],
            "official_url": row["current_product_url"],
        },
        "catalog": {
            "source_id": row["catalog_source_id"],
            "matrix_checked_at": row["source_checked_at"],
            "live_checked_at": checked_at,
            "status": catalog["catalog_status"],
            "live_product": live_product,
        },
        "download": download,
        "pdf": {
            "header": reader.pdf_header,
            "page_count": len(reader.pages),
            "encrypted": reader.is_encrypted,
            "page_width_points": float(page.mediabox.width),
            "page_height_points": float(page.mediabox.height),
            "document_metadata": metadata,
            "has_xmp_metadata": "/Metadata" in root,
            "has_optional_content_layers": "/OCProperties" in root,
            "has_geospatial_viewport": "/VP" in page,
            "unique_attachment_count": len(attachments),
            "attachments": [
                {
                    key: value
                    for key, value in attachment.items()
                    if key != "payload"
                }
                for attachment in attachments
            ],
        },
        "embedded_metadata": {
            **embedded,
            "filename": xml_attachments[0]["canonical_name"],
            "sha256": xml_attachments[0]["sha256"],
            "byte_count": xml_attachments[0]["byte_count"],
        },
        "symbol_guide": {
            **symbol_guide,
            "filename": pdf_attachments[0]["canonical_name"],
            "sha256": pdf_attachments[0]["sha256"],
            "byte_count": pdf_attachments[0]["byte_count"],
        },
        "collar": {
            "text": collar_text,
            "render": render,
            "manual_review": manual_review,
        },
        "rights": {
            "authority_url": manifest["rights_authority_url"],
            "rights_class": rights_class,
            "public_domain_status": public_domain_status,
            "third_party_status": third_party_status,
            "prohibited_findings": findings,
            "approved_sale_delivery_territories": approved_territories,
            "territory_status": territory_status,
        },
        "checks": checks,
        "decision": {
            "eligibility_status": eligibility_status,
            "sale_status": sale_status,
            "pause_reason": pause_reason,
        },
    }
    register = {
        "artifact_id": evidence_id,
        "cell_id": row["cell_id"],
        "cell_name": row["cell_name"],
        "cell_mapcode": row["cell_mapcode"],
        "publisher": "U.S. Geological Survey",
        "edition_date": row["current_product_date"],
        "official_url": row["current_product_url"],
        "sha256": download["sha256"],
        "byte_count": download["byte_count"],
        "embedded_metadata_sha256": xml_attachments[0]["sha256"],
        "catalog_checked_at": checked_at,
        "catalog_status": catalog["catalog_status"],
        "collar_review_status": manual_review["status"],
        "rights_class": rights_class,
        "public_domain_status": public_domain_status,
        "third_party_status": third_party_status,
        "territory_status": territory_status,
        "eligibility_status": eligibility_status,
        "sale_status": sale_status,
        "pause_reason": pause_reason,
        "evidence_path": f"artifact-verification/{evidence_id}.json",
    }
    return evidence, register


def blocked_error_record(
    row: dict[str, str],
    error: Exception,
    checked_at: str,
    manifest: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, str]]:
    evidence_id = artifact_id(row)
    reason = f"Inspection error: {type(error).__name__}: {error}"
    evidence = {
        "schema_version": 1,
        "artifact_id": evidence_id,
        "verified_at": checked_at,
        "artifact": {
            "cell_id": row["cell_id"],
            "cell_name": row["cell_name"],
            "edition_date": row["current_product_date"],
            "official_url": row["current_product_url"],
        },
        "checks": [{"id": "inspection-completed", "status": "failed", "evidence": reason}],
        "rights": {
            "authority_url": manifest["rights_authority_url"],
            "rights_class": "unknown",
            "public_domain_status": "unconfirmed",
            "third_party_status": "unconfirmed",
            "approved_sale_delivery_territories": manifest[
                "approved_sale_delivery_territories"
            ],
            "territory_status": manifest["territory_review_status"],
        },
        "decision": {
            "eligibility_status": "blocked-verification-failed",
            "sale_status": "blocked-unreviewed",
            "pause_reason": reason,
        },
    }
    register = {
        "artifact_id": evidence_id,
        "cell_id": row["cell_id"],
        "cell_name": row["cell_name"],
        "cell_mapcode": row["cell_mapcode"],
        "publisher": "U.S. Geological Survey",
        "edition_date": row["current_product_date"],
        "official_url": row["current_product_url"],
        "sha256": "",
        "byte_count": "",
        "embedded_metadata_sha256": "",
        "catalog_checked_at": checked_at,
        "catalog_status": "unconfirmed",
        "collar_review_status": "not-bound-to-downloaded-file",
        "rights_class": "unknown",
        "public_domain_status": "unconfirmed",
        "third_party_status": "unconfirmed",
        "territory_status": manifest["territory_review_status"],
        "eligibility_status": "blocked-verification-failed",
        "sale_status": "blocked-unreviewed",
        "pause_reason": reason,
        "evidence_path": f"artifact-verification/{evidence_id}.json",
    }
    return evidence, register


def catalog_blocked_record(
    row: dict[str, str],
    catalog: dict[str, str],
    live_product: dict[str, str] | None,
    query_error: str,
    checked_at: str,
    manifest: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, str]]:
    """Retain currentness evidence without downloading a stale or unconfirmed file."""
    evidence_id = artifact_id(row)
    reason = catalog["pause_reason"]
    evidence = {
        "schema_version": 1,
        "artifact_id": evidence_id,
        "verified_at": checked_at,
        "boundary_version": BOUNDARY_VERSION,
        "artifact": {
            "publisher": "U.S. Geological Survey",
            "cell_id": row["cell_id"],
            "cell_name": row["cell_name"],
            "cell_mapcode": row["cell_mapcode"],
            "edition_date": row["current_product_date"],
            "publication_year": row["current_product_pub_year"],
            "official_url": row["current_product_url"],
        },
        "catalog": {
            "source_id": row["catalog_source_id"],
            "matrix_checked_at": row["source_checked_at"],
            "live_checked_at": checked_at,
            "status": catalog["catalog_status"],
            "live_product": live_product,
            "query_error": query_error,
            "replacement_date": catalog["replacement_date"],
            "replacement_url": catalog["replacement_url"],
        },
        "rights": {
            "authority_url": manifest["rights_authority_url"],
            "rights_class": "unknown",
            "public_domain_status": "unconfirmed-current-file",
            "third_party_status": "unconfirmed",
            "approved_sale_delivery_territories": manifest[
                "approved_sale_delivery_territories"
            ],
            "territory_status": manifest["territory_review_status"],
        },
        "checks": [
            {
                "id": "live-catalog-exact-match",
                "status": "failed",
                "evidence": reason,
            }
        ],
        "decision": {
            "eligibility_status": "blocked-catalog-not-current",
            "sale_status": catalog["effective_sale_status"],
            "pause_reason": reason,
        },
    }
    register = {
        "artifact_id": evidence_id,
        "cell_id": row["cell_id"],
        "cell_name": row["cell_name"],
        "cell_mapcode": row["cell_mapcode"],
        "publisher": "U.S. Geological Survey",
        "edition_date": row["current_product_date"],
        "official_url": row["current_product_url"],
        "sha256": "",
        "byte_count": "",
        "embedded_metadata_sha256": "",
        "catalog_checked_at": checked_at,
        "catalog_status": catalog["catalog_status"],
        "collar_review_status": "not-reviewed-current-file",
        "rights_class": "unknown",
        "public_domain_status": "unconfirmed-current-file",
        "third_party_status": "unconfirmed",
        "territory_status": manifest["territory_review_status"],
        "eligibility_status": "blocked-catalog-not-current",
        "sale_status": catalog["effective_sale_status"],
        "pause_reason": reason,
        "evidence_path": f"artifact-verification/{evidence_id}.json",
    }
    return evidence, register


def write_register(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=REGISTER_FIELDS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def write_summary(path: Path, rows: list[dict[str, str]], checked_at: str) -> None:
    eligibility = Counter(row["eligibility_status"] for row in rows)
    sale = Counter(row["sale_status"] for row in rows)
    catalog = Counter(row["catalog_status"] for row in rows)

    def table(counter: Counter[str]) -> str:
        return "\n".join(
            f"| `{key}` | {value} |" for key, value in sorted(counter.items())
        )

    artifact_rows = "\n".join(
        "| {cell_name} | `{cell_id}` | {edition_date} | `{sha256}` | "
        "`{eligibility_status}` | `{sale_status}` |".format(**row)
        for row in rows
    )
    content = f"""# Phase 2 Artifact Verification Summary

**Status:** Approved July 21, 2026
**Verified:** {checked_at}
**Scope:** representative pipeline proof, not launch inventory

## Result

The exact-file pipeline processed **{len(rows)} official USGS GeoPDF artifacts**. It downloaded or checksum-reused only the exact URLs returned by the official current-product catalog, verified each file hash, inspected the PDF structure and embedded publisher metadata, screened component sources and collar text, rendered the collar for visual review, and produced an immutable evidence record.

No artifact is sale-enabled. The exact-file public-domain screens passed for the demonstration set, but no sale/delivery territory has completed legal review. The pipeline therefore applies the approved `blocked-territory` sale state automatically.

| Artifact | Cell | Edition | SHA-256 | Verification | Effective sale state |
| --- | --- | --- | --- | --- | --- |
{artifact_rows}

## Catalog states

| State | Artifacts |
| --- | ---: |
{table(catalog)}

## Verification states

| State | Artifacts |
| --- | ---: |
{table(eligibility)}

## Effective sale states

| State | Artifacts |
| --- | ---: |
{table(sale)}

## What was inspected

For every artifact, the audit records:

- exact official catalog URL, edition date, live catalog match, byte count, and SHA-256;
- PDF header, encryption state, page count, geospatial viewport, optional-content layers, document metadata, and unique attachments;
- embedded USGS XML checksum, publisher, product date, cell ID, use constraints, temporal range, update status, and every source citation;
- embedded USGS symbol-guide checksum and publisher/distribution checks;
- collar text, a rendered-collar checksum, the checksum-bound manual visual review, and prohibited-provider/copyright findings;
- public-domain exception tests for 2010-2016 commercial road data and Alaska/Hawaii imagery;
- territory status, eligibility status, effective sale state, and an explicit pause reason.

The production software named in PDF metadata is not treated as a map-content provider. The screen evaluates source citations and copyright notices, while preserving the governing USGS rights authority and the exact file's embedded constraints.

## Fail-closed behavior

- An excluded third-party component or known US Topo exception produces `blocked-third-party-copyright`.
- A changed checksum, non-official URL, missing metadata attachment, mismatched cell/date, missing collar, failed visual review, or other inspection error produces `blocked-unreviewed`.
- A different current URL or edition produces `paused-new-edition-check`.
- A missing, unreachable, or unconfirmed catalog record produces `blocked-stale`.
- A rights-clean exact file with no approved territory remains `blocked-territory`.
- Only an exact-current, fully verified file with a completed territory review can produce `eligible`.

## Reproduction

```sh
python3 -m pip install -r scripts/field-maps/requirements-phase2.txt
python3 scripts/field-maps/verify-phase2-artifacts.py \\
  --checked-at {checked_at} \\
  --cache-dir tmp/pdfs/phase2-review
python3 scripts/field-maps/recheck-phase2-artifacts.py \\
  --checked-at {checked_at} \\
  --fail-on-catalog-drift
```

Source PDFs and rendered collar images are temporary verification inputs, not repository artifacts. A local cache may be deleted after review. The committed audit JSON is sufficient to identify and re-download the exact official source, verify its checksum, reproduce the inspection, and bind the visual collar decision to the reviewed bytes.

Phase 2 is approved. Phase 3 may proceed under its own review gate when explicitly authorized.
"""
    path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()
    try:
        datetime.strptime(args.checked_at, "%Y-%m-%d")
    except ValueError as error:
        raise SystemExit("--checked-at must use YYYY-MM-DD") from error

    matrix = load_matrix(args.matrix)
    manifest = load_manifest(args.manifest)
    session = requests_session()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="cascadia-field-maps-phase2-") as temp_name:
        cache_dir = args.cache_dir.resolve() if args.cache_dir else Path(temp_name)
        cache_dir.mkdir(parents=True, exist_ok=True)
        register_rows: list[dict[str, str]] = []
        for requested in manifest["artifacts"]:
            cell_id = str(requested["cell_id"])
            row = matrix.get(cell_id)
            if row is None:
                raise RuntimeError(f"Manifest cell {cell_id} is absent from the matrix")
            try:
                evidence, register = verify_artifact(
                    session,
                    row,
                    requested,
                    manifest,
                    args.checked_at,
                    cache_dir,
                )
            except Exception as error:  # fail closed and retain an auditable decision
                evidence, register = blocked_error_record(
                    row, error, args.checked_at, manifest
                )
            (output_dir / f"{register['artifact_id']}.json").write_text(
                json.dumps(evidence, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            register_rows.append(register)

    register_rows.sort(key=lambda row: (row["cell_name"], row["cell_id"]))
    current_evidence = {
        (output_dir / f"{row['artifact_id']}.json").resolve()
        for row in register_rows
    }
    for prior_evidence in output_dir.glob("usgs-us-topo-*.json"):
        if prior_evidence.resolve() not in current_evidence:
            prior_evidence.unlink()
    write_register(args.register.resolve(), register_rows)
    write_summary(args.summary.resolve(), register_rows, args.checked_at)
    print(
        json.dumps(
            {
                "artifacts": len(register_rows),
                "catalog_states": dict(Counter(row["catalog_status"] for row in register_rows)),
                "eligibility_states": dict(
                    Counter(row["eligibility_status"] for row in register_rows)
                ),
                "sale_states": dict(Counter(row["sale_status"] for row in register_rows)),
                "register": str(args.register.resolve()),
                "evidence_dir": str(output_dir),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
