# CRESCO Key — Conditional Gateway Registry

Updated: 2026-10-01  
Project status: **ACTIVE**

## Status vocabulary

From this reconciliation forward, project gateway execution may use:

- **PROVEN** — adequate evidence exists for the bounded claim represented by the gate.
- **ACTIVE** — the gate applies now and is being satisfied or verified.
- **BLOCKED** — the gate is required but a material dependency, authority boundary, or proof is missing.
- **PENDING** — the gate is applicable and deliberately queued behind a known prerequisite.
- **N/A** — evaluated and not applicable to the current scope, with reason.
- **UNKNOWN** — applicability or truth cannot yet be resolved from canonical evidence.

This extends the older project-local four-state vocabulary prospectively. It does not rewrite earlier historical gate records.

Lifecycle coverage uses the central completeness vocabulary in `governance/BUILD-LIFECYCLE-COVERAGE.yaml`:
`SATISFIED / NOT_APPLICABLE_WITH_REASON / MISSING / UNKNOWN / RECONSTRUCTED_FROM_CANONICAL_EVIDENCE`.

A blank, omitted, or forgotten gate is never a PASS.

## Control plane and lifecycle

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| System Control Plane v1 activation | Next material touch of active project | **PROVEN** | Reconciled prospectively on 2026-10-01 in `governance/PROJECT-CONTROL-PLANE.yaml`; no backdating. |
| Lifecycle Coverage Manifest | All material projects | **PROVEN** | `governance/BUILD-LIFECYCLE-COVERAGE.yaml` now exists; unresolved capabilities inside it still block terminal completeness. |
| QUALIFY → DECIDE → DESIGN → DELIVER → AUDIT → EXPAND | All builds | **ACTIVE** | CRESCO is in DELIVER/LIVE-DEPTH/AUDIT overlap; EXPAND follows real live depth rather than proof packaging. |
| RUBRIC → PAIN → PROBLEM → NEGATIVE EVENT → DIFFERENTIATOR → EXECUTION → LIVE DEPTH → EVIDENCE → STORY → DEMO → Q&A | Judged builds | **ACTIVE** | Earlier stages are supported by existing canonical project evidence; LIVE DEPTH onward remain materially unresolved. |
| Pre-Build Reality Gate | Before Concept Lock | **PROVEN** | Existing project canon records real user/problem, negative-event evidence, impact, native/mobile need and killer demo before lock. This is historical evidence, not a claim that System Control Plane v1 existed then. |
| Real Negative Event Gate | Competitive product builds | **PROVEN** | Existing project research preserves concrete broad-authorization failures and their design implication: exact, bounded authority rather than broad silent windows. |
| Competitive Novelty / Kill Gate | Before Concept Lock | **PROVEN** | Existing project canon records comparison against Greenlight/Google Wallet/BTCBitByBit/Squads/session-key/policy alternatives and narrows residual differentiation. |
| Technical Reality Check | After Concept Lock | **ACTIVE** | Core program/mobile/relay code exists; load-bearing Devnet program deployment and real product runtime remain incomplete. |
| Living PRD | Before consequential implementation / material change | **PROVEN** | `product/PRD.md` exists and is being reconciled to v0.3 without changing locked product law. |
| Product Reality / Integration-First v1.3 | Active project next material touch | **ACTIVE** | Adopted on 2026-10-01. Real product action now outranks generic proof spikes; evidence should exhaust the canonical runtime. |
| Product Exploitation Loop | First live vertical slice onward | **PENDING** | Integration-first priority applies now; formal post-slice exploitation/depth-gap loop starts immediately after the first real CRESCO live core slice. |
| Claim → Runtime → Evidence Graph | Material live/payment/recovery/terminal claims | **ACTIVE** | `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml` exists. Android/MWA local claims are complete at bounded scope; program/live-core edges remain missing. |
| Rule Lifecycle | Any proposed global/system rule change | **N/A** | This reconciliation adopts existing central rules; it proposes no new cross-project rule. |
| Cross-Project Learning | Post-mortem / repeated comparable signals | **N/A** | Project is ACTIVE and has no terminal outcome. No single CRESCO result is being generalized. |

