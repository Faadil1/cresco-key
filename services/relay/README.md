# CRESCO Key Boundary Relay

Private coordination service for the two-device boundary flow.

## Security role

The relay is **not** financial authority.

It can:

- hold private human-readable request context;
- route a boundary request between devices;
- report that a guardian submitted an allowance transaction;
- record an offchain refusal;
- expire private request metadata.

It cannot:

- ALLOW capital movement;
- widen a Mandate;
- create an `AllowanceReceipt`;
- consume an allowance;
- turn a pending or unknown onchain result into confirmed success.

The Solana program remains the authority.

## Capability privacy

Each request is addressed by a 32-byte request id and protected by a random 32-byte bearer capability.

Only the SHA-256 hash of the relay token is stored in the Durable Object.

The token is returned only when the request is created. P0 clients may carry it in a secure deep link between the young-user and guardian experiences.

This protects request metadata from casual enumeration. Production hardening may split requester/guardian capabilities and add wallet-authenticated access.

## State semantics

Relay coordination state is monotonic:

`PENDING → REFUSED | ALLOWANCE_SUBMITTED | EXPIRED`

Once a request leaves `PENDING`, later bearer-capability events cannot rewrite that terminal coordination state.

Expiry is checked before reads and event application. A request at or beyond its `expiresAt` second becomes `EXPIRED` before a later coordination event can move it forward.

`ALLOWANCE_SUBMITTED` is only a marker that a guardian transaction was confirmed and reported to the relay. It is **not** an ALLOW decision and does not execute the payment.

## API

### Health

`GET /health` returns a lightweight liveness response. It does not prove the relay is deploy-ready.

### Readiness

`GET /ready` verifies that the required Durable Object binding is configured.

- `200` means the relay has the expected coordination binding.
- `503` means the relay must fail closed because the binding is missing.

This is an operator readiness check only. It does not prove mobile G1, a live CRESCO transaction, or financial authority.

### Create

`POST /v1/requests`

Required:

- `requestId` — 64 hex chars;
- `mandate`;
- `mandateNonce` — integer string;
- `mint`;
- `recipient` — Solana Pay recipient wallet;
- `amountBaseUnits` — positive integer string;
- `requesterWallet`;
- `guardianWallet`.

Optional:

- `expiresAt` — future Unix seconds;
- private `display.label`;
- private `display.reason`.

A create request whose `expiresAt` is already reached is rejected as `INVALID_EXPIRES_AT`.

Response returns the request plus a one-time `relayToken`.

### Read

`GET /v1/requests/:requestId`

Header:

`Authorization: Bearer <relayToken>`

### Record coordination event

`POST /v1/requests/:requestId/events`

Allowed event types:

- `GUARDIAN_OPENED`
- `REFUSED`
- `ALLOWANCE_SUBMITTED`
- `EXPIRED`

`ALLOWANCE_SUBMITTED` requires the guardian transaction signature.

It deliberately does **not** mean the payment is allowed. The child client must verify the relevant onchain allowance/program state before retrying.

## Local

```bash
npm install
npm test
npx wrangler dev
```

## Deployment

Deployment is intentionally separate from code merge. Configure Cloudflare account access outside git, then deploy with Wrangler.

No FCM/APNs credential is committed here.
