# Physical Android — new jury evidence (2026-10-12)

**Proof class: PHYSICAL / OBSERVED, NOT a completed phone-origin financial payment.**

**[Watch the 57-second real-device video](https://github.com/Faadil1/cresco-key/blob/main/docs/assets/clock-in-2026/cresco-key-physical-android-proof-57s.mp4)** · [Signature APK and release](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-signature-0bd51d53) · [Main jury guide](CLOCK-IN-2026-SIGNATURE-JUDGE-QUICKSTART.md)

The video is a short **edited montage of real Android captures**, supplemented by an actual app screenshot of the wallet enrollment check. The captures are not synthesized app mockups or one uninterrupted financial transaction. Solflare PIN entry and WhatsApp contact-sharing screens are excluded. MP4 duration: 56.875 s; SHA-256 `1e0e8efc6293cf93c0fee6c848071094ebe1bf6edbba90fe3ac5dc962114e989`.

| Evidence | Evidence class | Verdict |
|---|---|---|
| Signature app installed and working on real Android | **PHYSICAL / OBSERVED** | Yes. Genuine UI interactions. |
| Wallet-free live Devnet standing Key read | **PHYSICAL / LIVE_RPC_OBSERVED** | `READ COMPLETE`: max 10 test units per payment, 100 per period, 5% used, nonce 2. These values are Key rules, **not** the connected wallet balance. |
| Solflare handoff and connected Young Person views | **PHYSICAL / OBSERVED** | Yes; connection and UI observed. No independently verified phone-origin token transfer or wallet proof-message signature in this clip. |
| Configured five-unit demo intent for wrong beneficiary | **PHYSICAL / PRECHECK_BLOCKED** | `BUILD_CONFIG_BENEFICIARY_MISMATCH` prevented submitting a transaction; `transactionSubmitted:false`, `financialAuthorityDecision:false`. **Not a program-enforced financial refusal.** |
| Live connected-wallet setup check | **PHYSICAL / LIVE_RPC_OBSERVED** | `NOT_PROVISIONED`: absent Charter and Mandate for connected Devnet wallet; 10 SOL Devnet alone does not grant CRESCO authority. |
| Independently verified onchain 5-unit payment / 12-unit refusal / allowance grant | **LIVE_DEVNET / DEVELOPER_SIGNER_VERIFIED** | Documented separately in [jury guide](CLOCK-IN-2026-SIGNATURE-JUDGE-QUICKSTART.md). These actions did **not** originate from the phone. |
| Exact Guardian allowance redemption + replay | **BLOCKED** | [Issue #76](https://github.com/Faadil1/cresco-key/issues/76) remains open. Do not represent it as working. |

### Judge viewing sequence

1. [Narrated Explain product pitch](https://scrimba.com/explain/guide0cnst87t1?claim=t715okr5ne91r0a0&fullscreen=1) — presentation and terminology; Android screenshots are genuine but stills.
2. [**Physical device proof**](https://github.com/Faadil1/cresco-key/blob/main/docs/assets/clock-in-2026/cresco-key-physical-android-proof-57s.mp4) — real UI and negative path.
3. [Real emulator MWA walkthrough](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-real-android-walkthrough-86s.mp4) — **CI / EMULATOR** proof class, separately.
4. [Developer-signer Devnet transactions](CLOCK-IN-2026-SIGNATURE-JUDGE-QUICKSTART.md) and [redemption blocker](https://github.com/Faadil1/cresco-key/issues/76).

**Truth boundary:** Real Android app and wallet integration are observed; Live Core G1 is not promoted; no payment transaction was sent from the friend's wallet. A GitHub Release is not evidence of Radiants submission; verify the portal's submission receipt.
