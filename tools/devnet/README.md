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

## Validate mobile G1 receipts

After exporting the public mobile receipts from the app, validate the folder before reviewing any G1 promotion:

```bash
npm --prefix tools/devnet run validate-mobile-g1 -- path/to/mobile-g1-receipts
```

For CI or artifact processing, emit machine-readable output:

```bash
npm --prefix tools/devnet run validate-mobile-g1 -- --json path/to/mobile-g1-receipts
```

The validator checks for the required receipt coverage:

- signed wallet proof;
- 5-unit standing payment ALLOW with a transaction signature;
- 12-unit boundary payment REFUSE;
- boundary request creation;
- guardian Allow Once ALLOW with a grant signature;
- changed-recipient mutation REFUSE;
- exact approved execution ALLOW with a transaction signature;
- replay REFUSE after allowance consumption.

It also fails if exported receipts contain key names that look like private key, seed phrase, mnemonic, keypair, recovery, or secret material.

Passing validation means the receipt set is ready for human G1 evidence review. It does not by itself prove physical Android runtime, production wallet compatibility, or Devnet account-state changes.


## Borrowed-phone test: signer provenance and hard stop

The bootstrap script above requires **actual local secret-key files for both Guardian and Beneficiary** and signs `initializeCharter` with both roles. A public address copied from Solflare is **not a substitute for either signature**. Do not ask the phone owner to export a recovery phrase, do not use their personal wallet key material, and do not copy CI/legacy demo keypairs into the borrowed device.

For a repeatable phone test, arrange two consenting participants with separate **Devnet-only test wallets**. If their wallets cannot securely sign the Charter initialization using an approved supported workflow, mark `AUTHORIZED_PROVISIONING=BLOCKED` and do not attempt to attach the phone's beneficiary address to the historical charter. The current script is a **local-keypair developer bootstrap**, not a Mobile Wallet Adapter guardian/beneficiary onboarding flow.

The generated APK environment is bound to the public state of that specific authorized provisioned family. Regenerate the environment and APK only after that state exists; `READY_FOR_MOBILE_RUNTIME` remains **setup**, not wallet, transaction or full product evidence. The environment generator now rejects any state whose `network` is not exactly `devnet` and rejects the original legacy program ID. Custom RPC URLs still require independent cluster verification.

For the required physical runtime and evidence/stop criteria, see [the Samsung G1 runbook](../../docs/G1-PHYSICAL-SAMSUNG-OBSERVATION-2026-10-07.md).


## Build a new family-bound integrated APK candidate

The default Mobile APK Evidence workflow compiles a **historical demo-family test build**. Its green status does not prove live relay, verified Android identity, or compatibility with a newly connected wallet.

Once the user has legitimately provisioned the **actual Guardian and Beneficiary** on Devnet (using their authorized signatures, never their personal seed phrases), store only the resulting **public** state JSON under `evidence/devnet-distinct-program/` on the intended build branch. Confirm that the state contains the actual beneficiary and the expected program, mint, nonce, and Solana Pay intents.

The [Mobile APK Evidence GitHub Actions workflow](../../.github/workflows/mobile-apk-evidence.yml) supports manual **Run workflow** inputs:

- `integrated_candidate: true` (requires both public HTTPS origins, fail-closed)
- `devnet_state_path`: the checked-in public receipt for **this** newly authorized family
- `app_identity_uri`: the project's controlled HTTPS origin with independently confirmed Android Digital Asset Links
- `boundary_relay_url`: the actually deployed and operator-verified Cloudflare relay HTTPS origin

Only public origins and public state are bundled. **Never place any API token, wallet private key, recovery phrase, relay bearer capability, or secret into these inputs.** This build does not initiate any wallet signing or deploy a program.

The environment generator validates syntax, rejects known placeholder/non-HTTPS origins, and refuses an integrated build when either origin is missing. It **cannot itself prove ownership or assetlinks association, confirm the relay is running, or establish the cluster behind a custom RPC URL**. Independently check those facts first.

The standalone artifact includes a receipt identifying the built public beneficiary and state source, as well as whether both origins were configured; `integrationRuntimeVerified=false` intentionally remains until the subsequent real device/wallet/relay/onchain scenario succeeds.

**Stop criteria:** if no authorized new family state, no truly verified identity, or no deployed relay, use the historical artifact only as `BUILD_CONFIGURATION/LOCAL_PARTIAL` evidence. Do not describe it as an integrated/ready-to-use new-family APK. For a phone test, compare the connected wallet's public address to the receipt beneficiary **before sending anything**.
