# G1 Android physical session — observed unsigned payment boundary

Session: 2026-10-07 local / 2026-10-08T02:55–03:00Z
Evidence source: user-provided physical Samsung screen photos and public CRESCO JSON receipts (retained in original chat, not uploaded as canonical transaction proof here).
Truth classes: **OBSERVED / PHYSICAL_CLIENT**, **NOT LIVE_PAYMENT**.

## What was observed

- Museum Ledger standalone APK opened without Expo's development-server launcher on a physical Samsung Android phone.
- Solflare returned to the connected CRESCO screen on `solana:devnet`; an app-local TRC-01 signing receipt recorded `SIGNED` and 64 returned bytes. **Independent signature verification not performed.**
- A deterministic 5-unit intent was loaded from the provisioned demo state.
- Solflare presented an **unrecognized app domain** `replace_with_verified_app_domain` and **failed transaction simulation**. No confirmation of what specific on-chain accounts failed is available from the screenshot alone.
- After cancellation, CRESCO generated a public `STANDING_PAYMENT` receipt with `state=UNKNOWN`, `signature=null`, `relay=null`, `java.util.concurrent.CancellationException`.
- Therefore **no on-chain payment, balance movement, trusted program REFUSE, allowance, or end-to-end G1 completion is demonstrated**. The ledger receipt is a client observation, not a financial transaction receipt.

## Material cause found in source

`evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json` binds a charter/mandate to original public beneficiary `DD1T86…DRSZ`, whereas the newly created Samsung wallet uses a **different** public address `BW5dW…ySkT`. The mobile builder derives its charter PDA from the currently connected wallet; the old public nonce, vault and asset rule cannot be used as authority for a new beneficiary. This is a configuration mismatch evidenced by GitHub and the receipt, **not yet an independently traced explanation of the wallet cancellation**. Other possible contributors include unknown wallet identity, insufficient SOL Devnet, or wallet simulation behavior.

## PR #59 product repair

- Generator now supplies `EXPO_PUBLIC_DEMO_BENEFICIARY_WALLET` (public only) alongside the configured nonce.
- Young payment flow detects mismatched/missing beneficiary and **fails closed before Mobile Wallet Adapter signing**, displaying a `BLOCKED` provisioning panel.
- An opt-in safe `PRECHECK_BLOCKED` receipt can record `transactionSubmitted:false`, `signature:null`. This is a configuration check, not an observed program refusal.
- Native UI now distinguishes `UNKNOWN`, `BLOCKED`, `PENDING`, and `REFUSED`; the prior UNKNOWN-with-PENDING-badge is resolved in source.
- Distinct real provisioning **not performed**: a new `initialize_charter` requires both authorized beneficiary and guardian signers, then a guardian-initialized mandate and asset rules/vault/token setup. No private key material is copied from CI to a friend's phone.

## Remaining blockers / next action

1. Finish PR #59 CI + build new standalone configured APK. Historical APK does **not** include the preflight fix.
2. Set an app identity URI on a **domain genuinely controlled and verified for the Android application**; do not use a placeholder or claim trust verification without the real association asset.
3. For the new Samsung beneficiary, create an authorized distinct Devnet charter, mandate and test vault with real consenting signers (or use a matching, separately controlled Devnet wallet); do not bypass custody or account-signature rules.
4. Confirm SOL Devnet balance for fees, expected token ATA and current mandate nonce before signing; do not use mainnet funds.
5. On next protected physical payment test, require user/operator confirmation and preserve console/RPC evidence and exact transaction signature. If `UNKNOWN` again, investigate logs and do not blindly retry.
6. Only after successful in-bounds payment, attempt negative boundary, guardian exact allowance, changed recipient and replay tests. Relay live remains a separate deployment gate.

## Drift/truth update

`material_user_capability_delta_since_previous_milestone=PHYSICAL_ANDROID_APP_LAUNCH_MWA_CONNECTION_MESSAGE_SIGNATURE_OBSERVED; PAYMENT_NONE`.
`first_live_slice_proven=false`.
`current_primary_workstream=PRODUCT_EXPLOITATION`.
`exact_next_gate=G1_ACCOUNT_PROVISIONING_AND_IDENTITY_PRECHECK_THEN_PHYSICAL_PAYMENT`.
`workstream_drift_status=CLEAR_FOR_RUNTIME_REPAIR`.
`blocked_transition=LIVE_CORE_G1 / SUBMISSION_READY`.
`valid_stop_condition=AUTHORIZED_DEVNET_SIGNERS_AND_VERIFIED_IDENTITY_NOT_YET_AVAILABLE`.
