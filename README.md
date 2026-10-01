# CRESCO Key

**Mobile progressive authority on Solana.**

CRESCO Key gives a young person real standing financial authority inside explicit boundaries. Inside the Key, they act independently. At the boundary, CRESCO refuses the action and allows a guardian to grant one exact, single-use exception without widening the standing Key.

> The exception moved. The boundary did not.

## Start here if you are collaborating

New collaborator? Read these in order:

1. [`docs/COLLABORATOR-START-HERE.md`](docs/COLLABORATOR-START-HERE.md)
2. [`state/CURRENT.md`](state/CURRENT.md)
3. [`state/HANDOVER.md`](state/HANDOVER.md)
4. [`product/PRD.md`](product/PRD.md)
5. [`governance/PROJECT-CONTROL-PLANE.yaml`](governance/PROJECT-CONTROL-PLANE.yaml)
6. [`governance/BUILD-LIFECYCLE-COVERAGE.yaml`](governance/BUILD-LIFECYCLE-COVERAGE.yaml)
7. [`governance/CONDITIONAL-GATEWAY-REGISTRY.md`](governance/CONDITIONAL-GATEWAY-REGISTRY.md)
8. [`evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`](evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml)
9. [`evidence/REALITY-LEDGER.md`](evidence/REALITY-LEDGER.md)
10. [`CONTRIBUTING.md`](CONTRIBUTING.md)

The living PRD owns product intent. `state/CURRENT.md` and `state/HANDOVER.md` own project continuity. Central cross-project governance comes from `Faadil1/faadil-agent-system@main`; the project control-plane/lifecycle files record how it applies here.

## Status

- Product concept: **LOCKED**
- Target: **Solana Mobile CLOCK IN 2026**
- Network for current proof work: **Solana Devnet**
- Mobile direction: **native Android / React Native + Mobile Wallet Adapter**
- Current phase: **P0 implementation → load-bearing live integration / live depth**
- Last proven runtime gate: **MWA session on Android emulator — LOCAL / PARTIAL**
- Exact next primary gate: **distinct CRESCO Key Devnet program deployment + deterministic bootstrap**

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

- a distinct CRESCO Key program id deployed to Devnet and bound to the source commit;
- deterministic CRESCO payment state bootstrapped against that program;
- live relay deployment;
- real mobile MWA transaction through the CRESCO program;
- in-bounds / boundary / Allow Once / changed-recipient / replay runtime consequences;
- physical Android / production-wallet evidence where feasible for final proof;
- clean-room / judge self-serve reproduction;
- current Engineering Quality and TRACE/design assurance before terminal promotion;
- repeatable two-device hero run with inspectable Devnet receipts.

A generic Memo transaction through MWA is useful technical proof, but under Integration-First v1.3 it is **secondary** and is not the CRESCO live core.

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
