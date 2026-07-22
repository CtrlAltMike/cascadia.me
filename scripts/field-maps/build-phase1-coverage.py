#!/usr/bin/env python3
"""Build the Phase 1 Cascadia Field Maps boundary and USGS coverage matrix.

Only official publisher sources are used:

* U.S. Census Bureau 2025 state cartographic boundary KML
* Statistics Canada 2021 province/territory digital boundary GML
* USGS US Topo Availability ArcGIS service

The script deliberately does not download or inspect map artifacts. Exact-file
eligibility is Phase 2 work, so every current product remains verification-
blocked in the Phase 1 matrix.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
import tempfile
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import requests
from lxml import etree
from pyproj import Transformer
from requests.adapters import HTTPAdapter
from shapely import make_valid
from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.geometry.polygon import orient
from shapely.ops import transform, unary_union
from urllib3.util.retry import Retry


BOUNDARY_VERSION = "cascadia-field-maps-v1"
BOUNDARY_EFFECTIVE_DATE = "2026-07-21"
CHECKED_AT_DEFAULT = "2026-07-21"

US_CENSUS_PAGE = (
    "https://www.census.gov/geographies/mapping-files/2025/"
    "geo/carto-boundary-file.html"
)
US_CENSUS_ZIP = (
    "https://www2.census.gov/geo/tiger/GENZ2025/kml/"
    "cb_2025_us_state_5m.zip"
)
STATCAN_PAGE = (
    "https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/"
    "boundary-limites/index2021-eng.cfm?year=21"
)
STATCAN_ZIP = (
    "https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/"
    "boundary-limites/files-fichiers/lpr_000a21g_e.zip"
)
USGS_SERVICE = (
    "https://index.nationalmap.gov/arcgis/rest/services/"
    "USTopoAvailability/MapServer"
)
USGS_GRID_LAYER = f"{USGS_SERVICE}/0"
USGS_CURRENT_LAYER = f"{USGS_SERVICE}/2"

TARGET_US_STATES = {"WA": "Washington", "OR": "Oregon"}
TARGET_CANADA_PRUID = "59"

MATRIX_FIELDS = [
    "boundary_version",
    "jurisdictions",
    "grid_system",
    "cell_id",
    "cell_name",
    "cell_mapcode",
    "primary_state",
    "state_alpha",
    "cell_all_water",
    "min_lon",
    "min_lat",
    "max_lon",
    "max_lat",
    "current_product_present",
    "current_product_pub_year",
    "current_product_date",
    "current_product_url",
    "catalog_state",
    "rights_state",
    "sale_status",
    "phase1_reason",
    "catalog_source_id",
    "source_checked_at",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("docs/field-maps"),
        help="Directory for generated Phase 1 artifacts.",
    )
    parser.add_argument(
        "--checked-at",
        default=CHECKED_AT_DEFAULT,
        help="Catalog review date in YYYY-MM-DD form.",
    )
    return parser.parse_args()


def session() -> requests.Session:
    retry = Retry(
        total=5,
        connect=5,
        read=5,
        backoff_factor=0.8,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
    )
    result = requests.Session()
    result.headers.update(
        {
            "User-Agent": (
                "CascadiaFieldMapsPhase1/1.0 "
                "(+https://cascadia.me/field-maps/)"
            )
        }
    )
    result.mount("https://", HTTPAdapter(max_retries=retry))
    return result


def download(client: requests.Session, url: str, destination: Path) -> str:
    response = client.get(url, timeout=(20, 180))
    response.raise_for_status()
    destination.write_bytes(response.content)
    return hashlib.sha256(response.content).hexdigest()


def first_file_with_suffix(archive: zipfile.ZipFile, suffix: str) -> str:
    matches = [name for name in archive.namelist() if name.lower().endswith(suffix)]
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected one {suffix} file in archive; found {len(matches)}: {matches}"
        )
    return matches[0]


def coordinate_ring(text: str) -> list[tuple[float, float]]:
    coordinates: list[tuple[float, float]] = []
    for token in text.split():
        values = token.split(",")
        coordinates.append((float(values[0]), float(values[1])))
    return coordinates


def valid_polygonal(geometry: Any) -> Any:
    geometry = make_valid(geometry)
    if geometry.geom_type == "GeometryCollection":
        geometry = unary_union(
            [part for part in geometry.geoms if part.geom_type in {"Polygon", "MultiPolygon"}]
        )
    if geometry.geom_type not in {"Polygon", "MultiPolygon"}:
        raise RuntimeError(f"Expected polygonal geometry, got {geometry.geom_type}")
    return geometry


def parse_us_states(kml_bytes: bytes) -> dict[str, Any]:
    root = etree.fromstring(kml_bytes)
    ns = {"kml": "http://www.opengis.net/kml/2.2"}
    result: dict[str, Any] = {}

    for placemark in root.xpath(".//kml:Placemark", namespaces=ns):
        attributes = {
            node.get("name"): (node.text or "").strip()
            for node in placemark.xpath(".//kml:SimpleData", namespaces=ns)
        }
        abbreviation = attributes.get("STUSPS")
        if abbreviation not in TARGET_US_STATES:
            continue

        polygons: list[Polygon] = []
        for polygon_node in placemark.xpath(".//kml:Polygon", namespaces=ns):
            outer_nodes = polygon_node.xpath(
                "./kml:outerBoundaryIs/kml:LinearRing/kml:coordinates",
                namespaces=ns,
            )
            if not outer_nodes or not outer_nodes[0].text:
                continue
            outer = coordinate_ring(outer_nodes[0].text)
            holes = [
                coordinate_ring(node.text)
                for node in polygon_node.xpath(
                    "./kml:innerBoundaryIs/kml:LinearRing/kml:coordinates",
                    namespaces=ns,
                )
                if node.text
            ]
            polygons.append(Polygon(outer, holes))

        if not polygons:
            raise RuntimeError(f"No KML polygons found for {abbreviation}")
        result[abbreviation] = valid_polygonal(unary_union(polygons))

    if set(result) != set(TARGET_US_STATES):
        raise RuntimeError(f"Missing target U.S. states; found {sorted(result)}")
    return result


def pos_list(text: str) -> list[tuple[float, float]]:
    values = [float(value) for value in text.split()]
    if len(values) % 2:
        raise RuntimeError("GML posList has an odd coordinate count")
    return list(zip(values[::2], values[1::2]))


def parse_bc(gml_bytes: bytes) -> Any:
    root = etree.fromstring(gml_bytes)
    ns = {
        "gml": "http://www.opengis.net/gml",
        "fme": "http://www.safe.com/gml/fme",
    }
    target = None
    for feature in root.xpath(".//gml:featureMember", namespaces=ns):
        pruid = feature.xpath("string(.//fme:PRUID)", namespaces=ns).strip()
        if pruid == TARGET_CANADA_PRUID:
            target = feature
            break
    if target is None:
        raise RuntimeError("British Columbia PRUID 59 not found in Statistics Canada GML")

    polygons: list[Polygon] = []
    for patch in target.xpath(".//gml:PolygonPatch | .//gml:Polygon", namespaces=ns):
        outer_nodes = patch.xpath(
            "./gml:exterior/gml:LinearRing/gml:posList", namespaces=ns
        )
        if not outer_nodes or not outer_nodes[0].text:
            continue
        holes = [
            pos_list(node.text)
            for node in patch.xpath(
                "./gml:interior/gml:LinearRing/gml:posList", namespaces=ns
            )
            if node.text
        ]
        polygons.append(Polygon(pos_list(outer_nodes[0].text), holes))

    if not polygons:
        raise RuntimeError("No polygonal geometry found for British Columbia")

    bc_albers = valid_polygonal(unary_union(polygons))
    transformer = Transformer.from_crs(3347, 4326, always_xy=True)
    return valid_polygonal(transform(transformer.transform, bc_albers))


def arcgis_object_ids(
    client: requests.Session, layer_url: str, bbox: tuple[float, float, float, float]
) -> list[int]:
    params = {
        "where": "1=1",
        "geometry": ",".join(f"{value:.8f}" for value in bbox),
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "returnIdsOnly": "true",
        "f": "json",
    }
    response = client.get(f"{layer_url}/query", params=params, timeout=(20, 180))
    response.raise_for_status()
    payload = response.json()
    if "error" in payload:
        raise RuntimeError(f"ArcGIS ID query failed: {payload['error']}")
    return sorted(payload.get("objectIds") or [])


def chunks(values: list[int], size: int) -> Iterable[list[int]]:
    for offset in range(0, len(values), size):
        yield values[offset : offset + size]


def arcgis_features(
    client: requests.Session,
    layer_url: str,
    bbox: tuple[float, float, float, float],
    out_fields: list[str],
    return_geometry: bool,
) -> list[dict[str, Any]]:
    object_ids = arcgis_object_ids(client, layer_url, bbox)
    features: list[dict[str, Any]] = []
    for batch in chunks(object_ids, 400):
        params = {
            "objectIds": ",".join(str(value) for value in batch),
            "outFields": ",".join(out_fields),
            "returnGeometry": "true" if return_geometry else "false",
            "outSR": "4326",
            "f": "geojson" if return_geometry else "json",
        }
        response = client.get(f"{layer_url}/query", params=params, timeout=(20, 180))
        response.raise_for_status()
        payload = response.json()
        if "error" in payload:
            raise RuntimeError(f"ArcGIS feature query failed: {payload['error']}")
        features.extend(payload.get("features") or [])
    return features


def properties(feature: dict[str, Any]) -> dict[str, Any]:
    return feature.get("properties") or feature.get("attributes") or {}


def field(values: dict[str, Any], name: str, default: Any = "") -> Any:
    for key, value in values.items():
        if key.lower() == name.lower():
            return value
    return default


def normalized_cell_id(value: Any) -> str:
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def arcgis_date(value: Any) -> str:
    if value in (None, ""):
        return ""
    try:
        return datetime.fromtimestamp(float(value) / 1000, tz=timezone.utc).date().isoformat()
    except (TypeError, ValueError, OSError):
        return str(value)


def bool_text(value: Any) -> str:
    return "true" if str(value).strip().lower() in {"1", "true", "yes", "y"} else "false"


def round_coordinate(value: float) -> str:
    return f"{value:.6f}"


def latest_products(features: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for feature in features:
        values = properties(feature)
        cell_id = normalized_cell_id(field(values, "cell_id"))
        if not cell_id:
            continue
        date_value = field(values, "file_name_date")
        sort_key = (
            int(str(field(values, "pub_yr", "0") or "0")),
            float(date_value or 0),
            str(field(values, "cloud_url")),
        )
        existing = result.get(cell_id)
        if existing is None or sort_key > existing["_sort_key"]:
            result[cell_id] = {**values, "_sort_key": sort_key}
    return result


def build_matrix(
    grid_features: list[dict[str, Any]],
    product_features: list[dict[str, Any]],
    us_boundaries: dict[str, Any],
    checked_at: str,
) -> list[dict[str, str]]:
    products = latest_products(product_features)
    rows: list[dict[str, str]] = []

    for feature in grid_features:
        if not feature.get("geometry"):
            continue
        geometry = valid_polygonal(shape(feature["geometry"]))
        jurisdictions = [
            abbreviation
            for abbreviation in ("WA", "OR")
            if geometry.intersection(us_boundaries[abbreviation]).area > 1e-12
        ]
        if not jurisdictions:
            continue

        values = properties(feature)
        cell_id = normalized_cell_id(field(values, "CELL_ID"))
        product = products.get(cell_id)
        min_lon, min_lat, max_lon, max_lat = geometry.bounds
        has_product = product is not None
        all_water = bool_text(field(values, "CELL_ALLWATER"))

        if has_product:
            catalog_state = "current-candidate"
            rights_state = "exact-file-review-required"
            sale_status = "blocked-verification-required"
            reason = (
                "A current official-catalog product exists; Phase 2 must verify the "
                "exact file, checksum, collar, embedded metadata, component rights, "
                "public-domain authority, and latest-edition status before sale."
            )
        else:
            catalog_state = "no-current-product"
            rights_state = "not-applicable-no-current-product"
            sale_status = "blocked-missing-current-product"
            reason = (
                "The official current-availability layer returned no current US Topo "
                "product for this intersecting grid cell. Historical sources may be "
                "listed freely but cannot satisfy the latest-edition sale rule."
            )
            if all_water == "true":
                reason = (
                    "The official grid marks this as an all-water cell and the current-"
                    "availability layer returned no current US Topo product; it is not "
                    "a sale candidate."
                )

        rows.append(
            {
                "boundary_version": BOUNDARY_VERSION,
                "jurisdictions": "|".join(jurisdictions),
                "grid_system": "USGS 7.5-minute quadrangle index",
                "cell_id": cell_id,
                "cell_name": str(field(values, "CELL_NAME")),
                "cell_mapcode": str(field(values, "CELL_MAPCODE")),
                "primary_state": str(field(values, "PRIMARY_STATE")),
                "state_alpha": str(field(values, "STATE_ALPHA")),
                "cell_all_water": all_water,
                "min_lon": round_coordinate(min_lon),
                "min_lat": round_coordinate(min_lat),
                "max_lon": round_coordinate(max_lon),
                "max_lat": round_coordinate(max_lat),
                "current_product_present": "true" if has_product else "false",
                "current_product_pub_year": (
                    str(field(product, "pub_yr")) if product else ""
                ),
                "current_product_date": (
                    arcgis_date(field(product, "file_name_date")) if product else ""
                ),
                "current_product_url": (
                    str(field(product, "cloud_url")) if product else ""
                ),
                "catalog_state": catalog_state,
                "rights_state": rights_state,
                "sale_status": sale_status,
                "phase1_reason": reason,
                "catalog_source_id": "usgs-us-topo-availability",
                "source_checked_at": checked_at,
            }
        )

    rows.sort(key=lambda row: (row["jurisdictions"], row["cell_name"], row["cell_id"]))
    return rows


def geojson_geometry(geometry: Any) -> dict[str, Any]:
    oriented = geometry
    if geometry.geom_type == "Polygon":
        oriented = orient(geometry, sign=1.0)
    elif geometry.geom_type == "MultiPolygon":
        oriented = MultiPolygon([orient(part, sign=1.0) for part in geometry.geoms])
    return mapping(oriented)


def write_boundary(
    path: Path,
    boundaries: dict[str, Any],
    source_hashes: dict[str, str],
) -> None:
    jurisdiction_metadata = {
        "WA": ("Washington", "United States", "us-census-2025-state-boundary"),
        "OR": ("Oregon", "United States", "us-census-2025-state-boundary"),
        "BC": ("British Columbia", "Canada", "statcan-2021-pr-boundary"),
    }
    features = []
    for abbreviation in ("WA", "OR", "BC"):
        name, country, source_id = jurisdiction_metadata[abbreviation]
        features.append(
            {
                "type": "Feature",
                "id": abbreviation,
                "properties": {
                    "boundary_version": BOUNDARY_VERSION,
                    "jurisdiction": abbreviation,
                    "name": name,
                    "country": country,
                    "source_id": source_id,
                    "purpose": "operational Field Maps coverage",
                },
                "geometry": geojson_geometry(boundaries[abbreviation]),
            }
        )

    document = {
        "type": "FeatureCollection",
        "name": BOUNDARY_VERSION,
        "metadata": {
            "effective_date": BOUNDARY_EFFECTIVE_DATE,
            "crs": "OGC:CRS84 (longitude, latitude)",
            "definition": (
                "Union of the official administrative geometries for Washington, "
                "Oregon, and British Columbia. This is an operational product boundary, "
                "not a definition of ecological, geological, cultural, or Indigenous "
                "Cascadia."
            ),
            "us_boundary_publisher_page": US_CENSUS_PAGE,
            "us_boundary_source_url": US_CENSUS_ZIP,
            "us_boundary_source_sha256": source_hashes["us"],
            "bc_boundary_publisher_page": STATCAN_PAGE,
            "bc_boundary_source_url": STATCAN_ZIP,
            "bc_boundary_source_sha256": source_hashes["bc"],
            "geometry_note": (
                "Source geometry is retained without editorial simplification. The "
                "Statistics Canada EPSG:3347 geometry is transformed to OGC:CRS84."
            ),
        },
        "features": features,
    }
    path.write_text(
        json.dumps(document, ensure_ascii=False, indent=2, separators=(",", ": ")) + "\n",
        encoding="utf-8",
    )


def write_matrix(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=MATRIX_FIELDS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def validate_phase1(boundaries: dict[str, Any], rows: list[dict[str, str]]) -> None:
    expected_boundary_keys = {"WA", "OR", "BC"}
    if set(boundaries) != expected_boundary_keys:
        raise RuntimeError(
            f"Boundary keys must be {sorted(expected_boundary_keys)}; "
            f"found {sorted(boundaries)}"
        )
    for key, geometry in boundaries.items():
        if geometry.is_empty or not geometry.is_valid:
            raise RuntimeError(f"Boundary geometry {key} must be non-empty and valid")

    if not rows:
        raise RuntimeError("No intersecting USGS grid cells were produced")
    cell_ids = [row["cell_id"] for row in rows]
    if len(cell_ids) != len(set(cell_ids)):
        raise RuntimeError("The matrix must contain exactly one row per USGS cell_id")

    allowed_catalog_states = {"current-candidate", "no-current-product"}
    allowed_rights_states = {
        "exact-file-review-required",
        "not-applicable-no-current-product",
    }
    allowed_sale_states = {
        "blocked-verification-required",
        "blocked-missing-current-product",
    }
    required_fields = {
        "boundary_version",
        "jurisdictions",
        "grid_system",
        "cell_id",
        "cell_name",
        "catalog_state",
        "rights_state",
        "sale_status",
        "phase1_reason",
        "catalog_source_id",
        "source_checked_at",
    }

    for row in rows:
        if any(not row[name] for name in required_fields):
            raise RuntimeError(f"Matrix row {row['cell_id']} has a blank required field")
        if row["boundary_version"] != BOUNDARY_VERSION:
            raise RuntimeError(f"Matrix row {row['cell_id']} has the wrong boundary version")
        if row["catalog_state"] not in allowed_catalog_states:
            raise RuntimeError(f"Matrix row {row['cell_id']} has an invalid catalog state")
        if row["rights_state"] not in allowed_rights_states:
            raise RuntimeError(f"Matrix row {row['cell_id']} has an invalid rights state")
        if row["sale_status"] not in allowed_sale_states:
            raise RuntimeError(f"Matrix row {row['cell_id']} has an invalid sale state")
        if row["jurisdictions"] not in {"WA", "OR", "WA|OR"}:
            raise RuntimeError(f"Matrix row {row['cell_id']} has invalid jurisdictions")
        if row["current_product_present"] == "true":
            if not row["current_product_date"] or not row["current_product_url"]:
                raise RuntimeError(
                    f"Current candidate {row['cell_id']} lacks date or official URL"
                )
            if not row["current_product_url"].startswith(
                "https://prd-tnm.s3.amazonaws.com/"
            ):
                raise RuntimeError(
                    f"Current candidate {row['cell_id']} has a non-USGS product URL"
                )
            if row["catalog_state"] != "current-candidate":
                raise RuntimeError(
                    f"Current candidate {row['cell_id']} has inconsistent catalog state"
                )
        elif any(
            row[name]
            for name in (
                "current_product_pub_year",
                "current_product_date",
                "current_product_url",
            )
        ):
            raise RuntimeError(
                f"No-current row {row['cell_id']} contains current-product metadata"
            )

    if any("unknown" in row["catalog_state"] or "unknown" in row["sale_status"] for row in rows):
        raise RuntimeError("Phase 1 must not emit an unknown catalog or sale state")
    if any(row["sale_status"] == "eligible" for row in rows):
        raise RuntimeError("Phase 1 must not produce eligible sale rows")


def write_summary(
    path: Path,
    rows: list[dict[str, str]],
    source_hashes: dict[str, str],
    checked_at: str,
) -> None:
    catalog_counts = Counter(row["catalog_state"] for row in rows)
    sale_counts = Counter(row["sale_status"] for row in rows)
    jurisdiction_counts = Counter()
    for row in rows:
        for jurisdiction in row["jurisdictions"].split("|"):
            jurisdiction_counts[jurisdiction] += 1
    year_counts = Counter(
        row["current_product_pub_year"]
        for row in rows
        if row["current_product_pub_year"]
    )
    eligible_count = sum(row["sale_status"] == "eligible" for row in rows)
    unknown_count = sum(
        "unknown" in row["catalog_state"] or "unknown" in row["sale_status"]
        for row in rows
    )

    def count_lines(counter: Counter[str]) -> str:
        return "\n".join(
            f"| `{key}` | {value:,} |" for key, value in sorted(counter.items())
        )

    year_table = count_lines(year_counts) if year_counts else "| _none_ | 0 |"
    content = f"""# Phase 1 Coverage Matrix Summary

