# Phase 5 — territory and pricing decision

- **Status:** territory direction recorded; pricing and payment launch deferred
- **Date opened:** July 21, 2026
- **Approved checkout boundary:** United States billing country only
- **Physical delivery territory:** not decided
- **Approved prices:** none
- **Business decision owner:** Ebbline, LLC, doing business as Now We Plan

## Proposed pilot boundary

The owner has selected `US` as the only accepted billing country for a future pilot. The current digital checkout and fulfillment implementation treats that billing country as the order territory. No non-U.S. billing path is planned.

A physical map offer is not yet designed or approved. If printing and shipping are added, the ship-to territory, carrier method, packaging, shipping cost, damage or loss handling, and returns must be decided separately rather than inferred from the digital checkout rule.

The three exact 2023 USGS files passed the clean-room rights screen as U.S. public-domain works with no excluded third-party component found. The owner accepts the U.S.-only direction for these exact artifacts based on the clean-room record and current USGS guidance. This is a product and business-risk decision, not a legal opinion.

Professional counsel is not a prerequisite for the current site work or for preserving this U.S.-only decision. The owner may still seek focused advice before payment launch if the product changes, the territory expands, a non-federal component is found, or additional assurance is wanted.

## Territory record

The business decision is recorded here, but the artifact database remains intentionally fail-closed while payments, pricing, production staging, and fulfillment are deferred. Do not change any artifact from `blocked-territory` merely because this record is complete.

- Decision owner: Ebbline, LLC, doing business as Now We Plan
- Decision date: July 21, 2026
- Approved billing countries: `US`
- Intended digital delivery condition: buyer billing country must be `US`
- Physical ship-to countries: not decided
- Exact artifacts covered: `usgs-us-topo-7165-20230817`, `usgs-us-topo-30739-20230818`, and `usgs-us-topo-36018-20230815`
- Evidence relied upon: the Phase 2 exact-file clean-room records, official USGS source records, July 21 current-edition recheck, and matching checksum rehearsal
- Conditions: exact artifacts only; unchanged files; official free source remains visible; no expanded territory; no excluded third-party component; all other activation gates still apply
- Next review: before paid activation, whenever an artifact changes, or whenever the territory or product format changes
- Decision: preserve the U.S.-billing-only operational boundary; do not activate sales yet

## Required price record

Pricing is deferred. Earlier discussion found $4 per individual sheet and $9 for the three-sheet bundle plausible for a digital pilot, but the owner also requires any customer-facing price to account for shipping. That introduces an unresolved product-format decision: unchanged digital delivery and physical printing/shipping are different offers with different costs and operations. The earlier figures are therefore not approved prices.

Four final price records are needed before checkout can be tested end to end:

| Product | One-time price | Stripe sandbox Price ID | Approved by | Date |
| --- | ---: | --- | --- | --- |
| Cape Flattery US Topo | pending | pending | pending | pending |
| Mount Olympus US Topo | pending | pending | pending | pending |
| Port Angeles US Topo | pending | pending | pending | pending |
| Olympic Peninsula three-sheet pilot bundle | pending | pending | pending | pending |

No Stripe Price ID should be created until Ebbline, LLC decides the delivery format, included shipping territory and method if physical, final customer price, and refund/support implications. The public page must continue to disclose the official free source beside any approved price. The bundle must remain described as a bounded three-sheet pilot, not complete Olympic Peninsula coverage.

## Activation rule

A territory decision cannot activate inventory by itself. The site-wide payment gate, final product format and prices, private exact-file staging with SHA-256 metadata, sandbox purchase and refund tests, and final approval must also pass. Until then all four products remain paused and all three artifacts remain blocked.
