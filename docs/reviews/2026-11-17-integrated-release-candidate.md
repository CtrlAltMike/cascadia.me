# Bounded integrated release candidate

This candidate composes the exact remote heads of draft PRs #55–58. It does not
complete or renew the full Signals directory, government coverage, or Atlas
source review. All original review/evidence ledgers are retained byte-for-byte.
No merge, production publication, or Worker deployment is authorized here.

## Exact production scope

- Four Signals corrections from #55: Cowlitz, Yakima, King and Kitsap.
- Malheur official information and replacement enrollment destinations from #56.
- WSDOT SMS and King County EMS summary clarifications from #57.
- Oregon OEM's separately labeled scoped editorial-review metadata from #58.
- Atlas five-minute earthquake-cache expiry and uncertainty/capped-result display.
- Versioned Signals authority/app assets so returning clients receive the changes.

The integration contract records the exact eight record amendments (seven
content corrections plus OEM metadata), original PR heads, and original evidence
hashes. Existing preservation tests project only those exact declared amendments
back to their individual review stage. Before projection, a combined invariant
checks all 147 records against their original hashes after reversing the eight
amendments. Negative tests reject unrelated edits and false review dates. This
is composition validation, not new source evidence or permission to reseal it.

Historical full-review dates, action-review seals, coverage reviews and the
925-outcome government ledger remain unchanged. Signals and Atlas retain their
overdue disclosures. The initial #55 ledger still honestly describes its original
10 partial checks and 137 pending records; it has not been relabeled to imply a
completed subsequent audit.

## Two independent release surfaces

GitHub Pages serves the static site. The shared Cloudflare Worker is separately
deployed and also handles feedback, Ko-fi and scheduled Slack digests. This
candidate retains #55's Worker source fixes and tests but must not be treated as
permission to deploy that service. Static Atlas compatibility tests execute the
production renderers with legacy-shaped conditions/wind responses that omit the
new optional metadata. They pass. Static changes therefore do not require the
Worker deployment to render, but the old Worker's source-time conflation and
missing truncation metadata are not fixed until that separately authorized
release. Actual deployed parity, live upstream feeds, and full geographical
coverage have not been certified.

## Validation

- Registry: pass, 147 records and 925 government outcomes, zero errors.
- Browser script syntax, frame, design-system and SEO: pass.
- Original evidence/ledger hashes and exact eight-amendment integration: pass.
- Atlas freshness, capped-result, unknown-time and legacy Worker-shape tests: pass.
- Worker syntax/conditions/wind/forecast fixture suites: pass.
- Local Playwright: 18 non-browser checks passed. The 36 browser cases could not
  launch with missing bundled Chromium; installed system Chromium also failed at
  the host's forbidden socket creation. This is not a browser pass.
- A full hosted release gate on the exact integrated tree remains required.

Original PR heads remain unchanged. Independent green checks on #55–58 are not
substitutes for the combined-tree release gate. Any later approved static
publication must verify the resulting production assets; shared Worker
publication requires its own authorization and parity checks.