**Status:** Approved July 21, 2026
**Boundary version:** `{BOUNDARY_VERSION}`
**Official catalog checked:** {checked_at}
**Generated by:** `scripts/field-maps/build-phase1-coverage.py`

## Result

The matrix enumerates **{len(rows):,} unique USGS 7.5-minute grid cells** whose polygons have positive-area intersection with the Washington or Oregon components of `{BOUNDARY_VERSION}`.

- Washington-intersecting cells: **{jurisdiction_counts['WA']:,}**
- Oregon-intersecting cells: **{jurisdiction_counts['OR']:,}**
- Cells with an official current-product record: **{catalog_counts['current-candidate']:,}**
- Cells without an official current-product record: **{catalog_counts['no-current-product']:,}**
- Eligible sale rows in Phase 1: **{eligible_count:,}**
- Unknown catalog or sale rows: **{unknown_count:,}**

`eligible` is intentionally zero. A current catalog record establishes a candidate, not an exact-file rights decision. Exact-file download, checksum, collar, embedded-metadata, component-rights, public-domain, and edition verification belong to Phase 2.

## Catalog states

| State | Cells |
| --- | ---: |
{count_lines(catalog_counts)}

## Sale states

| State | Cells |
| --- | ---: |
{count_lines(sale_counts)}

