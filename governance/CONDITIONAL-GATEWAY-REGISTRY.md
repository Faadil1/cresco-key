# CRESCO Key — Conditional Gateway Registry

Updated: 2026-09-28  
Status vocabulary: **ACTIVE / N/A / BLOCKED / PROVEN**

This registry must be reviewed at every material gate transition.  
A blank, missing, or forgotten gate is not a PASS.

## Core lifecycle and judged-build gates

| Gateway | Activation | CRESCO Key status | Current condition |
|---|---|---:|---|
| QUALIFY → DECIDE → DESIGN → DELIVER → AUDIT → EXPAND | All builds | **ACTIVE** | CRESCO is in DELIVER/AUDIT overlap: P0 implementation exists; runtime proof and audit remain. |
| RUBRIC → PAIN → PROBLEM → NEGATIVE EVENT → DIFFERENTIATOR → EXECUTION → LIVE DEPTH → EVIDENCE → STORY → DEMO → Q&A | Hackathons / judged builds | **ACTIVE** | Rubric/problem/differentiator/execution are substantially established; LIVE DEPTH onward remain active. |
| Pre-Build Reality Gate | Before Concept Lock | **PROVEN** | Real problem/user evidence, negative-event evidence, impact, native/mobile need and killer demo were researched before lock. |
| Real Negative Event Gate | All serious builds | **PROVEN** | Apple/Google/Amazon broad-authorization failures and other relevant authorization failures inform the design. |
| Competitive Novelty / Kill Gate | Before Concept Lock | **PROVEN** | Greenlight/Google Wallet/BTCBitByBit/Squads/session-key/policy alternatives were compared; residual differentiation narrowed to standing authority + exact one-use exception + mismatch/stale/replay refusal. |
| Technical Reality Check | After Concept Lock | **ACTIVE** | Core code is implemented; runtime Android/Devnet proof is still incomplete. |
| Truth Boundary Gate | All builds | **ACTIVE** | Code/CI proof is separated from runtime/live proof; UNKNOWN remains explicit. |
| Negative Path Gate | All builds | **ACTIVE** | REFUSE/UNKNOWN semantics are implemented; full runtime negative evidence still required. |
| Evidence Integrity Gate | All builds | **ACTIVE** | Build/CI/runtime artifacts must retain LIVE/LOCAL/LOCAL_STUB/PRESEEDED/SIMULATED/PARTIAL/NOT_IMPLEMENTED labels. |
| Runtime / Commit Binding Gate | Once runtime exists | **BLOCKED** | Full mobile runtime has not yet been bound to a final demonstrated SHA/program id/relay deployment. |
| Deterministic Demo Gate | Before recording | **ACTIVE** | Canonical hero sequence is defined; runtime reproducibility still needs proof. |
| Judge Performance Assurance | Before submission | **ACTIVE** | Signature moment and memory sentence exist; hostile Q&A and final pacing still need validation. |
| Submission Integrity Gate | Competition submission | **ACTIVE** | Repository/APK/evidence work exists; final rule/package/runtime verification remains. |
| Final Snapshot / CURRENT / HANDOVER / Post-mortem | End of cycle / material handoff | **ACTIVE** | CURRENT exists; canonical HANDOVER/final snapshot will be updated at promotion/submission. |

## Additional registered governance gates

