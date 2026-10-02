# Distinct CRESCO Key Devnet Live Gate

Status: **ACTIVE — LIVE_CORE_G0**

This is the load-bearing runtime gate after Engineering Quality Assurance.

The target chain is:

`HUMAN-CONTROLLED DISTINCT PROGRAM KEY → PUBLIC PROGRAM ID PREFLIGHT → COMMIT PUBLIC ID → DEVNET DEPLOY → DEPLOYMENT RECEIPT / COMMIT BINDING → DETERMINISTIC PAYMENT BOOTSTRAP → REAL MOBILE CRESCO ACTION`

## Protected human boundary

Private key material is never committed to git, copied into public evidence, or pasted into project documentation.

The GitHub Actions workflow consumes Devnet-only keypairs from repository Actions secrets that the human repository owner controls.

Required secrets:

- `CRESCO_KEY_PROGRAM_KEYPAIR_JSON`
- `CRESCO_GUARDIAN_KEYPAIR_JSON`
- `CRESCO_BENEFICIARY_KEYPAIR_JSON`

All three are expected to be standard 64-byte Solana keypair JSON arrays.

The program keypair and guardian/beneficiary keypairs must be Devnet-only for this P0 evidence path.

## Workflow

Workflow:

`.github/workflows/cresco-key-devnet-live-gate.yml`

It is **workflow_dispatch only**. A protected external action does not run merely because code was pushed.

Available phases:

### 1. `inspect_program_id`

Requires only:

- `CRESCO_KEY_PROGRAM_KEYPAIR_JSON`

The job derives the **public** program id, hard-stops if it equals the original CRESCO program id, and emits only a public preflight receipt.

It does not deploy anything.

After this phase succeeds, commit the public program id into:

- `programs/keys/src/lib.rs` → `declare_id!`
- `Anchor.toml` → `[programs.devnet]`

Do not run `deploy_program` until those committed public values match the protected keypair.

### 2. `deploy_program`

Requires:

- `CRESCO_KEY_PROGRAM_KEYPAIR_JSON`
- `CRESCO_GUARDIAN_KEYPAIR_JSON`

The guardian Devnet keypair acts as the deployer / fee payer for this evidence path.

The workflow:

1. installs pinned Agave/Solana CLI `v2.3.0` from the official Anza release and verifies its published SHA-256;
2. installs pinned Anchor CLI `v0.32.1`;
3. derives the protected program public id;
4. refuses the original CRESCO id;
5. refuses if committed `declare_id!` or `[programs.devnet]` does not match the protected program id;
6. builds the program;
7. deploys to Devnet;
8. runs `solana program show`;
9. emits a public deployment receipt with program id, binary SHA-256, source commit, public deployer address and available deployment signature.

The workflow never uploads the keypair files.

### 3. `bootstrap_payment_state`

Requires:

- `CRESCO_GUARDIAN_KEYPAIR_JSON`
- `CRESCO_BENEFICIARY_KEYPAIR_JSON`

The workflow:

1. reads the committed distinct program id;
2. hard-stops if the original CRESCO id is still active;
3. requires distinct guardian and beneficiary wallets;
4. rebuilds the program / IDL;
5. runs `tools/devnet/bootstrap-payment-demo.cjs`;
6. emits public deterministic state for:
   - Charter;
   - active BOUNDED Mandate;
   - demo SPL mint;
   - 10-token standing action boundary;
   - 100-token period boundary;
   - funded program vault;
   - recipient A and recipient B canonical ATAs;
   - 5-token in-bounds payment intent;
   - 12-token boundary payment intent;
   - 12-token changed-recipient hostile payment intent.

`READY_FOR_MOBILE_RUNTIME` remains setup evidence only.

## Evidence classes

A successful `inspect_program_id` proves only that a protected keypair maps to a distinct public program id.

A successful `deploy_program` may promote:

- distinct CRESCO Key program deployment on Devnet;
- committed program-id match;
- build/deployment receipt;
- source-commit → deployment binding.

It does **not** prove the product Live Core Loop.

A successful `bootstrap_payment_state` may promote deterministic Devnet setup readiness.

It does **not** prove:

- real mobile CRESCO payment execution;
- guardian Allow Once runtime;
- changed-recipient refusal;
- replay refusal;
- physical Android;
- production-wallet compatibility;
- production/mainnet readiness.

## Failure handling

Failure remains evidence.

Do not:

- patch the source program id only inside the runner and narrate it as commit-bound deployment;
- use the original CRESCO program id;
- print private key JSON;
- upload keypair files as artifacts;
- bypass a mismatch guard;
- use a failed deployment as a LIVE claim;
- treat bootstrap readiness as real user action.

## Exact next transition

Once deployment + bootstrap are both observed and bound:

`REAL MOBILE CRESCO ACTION → 5 ALLOW → 12 REFUSE → GUARDIAN ALLOW ONCE → CHANGED RECIPIENT REFUSE → EXACT ALLOW ONCE → REPLAY REFUSE → STANDING KEY UNCHANGED`

That is the beginning of the first real Live Core Slice and activates the post-slice Product Exploitation / Depth Gap loop.
