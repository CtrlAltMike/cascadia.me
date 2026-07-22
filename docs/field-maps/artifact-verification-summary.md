# Phase 2 Artifact Verification Summary

**Status:** Approved July 21, 2026
**Verified:** 2026-07-21
**Scope:** representative pipeline proof, not launch inventory

## Result

The exact-file pipeline processed **3 official USGS GeoPDF artifacts**. It downloaded or checksum-reused only the exact URLs returned by the official current-product catalog, verified each file hash, inspected the PDF structure and embedded publisher metadata, screened component sources and collar text, rendered the collar for visual review, and produced an immutable evidence record.

No artifact is sale-enabled. The exact-file public-domain screens passed for the demonstration set, but no sale/delivery territory has completed legal review. The pipeline therefore applies the approved `blocked-territory` sale state automatically.

| Artifact | Cell | Edition | SHA-256 | Verification | Effective sale state |
| --- | --- | --- | --- | --- | --- |
| Cape Flattery | `7165` | 2023-08-17 | `2a203c1add0997af69ff6165cd61b749df42be5a57780b0c02035a37aa974570` | `verification-complete-territory-blocked` | `blocked-territory` |
| Mount Olympus | `30739` | 2023-08-18 | `48be495f5b08d011fc5a02c5e733f2cbabfd7d53f08c0b2e61c4f4ddaec6b987` | `verification-complete-territory-blocked` | `blocked-territory` |
| Port Angeles | `36018` | 2023-08-15 | `f13b438c62008b8777856a5c6e3b31b659bc999427d5b2c1f340e374e0152317` | `verification-complete-territory-blocked` | `blocked-territory` |

## Catalog states

| State | Artifacts |
| --- | ---: |
| `exact-current` | 3 |

## Verification states

| State | Artifacts |
| --- | ---: |
| `verification-complete-territory-blocked` | 3 |

## Effective sale states

| State | Artifacts |
| --- | ---: |
| `blocked-territory` | 3 |

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
python3 scripts/field-maps/verify-phase2-artifacts.py \
  --checked-at 2026-07-21 \
  --cache-dir tmp/pdfs/phase2-review
python3 scripts/field-maps/recheck-phase2-artifacts.py \
  --checked-at 2026-07-21 \
  --fail-on-catalog-drift
```

Source PDFs and rendered collar images are temporary verification inputs, not repository artifacts. A local cache may be deleted after review. The committed audit JSON is sufficient to identify and re-download the exact official source, verify its checksum, reproduce the inspection, and bind the visual collar decision to the reviewed bytes.

Phase 2 is approved. Phase 3 may proceed under its own review gate when explicitly authorized.
