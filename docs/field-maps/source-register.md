# Cascadia Field Maps Source Register

**Status:** Approved July 21, 2026
**Reviewed:** July 21, 2026
**Governing contract:** [`00-product-boundary-and-clean-room-contract.md`](00-product-boundary-and-clean-room-contract.md)

## How to read this register

This is the canonical Phase 1 record for repeated publisher, source, currency, limitation, and rights facts used by Cascadia Field Maps. It contains only official publisher sources and official rights authorities. Inclusion means that a source may support the free finder or coverage research; it does not make any artifact sellable.

Controlled Phase 1 dispositions are:

| Disposition | Meaning |
| --- | --- |
| `coverage-evidence` | May establish the adopted boundary or U.S. grid/current-product coverage |
| `free-finder` | May be described and linked as an official free source, subject to the stated limitation |
| `blocked-verification-required` | A U.S. candidate exists, but the exact file has not passed the Phase 2 gate |
| `blocked-open-licence-not-public-domain` | Commercial reuse may be allowed, but the approved public-domain-only sale rule is not satisfied |
| `blocked-currentness-or-suitability` | The source is historical, generalized, live-status-dependent, or unsuitable for the claimed field job |

`eligible` is not a Phase 1 disposition. Exact-file eligibility begins only in Phase 2.

## Registered sources

