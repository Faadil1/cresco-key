# CRESCO Key — Demo-First Architecture

Status: **LOCKED FOR P0 IMPLEMENTATION**  
Depends on: `product/PRD.md`, `docs/TECHNICAL-REALITY-CHECK.md`

## Demo sentence

> A young person acts freely inside a standing Key. At the boundary, a guardian can authorize one exact action from another phone without moving the standing boundary.

## The three things the demo must prove

1. **Autonomy is real** — an in-bounds action does not require guardian approval.
2. **The boundary is real** — an out-of-bounds action fails in the capital path.
3. **Consent is exact** — a one-time exception cannot be changed, reused, or silently widened.

Everything else is secondary.

## P0 architecture

```text
                 ┌─────────────────────────┐
                 │   Payment QR / deeplink │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │ Young user Android app  │
                 │ React Native / Expo     │
                 │ parse exact action      │
                 └────────────┬────────────┘
                              │
                        local MWA
                              │
                              ▼
                 ┌─────────────────────────┐
                 │ Young user's wallet     │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │ CRESCO Solana program   │
                 │ standing Key evaluation │
                 └───────┬─────────┬───────┘
                         │         │
                    IN BOUNDS   BOUNDARY
                         │         │
                         ▼         ▼
                      ALLOW     REFUSE
                         │         │
                    execute       └──────► private boundary request
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Relay / notification   │
                                  │ coordination only      │
                                  └──────────┬─────────────┘
                                             │
                                             ▼
                                  ┌────────────────────────┐
                                  │ Guardian Android app   │
                                  │ exact request review   │
                                  └──────────┬─────────────┘
                                             │
                                         local MWA
                                             │
                                             ▼
                                  ┌────────────────────────┐
                                  │ Guardian wallet        │
                                  └──────────┬─────────────┘
                                             │
                                             ▼
                                  grant exact allowance
                                             │
                                             ▼
                                  ┌────────────────────────┐
                                  │ AllowanceReceipt       │
                                  │ onchain, unused        │
                                  └──────────┬─────────────┘
                                             │
                     ┌───────────────────────┘
                     ▼
          Young app refreshes allowance
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   action mutated            exact action
       REFUSE                 ALLOW ONCE
                                 │
                                 ▼
                              USED
                                 │
                                 ▼
                         replay → REFUSE
```

## Trust boundaries

### Onchain authority

Must decide:

- standing ALLOW/REFUSE;
- exact allowance validity;
- action mismatch;
- stale Mandate/nonce;
- expiry;
- used/replay;
- capital movement.

### Mobile clients

May:

- collect user intent;
- scan/parse payment requests;
- present human-readable context;
- request wallet signing;
- show receipts.

Must not be trusted to decide authorization.

### Relay

May:

- deliver request metadata;
- manage push/deep-link routing;
- store private explanation/context;
- signal that an onchain allowance may now exist.

Must not:

- approve;
- widen;
- consume;
- fabricate confirmed execution.

### Wallet

Owns the user's local signing approval flow.

CRESCO does not read private keys.

## Canonical action model

P0 action:

```ts
type PaymentAction = {
  kind: "PAYMENT";
  mandate: string;
  mandateNonce: bigint;
  mint: string;
  destination: string;
  amountBaseUnits: bigint;
  requestId: string;
};
```

The exact allowance must bind the material fields.

Display metadata such as merchant label or image may be private/offchain, but it must never replace the cryptographic destination.

## Hero sequence

### Scene 1 — "Your Key"

Show only what matters:

- available asset;
- standing per-action limit;
- period status;
- plain-language state.

Do not begin with guardian administration.

### Scene 2 — Independent action

Scan/receive 5-unit payment.

Young user approves locally.

Result:

**ALLOWED BY YOUR KEY**

Show confirmed Devnet receipt.

### Scene 3 — Boundary

Scan/receive 12-unit payment.

Result:

**OUTSIDE YOUR KEY**

Explain:

> Your Key allows up to 10 per action.

Primary CTA:

**Ask for this exact action**

Secondary:

**Adjust**

### Scene 4 — Guardian phone

Exact request card:

- amount;
- asset;
- destination / verified display label if available;
- standing limit;
- exact-one-use language.

Actions:

- Not this time
- Allow once
- Widen Key

Hero path chooses **Allow once**.

Wallet handles signing.

### Scene 5 — Mutation attack

Before retry, mutate one material field.

Preferred: destination.

UI may still look plausible.

Program returns:

**REFUSE — action does not match approval**

This is the judge-memory moment.

### Scene 6 — Exact execution

Restore original action.

Execute.

Show:

- confirmed signature;
- allowance = USED;
- standing Key still unchanged.

### Scene 7 — Replay

Retry.

**REFUSE — permission already used**

End card:

> One request. One exact approval. One successful use.

> The exception moved. The boundary did not.

## Mobile UX requirements

- no desktop-style multi-column admin dashboard;
- thumb-reachable primary actions;
- no raw pubkeys as the first-line UX;
- exact details always reachable before signing;
- state restoration after app/process death;
- no artificial countdown urgency;
- no guardian push spam;
- no confetti or spending streaks;
- motion only for boundary, causality, continuity, exception travel, and consumption.

## P0 screens

Young user:

1. Connect / identify wallet
2. My Key
3. Scan / receive payment intent
4. Review payment
5. Boundary
6. Pending request
7. Exact exception ready
8. Receipt / refusal proof

Guardian:

1. Connect / identify wallet
2. Boundary request inbox
3. Exact request review
4. Allow once / refuse / widen
5. Grant receipt

For hackathon P0, these may exist in one APK with explicit role entry points, while still proving two distinct wallet/device sessions.

## Evidence capture

Every hero beat should produce a machine-verifiable record.

| Beat | Evidence |
|---|---|
| in-bounds | Devnet signature |
| boundary | program error / deterministic refusal |
| guardian grant | grant transaction + allowance account |
| mutation | mismatch refusal before use |
| exact execution | confirmed signature |
| consumed | allowance `used=true` |
| replay | already-used refusal |
| unchanged standing authority | same Mandate version/nonce before and after Allow Once |

## Definition of demo-ready

The vertical slice is demo-ready only when the full sequence can be repeated without manual database editing, hidden signer substitution, or narration needed to explain why each state is true.
