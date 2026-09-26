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

## API

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

- `expiresAt` — Unix seconds;
- private `display.label`;
- private `display.reason`.

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
