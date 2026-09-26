# CRESCO Key

**Mobile progressive authority on Solana.**

CRESCO Key gives a young person real standing financial authority inside explicit boundaries. Inside the Key, they act independently. At the boundary, CRESCO refuses the action and allows a guardian to grant one exact, single-use exception without widening the standing Key.

> The exception moved. The boundary did not.

## Status

- Product concept: **LOCKED**
- Target: **Solana Mobile CLOCK IN 2026**
- Network for current proof work: **Solana Devnet**
- Mobile direction: **native Android / React Native + Mobile Wallet Adapter**
- Current phase: **Technical Reality Check → Demo-First Architecture → Build**

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
- `apps/mobile/` — native Android/React Native client. *(to be built)*
- `programs/` — Solana authority program. *(to be ported/adapted from the proven CRESCO baseline only as needed)*

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
