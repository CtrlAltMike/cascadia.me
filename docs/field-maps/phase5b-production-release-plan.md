# Phase 5B — production release plan

- **Prepared:** July 21, 2026
- **Status:** NowWePlan public-content release verified; Cascadia gated release pending
- **Release goal:** publish Cascadia Field Maps and the connected NowWePlan catalog with commerce
  closed
- **Deployment:** NowWePlan deployed and publicly verified; Cascadia not yet deployed
- **Payments:** remain closed

## Release decision

The connected experience is ready for a controlled public-content release. Cascadia remains the
free source-finding and field-use layer. NowWePlan may publish the paused catalog and product
records, but it must not offer prices, checkout, subscriptions as a purchase requirement, or map
delivery.

The safe order is **NowWePlan first, Cascadia second**. NowWePlan is publicly reachable and its
administrative paths remain behind their narrow Access application, so Cascadia may proceed
through its protected release workflow.

## Preparation completed

- Cascadia Field Maps home, Olympic Peninsula finder, and offline field guide passed the Phase 5
  site-readiness contract, JavaScript syntax check, and print checks.
- Cascadia's release workflow now checks the Phase 2 field-map logic, the Phase 5 site contract,
  Field Maps JavaScript, and the Signals registry before publication.
- NowWePlan's schema migration was rehearsed against the production schema in isolation with no
  production records retained.
- A migration defect was corrected before production use.
- All 509 NowWePlan unit and integration tests passed.
- All 454 executed browser checks passed; 8 conditional checks were intentionally skipped.
- Production builds for Next.js and Cloudflare passed, including a non-deploying Worker dry run.
- The high-severity dependency advisory was removed; the release policy now passes at its
  high-severity threshold.
- Payments remain closed in source code, runtime configuration, and inventory data.

## Production facts that determine the sequence

- Cascadia's local Field Maps pages are not yet published.
- The current NowWePlan release matches tested commit
  `f087eb18b607c25ee6843feab552143bd12e4040` on `main` and `gated-production`.
- The broad Access application now covers only `readyplan.me` and `www.readyplan.me`.
  `nowweplan.com` and `www.nowweplan.com` are public, while `/api/admin/*` remains protected by
  the separate administrative Access application.
- All additive NowWePlan map-store migrations through `0014` are applied and verified in
  production.
- The configured private map-storage bucket exists, is empty, and has no public access.
- The Cascadia `main` branch and the NowWePlan `main` and `gated-production` branches have the
  required protections.
- The NowWePlan catalog contains four paused, unpriced products and three blocked artifacts, with
  no Stripe Price IDs or delivery keys.

After explicit approvals, the branch rules and empty private storage bucket were created, the six
additive database migrations were applied, and the exact tested NowWePlan release was deployed.
The broad Access wall was narrowed only after separate approval. The public catalog, four paused
product records, legal pages, pricing preview, onboarding, official-source links, and closed
checkout were then verified. No payment setting, sellable catalog state, delivery key, or map
object was changed.

## Controlled release sequence

1. Add and verify the required GitHub branch protections for both sites. **Complete.**
2. Create the empty private NowWePlan map-storage bucket with no public access and no objects.
   **Complete.**
3. Take a fresh D1 recovery bookmark and restricted export, verify it in isolation, and apply the
   six additive map-store migrations. **Complete.**
4. Verify that all products and artifacts remain fail-closed after migration. **Complete.**
5. Release NowWePlan through its tested `main` → `gated-production` workflow while Access remains
   enabled, then verify the exact deployed commit and closed payment gates. **Complete.**
6. With separate approval, remove or narrow the site-wide public Access wall and smoke-test the
   public NowWePlan catalog, product pages, legal pages, official-source links, and closed checkout.
   **Complete.** The wall was narrowed; administrative and legacy routes remain protected.
7. Release Cascadia through its protected `main` workflow.
8. Smoke-test all three Field Maps pages, print behavior, official publisher links, the map-record
   handoff, and the separate household-planning handoff.

Stop after any failed verification. Do not continue simply because the preceding deployment
completed.

## Rollback plan

- Roll NowWePlan back to its previous known-good Worker version or tested commit if its release
  regresses.
- Leave the additive map tables in place during an ordinary application rollback; previous code
  ignores them. Use destructive D1 Time Travel restoration only for confirmed data corruption.
- Restore the Cloudflare Access wall immediately if a public-access problem needs containment.
- Revert Cascadia's release commit through protected `main` if Field Maps or an existing page
  regresses.
- Keep all payments closed and all products paused throughout rollback and recovery.

## Later purchasing phase

Direct purchasing remains separate. It will require a product format, shipping-inclusive prices,
Stripe setup and sandbox proof, production file staging with exact checksums, refund and support
rehearsals, and a distinct launch approval. Ebbline, LLC, doing business as Now We Plan, remains the
business operator; Michael Hendrick remains the named author and human voice.

## Approval boundary

The repository, storage, database, NowWePlan gated release, narrowed Access boundary, and public
NowWePlan smoke test are complete. The next production-affecting change is the Cascadia release in
step 7: package the reviewed Field Maps work in a protected pull request, pass the committed site
release gate, merge only the tested change to `main`, and verify the published Field Maps surfaces
and handoffs.

That release will not open payments, activate a product, add a price or Stripe reference, upload a
map object, or complete the later Phase 5 commerce exit.
