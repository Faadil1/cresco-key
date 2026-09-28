# CRESCO Key

**Mobile progressive authority on Solana.**

CRESCO Key gives a young person real standing financial authority inside explicit boundaries. Inside the Key, they act independently. At the boundary, CRESCO refuses the action and allows a guardian to grant one exact, single-use exception without widening the standing Key.

> The exception moved. The boundary did not.

## Start here if you are collaborating

New collaborator? Read these in order:

1. [`docs/COLLABORATOR-START-HERE.md`](docs/COLLABORATOR-START-HERE.md)
2. [`product/PRD.md`](product/PRD.md)
3. [`state/CURRENT.md`](state/CURRENT.md)
4. [`state/HANDOVER.md`](state/HANDOVER.md)
5. [`governance/CONDITIONAL-GATEWAY-REGISTRY.md`](governance/CONDITIONAL-GATEWAY-REGISTRY.md)
6. [`governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md`](governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md)
7. [`CONTRIBUTING.md`](CONTRIBUTING.md)

The PRD is the product source of truth. `state/CURRENT.md` and `state/HANDOVER.md` preserve canonical continuity. The Conditional Gateway Registry governs promotion.

## Status

- Product concept: **LOCKED**
- Target: **Solana Mobile CLOCK IN 2026**
- Network for current proof work: **Solana Devnet**
- Mobile direction: **native Android / React Native + Mobile Wallet Adapter**
- Current phase: **P0 vertical slice implemented → Android APK builds → runtime proof + mobile UX refinement**

## Core product law

1. Standing authority is explicit and versioned.
2. In-bounds actions do not require per-action guardian approval.
3. Out-of-bounds actions fail closed.
4. A guardian may refuse, widen the standing Key, or grant one exact exception once.
5. An exception does not widen standing authority.
6. Changed, stale, or replayed authorization must refuse.
7. Learning, XP, badges, P&L, AI scores, market evidence, or contextual signals never mint authority.
8. The UI is not the guard. The capital path is.

## CLOCK IN hero flow

1. Young user receives a Solana payment request.
2. An in-bounds action executes with the user's own wallet approval.
3. An out-of-bounds action is refused by the CRESCO authority path.
4. The user asks for this exact action.
5. A guardian reviews the exact request on another phone.
6. The guardian grants one exact allowance through their own wallet.
7. A materially changed request is refused.
8. The original exact request executes once.
9. Replay is refused.
10. The standing Key remains unchanged throughout the one-time exception.

The mobile build prioritizes a stablecoin/payment-intent demonstration rather than an investment-specific AAPL flow. Existing market-evidence work remains useful technical evidence but is not the hero experience.

## Repository map

- `product/PRD.md` — canonical product requirements and shared team source of truth.
- `docs/TECHNICAL-REALITY-CHECK.md` — proven, active, blocked, and out-of-scope technical gates.
- `docs/DEMO-FIRST-ARCHITECTURE.md` — target mobile vertical slice and evidence requirements.
- `apps/mobile/` — Expo/React Native Android client with Mobile Wallet Adapter, Solana Pay QR parsing, two-device boundary flow, and direct CRESCO Key instruction construction.
- `programs/keys/` — Anchor authority program with standing payment execution and exact one-time payment allowance.
- `services/relay/` — private Cloudflare Durable Object boundary relay; coordination only, never authority.
- `docs/EXACT-PAYMENT-INTENT.md` — exact amount/recipient semantics and hostile-mutation rules.
- `docs/MOBILE-APK-EVIDENCE.md` — Android build-evidence gate and runtime promotion boundary.
- `scripts/provision-cresco-key-program.ps1` — guarded local provisioning/deployment path for a distinct CRESCO Key Devnet program id.

## Implementation evidence

Implemented and CI-verified in the repository:

- native Android prebuild and successful installable debug APK build;
- local Mobile Wallet Adapter integration code;
- Solana Pay SPL-token QR parsing;
- exact recipient-wallet binding with canonical ATA verification;
- standing payment instruction;
- guardian exact Allow Once instruction;
- exact retry and replay path;
- private two-device relay with fail-closed semantics;
- amount/recipient mutation refusal logic;
- Rust program tests, relay tests, and mobile TypeScript/prebuild checks.

These are **build/code evidence**, not claims that the full hero flow has already run on physical devices or Devnet.

Runtime promotion still requires:

- a distinct CRESCO Key program id deployed to Devnet;
- live relay deployment;
- verified app identity URI / Digital Asset Links for production-shaped wallet identity;
- installable APK on device;
- real MWA connect/reject/sign/send evidence;
- repeatable two-device hero run with Devnet receipts and hostile negative cases.

## Truth boundary

CRESCO Key does **not** currently claim:

- production brokerage;
- real securities execution for minors;
- production KYC or age verification;
- production custody;
- mainnet production readiness;
- universal legal eligibility;
- SGT as proof of age, parenthood, or family relationship;
- automatic Seed Vault access by the dApp;
- universal interception of transactions from unrelated dApps.

The CLOCK IN build must prefer real refusal over fake success.

## Prior baseline

The original authority-engine proof lives in:
https://github.com/Faadil1/cresco

This repository is a clean mobile-native product build. It should not accumulate private handoffs, exploratory scratch work, or submission-strategy notes.
