# CRESCO Key — CLOCK IN submission freeze packet

**Working draft, October 11, 2026. Submission NOT confirmed.** This is copy to paste into the actual signed-in Radiants form. Do not mark a form field submitted merely because this packet exists.

## First screen / 30-second positioning

**Project:** CRESCO Key

**Headline:** *Freedom with Boundaries.*

**Tagline:** The exception moves. The boundary does not.

**One-sentence pitch:** An Android-first Solana app for young people's financial independence: everyday actions happen within a standing Key; an exceptional purchase needs a Guardian's precise, one-time authority, not an unlimited permission change.

**Why anyone returns:** The intended day-to-day use is repeated independent spending and parent–young-person budget conversations, not approving every purchase. A Key grows only when the authorized Guardian explicitly changes it; a one-off exception does not automatically raise future limits. This is a product hypothesis, **not measured user retention or adoption**.

## What the judge can actually verify now

| Evidence | Classification / source |
| --- | --- |
| Android APK rebuilt with judge's no-wallet read-only Devnet tour, MWA, Guardian/Young UI, optional SKR | **CI + EMULATOR VERIFIED, NOT PHYSICALLY RETESTED**. Built at source `06abe0badbf52ca478e1d7063348fe619900d589`. [Standalone APK ZIP](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-ci-android-candidate-a11b090e/cresco-key-clock-in-devnet-ci-candidate-a11b090e.apk) · [Android emulator result](https://github.com/Faadil1/cresco-key/actions/runs/38177473382). [Public GitHub prerelease and SHA-256 receipt](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-ci-android-candidate-a11b090e) are available without relying on a temporary Actions artifact. The exact APK build commit is the verified PR test-merge SHA `a11b090e` (parents main `160de692` and PR head `06abe0ba`). |
| Physical Android with Solflare wallet | **OBSERVED ON AN EARLIER APK**, not the new APK and not a confirmed token payment. [Samsung field report](G1-PHYSICAL-SAMSUNG-OBSERVATION-2026-10-07.md). |
| Deployed current program on Solana Devnet | **VERIFIED ONCHAIN**, [program explorer](https://explorer.solana.com/address/6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP?cluster=devnet), [deployment](https://github.com/Faadil1/cresco-key/actions/runs/37182728261). |
| Actual 5 demo SPL-token units moved within standing limit | **VERIFIED ONCHAIN, SERVER-SIGNED DEVELOPER DEVNET WALLETS**, [exact tx](https://explorer.solana.com/tx/3PQLrxQCq3mkt6T14u9h5rUXDxCDV2DTq3dDE3qFB8WP8gLdTK3titWCStLgqFKPvfWnXKpfrQatxsBDZKfEaicS?cluster=devnet): vault 100→95, recipient A 0→5. **Not** from Samsung. |
| 12 demo units outside the standing limit | **VERIFIED ONCHAIN PROGRAM REFUSAL**, [tx](https://explorer.solana.com/tx/BWaa6cAG3hjvvSeBCAAg2hpmteqFg4YpRCVqaFzSPAGjtneBBMepZksbnGbULfDpHXWfhtEuQRtDwbX3bVAZ8C2?cluster=devnet): `ActionAmountExceeded`, no token movement. |
| Guardian creates an exact 12-unit allowance | **VERIFIED ONCHAIN GRANT ONLY**, [tx](https://explorer.solana.com/tx/24DRvkbxWvAiwLvn2zHNXa5FjZmhRcp6TFgojisk4wz93cfbhGr1yT7qQsXeSgXyqU18fa9HX6ZyJ3xbUwWC682u?cluster=devnet), live account bytes show `used=false`; its expiry is finite and it **does not establish an executable one-time exception**. |
| Full Allow Once exact redemption + changed-recipient denial + replay rejection on current deployed CRESCO Key | **BLOCKED**. The deployed program returns `AllowanceAlreadyUsed` (6026) for an **unused** allowance even in exact-recipient RPC simulation. [Root issue #76](https://github.com/Faadil1/cresco-key/issues/76) · [read-only differential](https://github.com/Faadil1/cresco-key/actions/runs/38196503268). |
| Current deployed binary is the originally archived binary | **READ-ONLY VERIFIED**, program hash matches deployment evidence, [forensics](https://github.com/Faadil1/cresco-key/actions/runs/38198680293). Does not resolve issue #76. |
| Original CRESCO engine Allow Once proof | **HISTORICAL DIFFERENT PROGRAM `ABjE6V5…`**, [original canonical receipts](https://github.com/Faadil1/cresco/blob/main/evidence/solana/ALLOW-ONCE-EXACT-ACTION-CANONICAL-PROOF-2026-09-25.md). Never present as live mobile/current-program consequence. |
| Relay Cloudflare | **LIVE COORDINATION ONLY**, [successful public deployment](https://github.com/Faadil1/cresco-key/actions/runs/38174012603). Cannot grant spending authority or transfer tokens. |
| Final portal submission | **UNKNOWN / NOT CONFIRMED**. Need saved final Radiants submission confirmation. |

## Suggested concise submission copy (English)

**Describe the problem.**

Youth finances often force an unhealthy choice: ask permission for every purchase, or give broad access. Families need a repeatable way for a young person to act independently, with spending rules that stay enforceable even when an unusual request comes up.

**What is CRESCO Key?**

CRESCO Key is an Android-first Solana Mobile prototype built around an onchain standing Key. A young user can present an exact payment intent and inspect their own authorization. The Guardian sees a separate, precise exception path rather than being asked to approve all spending. The core design rule is simple: **The exception moves. The boundary does not.**

**What has been built and actually run?**

We built a React Native Android application, Mobile Wallet Adapter sessions, a distinct Anchor program deployed on Solana Devnet, a real read-only Key inspection journey for wallet-free judges, and a coordination relay that does not control funds. A signed 5-unit demo SPL-token transaction and a program-level out-of-limit rejection were independently verified on the current Devnet program, including token balance deltas. A Guardian-signed one-time allowance has also been created onchain. We expose the outstanding one-time redemption issue openly rather than claiming the complete Guardian payment/replay loop already works.

**How does it use Solana Mobile?**

The Android UI brings exact purchase intents and separate young-user/Guardian journeys to the phone, with consent via Solana Mobile Wallet Adapter. Public Devnet accounts and Solana transactions are the source of authority and evidence, not an app animation or backend approval flag. An optional read-only SKR holder review is an experimental bonus candidate, not evidence of a qualified Mainnet SKR use case.

**What makes it different?**

CRESCO models the difference between standing autonomy and an exact one-time exception. Traditional approval UX risks blending a temporary exception with broad authority. Here the intended policy is bound to the payment's asset, amount, recipient, request identity and nonce. This distinction is implemented and historically proven in the earlier CRESCO authority engine; the new Android project's complete one-time execution remains a documented integration blocker.

**Status disclaimer (use where form permits):**

This is a Devnet research prototype, not a production financial service. A newer standalone APK is CI/emulator verified but not yet physically retested; the signed current-program 5-unit transfer and out-of-limit rejection were initiated by separately controlled development signers. The complete physical mobile Guardian→one-time execution→replay sequence has **not** been proven.

## Demo: 90 seconds, label footage

- **0–12 sec:** The dilemma: independence without open-ended spending.
- **12–32 sec:** Show actual Android screen, a precise intent and the read-only judge tour. Use `EMULATOR / CI` or `PHYSICAL EARLIER BUILD` labels.
- **32–55 sec:** Show actual [confirmed transfer](https://explorer.solana.com/tx/3PQLrxQCq3mkt6T14u9h5rUXDxCDV2DTq3dDE3qFB8WP8gLdTK3titWCStLgqFKPvfWnXKpfrQatxsBDZKfEaicS?cluster=devnet) and [refused over-limit transaction](https://explorer.solana.com/tx/BWaa6cAG3hjvvSeBCAAg2hpmteqFg4YpRCVqaFzSPAGjtneBBMepZksbnGbULfDpHXWfhtEuQRtDwbX3bVAZ8C2?cluster=devnet). Say these used **developer Devnet signers**, not a Samsung payment.
- **55–75 sec:** Guardian can create an exact onchain permission. Present [actual grant](https://explorer.solana.com/tx/24DRvkbxWvAiwLvn2zHNXa5FjZmhRcp6TFgojisk4wz93cfbhGr1yT7qQsXeSgXyqU18fa9HX6ZyJ3xbUwWC682u?cluster=devnet), and honestly label its one-use execution as **BLOCKED / work-in-progress**. Do not fake a redemption or replay refusal.
- **75–90 sec:** Return to product promise; show repo, verified code, installable APK and destination. `The exception moves. The boundary does not.`

**Missing video:** no verified permanent demo-video link is recorded. Do not insert a fabricated link. A rough but truthful accessible recording beats an unsubmitted polished edit.

## Final submission checklist

- [ ] In **Radiants signed-in project page**, confirm the real closure time. Operator calendar screenshot indicates **October 12, 2026 at 19:59 EDT**.
- [ ] Paste project name, description, problem, differentiator, Solana Mobile use case from above.
- [ ] Verify **public repo:** https://github.com/Faadil1/cresco-key
- [ ] Verify the exact standalone APK: https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-ci-android-candidate-a11b090e/cresco-key-clock-in-devnet-ci-candidate-a11b090e.apk. Permanent GitHub prerelease available: [https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-ci-android-candidate-a11b090e](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-ci-android-candidate-a11b090e).
- [ ] Record/upload video; confirm it plays without sign-in. **PERMANENT_VIDEO_URL = not yet available**.
- [ ] Add working presentation/deck only if the form needs it. **PUBLIC_DECK_URL = not yet available**.
- [ ] Confirm if a mobile app store link or signing requirement applies in the actual Radiants form; don't claim store publication without a listing.
- [ ] Click the actual final submit action; take a screenshot of the confirmation and preserve the entry URL.
- [ ] If additional verifiable G1 evidence appears before cutoff, update the submission copy **only after confirmed transactions**; never imply the source commit/build artifact is a real-wallet result.

**Contingency decision:** Do not miss the final form waiting for a Rust-program repair or a mobile-device loan. Submit the strongest supported evidence before the portal closes. This packet is NOT a submission itself.