| Source ID | Official publisher and source | Primary map job / coverage | Format and official cost | Currency evidence | Rights class | Phase 1 use and disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `us-census-2025-state-boundary` | U.S. Census Bureau — [2025 cartographic boundary files](https://www.census.gov/geographies/mapping-files/2025/geo/carto-boundary-file.html) and [exact state KML ZIP](https://www2.census.gov/geo/tiger/GENZ2025/kml/cb_2025_us_state_5m.zip) | Generalized state geometry for the Washington–Oregon operating boundary | KML ZIP; free official download | 2025 series; publisher page revised April 15, 2026 | U.S. federal boundary data; boundary evidence only, not a sale artifact | `coverage-evidence` |
| `statcan-2021-pr-boundary` | Statistics Canada — [2021 boundary files](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index2021-eng.cfm?year=21) and [exact province/territory GML ZIP](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/files-fichiers/lpr_000a21g_e.zip) | Province geometry for the British Columbia operating boundary | GML ZIP; free official download | 2021 Census geography; fixed series | [Open Government Licence – Canada](https://open.canada.ca/en/open-government-licence-canada), not public-domain status | `coverage-evidence`; `blocked-open-licence-not-public-domain` for sale |
| `usgs-us-topo-availability` | U.S. Geological Survey — [US Topo Availability ArcGIS service](https://index.nationalmap.gov/arcgis/rest/services/USTopoAvailability/MapServer) | Official 7.5-minute grid and current US Topo product footprints nationwide | ArcGIS REST/JSON/GeoJSON; free access | Service states that it is updated daily and reflects currently available products used by official download/store interfaces | Service metadata is coverage evidence; each linked map requires exact-file rights review | `coverage-evidence`; every Phase 1 current row is `blocked-verification-required` |
| `usgs-tnm-access` | U.S. Geological Survey — [The National Map Access API](https://apps.nationalmap.gov/tnmaccess/) and [API base](https://tnmaccess.nationalmap.gov/api/v1/) | Official catalog metadata and free downloads for current and non-current National Map products | JSON API and publisher-hosted files; free | Dataset metadata identifies US Topo as a daily catalog with current and non-current categories | Exact artifact may be public domain or contain an identified exception; inspect the exact file | `free-finder`; candidate-resolution input for Phase 2; `blocked-verification-required` |
| `usgs-topographic-maps` | U.S. Geological Survey — [Topographic Maps](https://www.usgs.gov/programs/national-geospatial-program/topographic-maps) | Current US Topo, historical maps, and OnDemand Topo discovery | GeoPDF, GeoTIFF, JPEG, KMZ and publisher tools; free downloads, optional printed reproduction | Publisher distinguishes current US Topo (2009–present), historical products, and generated products | [USGS copyright FAQ](https://www.usgs.gov/faqs/are-usgs-topographic-maps-copyrighted) says USGS topo maps are public domain except stated US Topo component cases; exact collars and metadata control | `free-finder`; exact current files remain `blocked-verification-required`; historical-only files are `blocked-currentness-or-suitability` |
| `usgs-topo-currentness` | U.S. Geological Survey — [How current are US Topo maps?](https://www.usgs.gov/faqs/how-current-are-us-topo-maps) | Currency authority for US Topo interpretation | Publisher guidance; free | USGS describes a three-year production cycle while warning that individual feature currency varies | Not an artifact; evidentiary guidance | Source-card limitation and Phase 2 edition check; never a substitute for live access/closure sources |
| `nps-public-maps` | National Park Service — [Data Sources and Accuracy for NPS Maps](https://www.nps.gov/subjects/gisandmapping/data-sources-and-accuracy.htm) | General reference, orientation, and route finding in NPS units | Publisher-hosted map graphics and PDFs; generally free | Individual park products vary; publisher recommends direct NPS acquisition | NPS states that its maps are public domain | `free-finder`; `blocked-currentness-or-suitability` for specialized backcountry, water-navigation, mountaineering, legal-boundary, or exact-file sale claims until separately reviewed |
| `usfs-mvum` | USDA Forest Service — [FSGeodata Clearinghouse MVUM datasets](https://data.fs.usda.gov/geodata/edw/datasets.php?xmlKeyword=motor%20vehicle%20use%20map%3A%20%25) and forest-specific direct official PDF pages such as [Ochoco](https://www.fs.usda.gov/r06/ochoco/maps-guides) | Legal motor-vehicle route designation on National Forest System land; not a general topographic map or live closure service | Direct official PDFs, national geodata, and free paper copies; forest-specific | National data is refreshed by unit as needed and must be checked against the published MVUM; individual MVUMs are edition-specific and temporary closures require separate current alerts | U.S. federal publisher, but exact PDF components and edition must be reviewed | `free-finder`; direct USDA sources only; `blocked-verification-required` for any sale candidate and `blocked-currentness-or-suitability` when live closures matter |
| `nrcan-nts` | Natural Resources Canada — [Topographic maps](https://natural-resources.canada.ca/maps-tools-publications/maps/topographic-maps), [NTS maps](https://natural-resources.canada.ca/maps-tools-publications/maps/topographic-maps/national-topographic-system-maps), and [NTS index maps](https://natural-resources.canada.ca/maps-tools-publications/maps/topographic-maps/national-topographic-system-index-maps) | National 1:50,000 and 1:250,000 topographic framework and sheet identification, including British Columbia | Official pages, indexes, downloadable data, and paper-distribution references; digital access varies by product | NTS framework is current; product-specific update state must be shown | [Open Government Licence – Canada](https://open.canada.ca/en/open-government-licence-canada), not public-domain status | `free-finder`; `blocked-open-licence-not-public-domain` |
| `nrcan-toporama-canvec` | Natural Resources Canada — [Atlas topographic map and data status](https://natural-resources.canada.ca/maps-tools-publications/maps/atlas-canada/read-about-topographic-maps) | Toporama/CanVec current-service discovery; legacy CanMatrix, CanTopo raster, Toporama Tiles, and NTDB status | Online mapping, vector data, and archived raster products; free official access | Publisher identifies CanVec as current data and the named raster collections as legacy/archived and no longer maintained | Open Government Licence – Canada | Current services: `free-finder`; legacy products: `blocked-currentness-or-suitability`; all are `blocked-open-licence-not-public-domain` for sale |
| `bc-rstbc` | Province of British Columbia — [Recreation Sites and Trails B.C.](https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails) and [planning/map information](https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning) | Official site/trail discovery, alerts, closures, warnings, rules, and access context | Official web search and interactive service; RSTBC says it does not produce hard-copy recreation maps for sale or distribution | Page and alert dates are live-service facts; must be checked at use time | Crown material; dataset-specific licence must be confirmed, and open licensing would still not be public-domain status | `free-finder`; live link only for volatile status; `blocked-open-licence-not-public-domain` or `blocked-verification-required` depending on the exact record |
| `bc-data-catalogue` | Province of British Columbia — [BC Data Catalogue](https://www2.gov.bc.ca/gov/content/data/finding-and-sharing/bc-data-catalogue) | Official dataset and web-service discovery across B.C. | Catalogue records, APIs, and downloadable datasets; access and cost vary | Catalogue is actively updated; exact record metadata controls | [Open Government Licence – British Columbia](https://www2.gov.bc.ca/gov/content/data/policy-standards/data-policies/open-data/open-government-licence-bc) applies only when the dataset says so; catalogue may also contain access-only material | `free-finder` discovery only; no catalog-level rights assumption; open-licence records are `blocked-open-licence-not-public-domain` |

## Rights conclusions adopted for Phase 1

### U.S. candidates

The USGS rights authority is favorable but not self-executing under the approved stricter product rule. It identifies most USGS topographic material as public domain and names limited US Topo exceptions, including commercial road data in most 2010–2016 maps and certain Alaska/Hawaii imagery. The current Washington and Oregon catalog records are therefore candidates, not approved inventory.

Every current U.S. row remains blocked until Phase 2 stores and verifies the exact official file, source URL, checksum, edition date, collar, embedded metadata, component credits, public-domain authority, intended sale/delivery territories, and latest-edition result. A source-page statement, federal publisher identity, or current availability footprint cannot replace that file-level review.

### Canadian sources

The federal and B.C. open-government licences grant broad reuse, including commercial use, subject to attribution and other terms. That is a licence, not a finding that the artifact is in the public domain. Under the approved rule:

- Canadian sources may be useful and prominent in the free finder;
- Cascadia may link to official sources and state their real licence/update status;
- no NRCan, Statistics Canada, or B.C. open-government artifact may become a paid SKU;
- a future policy change would require a separate “rights-cleared official maps” class, attribution system, legal review, and explicit approval.

### Suitability and live status

Official does not mean fit for every job. NPS explicitly limits its maps as general reference; USFS MVUMs govern designated motorized use but do not replace topographic context or temporary closure notices; RSTBC alerts and closures are volatile. Field Maps must link rather than freeze volatile status into a durable artifact.

## Coverage-matrix binding

The Phase 1 U.S. matrix may use only `usgs-us-topo-availability` to establish grid membership and current-product presence. The adopted boundary may use only `us-census-2025-state-boundary` and `statcan-2021-pr-boundary`.

Other registered sources support later free-finder editorial work or Phase 2 candidate resolution. They do not backfill a missing USGS cell, establish a latest USGS edition, or confer paid eligibility.

The generated counts and publication-year distribution live in [`coverage-matrix-summary.md`](coverage-matrix-summary.md), so a future catalog rebuild cannot leave a contradictory count in this canonical source record. No Phase 1 row may be eligible or unknown.

## Maintenance rule

At each review:

1. open the official publisher page or API directly;
2. record the review date and product-specific currency statement;
3. distinguish current services from fixed, legacy, archived, or historical products;
4. follow the exact dataset's rights record rather than the portal's general reputation;
5. pause a source when currency, official provenance, direct access, or rights cannot be established;
6. never infer eligibility from a consumer map, private catalog, basemap, price, download button, or commercial-reuse permission.

Phase 2 consumes this approved register under its own review gate.
