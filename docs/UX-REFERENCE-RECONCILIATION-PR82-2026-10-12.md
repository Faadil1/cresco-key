# CRESCO Key — UI/UX reference reconciliation (12 Oct 2026)

**Decision: VISUAL DIRECTION NOT ACCEPTED / REOPENED.** This is a design-review record, not a claim that the six reference designs were implemented or that the current app is ready to ship.

## Why this record exists

PR #82 fixes valuable first-fold usability issues, but the living seal + Museum Ledger treatment is **not by itself** a satisfactory reconciliation of the UI/UX references supplied earlier. The present styling should not be described as the user's approved design. Keep functional improvements; do not silently treat visual implementation as visual acceptance.

**Actual evidence:** Android Emulator Smoke run [#38245715806](https://github.com/Faadil1/cresco-key/actions/runs/38245715806), exact PR head `541f33ae491dfe605eb9ac1740392e93a21d37c5`, artifact `cresco-key-android-emulator-evidence`; images `cresco-launch.png` and `cresco-judge-tour.png`. These are real emulator captures, **not** art-direction mockups or physical phone proofs.

### What the captures show

- **Welcome:** correct first viewport accessibility of *Connect wallet* and the independent no-wallet tour; however, hero, wallet card, explanatory copy and three long numbered steps produce a mostly text-first editorial brochure rather than a financial product interface.
- **Read-only Devnet tour:** two giant prose-heavy cards before live spending information is seen. “Check sample Key limits” is a legitimate honest action, but the live Key data and boundary relationship should become the visual hierarchy *after loading*, not remain hidden behind explanation.
- The compact ring reads as a logo; it does **not** currently make authority, spending, request, approval and non-approval intelligible as one consistent interactive visual grammar.
- Need real emulator/phone review of Young, Guardian, boundary, unknown, receipts and both font-scale variants before any design acceptance. Do not infer their quality from the welcome screenshot.

## Reference ledger — previously shared, not silently dropped

CRESCO Visual Lab: [cresco-visual-lab.pages.dev](https://cresco-visual-lab.pages.dev/). Earlier exploration required **six distinct branches with an equivalent product flow**, rather than immediately selecting one untested style:

1. Bit / Living Key
2. The Shear Line
3. Key Island
4. Family Chat
5. Stay in Key
6. First Pass

Earlier external inspiration/research set included **Mobbin**, **Rare UI**, **Interior**, **Zajno Motion**, **Inspora**, and the user's TRACE/Winning Intelligence/CARI references. These are *references to investigate*, not licenses to transplant visual components or proof that any pattern is already incorporated.

**Reference-integrity gap:** The previous six visual branches were not available for direct visual reinspection in this review. Restore or export reference screenshots/source, document each branch's *specific* transferable patterns and non-transferable elements, and ask for explicit user selection of a visual target before presenting a new style as approved. Do **not** invent unseen visual descriptions for these branches.

**Benita contribution:** audit and inventory the actual prior CRESCO work and any mobile-specific UX assets. CRESCO (World's Fair / web) and CRESCO Key (mobile, separate repo and authority model) are distinct products: recover transferable design work without overriding the CRESCO Key PRD, wallet interactions or chain semantics.

## Required visual exploration before next UI lock

Produce **three materially distinct mobile directions** grounded in the recovered references, for a side-by-side comparison using the **same** states and data. Three directions is a review batch, not a claim that the six original branches are reducible to three; maintain the full source/reference ledger.

Use identical information density, same viewport sizes (360×800, 390×844) and same realistic financial states for fair comparison:

- Welcome: visible Connect wallet + explicitly read-only Devnet entry
- My Key: standing per-payment/period rules, live period usage and next permissible action
- Young: amount, exact asset, full recipient, payment preflight and actual refusal cause
- Guardian: precise request, Allow Once vs structurally separated permanent-limit change
- Boundary / request / refused / unknown / verified: distinct source-backed status, next action and recovery
- Receipt + replay: only signed/onchain-verified confirmations, exact transaction evidence

**Art direction criteria:** recognizable at first glance; youthful without infantilizing Guardian; family trust without generic fintech/dashboard tropes; mobile-native hierarchy; expressive product-state visualisation rather than serif typography/card volume alone; avoid navy AI-SaaS, crypto glow, hollow gamification, ungrounded trust scores and decorative animations.

**Micro-motion:** only when materially helpful and tied to observed runtime state; ring/standing authority does not widen; detached marker denotes specific request, not approval; reduced motion must be meaningful and static. Preserve full recipient/mint display, actual failure classification and 44dp targets.

### Acceptance gates (cannot be bypassed by green CI)

| Gate | Status at review | Required evidence |
| --- | --- | --- |
| Previous references recovered & faithfully mapped | **BLOCKED** | Original six source visuals/exports + source-to-component decision log, including Benita inventory |
| Visual option/target explicitly chosen by user | **BLOCKED** | Three equivalent-state options, choice recorded; no silent style promotion |
| Android screenshot-level visual QA | **PARTIAL** | Real welcome and read-only-tour captures at exact head only; capture rest of Young/Guardian and all core financial states |
| Product functionality preserved | **ACTIVE** | Real live-core-loop, correct wallet and onchain semantics, no pretend verified state |
| MWA session run | **BLOCKED** | Latest run [#38245715948](https://github.com/Faadil1/cresco-key/actions/runs/38245715948) failed during Gradle's Kotlin compiler artifact download with HTTP 504; classify this as infrastructure/dependency-fetch failure for this run, re-run before interpreting MWA product behavior |
| Mobile CI, G1 configured preflight, emulator smoke, APK build | **PROVEN at `541f33ae`** | Independent green runs at the exact commit; these do not validate artwork or physical-wallet success |
| Real Guardian Allow Once → payment → replay | **BLOCKED** | Program/runtime issue [#76](https://github.com/Faadil1/cresco-key/issues/76), genuine complete state transitions and consequences |
| Physical Android acceptance / public APK replacement | **BLOCKED** | Exact APK sha/commit, installed handset screenshots, MWA/Guardian checks as applicable; preserve current public fallback until verified |

## Immediate safe path

1. Preserve the functional first-fold, disclosure, safe-state and native-accessibility improvements already in PR #82.
2. **Do not merge for “visual completion”**: the current Museum Ledger / Living Key visual is a working candidate, not signed-off direction.
3. Recover the previous branch imagery and Benita material; perform a documented reference-to-pattern audit without copying blindly.
4. Compare three intentional **screens-first** alternatives; let the user select a design target.
5. Only then implement UI on a dedicated branch of PR #82 or follow-on PR, with real device QA. Keep program contract/signers/authority untouched; release gating stays independent of visual approval.

This record changes **design acceptance and scope visibility only**; it changes no smart-contract logic, MWA behavior, payment authorization, transaction or receipt states.
