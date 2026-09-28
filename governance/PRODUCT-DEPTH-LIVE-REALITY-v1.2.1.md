# Product Depth & Live Reality v1.2.1

Status: **ACTIVE — CANONICAL**

This rule auto-activates for CRESCO Key product/build/hackathon work and does not replace any existing gate.

## Core laws

- **Vertical Slice = entry point, not Definition of Done.**
- **Technical Proof ≠ Live Product Integration.**
- Replay/static/captured evidence alone does not satisfy a claim of **Live Core Loop**.
- One external trial ≠ adoption.
- Organic usage excludes scripted activity used to inflate traction.
- Depth ≠ feature count.
- Polish does not compensate for weak product reality.

Preferred order:

`REAL PROBLEM → NATIVE MECHANISM → LIVE INTEGRATION → PRODUCT DEPTH → REAL USER/OPERATOR LOOP → REAL CONSEQUENCE → EVIDENCE & OBSERVABILITY → UX/DESIGN → SUBMISSION PACKAGING`

## Mandatory depth checks

Every serious promotion reviews the following:

| Depth check | CRESCO Key status | Current condition |
|---|---:|---|
| Live Core Loop | **BLOCKED** | Full Android + wallet + program + relay hero loop has not yet been runtime-proven. |
| Load-Bearing Integration | **ACTIVE** | MWA, program, Solana Pay semantics and relay exist in code; runtime proof remains. |
| Real Consequence | **ACTIVE** | Devnet capital-path ALLOW/REFUSE/one-use consequence is designed/implemented; live receipts still needed. |
| Representative success scenario | **ACTIVE** | 5-unit in-bounds ALLOW scenario defined; runtime receipt pending. |
| Representative negative scenario | **ACTIVE** | 12-unit standing REFUSE + changed-recipient refusal + replay refusal defined; runtime receipts pending. |
| Boundary scenario | **ACTIVE** | Exact guardian exception without widening standing Key is the canonical boundary scenario. |
| Recovery scenario | **ACTIVE** | Wallet cancellation, RPC uncertainty, app restart and relay failure must be exercised. |
| Failure / recovery | **ACTIVE** | UNKNOWN/fail-closed semantics exist; clean runtime recovery evidence pending. |
| Real-user surface | **ACTIVE** | Native Android UI exists; physical-user runtime is not yet proven. |
| External-user / operator evidence | **BLOCKED** | No external operator/user runtime trial has yet been recorded. |
| Time to First Value | **ACTIVE** | Must be measured on the actual mobile loop once runtime works. |
| Operational Economics | **N/A** | Not yet material to P0; revisit if relay/RPC/notification costs become meaningful. |
| Shared Product Core | **PROVEN** | Mobile flow, authority program and relay all serve the same locked authority primitive. |
| Reality Ledger | **ACTIVE** | Gateway registry + CURRENT state act as the current ledger; runtime receipts must be appended as promotion occurs. |
| Observability / receipts | **ACTIVE** | APK/CI receipts exist; program/relay/mobile runtime receipts remain incomplete. |
| Judge/operator self-serve | **ACTIVE** | Setup docs and evidence paths exist; final clean judge flow still needs completion. |
| Setup / reproducibility | **ACTIVE** | Provision/bootstrap scripts exist; clean-room reproduction must still be tested. |
| Clean-room / external-dependency failure | **ACTIVE** | Must test missing wallet, RPC failure, relay outage, expired request, restart and unavailable dependency. |
| Post-Vertical-Slice Depth Gap Review | **ACTIVE** | Required immediately after Live Core Loop is proven, before heavy final polish. |

## Live Core Loop promotion rule

CRESCO Key cannot claim **LIVE CORE LOOP** until the following same-product path works in a real runtime:

1. Android app running.
2. Real MWA wallet interaction.
3. CRESCO Key program deployed to the claimed network.
4. In-bounds payment creates real confirmed program/capital consequence.
5. Boundary action genuinely refuses.
6. Exact request reaches guardian flow.
7. Guardian exact grant is confirmed onchain.
8. Changed recipient genuinely refuses.
9. Original exact payment genuinely succeeds once.
10. Replay genuinely refuses.
11. Standing Key remains unchanged by Allow Once.
12. Relevant receipts bind to the demonstrated commit/runtime.

A replayed/captured run may document the proof after it happened. It is not a substitute for the integrated loop itself.

## Load-Bearing Integration test

For each integration, ask:

> If this integration is removed, does the claimed product mechanism still work?

For CRESCO Key:

- Solana program: **load-bearing**
- wallet/MWA: **load-bearing for mobile user action**
- payment intent/QR: **load-bearing for the mobile hero interaction**
- relay: **load-bearing for the remote two-device experience, but not the financial authority**
- visual polish: **not load-bearing**
- learning layer: **not load-bearing for P0 authority**

## Real Consequence test

A product state is consequential when it changes what the user/system can actually do.

Examples for CRESCO Key:

- program refuses out-of-bounds payment;
- exact allowance exists onchain;
- changed recipient cannot inherit approval;
- allowance is consumed after one successful use;
- replay cannot move capital.

A toast or UI-only state is not enough.

## External user/operator evidence

When possible before submission:

- place the build in another person's hands;
- do not narrate every step;
- measure where they hesitate;
- preserve operator/user feedback;
- distinguish one trial from adoption;
- do not call scripted team usage "organic."

## Time to First Value

Once runtime is available, measure:

- install/open → wallet connected;
- wallet connected → current Key understood;
- scan → first ALLOW/REFUSE understood;
- boundary → guardian decision;
- guardian decision → exact action completed.

Do not optimize invented metrics before measuring the actual loop.

## Post-Vertical-Slice Depth Gap Review

Immediately after the first real vertical slice works, ask:

> **What separates this slice from something a real user could use tomorrow?**

Then inspect material gaps in:

- onboarding;
- state persistence;
- failure recovery;
- security;
- permissions;
- repeat behavior;
- user comprehension;
- notification reliability;
- observability;
- external-user usability;
- setup/reproducibility;
- operational cost;
- legal/privacy boundaries;
- accessibility;
- latency/performance.

Close material gaps before heavy visual polish.

## Frozen/submitted rule

No silent retrofit of submitted/frozen evidence.

If reopened:

- declare the reopen;
- create a new delta;
- preserve the old snapshot;
- do not rewrite historical proof as if it existed earlier.
