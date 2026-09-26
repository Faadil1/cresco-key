# Solana program — CRESCO Key payment delta

This program is derived from the proven `Faadil1/cresco` authority program so the CLOCK IN build does not silently discard the existing Mandate, stale, replay, and Allow Once semantics.

## Deployment safety

**DO NOT DEPLOY THIS BRANCH TO DEVNET YET.**

The Rust source temporarily retains the original CRESCO `declare_id!` only so the inherited program compiles before a distinct CRESCO Key program identity is provisioned.

`Anchor.toml` deliberately defines **Localnet only**.

Before any Devnet deployment:

1. generate a new CRESCO Key program keypair outside git;
2. replace `declare_id!` with the new public key;
3. add the new Devnet mapping to `Anchor.toml`;
4. confirm the original `Faadil1/cresco` Devnet program remains untouched;
5. record the new program id in the PRD/evidence.

## P0 delta

New instructions:

- `execute_payment_within_mandate`
- `grant_payment_allowance_once`
- `execute_payment_once`

The exact one-time payment stores explicit:

- mint;
- destination token account;
- exact amount;
- Mandate nonce;
- request id;
- expiry;
- used state.

A destination or amount mutation refuses before the allowance is consumed.