## Product reality, evidence, and terminal gates

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| Truth Boundary Gate | All material claims | **ACTIVE** | OBSERVED / INFERRED / UNKNOWN boundaries remain explicit; code/CI/local emulator proof is not production evidence. |
| Negative Path Gate | All serious builds | **ACTIVE** | Wallet decline is runtime-proven; product-level 12-unit refusal, changed-recipient refusal, replay refusal and recovery remain to be proven in the integrated live path. |
| Evidence Integrity Gate | All material proof | **ACTIVE** | LOCAL/PARTIAL/TESTED/MOCKED/NOT_PROVEN distinctions remain mandatory. Failures are preserved. |
| Reality Ledger | Competitive/release claims | **PROVEN** | `evidence/REALITY-LEDGER.md` exists and is reconciled at this material touch; it must stay current. |
| Runtime / Commit / Deployment Binding | Any live runtime claim | **BLOCKED** | Final CRESCO program id, live relay deployment and integrated hero runtime are not yet bound through runtime → receipt → commit → deployment. |
| Observability / Reproducibility | Runtime/evidence work | **ACTIVE** | CI artifacts and bounded receipts exist; full program/relay/mobile hero receipts and clean-room run are missing. |
| Deterministic Demo Gate | Before recording | **PENDING** | Hero sequence is locked, but the same-product live path must exist before deterministic fallback/replay can be treated as supporting evidence. |
| Judge Performance Assurance | After product depth, before submission | **PENDING** | Signature moment exists conceptually; judge pacing, hostile Q&A, claim→demo→receipt chain and final self-serve path wait on live depth. |
| Submission Integrity Gate | Before final submission | **PENDING** | Official requirements are known; final APK/runtime/video/deck/repository/evidence consistency cannot be checked until the build reaches terminal assurance. |
| Project Finisher / Terminal Assurance | After BUILD_CANDIDATE_READY | **BLOCKED** | BUILD_CANDIDATE_READY has not been reached. |
| Pre-Launch / Ship Assurance | Before release/submission | **BLOCKED** | Live program/relay/hero path, quality receipt, clean-room/self-serve and terminal evidence remain incomplete. |
| Final Snapshot / CURRENT / HANDOVER / Post-mortem | Terminal cycle | **PENDING** | CURRENT/HANDOVER are current; final snapshot/post-mortem are not yet due. |
| Post-Submission Freeze / Reopen Gate | After submission | **N/A** | Project is ACTIVE and not yet submitted/frozen. |

## Quality, design, and evaluator experience

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| Engineering Quality Assurance | Active code-bearing project without current receipt | **ACTIVE** | **BACKFILL_REQUIRED and now the exact next system gate.** The prior atomic proof-repair lane is stabilized/closed; run bounded scan → triage → justified fixes → regression verification → receipt before the next material code/deploy batch. |
| TRACE / Design Experience Assurance | Evaluator-facing UI or material design risk | **ACTIVE** | Mobile evaluator-facing experience makes TRACE applicable. Benita's design work is useful but does not substitute for a TRACE verdict. |
| Distinctiveness Escalation | After functional slice | **ACTIVE** | Preserve young-person agency, boundary legibility, exact exception consumption, non-generic visual language and signature behavior. |
| Accessibility / Responsive | User-facing mobile product | **ACTIVE** | Mobile legibility, reduced motion, keyboard/accessibility equivalents where relevant, and small-screen behavior still require final verification. |
| Performance / Latency | Load-bearing mobile flow | **PENDING** | Measure wallet handoff, RPC confirmation, relay and guardian turnaround when the integrated live path is available. |
| Time to First Value | Real mobile loop | **PENDING** | Measure open/connect → first understood Key → first ALLOW/REFUSE once the live path is usable. |
| External user / operator trial | Before submission when practical | **PENDING** | No external trial yet; one trial would be a usability signal, not adoption. |
| Clean-room / self-serve | Before terminal promotion | **PENDING** | Setup tooling exists but fresh-environment reproduction is not yet proven. |

## Platform, dependency, and safety gates

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| Rules / Eligibility | Competition | **ACTIVE** | Official CLOCK IN requirements are current as of reconciliation; recheck at final submission. |
| Sponsor-Native / Load-Bearing Integration | Solana Mobile build | **ACTIVE** | Solana Mobile/MWA + Solana program authority are causally load-bearing; integrated runtime remains missing. |
| Reference Intelligence | Material external pattern/source use | **ACTIVE** | Official Solana Mobile rules/repos/docs are relevant primary sources. No central Solana/MWA pattern packet is currently registered/adopted; source presence does not imply authority. |
| Data Provenance / Freshness | Current external claims | **ACTIVE** | Competition/rules/product claims need current source/date tracking. The hero payment loop itself does not depend on live market data. |
| External Dependency / Failure | RPC, wallet, relay, OS/toolchain | **ACTIVE** | Keyguard and Android SDK/toolchain failures are preserved; RPC/relay outage, timeout and recovery still need integrated testing. |
| Human Action Boundary | Protected external actions | **ACTIVE** | Program/wallet key custody, external secrets, final submission and irreversible production actions remain human checkpoints. |
| Security / Secrets | Keys/wallets/cloud credentials | **ACTIVE** | No private key or external secret may enter git/evidence artifacts. |
| Legal / Compliance Boundary | Money/minors/custody/securities | **ACTIVE** | Devnet/demo boundary remains explicit; no production custody, brokerage, KYC, mainnet or minor-securities execution claim. |
| IP / Licence / Originality | Public release/submission | **PENDING** | Final dependency/asset/licence/originality review remains to be completed. |

