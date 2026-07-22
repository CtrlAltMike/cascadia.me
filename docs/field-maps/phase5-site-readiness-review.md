# Phase 5 — site-readiness review

- **Reviewed:** July 21, 2026
- **Status:** site ready; commerce intentionally deferred
- **Public sales:** closed
- **Deployment:** not performed

## Scope

The review covered the connected public experience rather than treating the two sites as separate artifacts:

- Cascadia Field Maps home
- Olympic Peninsula regional finder
- offline field guide and printable worksheet
- NowWePlan Maps catalog
- one paused NowWePlan product record
- the Cascadia-to-NowWePlan map-record handoff
- the separate Cascadia-to-NowWePlan household-planning handoff

Desktop review used a 1280 × 720 viewport. Mobile review used a 390 × 844 viewport.

## Outcome

The free Field Maps task remains complete without an account, location permission, payment, or NowWePlan. All reviewed official-source links remain above the optional handoffs. The three verified USGS files are still available directly from the official publisher.

Two readiness gaps were found and corrected:

1. Cascadia still used the earlier Phase 3 wording that sale-territory review was incomplete and did not expose the later optional handoff contract.
2. NowWePlan's catalog hero described buying and checkout as though they were open even though the payment gate correctly refused checkout.

The corrected experience now states:

- map pricing and checkout are closed;
- the public product records remain visible as paused records;
- the official free files are available now;
- product format, pricing, payment, and delivery remain deferred;
- the map-record and household-planning paths are separate;
- NowWePlan receives only the public source, entry, and broad-region query fields; and
- no route, exact location, travel date, household answer, or Cascadia page state is transferred.

## Responsive and access review

- No horizontal overflow was found on the reviewed desktop or mobile pages.
- The reviewed images loaded successfully and every image had alt text.
- Cascadia and NowWePlan mobile navigation opened correctly and reported its expanded state.
- The reviewed pages retained one visible `h1`, semantic landmarks, breadcrumb navigation, and labeled handoff regions.
- No browser console warnings or errors were present on the reviewed local pages.
- The offline guide exposes nine printable checks and a labeled **Print this guide** control.
- The print control is wired to the browser print action, and the Field Maps stylesheet retains its print-only layout and link treatment.

## Closed-commerce controls

- The public NowWePlan catalog contains no buy, purchase, subscribe, or checkout control while payments are closed.
- Paused product records keep the official publisher link visible above the closed-checkout notice.
- Direct subscription and map checkout requests still fail before authentication, order creation, or Stripe access.
- The code-level payment gate and the separate runtime setting both remain closed.
- The pilot products remain unpriced, paused, and without production delivery objects.

## Validation

- Phase 5 Cascadia site-readiness validator passed for all three Field Maps pages.
- Field Maps JavaScript syntax check passed.
- NowWePlan targeted map-catalog and payment-gate tests passed.
- NowWePlan TypeScript check passed.
- Repository whitespace checks passed.

The final full test, lint, brand, and production-build results are recorded in the Phase 5 pilot inventory summary.

## Decision

The connected sites are ready for continued public-content work with commerce closed. This is not the production proof required to complete Phase 5's commerce exit, and it does not authorize Phase 6 inventory expansion.

The next commerce step, when the owner chooses to resume it, is the product-format decision: unchanged digital download or a separately designed printed-and-shipped product. That decision must precede final pricing, Stripe sandbox setup, shipping terms, and fulfillment rehearsal.