## Current product publication years

| Year | Cells |
| --- | ---: |
{year_table}

## Method

1. Download the official 2025 U.S. Census Bureau 1:5,000,000 state cartographic boundary KML.
2. Select Washington and Oregon by `STUSPS` and retain their official source geometry.
3. Download the official Statistics Canada 2021 province/territory digital boundary GML, select British Columbia by `PRUID=59`, and transform EPSG:3347 to longitude/latitude for the versioned boundary artifact.
4. Query the official USGS US Topo Availability `7.5 Minute Index` and `Index of Available Maps` layers by object ID within the Washington–Oregon envelope.
5. Keep a grid cell only when its polygon has a positive-area intersection with Washington or Oregon.
6. Match current products by official USGS `cell_id`; where multiple records occur, retain the latest `pub_yr`, then `file_name_date`, then stable URL order.
7. Assign an explicit blocked state to every row. No source map file is downloaded or inspected in Phase 1.

The matrix does not enumerate British Columbia NTS sheets. Phase 1 keeps official Canadian sources in the source register as free-finder candidates and blocks them from sale under the approved public-domain-only rule. Complete B.C. free-finder coverage is Phase 8.

## Column definitions

| Column | Meaning |
| --- | --- |
| `boundary_version` | Adopted operating boundary that produced the row |
| `jurisdictions` | Positive-area intersections with `WA`, `OR`, or both |
| `grid_system` | Official grid series used for enumeration |
| `cell_id`, `cell_name`, `cell_mapcode` | Official USGS grid identifiers |
| `primary_state`, `state_alpha`, `cell_all_water` | Publisher grid attributes; these do not override geometric intersection |
| `min_lon`, `min_lat`, `max_lon`, `max_lat` | Official grid feature bounds in longitude/latitude, rounded to six decimals |
| `current_product_*` | Presence, publication year/date, and official current-product URL from the availability layer |
| `catalog_state` | `current-candidate` or `no-current-product` |
| `rights_state` | Whether exact-file review is required or unavailable because no current product exists |
| `sale_status` | Explicit Phase 1 block; never `eligible` |
| `phase1_reason` | Human-readable explanation for the blocked state |
| `catalog_source_id` | Stable key into `source-register.md` |
| `source_checked_at` | Date the live official catalog was queried |

