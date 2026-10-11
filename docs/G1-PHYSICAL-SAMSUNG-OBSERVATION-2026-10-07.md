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


## Next physical Samsung session — operator runbook (2026-10-11)

**Status: PREPARATION ONLY / NOT G1 PROOF.** This checklist does not assert that any new wallet, account, payment, refusal, or guardian authorization has succeeded. Do not promote the application to SUBMITTED or COMPLETE based on this document.

### Before borrowing the device

1. Record the **exact intended APK commit, successful release APK workflow run, artifact ID and SHA-256 digest**. Install that artifact, not an earlier APK or a Metro-dependent debug binary. Check that the compiled environment targets `solana:devnet`, the deployed CRESCO program ID `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`, and the intended public app-identity URI.
2. Resolve issue #6 by using a **domain actually controlled by the project** and independently verifying app-domain association; never use `replace_with_verified_app_domain`. If this cannot be done, retain the identity warning and explicitly mark compatibility as blocked or partial. Never instruct an operator to disregard wallet security warnings.
3. Ask the device owner for informed consent to install the APK and conduct **Devnet-only** wallet tests. Prefer a separate test wallet controlled by consenting participants. Never request seed phrases, export private keys, use CI/demo keypairs on the borrowed phone, or mix Mainnet funds with test funds.
4. Obtain two legitimate consenting signers for Guardian and Beneficiary roles, and record **public addresses only**. The exact beneficiary connected in the app must match the beneficiary bound to the on-chain charter; do not reuse the historical demo charter for a different wallet.
5. Using the legitimate signer-authorized provisioning flow, create the charter, mandate, asset rule, token/vault accounts, and demo token balance for this actual beneficiary. Record public transaction signatures and read-only RPC-confirmed account addresses. **If such a provisioning flow is not available, STOP and classify `G1=BLOCKED`; do not forge state or claim a verified live loop.**
6. Confirm Devnet SOL for fees, expected mint/token-program ownership, recipient ATA, enabled rule, correct mandate stage, unexpired policy, available vault tokens, and latest mandate nonce. Run the app's read-only standing-Key and payment-readiness probes. A green probe means only `READY_FOR_WALLET_ATTEMPT`, **never** executed payment.

### In the physical session

1. Capture phone model, Android version, wallet-app version, network, APK digest/commit, and timestamp. Avoid collecting personal wallet history or unrelated device data.
2. Launch standalone CRESCO, connect the **intended** beneficiary wallet through MWA, and inspect the real on-chain Key. If the beneficiary, network, account ownership, or app identity is inconsistent, **stop before signing**.
3. Initiate an **in-bounds, small Devnet-only** payment. Read the exact amount/mint/recipient shown in the wallet before human approval. If simulation fails or any identity/security warning is unresolved, **cancel**. Do not repeatedly send an UNKNOWN transaction.
4. If the wallet returns a signature, query Devnet RPC/explorer for **confirmed transaction status, program logs and actual resulting token balances**; preserve the before/after state and receipt. Wallet `SIGNED`, client `PENDING`, or a UI success badge **is not** proof of a successful payment.
5. Only after a verified successful baseline payment, test: out-of-bounds refusal; guardian's exact one-time decision with the **guardian's separate authorized wallet**; altered recipient/amount; expired authorization; single-use replay; and a deliberately canceled/failed wallet flow. Record both the resulting on-chain consequence and the app's actual state/recovery, distinguishing predicted UI boundaries from program-enforced refusals.
6. Sanitize receipts and screenshots: no seed phrases, private keys, relay bearer tokens, secret environment values, or personal details. Preserve public signatures, public account IDs, error codes, timestamps, network and artifact provenance.

### Verdict / stop criteria

- **PROVEN (scope limited to observed path):** same artifact and Devnet program, valid real authorized accounts, physical device and wallet, independently RPC-confirmed transaction and consequences, coherent public receipt. Full live core-loop proof additionally requires the guardian and negative/replay paths.
- **PARTIAL:** physical app, wallet session, or read-only prechecks work but the real payment/guardian consequences are not confirmed.
- **BLOCKED:** no consenting signers, account provisioning, verified app identity needed for safe signing, compatible wallet, or deployable correct APK.
- **UNKNOWN:** wallet cancellation/simulation or RPC state cannot be conclusively attributed; never count as REFUSED or successful and never automatically retry.

### Post-session

Link evidence back to the exact commit and APK artifact; update `evidence/REALITY-LEDGER.md`, the claim/evidence graph, canonical `state/CURRENT.md` and `state/HANDOVER.md` only after checking the observed receipts. Keep SKR PR #63 optional and dependent on #62; **do not let its CI green status upgrade the finance loop's live evidence**. Submit the CLOCK IN entry using only verified claims, even if G1 remains blocked.


## New physical Samsung / Solflare wallet proof — 2026-10-11

**Source:** operator-provided `WALLET_PROOF` public JSON runtime receipt and a ~65-second Samsung screen recording shared in chat; the video has **not** been uploaded to a stable repository artifact. The recording shows the Cresco Key `SIGNED · 64 signature bytes` session status, screen sharing the public JSON receipt, and Solflare screens (including a wallet recovery-backup prompt). No recovery phrase or private key was supplied.

- Receipt schema: `cresco-key.mobile-g1-runtime-receipt.v1`
- Captured at: `2026-10-11T20:07:28.896Z`
- Scenario: `WALLET_PROOF`
- Beneficiary wallet observed: `BW5dWcUfrmKNGuwuccWYAKArPseBM23qwV8PiZ96ySkT`
- Reported chain: `solana:devnet`
- Program config: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- Mandate nonce: `2` with explicit source `BUILD_CONFIG_NOT_LIVE_AT_RECEIPT_TIME`
- Configured payment intent: 5 demo tokens, mint `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`. **Intent presence is not payment execution.**
- Result: `details.state=SIGNED`, `signatureByteLength=64`; signature bytes, original signed message, and independent cryptographic verification were **not** captured in this receipt.
- Relay: `null`; **no actual payment transaction signature, account-state change, live guardian approval or allowance consequence** recorded.

**Evidence classification:** `OBSERVED / PHYSICAL_CLIENT / MWA_MESSAGE_SIGNING_REPORTED`; not `LIVE_PAYMENT`, not cryptographically independently verified `WALLET_PROOF`, and not `LIVE_CORE_G1`. The connected wallet still differs from the historically provisioned beneficiary `DD1T86b6vSJd7avUVn23f8TaZxdKEzjRF14XzgffDRSZ`. No legitimate new charter + mandate + funded mint/vault or exact-guardian signer authority is proven for the connected `BW5dW...` account.

**Next safe action while device is present:** capture `PRECHECK_BLOCKED` using the explicit `Record setup blocker (no transaction)` UI; verify the message identifies the beneficiary mismatch; optionally inspect read-only Key status. Do not issue any financial transaction until the connected beneficiary's own authorized onchain charter/mandate and guardian have been provisioned and inspected. Never expose Solflare recovery words or interpret the backup prompt as an authorization.
