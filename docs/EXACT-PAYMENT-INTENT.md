# Exact Payment Intent — P0 Contract Semantics

Status: **IMPLEMENTED IN PR #7 / RUNTIME EVIDENCE PENDING**

This document is the shared semantic contract for CLOCK IN's hero payment path.

## Why this exists

The original CRESCO proof already established exact one-time authorization by notional amount, including:

- one request;
- changed amount refusal;
- one successful use;
- replay refusal;
- unchanged standing Mandate.

CLOCK IN requires a more legible mobile proof:

> Guardian approved this payment to this recipient. A changed recipient does not inherit that approval.

The program must enforce that statement independently of the UI.

## Standing payment

`execute_payment_within_mandate(amount, expected_nonce)`

Standing authority remains defined by:

- active Mandate;
- current Mandate nonce;
- permitted transfer action;
- enabled AssetRule;
- per-action amount;
- per-period amount;
- correct mint.

The beneficiary signs the payment instruction.

The recipient may be any valid token account for the configured mint in P0.

Future recipient allowlists are a separate policy dimension and are not implied by this implementation.

## Boundary request

The private relay may carry a human-readable request, but it is not authority.

A P0 boundary request ultimately maps to these security-relevant values:

- Mandate;
- Mandate nonce;
- mint;
- Solana Pay recipient wallet;
- exact amount;
- request id;
- expiry.

The request id is an identifier, not a substitute for action validation.

## Guardian grant

`grant_payment_allowance_once(request_id, expected_nonce, amount, expires_at)`

The guardian transaction creates a `PaymentAllowanceReceipt`.

The receipt stores explicit program state:

```text
mandate
guardian
beneficiary
mint
recipient
amount_base_units
request_id
mandate_nonce
expires_at
used
used_at
```

The standing Mandate is not advanced or rewritten by this instruction.

## Exact execution

`execute_payment_once(request_id, expected_nonce, amount)`

Before capital movement, the program requires:

1. active Mandate;
2. current Mandate nonce;
3. transfer action allowed by the AssetRule;
4. allowance not used;
5. allowance nonce equals the current expected nonce;
6. allowance not expired;
7. request id matches;
8. actual amount exactly equals approved amount;
9. actual Solana Pay recipient wallet exactly equals approved recipient;
10. mint matches.

Only after those checks does the vault transfer occur.

The allowance is marked `used=true` only after the transfer succeeds. Solana transaction atomicity prevents a failed transfer from leaving a consumed allowance behind.

## Mutation behavior

| Mutation | Expected result | Allowance consumed? |
|---|---|---|
| Amount 12 → 11 | REFUSE | No |
| Amount 12 → 13 | REFUSE | No |
| Destination A → B | REFUSE | No |
| Mint A → B | REFUSE / account mismatch | No |
| Mandate nonce changes | REFUSE stale | No |
| Expiry passes | REFUSE expired | No |
| Original exact action | ALLOW once | Yes |
| Replay exact action | REFUSE already used | Already used |

## What this does not claim

P0 does not yet enforce:

- merchant identity;
- merchant category;
- geolocation;
- legal age;
- parenthood;
- recipient reputation;
- fiat settlement;
- card-network acceptance.

Those may inform future policy but must not be implied by the exact-payment proof.

## Judge-safe statement

> The guardian approves one exact payment. Changing the amount or recipient does not inherit that approval, and successful use does not widen the standing Key.


## Solana Pay alignment

Solana Pay transfer-request URLs encode the **recipient wallet** as the URL pathname. For SPL-token requests, the canonical associated token account (ATA) is derived from the recipient wallet and the `spl-token` mint.

CRESCO Key therefore binds the guardian's exact exception to the Solana Pay recipient wallet, not to a client-selected arbitrary token account. At execution, the program derives the recipient's canonical ATA for the active Token/Token-2022 program and refuses any different token-account destination.

This removes a client-side ambiguity: the UI cannot keep the approved recipient label while silently routing the vault transfer to another token account.