## Reproduction

From the repository root, install the pinned dependencies and run:

```sh
python3 -m pip install -r scripts/field-maps/requirements-phase1.txt
python3 scripts/field-maps/build-phase1-coverage.py --checked-at {checked_at}
```

The build fails when a required official file, geometry, or API query cannot be resolved. It does not silently convert a missing response into an eligible or unknown sale state.

## Source snapshot checksums

| Source snapshot | SHA-256 |
| --- | --- |
| U.S. Census 2025 state boundary ZIP | `{source_hashes['us']}` |
| Statistics Canada 2021 province/territory boundary ZIP | `{source_hashes['bc']}` |

The live USGS availability service is updated daily. Its review date is recorded per matrix row rather than represented by a static source-file checksum.

## Phase 1 acceptance checks

- [x] The operating boundary is versioned and carries official source provenance.
- [x] Every intersecting U.S. cell has a catalog state.
- [x] Every intersecting U.S. cell has a sale state.
- [x] No unknown row is represented as sellable.
- [x] No row is marked eligible before exact-file verification.
- [x] Canadian open-government sources remain free-finder-only under the strict rule.
- [x] No prohibited commercial catalog, basemap, derivative, or third-party marketplace was used as evidence.

Phase 2 may proceed under its own review gate.
"""
    path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()
    try:
        datetime.strptime(args.checked_at, "%Y-%m-%d")
    except ValueError as error:
        raise SystemExit("--checked-at must use YYYY-MM-DD") from error

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    client = session()

    with tempfile.TemporaryDirectory(prefix="cascadia-field-maps-phase1-") as temp_name:
        temp_dir = Path(temp_name)
        us_zip_path = temp_dir / "us-states.zip"
        bc_zip_path = temp_dir / "canada-pr.zip"
        source_hashes = {
            "us": download(client, US_CENSUS_ZIP, us_zip_path),
            "bc": download(client, STATCAN_ZIP, bc_zip_path),
        }

        with zipfile.ZipFile(us_zip_path) as archive:
            us_kml = archive.read(first_file_with_suffix(archive, ".kml"))
        with zipfile.ZipFile(bc_zip_path) as archive:
            bc_gml = archive.read(first_file_with_suffix(archive, ".gml"))

    us_boundaries = parse_us_states(us_kml)
    bc_boundary = parse_bc(bc_gml)
    boundaries = {**us_boundaries, "BC": bc_boundary}

    us_union = valid_polygonal(unary_union(list(us_boundaries.values())))
    query_bbox = us_union.bounds
    grid_features = arcgis_features(
        client,
        USGS_GRID_LAYER,
        query_bbox,
        [
            "OBJECTID",
            "CELL_ID",
            "CELL_NAME",
            "PRIMARY_STATE",
            "STATE_ALPHA",
            "CELL_MAPCODE",
            "CELL_ALLWATER",
        ],
        return_geometry=True,
    )
    product_features = arcgis_features(
        client,
        USGS_CURRENT_LAYER,
        query_bbox,
        [
            "OBJECTID",
            "cell_id",
            "cell_name",
            "primary_state",
            "file_name_date",
            "cloud_url",
            "pub_yr",
            "minx",
            "maxx",
            "miny",
            "maxy",
        ],
        return_geometry=False,
    )

    rows = build_matrix(grid_features, product_features, us_boundaries, args.checked_at)
    validate_phase1(boundaries, rows)

    write_boundary(output_dir / "coverage-boundary.geojson", boundaries, source_hashes)
    write_matrix(output_dir / "coverage-matrix.csv", rows)
    write_summary(
        output_dir / "coverage-matrix-summary.md",
        rows,
        source_hashes,
        args.checked_at,
    )

    print(
        json.dumps(
            {
                "boundary_version": BOUNDARY_VERSION,
                "matrix_rows": len(rows),
                "catalog_states": dict(Counter(row["catalog_state"] for row in rows)),
                "sale_states": dict(Counter(row["sale_status"] for row in rows)),
                "output_dir": str(output_dir),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.RequestException as error:
        print(f"Official-source request failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
    except (OSError, RuntimeError, zipfile.BadZipFile, etree.XMLSyntaxError) as error:
        print(f"Phase 1 build failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
