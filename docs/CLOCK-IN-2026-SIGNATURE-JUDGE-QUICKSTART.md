# CLOCK IN 2026 — CRESCO Key Signature judge quickstart

**Submission confirmation is not recorded.** A published APK is not a completed Radiants submission.

## Product

**Freedom with Boundaries.** A new Android-first Solana Mobile app for financial autonomy with a standing, onchain spending Key. Rather than broadening that permission permanently, a Guardian can review one exact amount, token mint and recipient. **The exception moves. The boundary does not.**

## Downloads and source

- [Latest Signature standalone Android APK](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-clock-in-0bd51d53-devnet.apk)
- [Public 18-slide Signature jury deck PDF](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-jury-deck-18-slides.pdf)
- [Genuine Android-emulator footage montage, 86 seconds (six edited continuous excerpts from one recorded session)](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-real-android-walkthrough-86s.mp4) — preferred product-view footage. Mock MWA, not a physical Solflare transaction.
- [Actual browser-recorded interactive story, 29 seconds](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-real-browser-interactive-story-29s.mp4) — genuine browser clicks and animated story slides; not the Android financial UI.
- [Interactive editorial explainer, 54 seconds](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-interactive-explainer-54s.mp4) — storytelling, not a simulated live web app.
- [Earlier 88s proof montage](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-demo-88sec.mp4) — retained only as archive.
- [Public release, build receipt and SHA-256](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-signature-0bd51d53)
- [Mobile Signature source, PR #85](https://github.com/Faadil1/cresco-key/pull/85) — source commit 0bd51d53
- [Actual Android emulator workflow](https://github.com/Faadil1/cresco-key/actions/runs/38297714925)
- [Actual Mock MWA workflow](https://github.com/Faadil1/cresco-key/actions/runs/38297714919)
- [Standalone APK workflow](https://github.com/Faadil1/cresco-key/actions/runs/38297714985)

The latest Signature app passed five CI checks: Mobile CI, G1 configured preflight, Android emulator smoke, Mock Mobile Wallet Adapter session, and standalone APK build. The app includes native Young/Guardian views, Solana Pay-style intent scanning, wallet-free read-only Devnet Key exploration, MWA connect/decline/message signing and a separate SKR Charter Atelier. The release is a Devnet prototype, not production-certified.

## Financial evidence and proof origin

| Scenario | Public evidence | Classification |
| --- | --- | --- |
| 5-unit transfer inside standing boundary | [Solana Devnet confirmation](https://explorer.solana.com/tx/3PQLrxQCq3mkt6T14u9h5rUXDxCDV2DTq3dDE3qFB8WP8gLdTK3titWCStLgqFKPvfWnXKpfrQatxsBDZKfEaicS?cluster=devnet) | LIVE DEVNET; developer signers, **not** Android |
| 12-unit over-limit action refused | [Devnet proof](https://explorer.solana.com/tx/BWaa6cAG3hjvvSeBCAAg2hpmteqFg4YpRCVqaFzSPAGjtneBBMepZksbnGbULfDpHXWfhtEuQRtDwbX3bVAZ8C2?cluster=devnet) | LIVE DEVNET; developer signers |
| Guardian onchain exact allowance grant | [Grant transaction](https://explorer.solana.com/tx/24DRvkbxWvAiwLvn2zHNXa5FjZmhRcp6TFgojisk4wz93cfbhGr1yT7qQsXeSgXyqU18fa9HX6ZyJ3xbUwWC682u?cluster=devnet) | LIVE DEVNET grant only |
| Guardian exact consumption and replay | [Open issue #76](https://github.com/Faadil1/cresco-key/issues/76) | BLOCKED; current program returns AllowanceAlreadyUsed despite unused account |
| Connected wallet on physical Android | [Field notes](G1-PHYSICAL-SAMSUNG-OBSERVATION-2026-10-07.md) | Earlier app candidate; physical message signing but no token transfer |

**No complete Guardian Allow Once → exact redemption → replay refusal has been proven on the current deployed program.** Emulated wallet signature is not the same as a mobile transfer. Physical end-to-end payment remains pending. The sample preconfigured beneficiary does not automatically match another test wallet.

## Optional SKR feature

The optional SKR Charter Atelier uses read-only Solana Mainnet token account inspection for official SKR presence, then provides family discussion prompts and an optional read-only Devnet Key limit review. It cannot transfer tokens or change financial authority. Physical holder verification remains open. All core Cresco functionality works independently of SKR.

## Judges' suggested path

Install the public candidate → Explore live Devnet Key without a wallet → connect a supported Android wallet → inspect the Young/Guardian interfaces → compare visible rule boundaries with public Devnet receipts above → review the open blocker honestly.

**Submission deck and video URLs are supplied separately by the operator; confirm access without sign-in.**
## Short narrated judge pitch (Explain)

- [CRESCO Key — CLOCK IN Judge Demo, approx. 2m12s narration](https://scrimba.com/explain/guide0cnst87t1?claim=t715okr5ne91r0a0&fullscreen=1).
- This is a **narrated explanation** with actual emulator screenshots, not a live Android video. It includes observed Mobile Wallet Adapter behavior and separately labels developer-signer Devnet payments.
- The application's **moving Android demo** remains separate: [public 88-second emulator video](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-demo-88sec.mp4).
- The Radiants DEMO VIDEO URL field asks for YouTube, Loom or a **public Google Drive link**: do not paste the Scrimba link without checking form acceptance; claim and export this explainer to MP4 then host it on an accepted provider. Scrimba playback length is estimated until the exported MP4 duration is measured. Do not assume submission completed.
