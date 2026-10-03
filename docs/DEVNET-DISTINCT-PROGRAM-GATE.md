# Distinct CRESCO Key Devnet Program Gate

Status: **ACTIVE — protected human setup required**

Primary gate:

`LIVE_CORE_G0 — DISTINCT CRESCO KEY DEVNET PROGRAM DEPLOYMENT + BOOTSTRAP`

This gate deliberately separates **private key custody** from **public program identity**.

## Why this is split

The deployed Solana program must be bound to a source commit. Therefore CRESCO Key does **not** patch `declare_id!` only inside an ephemeral CI runner and then call that deployment commit-bound.

The correct sequence is:

1. human provisions Devnet-only private key material into encrypted GitHub repository secrets;
2. only the **public program id** is surfaced;
3. the public id is committed into `programs/keys/src/lib.rs` and `Anchor.toml`;
4. CI verifies the committed public id exactly matches the secret-backed program keypair;
5. CI builds and deploys that exact commit;
6. deployment evidence binds runtime → receipt → commit → program id;
7. deterministic payment state is bootstrapped with distinct guardian/beneficiary Devnet wallets.

## Required repository secrets

- `CRESCO_KEY_PROGRAM_KEYPAIR_JSON`
- `CRESCO_GUARDIAN_KEYPAIR_JSON`
- `CRESCO_BENEFICIARY_KEYPAIR_JSON`

These contain Devnet-only keypairs and must never be committed, uploaded as public artifacts, printed in logs, or pasted into chat.

## Browser/Codespaces setup

For a user working from a managed/office computer, the intended one-time setup is a private GitHub Codespace or equivalent trusted browser shell.

Run from the repository:

```bash
bash scripts/seed-devnet-repo-secrets.sh
```

The helper:

- installs the official Solana CLI v2.3.0 only when needed;
- creates three Devnet-only keypairs outside the repository;
- stores them as encrypted GitHub repository secrets through `gh secret set`;
- prints **public addresses only**.

After it finishes, provide only the printed **PUBLIC PROGRAM ID** to the CRESCO Key workstream.

## Hard safety stops

Deployment must fail if:

- the secret-backed program id equals the original CRESCO id
  `ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`;
- committed `declare_id!` differs from the secret-backed program id;
- committed `[programs.devnet]` differs from the secret-backed program id;
- guardian and beneficiary are the same key;
- required secrets are absent;
- build/deployment does not complete;
- independent `solana program show` verification fails.

## Evidence class

A successful deployment + bootstrap may promote:

- distinct CRESCO Key Devnet program deployment;
- program id ↔ source commit binding;
- deterministic public demo state readiness.

It still does **not** by itself prove the Live Core Loop. The next proof must come from the real mobile CRESCO authority/payment path.
