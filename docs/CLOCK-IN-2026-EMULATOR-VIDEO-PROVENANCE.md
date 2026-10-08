# CLOCK IN 2026 — Emulator video provenance (2026-10-08)

## Source and scope

- Real Android Emulator API 36 recording, captured by `adb shell screenrecord` during the `MWA Session Evidence` workflow. Source: [run 37723102919](https://github.com/Faadil1/cresco-key/actions/runs/37723102919), artifact `cresco-key-mwa-session-evidence` (ID 11527910150).
- The wallet in that recording is the official **Solana Mock MWA Wallet**, not Solflare. Recording duration approximately 99 seconds before editorial cuts. Recorded flow includes launch, an authorization decline and retry, an authorization and message signing, Young navigation, and relaunch, subject to artifact/receipt validation.
- Physical Samsung observations were supplied independently by the user: actual APK opened, Solflare Devnet wallet connected, app receipt recorded TRC-01 message SIGNED (64 bytes), five-unit intent loaded, Solflare simulation failed, transaction canceled, CRESCO emitted `STANDING_PAYMENT UNKNOWN` with signature `null`.
- The narrated 142-second landscape video uses an **edited excerpt** of the real emulator recording with distinct, labeled physical Samsung photographs and editorial title/Devnet/SKR slides. It is **not** a continuous capture of a live on-chain payment.
- The audio is narrational, not original emulator microphone audio; wallet display audio is not used as evidence.
- Original distinct CRESCO program on Devnet: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`; an on-chain payment under the newly connected Samsung wallet is **not yet proven**.
- SKR optional Charter Atelier is source-level integration; **not** represented as physically verified or as a verified bounty prize.

## Allowed demonstration claims

- REAL_EMULATOR_RECORDING / LOCAL: launch and observed Mock MWA actions.
- PHYSICAL_CLIENT_OBSERVED: Samsung + Solflare connect and in-app message signature.
- LIVE_INTEGRATION: distinct program deployed on Devnet.
- NOT_PROVEN: G1 mobile on-chain payment, Guardian live allowance, replay refusal on a real phone, live relay, fully tested SKR bonus eligibility.

## Assets

- Captured MP4 remains in the run artifact, not embedded into source control; it contains no secret recovery phrase or private key.
- Submission presentation, narration and edited export are separate local artifacts managed outside the source repo.
- `scripts/mwa-session-evidence.sh` now records video as an additive evidence step, without changing protected signing or claiming mainnet usage.

Current project primary workstream remains PRODUCT_EXPLOITATION. Submission media does not promote live product proof or terminal readiness.
