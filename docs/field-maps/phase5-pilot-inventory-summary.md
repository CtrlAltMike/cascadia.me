# Phase 5 — Olympic Peninsula pilot inventory

- **Status:** site ready; commerce activation deferred
- **Started:** July 21, 2026
- **Public sales:** closed
- **Business operator:** Ebbline, LLC, doing business as Now We Plan
- **Creator and writer:** Michael Hendrick

## Bounded pilot catalog

Phase 5 begins with three individual source sheets and one bundle containing the same three sheets. This is an operational pilot, not complete Olympic Peninsula coverage.

| Product | Included exact artifact | Store state |
| --- | --- | --- |
| Cape Flattery US Topo | `usgs-us-topo-7165-20230817` | paused / unpriced |
| Mount Olympus US Topo | `usgs-us-topo-30739-20230818` | paused / unpriced |
| Port Angeles US Topo | `usgs-us-topo-36018-20230815` | paused / unpriced |
| Olympic Peninsula US Topo pilot bundle | all three artifacts above | paused / unpriced |

The product records have no Stripe Price IDs. The artifact records remain technically `blocked-territory` and have no production delivery keys. The owner has selected `US` as the only future billing country, but physical delivery territory and product format remain undecided. The database will remain fail-closed until the whole payment and fulfillment launch is reviewed. The store therefore has zero active products and zero public checkout opportunities.

## July 21 evidence

The official live catalog recheck returned three `exact-current` results and zero catalog drift. Fresh downloads from the registered official URLs matched the reviewed byte counts and SHA-256 checksums:

| Sheet | Edition | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Cape Flattery | 2023-08-17 | 8,880,171 | `2a203c1add0997af69ff6165cd61b749df42be5a57780b0c02035a37aa974570` |
| Mount Olympus | 2023-08-18 | 40,793,113 | `48be495f5b08d011fc5a02c5e733f2cbabfd7d53f08c0b2e61c4f4ddaec6b987` |
| Port Angeles | 2023-08-15 | 42,725,552 | `f13b438c62008b8777856a5c6e3b31b659bc999427d5b2c1f340e374e0152317` |

An isolated local private-storage rehearsal uploaded and retrieved all three unchanged PDFs. The retrieved byte counts and SHA-256 checksums matched again. This proves byte-for-byte storage behavior only; no production file was uploaded and no delivery key was attached to sellable inventory.

## Automatic pause and history

NowWePlan now has an append-only artifact-event history and an authenticated inventory-recheck path. It accepts only a fresh, complete official-source report covering every registered artifact. Exact-current evidence preserves the existing sale gate; it never promotes a blocked artifact. Superseded, withdrawn, or unconfirmed evidence moves the artifact to a non-sale state and pauses any affected active product.

The July 21 exact-current evidence is seeded as three `catalog-rechecked` events. No event changes the existing `blocked-territory` state.

## Validation to date

- all Phase 5 local database migrations applied successfully
- production migrations `0009` through `0014` applied successfully after a fresh recovery bookmark
  and restricted schema export; no migrations remain pending
- production D1 quick check returned `ok`, foreign-key check returned no rows, and existing
  aggregate account counts were unchanged
- local inventory: four paused products, three `blocked-territory` artifacts, three catalog-recheck events, and no refund records
- production inventory matches the fail-closed local state: four paused and unpriced products,
  three blocked artifacts, three catalog-recheck events, and no checkout or delivery records
- 509 automated tests across 62 files
- 454 browser checks passed; 8 conditional checks were intentionally skipped; none failed
- TypeScript check and production build passed
- OpenNext Cloudflare build and non-deploying Worker dry run passed
- schema and brand checks passed
- lint passed with zero errors; two existing warnings remain in the generated Cloudflare type file
- Phase 5 Cascadia site-readiness validation passed across all three Field Maps pages
- `git diff --check` passed in both repositories

## Site-readiness review

The connected Cascadia and NowWePlan experience passed desktop and mobile review on July 21. The review corrected the stale Phase 3 territory wording, added the approved optional handoffs after the free task, and changed the NowWePlan map catalog from active-purchase language to explicit prelaunch language.

The full findings and boundary checks are recorded in [`phase5-site-readiness-review.md`](phase5-site-readiness-review.md). The site is ready to remain public with free sources and paused product records; this status does not open checkout, stage production files, approve prices, or complete the Phase 5 commerce exit.

## Open activation gates

- deliberate opening of the site-wide code and runtime payment gates
- final decision between unchanged digital delivery and a physical product with included shipping
- approved one-time prices and later sandbox Stripe Price IDs
- production-private staging with required SHA-256 object metadata
- sandbox purchase, retry, email, download, expiration, review-required, and refund rehearsal
- final Phase 5 production approval

The intended U.S.-only billing boundary is recorded; a physical ship-to boundary is not. Ebbline, LLC, doing business as Now We Plan, is the business owner for correction, refund, and support functions; `support@nowweplan.com` is the public channel, and Michael Hendrick remains the named creator and human voice. No internal employee title or payment processor needs to be assigned while sales are closed.

Until every gate passes, the individual sheets and bundle remain visible only as paused, free-source-forward catalog entries.

## Phase 5B production preparation

The production-state audit, safe release order, approval boundary, and rollback plan are recorded
in [`phase5b-production-release-plan.md`](phase5b-production-release-plan.md). Phase 5B prepares a
public-content release with commerce closed; it does not complete this phase's commerce exit.