| Gateway | Activation | CRESCO Key status | Current condition |
|---|---|---:|---|
| Rules / Eligibility Gate | Any competition | **ACTIVE** | CLOCK IN requirements must be rechecked against final submission state. |
| Sponsor-Native Advantage Gate | Sponsored ecosystem build | **ACTIVE** | Solana Mobile/MWA + Solana capital-path enforcement are load-bearing; must be runtime-proven. |
| Data Provenance / Freshness Gate | External/current data claims | **ACTIVE** | Current public rule/product claims require source/date tracking; hero payment path itself does not depend on live market data. |
| External Dependency / Failure Gate | Any load-bearing external service | **ACTIVE** | RPC, wallet, Cloudflare relay and mobile OS failure/recovery must be tested. |
| Human Action Boundary Gate | Protected human steps | **ACTIVE** | Wallet approvals, collaborator access, final submission and irreversible external actions remain explicit human checkpoints. |
| Security / Secrets Gate | Keys/wallets/cloud credentials | **ACTIVE** | Keypairs remain outside git; Cloudflare secrets belong in repository secrets/runtime only. |
| Legal / Compliance Boundary Gate | Money/minors/custody/securities | **ACTIVE** | Devnet/demo truth boundary remains explicit; no production custody/brokerage/minor-securities claim. |
| IP / Licence / Originality Gate | Public release/submission | **ACTIVE** | Dependency/assets/licence/originality review remains required before submission. |
| Observability / Reproducibility Gate | Runtime/evidence work | **ACTIVE** | Receipts/workflows exist; clean-room reproducibility still needs completion. |
| Demo Environment Gate | Before demo/recording | **ACTIVE** | Emulator smoke sub-gate is PROVEN on run 36669206551: standalone CRESCO UI + official Mock MWA Wallet installation + Android VIEW-intent discovery. Physical Android remains a separate BLOCKED promotion requirement for strongest final evidence. |
| Accessibility / Responsive Gate | User-facing product | **ACTIVE** | Mobile UX pass must include legibility/accessibility checks. |
| Performance / Latency Gate | User-facing/load-bearing flow | **ACTIVE** | MWA handoff, RPC, relay and confirmation latency must be measured on runtime. |
| Pre-Launch / Ship Assurance | Before shipping/submission | **BLOCKED** | Cannot advance until deploy/runtime/critical path/evidence gates are proven. |
| Distinctiveness Escalation | After functional slice | **ACTIVE** | UX/signature behavior/category differentiation must continue after runtime slice. |
| Post-Submission Freeze / Reopen Gate | After submission | **N/A** | Not submitted yet. |

## Transactional / blockchain conditional gateways

| Gateway | Activation | CRESCO Key status | Current condition |
|---|---|---:|---|
| Gateway / Nanopayments | Transactional rail where applicable | **N/A** | CRESCO P0 does not depend on a separate nanopayment rail. |
| x402 | M2M paid unlock | **N/A** | Not used by CRESCO P0. If activated later, full requirements/payment → verify → settle → HTTP 200/unlock proof is mandatory. |
| Wallets | Blockchain identity/value | **ACTIVE** | MWA integration exists in code; real Android wallet runtime remains unproven. |
| Contracts | Smart contracts | **ACTIVE** | Program delta is code/Rust-test proven; distinct CRESCO Key Devnet deployment is still required. |
| App Kit / external platform integration | Sponsor/platform requirement | **N/A** | No separate App Kit is required for the locked P0; Solana Mobile/MWA is tracked under Sponsor-Native Advantage + Wallets. |
| LIVE_GATEWAY Promotion Gate | Core value depends on live external gateway | **N/A** | No separate third-party settlement gateway is central to P0. Solana runtime itself is handled through Contracts/Wallets/Runtime gates. |

## x402 strict rule if ever activated

A UI message such as "payment successful" is never enough.

Required chain:

`requirements/payment → verify → settle → HTTP 200/unlock`

Evidence must include, as applicable:

- amount;
- network;
- transaction/reference;
- payer/buyer receipt;
- seller/service receipt;
- unlock response.

`LOCAL_STUB` may support design/testing but can never be narrated as `LIVE_GATEWAY`.

If product value depends on the real external gateway, the build cannot be promoted as live until the gateway is proven.

## Registry review rule

Review and update this file whenever:

- a new integration is added;
- a sponsor mechanism becomes load-bearing;
- the environment changes;
- a runtime is deployed;
- a demo is recorded;
- a claim is upgraded;
- a project is frozen/submitted/reopened.
