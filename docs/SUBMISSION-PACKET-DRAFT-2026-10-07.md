# CRESCO Key — CLOCK IN 2026 Submission Packet (physical Samsung evidence)

Updated: 2026-10-11. **DRAFT / NOT SUBMITTED.** Verify competition portal deadline and submit before close. Do not wait for full G1 to complete if it would cause a missed submission.

## Pitch

**CRESCO Key — Freedom with Boundaries.**

> The exception moved. The boundary did not.

CRESCO Key is an Android-first Solana Mobile prototype for young people's bounded financial independence. A standing onchain Key defines what the beneficiary can do without repeated approval. An exact, time-limited Guardian exception is intended to authorize only one unchanged action. Recipient/amount mutation and replay must never inherit broad permission.

## Short description — submission ready

Most youth finance products offer lockdown, repeated parental permission, or a broad debit card. CRESCO Key explores a more precise primitive: standing authority for ordinary actions, and an exact one-time Guardian exception at the boundary. The **distinct deployed Solana Devnet program** contains the charter, mandate, token asset-rule and payment allowance instructions. The **standalone Android APK was operated on a physical Samsung using Solflare Devnet**, confirming a Mobile Wallet Adapter message-signing flow and public receipt export. When a newly connected wallet did not own the configured demo Charter, the app's setup preflight **blocked safely before sending a payment**, instead of treating that wallet as authorized.

The entire mobile-to-Guardian-to-onchain-payment sequence **remains unproven**. We present the real observed app behavior and Devnet architecture, not a fictional successful purchase.

## Actual observed runtime — physical phone

- Samsung Android, standalone release-mode *test* APK, no Expo Metro.
- Solflare wallet public address `BW5dWcUfrmKNGuwuccWYAKArPseBM23qwV8PiZ96ySkT`; wallet receipt reported `solana:devnet`.
- Signed-message public receipt: `cresco-key.mobile-g1-runtime-receipt.v1`, scenario `WALLET_PROOF`, captured at `2026-10-11T20:07:28.896Z`, `SIGNED`, 64 signature bytes. Original signature bytes and independently verified message binding were not saved.
- Physical screen showed configured 5-unit Solana Pay-style request, wallet `BW5dW...` vs configured beneficiary `DD1T86...`, `This Key is not yet provisioned` and `Preflight stopped safely`. **No payment was submitted.**
- Friend's wallet UI displayed 10 SOL after two user-reported 5 SOL Devnet faucet requests. A faucet success screen was supplied. **Wallet UI balance, not independently RPC-verified**; no fiat value, no custody and not a CRESCO vault deposit.
- A code fix now emits a `PRECHECK_BLOCKED` public receipt. This fix has **not yet been physically installed and observed on Samsung**.
- New onboarding source checks the *connected* wallet's Charter, Mandate and SOL balance using Devnet RPC, accepts a distinct intended Guardian's *public address*, and exports a **public setup request**. This is **not a signed `initialize_charter` transaction**. Both Guardian and Beneficiary must authorize Charter initialization.

### Actual verification references

- GitHub repository: https://github.com/Faadil1/cresco-key
- Full-product continuation PR #62 (DRAFT / not merged): https://github.com/Faadil1/cresco-key/pull/62
- Program id: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- Program deployment/bootstrap run: https://github.com/Faadil1/cresco-key/actions/runs/37182728261
- Physical observations and constraints: `docs/G1-PHYSICAL-SAMSUNG-OBSERVATION-2026-10-07.md`
- Devnet public bootstrapped family: `evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json`
- Mobile CI including enrollment regression: https://github.com/Faadil1/cresco-key/actions/workflows/mobile-ci.yml
- Latest standalone APK build workflow: https://github.com/Faadil1/cresco-key/actions/workflows/mobile-apk-evidence.yml
- CI emulator/Mock MWA footage provenance: `docs/CLOCK-IN-2026-EMULATOR-VIDEO-PROVENANCE.md`

## Solana Mobile prize/bounty positioning — optional SKR

The official CLOCK IN listing describes **one extra $10,000 SKR integration prize** and **$125,000 USDC in main prizes**. The SKR bonus is optional; no other unrelated bounty is claimed.

**What's in source for SKR on this PR:** optional Charter Atelier on both Android roles; read-only official SKR Mainnet mint balance check for the connected public wallet; family discussion prompts; an SKR-gated read-only review of an *actually inspected CRESCO Devnet standing Key*. The Key-review receipt identifies guardian/beneficiary, nonce and cap/period usage in base units and can be shared, but **cannot affect financial permissions**. Unverified SKR balances never unlock the review. The Young/Guardian financial core does not require SKR.

**What is not proven:** no current APK artifact containing these latest changes has been physically installed and inspected, no real Mainnet SKR holder has been tested end-to-end, no bonus prize eligibility has been judged, no Mainnet transactions or SKR incentives were executed. Classify as **SOURCE / CI_PENDING**, NOT as a completed bounty.

**Judge positioning:** SKR gives opted-in token holders a community policy-review space, linked to live family Key facts rather than artificial screenshots; this is useful optional product depth but does not substitute for the unproven mobile payment/Guardian core loop.

