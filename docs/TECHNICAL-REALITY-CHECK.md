# CRESCO Key — Technical Reality Check

Date: 2026-09-26  
Status: **PASS WITH REQUIRED DELTAS**  
Concept source of truth: `product/PRD.md`

## Purpose

This document freezes what is already proven, what must be built for CLOCK IN, and what is explicitly not assumed.

The mobile build must preserve the product laws:

> The exception moved. The boundary did not.

> The UI is not the guard. The capital path is.

## Current baseline

The original CRESCO repository already proves on Solana Devnet:

- versioned Mandates;
- in-bounds execution without guardian approval;
- out-of-bounds refusal;
- exact one-time guardian authorization;
- changed-action refusal;
- stale-authorization refusal;
- replay refusal;
- confirmed Devnet receipts;
- fail-closed Pyth evidence in the investment lane.

The canonical prior proof is retained in `Faadil1/cresco`. CRESCO Key must not weaken those semantics while changing the user surface.

## Mobile platform facts

Current Solana Mobile documentation states:

- Mobile Wallet Adapter (MWA) is the standard protocol for connecting Android apps to wallets;
- React Native is a supported and recommended integration path;
- `@wallet-ui/react-native-kit` is the recommended package for new apps;
- MWA supports wallet authorization, message signing, and transaction signing;
- a custom Expo development build is required because MWA uses native modules;
- the dApp Store requires a signed release APK;
- testing can be done on a normal Android device or emulator with an MWA-compatible wallet.

References:

- https://docs.solanamobile.com/get-started/react-native/installation
- https://docs.solanamobile.com/get-started/react-native/setup
- https://docs.solanamobile.com/get-started/react-native/quickstart
- https://docs.solanamobile.com/solana-mobile-stack/mobile-wallet-adapter
- https://docs.solanamobile.com/dapp-store/checklist

## Gate registry

| Gate | State | Decision |
|---|---|---|
| Existing CRESCO authority semantics | **PROVEN** | Reuse/adapt; do not re-invent. |
| Native Android app | **ACTIVE** | Build a real Expo/React Native Android client. |
| Mobile Wallet Adapter | **ACTIVE** | Required for local wallet connect/sign flows. |
| Young-person local signing | **ACTIVE** | Local MWA wallet session on the young user's device. |
| Guardian local signing | **ACTIVE** | Local MWA wallet session on the guardian device. |
| Two-device coordination | **ACTIVE** | Relay request state privately; relay is not authority. |
| Remote MWA dependency | **N/A P0** | Each phone talks to its own local wallet. |
| Durable nonce dependency | **N/A P0** | The exact allowance is a durable authorization object; do not keep a user transaction open while waiting. |
| Solana Pay / payment QR | **ACTIVE** | Use as mobile payment-intent input and demo surface. |
| Exact destination binding | **BLOCKED** | Required program delta before the hero proof is honest. |
| Exact amount binding | **PROVEN baseline / EXTEND** | Existing exact-notional semantics exist; bind the complete payment intent. |
| Replay refusal | **PROVEN** | Preserve. |
| Stale authorization refusal | **PROVEN** | Preserve. |
| Pyth | **PROVEN / NON-HERO** | Keep for market-evidence lanes; not required for stablecoin hero payment. |
| Push notifications | **ACTIVE UX** | Coordination only; notification receipt never grants authority. |
| Seed Vault direct dApp access | **N/A** | CRESCO uses MWA; wallet may use Seed Vault underneath. |
| SGT family identity | **N/A** | SGT is not proof of age, parenthood, or guardianship. |
| SKR | **N/A P0** | Add only if it creates real user value. |
| x402 / nanopayments | **N/A** | No requirement in locked concept. |
| Fiat/card rails | **N/A** | Out of scope. |
| Mainnet production money | **N/A P0** | Devnet truth boundary remains explicit. |
| Agent delegation | **ROADMAP** | Chain of Keys after P0. |

## Required program delta

The CLOCK IN hero path should prove an **intent mismatch**, not merely an amount mismatch.

For a payment action, the exact authorization commitment must be bound to security-relevant execution fields such as:

- Mandate account / identifier;
- Mandate nonce or version;
- action type;
- token mint;
- destination wallet/account;
- amount;
- expiry / validity;
- one-time request identifier.

The program must verify that the action executed is the action authorized.

A human-readable UI label or client-supplied hash without program-side recomputation/verification is not enough.

### Target proof

1. Key permits up to 10 units per action.
2. Young user requests 12 units to destination A.
3. Standing path: **REFUSE**.
4. Guardian grants **exactly 12 units to destination A once**.
5. Young user changes destination A → B while keeping amount 12.
6. Program: **REFUSE / action mismatch**.
7. Restore destination A.
8. Program: **ALLOW ONCE**.
9. Receipt consumed.
10. Replay: **REFUSE / already used**.
11. Standing Key version remains unchanged.

## Solana Pay role

Solana Pay is a request format, not CRESCO's authority layer.

The current Solana Pay specification can encode payment requests with:

- recipient;
- amount;
- SPL token mint;
- reference;
- label/message/memo.

CRESCO should parse the mobile request into a canonical action and route that action through the CRESCO program.

Reference:
https://solana.com/docs/tools/solana-pay/specification/version1

## Mobile failure states that must be first-class

The app must model:

- wallet not installed;
- wallet session rejected;
- signing rejected;
- RPC unavailable;
- request relay unavailable;
- guardian offline;
- request expired;
- Mandate changed while request was pending;
- action mutated after approval;
- allowance already consumed;
- transaction submitted but confirmation unknown;
- app killed and relaunched while request is pending.

Never map these into generic success/failure only.

Canonical user-visible execution states remain:

- **ALLOW**
- **REFUSE**
- **PENDING**
- **UNKNOWN**

## Privacy boundary

Do not put private family reasoning onchain.

The chain should prove only what is necessary for authority and execution.

Private coordination can live in the relay layer, including:

- human-readable reason text;
- optional learning reflection;
- notification delivery state;
- device push identifiers.

The relay cannot mint or widen financial authority.

## Technical experiments before promotion

### TRC-01 — Local MWA

On Android:

- connect;
- disconnect;
- sign-in/sign-message if used;
- sign and send a Devnet transaction;
- reject/cancel wallet approval;
- restore session after app restart.

Promotion evidence: screen recording + transaction signature + failure capture.

### TRC-02 — Exact destination binding

Program-level test:

- approve destination A;
- mutate destination to B;
- verify refusal before allowance consumption;
- restore A;
- execute;
- replay;
- verify refusal.

Promotion evidence: deterministic test + Devnet receipt.

### TRC-03 — Two-device relay

Device A creates a boundary request.

Device B independently opens the request and grants it through its own local MWA wallet.

Device A observes onchain allowance availability and retries.

Promotion evidence: two-device recording and state trace.

### TRC-04 — App lifecycle

Kill/relaunch the app in each of these states:

- before guardian response;
- after guardian grant but before retry;
- after submission but before confirmation.

No duplicate spend and no fake confirmed state.

### TRC-05 — Release APK

Produce a signed non-debug APK and install it on a clean Android test device.

Promotion evidence: APK artifact + clean install + MWA test.

## Promotion condition

Technical Reality Check moves from **PASS WITH REQUIRED DELTAS** to **PROVEN MOBILE VERTICAL SLICE** only when TRC-01 through TRC-05 are evidenced.

No claim may be promoted because the UI simulates the state.
