# Checkout summary and promo — 2026-10-16

Based on GitHub main `dba5eff16d00a212009cd271f98e9a48aca559d6`.

## Behaviour

- Summary uses the supplied Figma layout: 355px card, 16px horizontal / 20px vertical padding, 24px rows with 10px gaps. Values, chevrons and the bonus switch align on the right.
- Existing Avito Sans fonts and the initially enabled bonus setting are retained. Amounts are derived from the real prototype cart, not the illustrative Figma numbers.
- Product-discount disclosure shows the legacy offer and wallet discount. The existing seller-specific 25% quantity offer is shown separately, with selected item thumbnails; it is not subtracted twice.
- Any nonempty promo code grants up to 3,000 rubles after the existing discounts and bonus redemption. It cannot discount delivery or make the order negative. Only one code applies at a time.
- Apply by Enter, mobile Done or leaving the input. Tab also applies. Escape cancels editing. Clearing and confirming removes the code. The draft is not applied while typing. Codes are trimmed and uppercased; long codes are truncated visually while their full text remains accessible.
- All state is in memory; reloading starts the original flow. No real promotion or payment service is contacted.

## Design sources and assets

- Summary: Figma file `dSdNF9eIiVsZiwmIRvewxf`, section `1649:102579`; frames `1649:102173`, `1649:102272`, `1649:102373`.
- Inline promo flow: section `1650:103115`, starting frame `1650:102769`, editing frame `1650:102933`.
- Red chevron: original SVG from `1649:102225`, exported as `c4ea9.svg`, saved as `assets/summary/arrow-red.svg`, 8×16. Preloaded through assets.json.
- Black chevron reuses matching `assets/b764d.svg`, 8×16. Thumbnails use cart product images; the switch and input are real DOM controls.

## Verification

- `node --test qa/*.test.mjs`: nine passing test files, including the eight previous suites and new promo pricing cases.
- `node --check app.js`, `node --check summary.mjs`, and `git diff --check` pass.
- `node qa/summary.browser.cjs <playwright module>` checks the real application in Chrome, DPR 1, at 375×667, 390×844 and 1280×900. Set PROTOTYPE_URL to test a different server and QA_OUTPUT for screenshots/results.
- Browser scenarios: empty/typed/applied promo, arbitrary and long codes, replacement/removal, Escape, null-target blur, Tab, held pointer click, modal focus restoration, bonus toggle, quantity bundle, deselection, payment changes, cheap cart cap and empty cart. No page errors or failed resource responses.
- All active asset files exist and are nonempty. No root-relative local asset URLs found.
- Visual comparison and overlays checked for summary and inline promo states. Measured logical card 355px, rows 323×24px, total row 54px, chevrons 8×16px; no horizontal overflow. Entire summary can be scrolled above the fixed footer.
- Native iOS/Android keyboards and Safari were not tested. Desktop Chrome viewport checks do not claim real-device coverage.

The Avito-hosting version 1 remains the previous snapshot. This change targets the canonical GitHub prototype.
