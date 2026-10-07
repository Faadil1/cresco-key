# CRESCO Key — Submission Contingency Packet Without Physical G1

Date: 2026-10-07
Status: ACTIVE contingency plan, not final submission proof.

## Decision

Prepare the submission package as if no physical Android/prod-wallet G1 operator becomes available before the deadline, while preserving a clean late-G1 insertion slot if an operator becomes available tonight.

This packet does not promote CRESCO Key to LIVE_CORE_G1, BUILD_CANDIDATE_READY, SUBMISSION_READY, or SUBMITTED.

## Current Evidence We Can Truthfully Use

| Evidence | Scope | Truth boundary |
|---|---|---|
| Distinct Devnet program deployment and deterministic bootstrap | LIVE_INTEGRATION | Proves deployed CRESCO program and bootstrapped deterministic state only. |
| Android APK build | BUILD_CONFIGURATION | Proves a build artifact can be produced by CI; not physical-device proof. |
| Android emulator smoke | LOCAL / PARTIAL | Proves emulator launch/navigation; not production wallet/device compatibility. |
| MWA session | LOCAL / PARTIAL | Proves bounded Mock MWA behavior; not prod-wallet or real physical Android. |
| Mobile judge-path UX #56 | BUILD_CONFIGURATION / LOCAL_PARTIAL | Proves judge/operator self-orientation surface exists in app; not live core loop. |
| Relay readiness endpoint | CODE / CI | Proves fail-closed readiness endpoint exists; not live Cloudflare deployment. |
| Receipt validator | CODE / CI | Proves exported receipts can be checked; not that G1 receipts exist. |

## Claims Allowed In Submission Copy

Allowed:

- CRESCO Key is a Devnet Android APK prototype for bounded youth financial authority.
- It uses a distinct CRESCO Key Solana Devnet program.
- It implements standing authority, exact one-time exceptions, mutation/replay refusal logic, relay coordination code, and runtime receipt export.
- Current CI proves APK build, emulator launch, and Mock MWA session behavior.
- Physical Android/prod-wallet full G1 is pending if not captured before submission.

Forbidden unless late G1 is actually captured:

- "Live Core Loop proven."
- "Physical Android proven."
- "Production wallet compatible."
- "End-to-end two-device Devnet payment proven from phone."
- "Submission-ready by canonical gates."
- Any implication that emulator or deterministic evidence is equivalent to a physical G1 run.

## Demo Video Fallback Structure

Target length: 2 to 3 minutes.

1. First 5 seconds: show the problem and promise.
   - "CRESCO Key gives a young person real financial independence inside explicit boundaries."
   - Show: mobile role screen / judge-path card.

2. 5 to 35 seconds: show the product loop.
   - Young person loads or scans an intent.
   - In-bounds action is allowed by standing Key.
   - Boundary action is refused and becomes an exact guardian request.
   - Guardian chooses "Not this time" or "Allow this exact payment once."
   - Retry/mutation/replay are treated as product law, not UI preference.

3. 35 to 75 seconds: show the technical backbone.
   - Program ID: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`.
   - Deterministic charter/mandate/mint are already bootstrapped.
   - APK build, emulator smoke, and MWA session are green.
   - Receipts can be shared and validated.

4. 75 to 120 seconds: show why it is unique.
   - Not parental surveillance.
   - Not a generic wallet.
   - Not broad session keys.
   - Exact exceptions move; the standing boundary does not.

5. Final 10 seconds: truth boundary.
   - "The Devnet program and mobile APK are built; emulator and Mock MWA evidence are green. The final physical Android/prod-wallet G1 remains pending if no operator/device is available before submission."

## Late-G1 Insertion Slot

If a physical Android/prod-wallet operator becomes available tonight:

1. Install the latest APK generated from the final commit.
2. Run `docs/MOBILE-G1-RUNTIME-RUNBOOK.md`.
3. Export public runtime receipts with `Share latest receipt JSON`.
4. Validate receipts with:

```bash
npm --prefix tools/devnet run validate-mobile-g1 -- <receipt-folder>
```

5. Add the validated receipt bundle to the final evidence packet.
6. Update CURRENT/HANDOVER and the evidence graph before claiming G1.

## Submission Safety Rule

If the deadline safety boundary arrives without validated G1 receipts, submit the strongest truthful fallback package rather than waiting indefinitely. Final submission is still a protected human action and requires platform receipt evidence to become SUBMITTED_VERIFIED.
