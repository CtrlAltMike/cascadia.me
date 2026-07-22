# Phase 4 — NowWePlan map store summary

**Status:** approved July 21, 2026
**Date:** July 21, 2026
**Phase 5:** started; activation remains gated

## Outcome

The subscription-free NowWePlan map-store system is implemented for review. Public sales remain closed because the Olympic Peninsula proof has zero approved sale territories and zero staged delivery files. The public catalog is therefore honest and usable as a paused proof, not a premature inventory launch.

## What Phase 4 adds

- a public `/maps` catalog and public product page
- the official free publisher path beside the paused price area
- exact artifact records with publisher ID, official URL, edition, verification date, checksum, rights state, and sale state
- one-time guest Stripe Checkout infrastructure with explicit terms acceptance
- order-owned delivery access that never reads or depends on a household subscription
- fulfillment revalidation for rights, territory, current artifact state, checksum, edition, and delivery key
- an opaque order page and 30-day exact-file download window
- a transactional receipt/delivery email without marketing enrollment
- optional account linking and optional planning only after delivery is established
- a narrow `src=cascadia&entry=field-maps&region=olympic-peninsula` arrival that transfers no order, route, trip, location, or household data
- privacy and terms language matching the actual guest-order behavior
- a dedicated 1200 × 630 NowWePlan Maps social preview

## Independence proof

Synthetic eligible fixtures test the same sale decision for:

- a person with no account
- an account that has never subscribed
- a free account
- an active subscriber
- a canceled subscriber

All five are treated identically. The gate depends only on the product and exact artifacts. Download access belongs to the fulfilled order and its delivery window.

## Current public inventory state

| Item | State |
| --- | --- |
| Olympic Peninsula US Topo proof | Paused / not for sale |
| Cape Flattery proof sheet | Blocked — territory review incomplete |
| Mount Olympus proof sheet | Blocked — territory review incomplete |
| Port Angeles proof sheet | Blocked — territory review incomplete |
| Eligible sale artifacts | 0 |
| Active products | 0 |

The source sheets remain available free from their official publisher. Phase 4 does not upload them to paid delivery storage or assign a sale price.

## Validation

The Phase 4 implementation passed on July 21, 2026:

- generated Cloudflare binding types, including private `MAP_FILES` storage
- Drizzle schema check
- local D1 migration, 19 statements applied successfully
- local inventory query: one paused product, three `blocked-territory` artifacts, zero active products, zero eligible artifacts
- TypeScript typecheck
- 481 unit and route tests across 56 files
- ESLint with zero errors; the two remaining warnings are in Wrangler's generated type file
- NowWePlan brand allowlist check across 370 active files
- Next.js production build, including the public map pages and four map-commerce routes
- whitespace/error-marker check in both repositories

The social asset was generated with the built-in image tool and corrected after review to add the requested word spacing. It is saved in the NowWePlan project as `public/images/nowweplan-maps-social.jpg`. Its exact text is “NOW WE PLAN MAPS” and “One-time delivery. No subscription.” It contains no agency seal, commercial-provider branding, UI, price, sale badge, or route claim.

## Approval boundary

Approving Phase 4 approves the storefront, guest-commerce contract, order entitlement, delivery controls, transactional email, optional handoff, and paused public proof. It does not approve any real inventory for sale.

Phase 5 may begin only after explicit approval. Its job is to complete a bounded Olympic Peninsula inventory review and operational rehearsal; it must not bypass the territory, rights, current-edition, or exact-file gates.
