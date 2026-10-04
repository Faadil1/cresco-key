# Distinct CRESCO Key Devnet Program Gate

Status: **PROVEN — protected Devnet deploy/bootstrap succeeded**

Primary gate:

`LIVE_CORE_G0 — DISTINCT CRESCO KEY DEVNET PROGRAM DEPLOYMENT + BOOTSTRAP`

This gate deliberately separates **private key custody** from **public program identity**. It is now complete at `LIVE_INTEGRATION` scope, while the Live Core Loop remains unproven.

## Observed receipt

- GitHub Actions run: `37182728261`
- Source commit: `0db1f52ff35961fdd1191cff61f8324fe470f504`
- Network: `devnet`
- Program id: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- Deployment signature: `5o2zN6qo9KY9Jhz5VNuuvaRr95p7gdSj858e28nW1PRDYHgpPx88uE2y4Kw4Funh4bzm3evEicmAY1Pf5Ygej2g8`
- Program binary SHA-256: `7f45c16253e886160f9c9242edb46ab45c868e2d36767192b8d76e9db605a77c`
- Artifact: `https://github.com/Faadil1/cresco-key/actions/runs/37182728261/artifacts/11295688079`
- Artifact digest: `sha256:45c8031ed62c0b218e865b51ee1e855f8e8e26868c55e1a21af5695b46f3f819`
- Receipt generated at: `2026-10-04T06:32:26.208Z`

Deterministic bootstrap output:

- status: `READY_FOR_MOBILE_RUNTIME`
- guardian: `Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov`
- beneficiary: `DD1T86b6vSJd7avUVn23f8TaZxdKEzjRF14XzgffDRSZ`
- charter: `9FjR5U3ELz6oRmMJN8VoH6M2795bBSnkEN6kgz7Y8ZQS`
- mandate: `C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE`
- mint: `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`

Truth boundary preserved by the receipt:

`distinctProgramDeployed`: true
`deterministicPaymentStateReady`: true
`mobileCrescoTransactionProven`: false
`fullLiveCoreLoopProven`: false
`physicalAndroidProven`: false
`productionWalletCompatibilityProven`: false

## Why this was split

The deployed Solana program must be bound to a source commit. Therefore CRESCO Key did **not** patch `declare_id!` only inside an ephemeral CI runner and then call that deployment commit-bound.

The completed sequence was:

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

The completed one-time setup path was a private GitHub Codespace or equivalent trusted browser shell.

Run from the repository:

```bash
bash scripts/seed-devnet-repo-secrets.sh
```

The helper:

- installs the official Solana CLI v2.3.0 only when needed;
- creates three Devnet-only keypairs outside the repository;
- stores them as encrypted GitHub repository secrets through `gh secret set`;
- prints **public addresses only**.

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

This deployment + bootstrap promotes:

- distinct CRESCO Key Devnet program deployment;
- program id ↔ source commit binding;
- deterministic public demo state readiness.

It still does **not** by itself prove the Live Core Loop. The next proof must come from the real mobile CRESCO authority/payment path against this deployed program and deterministic state.