**Time-critical submission:** Solana Mobile's September 8 blog states submissions closed October 8; Radiants' public calendar presently displays October 12 at 11:59 UTC (07:59 EDT on Oct 12). Both cannot be assumed authoritative at once. Check the signed-in portal immediately, submit the functional artifact(s) before its live deadline, and preserve the actual confirmation. Never treat project registration as submission.

## Evidence classification — avoid claims inflation

| Feature | Claim boundary |
| --- | --- |
| Distinct CRESCO Solana program | **LIVE_DEVNET_DEPLOYMENT / OBSERVED** |
| Program bootstrap and original demo family | **DEVNET_BOOTSTRAP / OBSERVED** |
| Standalone APK physical launch | **PHYSICAL_ANDROID / OBSERVED** |
| Solflare MWA message-signing response | **PHYSICAL_CLIENT / OBSERVED**, independent cryptographic signature verification pending |
| Demo wallet/beneficiary mismatch check | **PHYSICAL_CLIENT / OBSERVED**, local setup refusal, **not** onchain policy refusal |
| Friend's 10 SOL screenshot | **WALLET_UI / OBSERVED**, not independently RPC-verified |
| Read-only own-Key enrollment inspection | **SOURCE+CI / VERIFIED**, real-device test pending |
| Guardian onboarding two-signature charter | **BLOCKED / NOT_IMPLEMENTED_END_TO_END** |
| Mobile 5-unit transfer | **UNKNOWN / NOT_PROVEN** |
| Guardian one-time grant, exact retry, mutated recipient, replay | **SOURCE / PARTIAL; FULL PHYSICAL G1 NOT_PROVEN** |
| Cloudflare relay public runtime | **UNKNOWN / NOT_DEPLOYMENT_VERIFIED** |
| Production custody / minor identity / mainnet money | **N/A / NOT_CLAIMED** |

## Suggested 135–150 second video narrative

**0:00–0:10 — Hook.** "Teenagers need room to act without a boundary that quietly disappears."

**0:10–0:35 — Product.** Show Museum Ledger Android surface. Explain bounded standing Key, exact exception, explicit refusal.

**0:35–1:00 — Real physical Android.** Label physical Samsung + Solflare. Show session connection and `SIGNED` 64-byte public receipt. This is a message signature, **not a payment**.

**1:00–1:20 — Valuable real negative.** Show the 5-unit intent and **connected wallet mismatch** `BW5dW...` vs `DD1T86...`. Capture the real preflight `This Key is not yet provisioned`; **no payment submitted**. This is a product safety behavior, not a confirmed onchain payment refusal.

**1:20–1:50 — Solana design and depth.** Show actual Devnet deployed program, original family's Charter/Mandate, and native MWA integration. Explain guardian's exact allowance and mutation/replay invariants as currently implemented and locally tested, **not** as physical production proof.

**1:50–2:15 — What remains.** "A second wallet's authorized onboarding, full physical Guardian coordination and an onchain mobile payment still require integrated testing. We are showing the exact boundary of today's evidence."

**2:15–2:25 — Close.** "The exception moved. The boundary did not."

**Video integrity:** use footage/photo labels and source dates. The existing 142-second cut includes Android emulator material plus Samsung photographs. Do not call it one continuous, full onchain hero run. No invented audio/screens/signatures.

## Portal copy

**Project name:** CRESCO Key

**Tagline:** Freedom with Boundaries — exact exceptions without broader authority.

**What it does:** CRESCO Key lets a young person understand and eventually spend through a standing Solana Key with explicit limits. A Guardian's proposed exception is tied to one amount, recipient, asset, nonce and time window, not a general increase in permission. The app already exposes real Android wallet behavior, Devnet account inspection and fail-closed setup checks. Full production-like two-wallet transaction execution is still under integration.

**Solana Mobile integration:** Standalone Android-first React Native application with `@wallet-ui/react-native-kit` Mobile Wallet Adapter session and message-signing observed against Solflare on a physical Samsung; Solana Pay-style intents; Solana Devnet onchain authority program.

**What is verified:** distinct Devnet program and original deterministic family; source/CI and Android emulator, physical Samsung launch, MWA message response, wallet-mismatch setup stop. New read-only enrollment has passed Mobile CI but still needs a newer APK and physical confirmation.

**Unverified:** real onchain payment from the physical Solflare beneficiary; guardian cosigned provisioning; physical Guardian Allow Once / changed-recipient / replay hero run; deployed Cloudflare relay.

## Finish and submission checklist

- [x] Project/repo/program linked.
- [x] Real physical Android evidence captured and classified.
- [x] Source and CI enrollment preflight / Guardian public handoff developed.
- [ ] Wait for **green standalone APK artifact tied to the desired commit** before advertising a new binary.
- [ ] Validate finished published video URL, with physical/emulator labels.
- [ ] Upload demo video and/or deck to public, stable viewing URLs.
- [ ] Final judge-readable README and evidence pointers in **main**; PR #62 is still draft.
- [ ] Revisit product claims only if new actual onchain/physical receipts emerge.
- [ ] **Submit in competition portal before deadline; retain actual submission confirmation.**

**Do not treat registration or draft packet as submission.** A truthful partial product submitted on time is better than a non-submission waiting for unsupported LIVE_CORE_G1 claims.