## Android / wallet / Solana runtime gates

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| Android standalone emulator runtime | Mobile runtime | **PROVEN** | Run `36669206551` proved standalone CRESCO launch + Connect wallet surface at LOCAL/PARTIAL scope. |
| MWA session decline/authorize/signMessage/relaunch | Mobile wallet behavior | **PROVEN** | Run `36699897176` proved the bounded emulator session sequence at LOCAL/PARTIAL scope. |
| Real MWA Devnet sign/send | Transaction technical proof | **PENDING** | Not proven. Latest run `36761591880` failed before transaction runtime. Separate PR #28/issue #27 were closed/deferred under v1.3; sign/send should now be proven through the real CRESCO product path where practical. |
| Physical Android | Strongest target-device evidence | **UNKNOWN** | No physical Android runtime has been observed. Lack of owner device does not change architecture; borrow/obtain one later for final evidence if feasible. |
| Production-wallet compatibility | Real wallet target | **UNKNOWN** | Official test wallets prove protocol behavior only; production-wallet behavior remains unobserved. |
| Solana authority program code | Smart-contract mechanism | **PROVEN** | Exact payment/allowance logic and negative invariants exist in code/tests at code-test scope. |
| Distinct CRESCO Key Devnet program | Load-bearing live integration | **BLOCKED** | **Exact next primary gate.** New distinct program identity + Devnet deploy + receipt/commit binding are still missing and require protected key custody. |
| Deterministic Devnet payment bootstrap | After distinct program deploy | **PENDING** | Tooling exists; must run against the newly deployed program and bind resulting state. |
| Solana Pay / payment intent | Mobile hero input | **ACTIVE** | Parser/QR code exists; real integrated scan/payment execution remains to be proven. |
| Boundary relay code | Remote guardian coordination | **PROVEN** | Coordination-only code/tests exist at code/test scope. |
| Live Cloudflare boundary relay | Two-device live experience | **BLOCKED** | Deployment receipt/runtime identity still missing. |
| Full two-device Live Core Loop | P0 hero value | **BLOCKED** | Requires deployed program + live relay + mobile MWA + real success/boundary/grant/mutation/replay consequences + evidence binding. |

## Other transactional gateways

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| Seed Vault direct dApp integration | Direct secret/key access | **N/A** | CRESCO uses MWA; compatible wallets may use Seed Vault internally. |
| SGT | Device/token identity | **N/A** | Not required by locked P0 and does not prove age/guardianship/consent. |
| SKR | Token/ecosystem integration | **N/A** | Add only if it creates material product value. |
| Gateway / Nanopayments | Separate settlement rail | **N/A** | P0 does not depend on a separate nanopayment rail. |
| x402 | Machine-paid unlock | **N/A** | Not used by locked P0. If activated, full requirements/payment → verify → settle → unlock evidence becomes mandatory. |
| Cards / fiat off-ramp | Production payment rail | **N/A** | Out of P0 scope. |
| Mainnet | Production settlement | **N/A** | Devnet is sufficient for the current truthful P0 proof; no mainnet production claim. |
| AI agent authority | Recursive delegate | **N/A** | Chain of Keys is roadmap, not P0. |
| LIVE_GATEWAY | Separate third-party live gateway | **N/A** | Solana runtime is tracked directly under wallet/contracts/runtime gates. |

## Exact next system gate

**ENGINEERING_QUALITY_BACKFILL**

Exact next action:

`PRECONDITIONS → BASELINE SCAN → TRIAGE → BOUNDED FIX LOOP → REGRESSION VERIFY → ENGINEERING QUALITY RECEIPT`

This is the required safe-boundary repair handoff. It must preserve product/security/evidence contracts and avoid score chasing or broad aesthetic refactors.

## Exact next product gate after EQA

**LIVE_CORE_G0 — DISTINCT CRESCO KEY DEVNET PROGRAM DEPLOYMENT + BOOTSTRAP**

`HUMAN-CONTROLLED DISTINCT PROGRAM KEY → DEVNET DEPLOY → DEPLOYMENT RECEIPT/PROGRAM ID → COMMIT BINDING → DETERMINISTIC PAYMENT BOOTSTRAP → REAL MOBILE CRESCO ACTION`

The generic Memo transaction proof is deferred as a separate lane and must not displace the load-bearing path.

## Review triggers

Review this registry whenever:

- project scope or status changes;
- an integration becomes load-bearing;
- a live runtime/deployment changes;
- an evidence claim is promoted or fails;
- a demo is locked or recorded;
- BUILD_CANDIDATE_READY is approached;
- the project is frozen/submitted/reopened.
