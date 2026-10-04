# Devnet payment-demo bootstrap

This tool prepares deterministic public Devnet state for the CRESCO Key CLOCK IN hero path.

It does **not** create or store production credentials.

## Prerequisites

1. A distinct CRESCO Key program id has already been provisioned and deployed to Devnet.
2. Run `anchor build` after the new `declare_id!` is set so `target/idl/keys.json` matches the deployed program.
3. Two **distinct Devnet-only** keypairs exist outside the repository:
   - guardian;
   - beneficiary / young person.
4. The guardian has enough Devnet SOL to create accounts and the demo SPL mint.

The beneficiary keypair is required only to consent/sign the initial Charter creation if that Charter does not already exist.

Never commit either keypair.

## Install

From `tools/devnet`:

```powershell
npm install
```

## Run from the repository root

PowerShell:

```powershell
$env:ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com"
$env:ANCHOR_WALLET = "$HOME\.config\solana\guardian-devnet.json"
$env:CRESCO_GUARDIAN_KEYPAIR = "$HOME\.config\solana\guardian-devnet.json"
$env:CRESCO_BENEFICIARY_KEYPAIR = "$HOME\.config\solana\beneficiary-devnet.json"
$env:CRESCO_KEY_EXPECTED_PROGRAM_ID = "<NEW_CRESCO_KEY_PROGRAM_ID>"
node .\tools\devnet\bootstrap-payment-demo.cjs
```

The tool refuses to run if the active program id is still the original CRESCO Devnet program.

## What it creates

- Charter bound to a distinct guardian and beneficiary;
- active BOUNDED Mandate;
- demo SPL token with 6 decimals;
- AssetRule:
  - transfer enabled;
  - 10-token per-action standing boundary;
  - 100-token period boundary;
- program vault funded with 100 demo tokens;
- recipient A + valid ATA;
- recipient B + valid ATA for the hostile changed-recipient test;
- Solana Pay QR strings for:
  - 5-token in-bounds action;
  - 12-token boundary action;
  - 12-token changed-recipient hostile action.

The public runtime receipt is stored by default at:

`~/.config/solana/cresco-key-demo-state.json`

The file contains public addresses/config only. It does not contain private keys.

## Why recipient B gets an ATA

The hostile changed-recipient transaction must reach the CRESCO Key program far enough to prove `PaymentAllowanceRecipientMismatch`.

If recipient B had no token account, the runtime could fail earlier during account validation and produce only an unrelated/UNKNOWN failure. Creating both ATAs makes the negative proof deterministic.

## Promotion rule

`READY_FOR_MOBILE_RUNTIME` is setup evidence only.

It becomes hero-flow evidence only after the mobile client produces real Devnet transaction signatures for ALLOW and the required REFUSE cases.

## Generate mobile G1 environment

After the distinct Devnet deploy/bootstrap run is recorded, generate the mobile runtime environment from the public receipt:

```bash
node tools/devnet/write-mobile-env-from-demo-state.cjs \
  evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json \
  apps/mobile/.env
```

The generated file contains public Devnet addresses and Solana Pay intents only. It does not contain private key material.

This enables the mobile app's deterministic G1 helpers:

- 5-unit in-bounds intent;
- 12-unit boundary intent;
- changed-recipient hostile intent.

The generated configuration is still not a Live Core Loop receipt. Promotion requires wallet-mediated mobile transactions against the deployed program.
