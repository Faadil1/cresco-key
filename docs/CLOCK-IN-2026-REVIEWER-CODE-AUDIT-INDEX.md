# CLOCK IN 2026 — Reviewer code and evidence index

**Purpose:** an auditable, low-friction map from claims to exact source, CI build, onchain receipts, and observed phone behavior. This is **not** an independent external security audit and is **not** proof of a full Android-origin financial transaction.

## Exact APK/source binding

- **[Download standalone Signature Android APK](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-clock-in-0bd51d53-devnet.apk)**, SHA-256 `878e11e1b55ce97817bcf7a852651606ade3a219be0e75866c739b5137b329b8`.
- [Published GitHub release](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-signature-0bd51d53) includes the binary, SHA-256 and standalone APK receipt.
- [**Exact public source commit used for the published Signature candidate**](https://github.com/Faadil1/cresco-key/tree/0bd51d532da85fd890efc9dd6208de8b5d837dd7). The current development PR may be ahead of this historical immutable build; do **not** mistake today's branch HEAD for the shipped APK source.
- [PR #85 — review Signature mobile changes](https://github.com/Faadil1/cresco-key/pull/85), still a draft. PR #85 is not evidence that all its work has been merged to `main`.

## Mobile source (the code, not just a description)

| Reviewer interest | Direct source |
| --- | --- |
| Real Android / Young and Guardian workspaces | [BoundaryWorkspace.tsx](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/BoundaryWorkspace.tsx) |
| Start / connect / judge tour | [WalletGate.tsx](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/WalletGate.tsx), [JudgeReadOnlyTour.tsx](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/JudgeReadOnlyTour.tsx) |
| Solana Pay intent parser and decimal safety | [solanaPay.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/payment/solanaPay.ts) |
| Camera QR intent scan | [PaymentScanner.tsx](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/payment/PaymentScanner.tsx) |
| Chain instructions and PDA derivation | [programClient.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/solana/programClient.ts) |
| Read live standing Key, check rules | [standingKey.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/solana/standingKey.ts) |
| Connected-wallet enrollment preflight | [enrollment.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/solana/enrollment.ts), [paymentReadiness.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/solana/paymentReadiness.ts) |
| Track Solana submission outcome, including UNKNOWN | [outcome.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/solana/outcome.ts) |
| Request coordination and privacy | [relay/client.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/relay/client.ts), [deepLink.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/relay/deepLink.ts), [storage.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/relay/storage.ts) |
| Optional SKR read-only atelier | [SkrCharterAtelier.tsx](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/skr/SkrCharterAtelier.tsx), [liveKeyCharterReview.ts](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/src/skr/liveKeyCharterReview.ts) |
| Actual deployed onchain instruction source | [Anchor Rust program lib.rs](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/programs/keys/src/lib.rs) — declares `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP` |
| Actual Android build dependencies and test scripts | [apps/mobile/package.json](https://github.com/Faadil1/cresco-key/blob/0bd51d532da85fd890efc9dd6208de8b5d837dd7/apps/mobile/package.json) |

## Reproduce the relevant source checks

Requirements: Node.js >=22.13.0 and the SDKs needed for Android build. Commands from repository root:

```sh
cd apps/mobile
npm install
npm run typecheck
npm run test:financial-boundaries
npm run test:enrollment
npm run test:skr-live-review
```

For public Devnet receipt-validator tests:

```sh
cd tools/devnet
npm install --ignore-scripts
npm run check
```

These are **reproduction instructions**, not a claim that this document just executed all commands. See actual workflow history for results.

## Exact source CI — what was actually validated

- [Mobile CI](https://github.com/Faadil1/cresco-key/actions/runs/38297714978) — source checks (run IDs should be checked in GitHub against the exact commit).
- [Real Android emulator smoke](https://github.com/Faadil1/cresco-key/actions/runs/38297714925) — UI and navigation on emulator.
- [Mobile Wallet Adapter integration on Mock Wallet](https://github.com/Faadil1/cresco-key/actions/runs/38297714919) — decline, authorize, proof message and role navigation. A signed message is **not** a token payment.
- [Standalone APK evidence](https://github.com/Faadil1/cresco-key/actions/runs/38297714985) — CI build receipt and release candidate binary.
- [Preflight / G1 configured checks](https://github.com/Faadil1/cresco-key/actions) — discover by workflow name and exact build SHA.

## Verifiable Solana Devnet consequences

| Scenario | Evidence | Proof boundary |
| --- | --- | --- |
| 5 units inside limit transferred | [Solana transaction](https://explorer.solana.com/tx/3PQLrxQCq3mkt6T14u9h5rUXDxCDV2DTq3dDE3qFB8WP8gLdTK3titWCStLgqFKPvfWnXKpfrQatxsBDZKfEaicS?cluster=devnet) | `LIVE_DEVNET / DEVELOPER_SIGNERS`, not physical phone |
| 12 units exceeded cap; refused | [Solana transaction](https://explorer.solana.com/tx/BWaa6cAG3hjvvSeBCAAg2hpmteqFg4YpRCVqaFzSPAGjtneBBMepZksbnGbULfDpHXWfhtEuQRtDwbX3bVAZ8C2?cluster=devnet) | `LIVE_DEVNET / DEVELOPER_SIGNERS`, not local beneficiary refusal |
| Guardian allowance granted | [Solana transaction](https://explorer.solana.com/tx/24DRvkbxWvAiwLvn2zHNXa5FjZmhRcp6TFgojisk4wz93cfbhGr1yT7qQsXeSgXyqU18fa9HX6ZyJ3xbUwWC682u?cluster=devnet) | Onchain grant only; **no redemption claim** |

## Real physical Android phone — independently classified

- [57-second edited genuine phone footage](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-physical-android-proof-57s.mp4).
- [Observed / blocked evidence ledger](CLOCK-IN-2026-PHYSICAL-ANDROID-EVIDENCE.md): actual read-only Key data (10 per payment, 100 per period, 5% used), Solflare connection, beneficiary preflight mismatch `transactionSubmitted:false`, and independent account read `NOT_PROVISIONED`.
- The physical phone's wallet is **not** a provisioned member of the sample family Key; 10 Devnet SOL does not make it eligible. No private key, wallet PIN or seed phrase is in this index.

## Material open findings, not swept under the rug

1. [**P0 #76 — Guardian Allow Once redemption fails as AlreadyUsed despite unused grant**](https://github.com/Faadil1/cresco-key/issues/76). No completed exact redemption, changed-recipient mutation and replay chain has been proven on the current binary.
2. Native MWA signMessage on emulator and the physical Solflare connection do not demonstrate an end-to-end Android-origin token transfer.
3. Physical wallet is not provisioned; setup requires a distinct Guardian and beneficiary authorized signatures, a live Charter, Mandate, rules and funded Devnet vault.
4. Wallet app identity/asset association is a prototype limitation; a warning must not be misrepresented as production certification.
5. Optional SKR checks public Mainnet token-account presence and builds a read-only Devnet Key report; it does not authorize payments or evidence repeat-use/adoption.

**If the coach shows CODE NONE, paste `https://github.com/Faadil1/cresco-key` into REPOSITORY URL, save the field, and select OPEN SECURITY AUDIT. Do not represent this source index as the results of that independent audit.**

**Bottom line:** CRESCO Key is a source-auditable **Devnet research prototype with a functioning Android product shell and mobile wallet integration**. The complete family financial live core loop remains **BLOCKED / NOT PROVEN**.
