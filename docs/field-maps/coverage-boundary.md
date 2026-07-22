# Cascadia Field Maps v1 Operating Boundary

**Status:** Approved July 21, 2026
**Boundary ID:** `cascadia-field-maps-v1`
**Effective date:** July 21, 2026
**Geometry:** [`coverage-boundary.geojson`](coverage-boundary.geojson)

## Decision

The v1 operating boundary is the union of the official administrative geometries for:

- Washington;
- Oregon; and
- British Columbia.

This is a product-coverage decision. It is not offered as a definition of ecological, geological, bioregional, cultural, historical, or Indigenous Cascadia. It does not assert that every map source covers every part of those jurisdictions or that all official maps within them are suitable for a particular field use.

The version gives Field Maps a stable, reproducible answer to “which cells must be checked before regional completeness is claimed?” The U.S. matrix enumerates every USGS 7.5-minute cell with a positive-area intersection against the Washington or Oregon source geometry. British Columbia is included in the operating boundary, but Phase 1 records its official sources only; complete NTS/free-finder coverage remains Phase 7 work.

## Included and excluded geography

| Geography | v1 treatment | Reason |
| --- | --- | --- |
| Washington | Included; U.S. grid enumerated | Core site coverage and official U.S. inventory candidate area |
| Oregon | Included; U.S. grid enumerated | Core site coverage and official U.S. inventory candidate area |
| British Columbia | Included; official sources registered, no paid candidates | Core site coverage; Crown/open-government material is blocked by the strict public-domain-only sale rule |
| Northern California, Idaho, Montana, Alaska, Yukon, and Alberta | Excluded | Sometimes associated with broader Cascadia concepts, but outside this versioned product boundary |
| Offshore or cross-border cells that only touch a source boundary at a line or point | Excluded from the U.S. matrix | Zero-area contact does not create a coverage obligation |

Expanding or contracting this list requires a new boundary version, regenerated matrix, documented migration, and explicit approval. A prose edit cannot silently change inventory scope.

## Official geometry sources

### Washington and Oregon

- **Publisher:** U.S. Census Bureau
- **Dataset:** 2025 1:5,000,000 state cartographic boundary KML
- **Selection keys:** `STUSPS=WA` and `STUSPS=OR`
- **Publisher page:** <https://www.census.gov/geographies/mapping-files/2025/geo/carto-boundary-file.html>
- **Exact source ZIP:** <https://www2.census.gov/geo/tiger/GENZ2025/kml/cb_2025_us_state_5m.zip>
- **Downloaded source SHA-256:** `076aabf7b7e3adaf170f8dc014a8936032a4c1e5cee3ec1f0a5aa2bab538d856`

The cartographic boundary is suitable for a regional coverage decision and already represents the source publisher's generalized cartographic geometry. It is not a legal survey boundary and must not be presented as one.

### British Columbia

- **Publisher:** Statistics Canada
- **Dataset:** 2021 province/territory digital boundary GML
- **Selection key:** `PRUID=59`
- **Source CRS:** EPSG:3347
- **Publisher page:** <https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index2021-eng.cfm?year=21>
- **Exact source ZIP:** <https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/files-fichiers/lpr_000a21g_e.zip>
- **Downloaded source SHA-256:** `af8f0caee0d0c15dbd9f92099165966023fa1a6b85abb80218c6f91731f4ea20`

The digital boundary includes the official administrative extent and coastal-water treatment described by Statistics Canada. The build transforms it from EPSG:3347 into OGC:CRS84 longitude/latitude without editorial simplification. Its inclusion establishes Field Maps geography, not paid eligibility.

## Geometry artifact

[`coverage-boundary.geojson`](coverage-boundary.geojson) is a three-feature GeoJSON FeatureCollection, one feature per jurisdiction. Its top-level metadata records:

- the boundary version and effective date;
- the operational definition and limitation;
- source URLs and download checksums;
- the coordinate reference system and transformation note.

The build retains individual jurisdiction features instead of dissolving them. This supports future source filtering and audit without changing the v1 union definition.

## Matrix relationship

[`coverage-matrix.csv`](coverage-matrix.csv) is the authoritative Phase 1 U.S. cell enumeration for this boundary version. A row is present only when the official USGS grid polygon has a positive-area intersection with Washington or Oregon. Each row must have:

- one or more intersecting jurisdictions;
- an official grid cell ID and name;
- a current-product presence result from the official USGS availability service;
- an explicit catalog state;
- an explicit rights state;
- an explicit sale state; and
- the official-catalog review date.

No cell becomes sellable because it intersects this boundary. Boundary membership, catalog availability, field suitability, rights, current edition, and exact-file integrity are separate decisions.

## Reproduction and change control

The boundary and matrix are generated by [`../../scripts/field-maps/build-phase1-coverage.py`](../../scripts/field-maps/build-phase1-coverage.py). Reproduction instructions and the live-catalog snapshot result are in [`coverage-matrix-summary.md`](coverage-matrix-summary.md).

The following require `cascadia-field-maps-v2` or later rather than an in-place redefinition:

- adding or removing a jurisdiction;
- replacing a source boundary series in a way that materially changes scope;
- changing the positive-area intersection rule;
- treating British Columbia as paid inventory;
- using an ecological or cultural boundary instead of administrative jurisdictions.

Routine publisher boundary updates may regenerate v1 only when they preserve this adopted definition and the resulting difference is reviewed and recorded. Exact sale and delivery territories remain an artifact-level legal-review input; the operating boundary does not settle them.

Phase 2 may proceed under its own review gate.
