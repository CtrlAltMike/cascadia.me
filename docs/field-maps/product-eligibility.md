# Cascadia Field Maps Exact-Artifact Eligibility

**Status:** Approved July 21, 2026
**Effective for:** `cascadia-field-maps-v1` U.S. candidates
**Governing contract:** [`00-product-boundary-and-clean-room-contract.md`](00-product-boundary-and-clean-room-contract.md)

## Decision model

Catalog availability and sale eligibility are intentionally different records.

1. A Phase 1 cell identifies an official current-product candidate.
2. Phase 2 resolves that candidate to one exact official file and immutable checksum.
3. The exact file must pass structural, embedded-metadata, component-source, collar, rights-authority, edition, and territory checks.
4. Any failed, missing, ambiguous, unreachable, or changed check produces a paused state.
5. Only a fully verified, exact-current file with approved sale/delivery territories may be `eligible`.

The current Phase 2 demonstration has no approved sale/delivery territory. A passing exact-file rights screen therefore produces `verification-complete-territory-blocked` with the approved `blocked-territory` sale state, not `eligible`.

## Required evidence

Each audit record must contain:

- publisher and stable grid/cell ID;
- official current-catalog URL and edition date;
- live catalog review date and exact-match result;
- source byte count, SHA-256, HTTP content type, ETag when provided, and last-modified value when provided;
- PDF header, encryption state, page count, geospatial viewport, optional-content layer presence, and document metadata;
- unique embedded-attachment names, aliases, byte counts, and checksums;
- exact embedded USGS XML metadata checksum and parsed publisher, title, date, cell ID, use constraints, temporal range, update status, and source citations;
- embedded symbol-guide identity, checksum, and official/free-distribution checks;
- extracted collar text and a rendered-collar checksum;
- a manual collar review bound to the exact source SHA-256;
- tests for known US Topo public-domain exceptions and excluded content providers/notices;
- a controlled `rights_class` value from the approved product contract;
- the governing rights-authority URL;
- approved sale/delivery territories and their review status;
- eligibility, effective sale state, and a human-readable reason.

The exact source PDF and temporary collar render are not committed to Cascadia. The audit record can reproduce the download and prove whether the retrieved bytes match the reviewed file.

## State transitions

| Condition | Catalog state | Eligibility state | Effective sale state |
| --- | --- | --- | --- |
| Exact current file; every verification passes; territory approved | `exact-current` | `eligible` | `eligible` |
| Exact current file; rights/file verification passes; territory not approved | `exact-current` | `verification-complete-territory-blocked` | `blocked-territory` |
| Exact current file; excluded third-party component or known exception | `exact-current` | `blocked-verification-failed` | `blocked-third-party-copyright` |
| Exact current file; another file, metadata, source, collar, rights, or review check fails | `exact-current` or `unconfirmed` | `blocked-verification-failed` | `blocked-unreviewed` |
| Official catalog identifies a different file or date | `superseded` | Prior decision cannot carry forward | `paused-new-edition-check` |
| Official current catalog has no cell record | `withdrawn` | Prior decision cannot carry forward | `blocked-stale` |
| Official current catalog cannot be confirmed | `unconfirmed` | Prior decision cannot be relied upon | `blocked-stale` |

A replacement file is always a new exact artifact. It cannot inherit the prior checksum, embedded evidence, collar review, or rights decision.

## Rights screen

The governing U.S. publisher authority is the USGS statement, [“Are USGS topographic maps copyrighted?”](https://www.usgs.gov/faqs/are-usgs-topographic-maps-copyrighted). The automated screen combines that authority with exact-file evidence.

For the current Washington/Oregon program, the verifier rejects or pauses when it finds:

- a 2010–2016 US Topo publication year subject to the historical commercial-road exception;
- an Alaska or Hawaii imagery exception;
- a named commercial road, imagery, consumer-map, or open-map content provider in the source citations or collar;
- an explicit third-party copyright notice;
- a publisher/date/cell mismatch in the embedded metadata;
- a missing or unexpected attachment set;
- a checksum change or non-official source URL;
- a manual collar review that is absent, failed, or bound to different bytes.

The GIS production tool named in PDF document metadata is not itself a component-source credit. Tool provenance is retained in the audit, while content-rights decisions use the collar, embedded source citations, use constraints, and governing publisher authority.

## Visual collar review

Automated extraction is necessary but not sufficient. A reviewer must inspect a rendered full page and a readable collar crop for:

- correct quadrangle title and edition;
- visible publisher identity;
- source-credit consistency with the embedded XML;
- third-party copyright or provider notices;
- unexplained marks, branding, layers, or attachments;
- legible and complete collar content.

The review record includes the method, review owner, date, and source SHA-256. If the file hash changes, the review is invalid automatically. The current demonstration records the Codex-assisted implementation inspection transparently; production eligibility still requires the product owner's review process and a completed territory decision.

## Scheduled recheck

[`../../scripts/field-maps/recheck-phase2-artifacts.py`](../../scripts/field-maps/recheck-phase2-artifacts.py) compares each registered URL and edition date to the live official current-product catalog. Its state transformer is fail-closed: superseded, withdrawn, and unconfirmed records are returned with a paused sale state regardless of their prior decision.

The weekly workflow [`../../.github/workflows/field-maps-artifact-recheck.yml`](../../.github/workflows/field-maps-artifact-recheck.yml) runs decision tests, performs the live recheck, uploads the automatic-pause report, and fails visibly on catalog drift. A future NowWePlan inventory integration must consume the same effective state rather than treating the static register as permission to sell.

## Demonstration scope

The Phase 2 proof uses three official 2023 Olympic Peninsula sheets:

- Cape Flattery — coastal and international-boundary source mix;
- Mount Olympus — wilderness, trails, wetlands, and dense terrain;
- Port Angeles — urban structures, roads, ferries, and federal-land sources.

This sample tests the pipeline across materially different collars and source lists. It is not a launch catalog and does not establish completeness for the Olympic Peninsula or the wider operating boundary.

See [`artifact-verification-summary.md`](artifact-verification-summary.md) for generated results and [`artifact-register.csv`](artifact-register.csv) for the exact-file records.

Phase 2 is approved. Phase 3 may proceed under its own review gate when explicitly authorized.
