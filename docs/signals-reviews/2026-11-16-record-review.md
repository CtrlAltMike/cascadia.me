# Signals record review: first Washington batch

Status: **in progress**, not a directory refresh. Source review date: 2026-11-16.
Base: published main `e12e6c3ec6333a146b1ddde786390c09d3b9bd6e`.

## Exact scope

The companion JSON inventories all 147 production records and records partial official-source checks for 10 Washington counties: Clallam, Cowlitz, King, Kitsap, Lewis, Pierce, Snohomish, Thurston, Whatcom and Yakima. **137 records remain unexamined in this pass; zero are claimed fully reverified.** Every entry retains its prior verification date and SHA-256 snapshot of the loaded record so later work can identify changed inputs. No historical audit, production record, batch seal, directory date, or overdue notice was changed.

The 925 government coverage outcomes remain historical and have not been re-reviewed. Existing validator output saying 147 reviewed records describes the old sealed action review, not this new pass.

## Most important findings

- **Cowlitz:** [county guidance](https://www.co.cowlitz.wa.us/196/Emergency-Management) specifically advises Voice or Voice & Text for emergency community alerts. The current record lists only email/text. Add the county's instruction and phone channel in a separately reviewed editorial update. County-linked enrollment confirms text/email/voice options and differentiates automatic landlines from cellular enrollment.
- **Snohomish:** [county page](https://snohomishcountywa.gov/620/Public-Alert-Resources) describes three different services. Its explicit email/text sentence is for GovDelivery preparedness messages, not proof of emergency SnoCoAlerts delivery channels. Do not simply freshen the current channel assertion from that sentence.
- **Kitsap:** the current short URL could not be resolved by this research tool. [Official DEM page](https://www.kitsapdem.com/programs/kitsapalert/) provides a canonical alternative and confirms emergency text/phone/email notifications. This tool failure does not establish a public outage. The page also distinguishes KitsapALERT from separate first-responder profile services despite vendor branding.
- **King:** old information URL redirects to [a canonical county page](https://kingcounty.gov/en/dept/executive-services/health-safety/safety-injury-prevention/emergency-preparedness/alert-king-county). The page supports additional contact/language metadata, but the registration portal only exposed a shell.
- **Yakima and Cowlitz:** official sources describe automatic landline enrollment exceptions. A bare opt-in boolean needs explanatory text if readers might interpret it as covering every delivery mechanism.

Full per-record source URLs, confirmed facts, unresolved fields and suggested edits are in the JSON. No registration forms were submitted, accounts created, or messages sent. Reachability and a readable enrollment shell do not demonstrate actual delivery or precise jurisdiction coverage.

## Continuation

1. Resolve the unverified fields for these 10 records. A record-level review must cover all present optional fields as well as authority, action destination/label, applicability, and Start Here eligibility.
2. Finish the other 137 records by geographic/source batch. Record inaccessible sources as unresolved rather than marking them fresh or absent.
3. Reconcile the government outcome ledger against current official rosters separately. Do not convert earlier unavailable sites into absent services.
4. For a production correction, retain the old evidence, split/re-seal only affected action batches if necessary, and advance only genuinely verified record dates. Do not advance global dates or remove overdue disclosure until the complete scope is satisfied.
5. Run registry and affected release checks before requesting publication approval. This branch is evidence-only and has not been published.

## Checks

- Existing Signals registry validator: passed, 147 unique records and 925 historical outcomes, no errors.
- Supplemental ledger IDs, exact record hashes, previous dates and 10/137 status totals checked against current production loader.
- `git diff --check`: passed.
- Browser/release tests not run: no runtime or UI changes.

## Follow-on editorial patch (unpublished)

The evidence-only checkpoint above is retained in commit `72ba0c7`. The follow-on patch makes narrowly sourced field corrections in four records:

- Cowlitz: adds the county's Voice/Voice & Text instruction, phone channel, and landline exception. Omits the oversimplified opt-in badge.
- Yakima: explains the listed-landline exception and address requirement, adds phone, and omits the oversimplified opt-in badge.
- King and Kitsap: uses canonical official **information** pages; enrollment action destinations remain unchanged. Kitsap short-link failure remains a research-tool limitation, not a claimed outage.

The README's documented opt-in-field count changes from 131 to 129. All record verification dates, action/coverage text seals, global dates and overdue flags remain unchanged. JSON hashes still describe the published baseline. The new regression test confirms all 143 untouched records retain exactly their baseline snapshots and all 147 retain their dates.

Additional validation: Signals validator, site-frame synchronization, design-system and SEO checks pass. Focused non-browser regression test passes for desktop and mobile projects. Full `npm run validate` was attempted but browser-based cases could not launch because the required Playwright Chromium executable is not installed in this environment; this is not a full release-test pass. Browser/CI validation is still required before publication. No additional records were marked reviewed in this patch.
