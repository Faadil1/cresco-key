# CRESCO Key — Conditional Gateway Registry

Updated: 2026-10-05  
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
| Technical Reality Check | After Concept Lock | **ACTIVE** | Core program/mobile/relay code exists; load-bearing Devnet program deployment and deterministic bootstrap are proven; real mobile product runtime remains incomplete. |
| Living PRD | Before consequential implementation / material change | **PROVEN** | `product/PRD.md` exists and is being reconciled to v0.3 without changing locked product law. |
| Product Reality / Integration-First v1.5 | Active project next material touch | **ACTIVE** | Adopted on 2026-10-01. Real product action now outranks generic proof spikes; evidence should exhaust the canonical runtime. |
| Product Exploitation Loop | First live vertical slice onward | **PENDING** | Product Reality v1.5 priority applies now; formal post-slice exploitation/depth-gap loop starts immediately after the first real CRESCO live core slice. |
| Claim → Runtime → Evidence Graph | Material live/payment/recovery/terminal claims | **ACTIVE** | `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml` exists. Android/MWA local claims are complete at bounded scope; distinct program/bootstrap is complete at LIVE_INTEGRATION scope; live-core edges remain missing. |
| Rule Lifecycle | Any proposed global/system rule change | **N/A** | This reconciliation adopts existing central rules; it proposes no new cross-project rule. |
| Cross-Project Learning | Post-mortem / repeated comparable signals | **N/A** | Project is ACTIVE and has no terminal outcome. No single CRESCO result is being generalized. |

## Canonical baseline and drift tripwire — 2026-10-05

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| Canonical baseline pin | Active project at next material touch | **PROVEN** | Project truth is reconciled to `0.1.56-canonical-baseline-drift-tripwire-promoted`, continuity SHA `8a7e8a4ff5461641c595e2cf052a95fdc32a6340`, central wave merge `fb062d6cd792cab8e27c342120824f285120bc2f`, Product Reality v1.5.0. |
| Baseline delta classification | Canon advancement or stale project pin | **ACTIVE** | Resume classification was **MATERIAL_RECONCILIATION_REQUIRED** because local project truth still referenced v1.3 and lacked v1.5 drift fields. This registry records the reconciliation; affected terminal promotions remain blocked until product gaps are resolved. |
| Drift Tripwire | Every material milestone | **ACTIVE** | `material_user_capability_delta_since_previous_milestone = NONE` after #46-#49. Validator/receipt/state work did not prove a new user/operator capability. |
| Workstream Drift | Demo/evidence work while product gaps remain and user delta is NONE/UNKNOWN | **BLOCKED** | **WORKSTREAM_DRIFT** is emitted. Demo/evidence/packaging work must stop as the primary lane; current primary workstream is restored to **PRODUCT_EXPLOITATION**. |
| Demo packaging permission | Before story/video/README/submission packaging work | **BLOCKED** | Packaging is **SECONDARY_SUPPORT_ONLY** until LIVE_CORE_G1 or another material live product delta advances. |

## Product reality, evidence, and terminal gates

| Gateway | Activation | Status | Current condition |
|---|---|---:|---|
| Truth Boundary Gate | All material claims | **ACTIVE** | OBSERVED / INFERRED / UNKNOWN boundaries remain explicit; code/CI/local emulator proof is not production evidence. |
| Guardian offchain refusal path | Mobile boundary flow | **ACTIVE** | Mobile Guardian flow can record **Not this time** as `REFUSED` and emit a public receipt at code/build scope; live relay and device runtime evidence remain pending. |
| Negative Path Gate | All serious builds | **ACTIVE** | Wallet decline is runtime-proven; product-level 12-unit refusal, changed-recipient refusal, replay refusal and recovery remain to be proven in the integrated live path. |
| Evidence Integrity Gate | All material proof | **ACTIVE** | LOCAL/PARTIAL/TESTED/MOCKED/NOT_PROVEN distinctions remain mandatory. Failures are preserved. |
| Reality Ledger | Competitive/release claims | **PROVEN** | `evidence/REALITY-LEDGER.md` exists and is reconciled at this material touch; it must stay current. |
| Runtime / Commit / Deployment Binding | Any live runtime claim | **ACTIVE** | Distinct CRESCO Key Devnet program is now bound to run `37182728261`, commit `0db1f52ff35961fdd1191cff61f8324fe470f504`, deploy signature `5o2zN6qo9KY9Jhz5VNuuvaRr95p7gdSj858e28nW1PRDYHgpPx88uE2y4Kw4Funh4bzm3evEicmAY1Pf5Ygej2g8`, and artifact digest `sha256:45c8031ed62c0b218e865b51ee1e855f8e8e26868c55e1a21af5695b46f3f819`; live relay and integrated hero runtime are still missing. |
| Observability / Reproducibility | Runtime/evidence work | **ACTIVE** | CI artifacts and bounded receipts exist for program/bootstrap; relay/mobile hero receipts and clean-room run are missing. |
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
| Engineering Quality Assurance | Active code-bearing project without current receipt | **PROVEN** | Backfill completed 2026-10-02 with **PASS_WITH_ACCEPTED_DEBT**. Receipt: `evidence/engineering-quality/ENGINEERING-QUALITY-RECEIPT-2026-10-02.json`. Issue #33 remains explicit dependency/reproducibility debt for PRE_SUBMISSION / RELEASE. |
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
| Distinct CRESCO Key Devnet program | Load-bearing live integration | **PROVEN** | Run `37182728261` deployed program `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP` to Devnet from commit `0db1f52ff35961fdd1191cff61f8324fe470f504`; deploy signature `5o2zN6qo9KY9Jhz5VNuuvaRr95p7gdSj858e28nW1PRDYHgpPx88uE2y4Kw4Funh4bzm3evEicmAY1Pf5Ygej2g8`. |
| Deterministic Devnet payment bootstrap | After distinct program deploy | **PROVEN** | Run `37182728261` bootstrapped status `READY_FOR_MOBILE_RUNTIME` with charter `9FjR5U3ELz6oRmMJN8VoH6M2795bBSnkEN6kgz7Y8ZQS`, mandate `C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE`, mint `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`. |
| Mobile G1 configured Devnet preflight | Before physical/mobile transaction run | **PROVEN** | PR #42 merged at `842ff6cf74e93fbb28bc3fd0dba30c27cf3da6e6`; final head `a2d9e35f8730a4ca97c8324e96c116697c8fbfb2`; configured preflight, mobile CI, APK evidence, emulator smoke and MWA session evidence all passed. This is not a CRESCO transaction or Live Core Loop proof. |
| Mobile G1 receipt capture readiness | Before live receipt export | **PROVEN** | PR #44 merged at `ffef78e45053e1406b90843d89fe271c9d593466`; final head `f3354b1e9c9f44ebecea8e3ebcc8718e977f1d32`; app can export/share `cresco-key.mobile-g1-runtime-receipt.v1` receipts. This is not a live transaction proof. |
| Mobile G1 receipt validator | Before G1 promotion review | **PROVEN** | PR #46 merged at `451b862f78fdf46de53877ca08d1a06dcb5d30cb`; final head `798ff453f62822aaa6b0d9e5bec8d82517238702`; Devnet Tooling CI `37245241219` success. Validates receipt coverage and flags secret-like fields. |
| Mobile G1 receipt validator self-test | Validator reliability | **PROVEN** | PR #48 merged at `8af1bc3dc75754d7eddc7b211f54970fcbee650e`; final head `c95758f7fcb0db4c1623a70ac800805eae9896ae`; Devnet Tooling CI `37251332445` success. This proves validator behavior only, not mobile product runtime. |
| Solana Pay / payment intent | Mobile hero input | **ACTIVE** | Parser/QR code exists; real integrated scan/payment execution remains to be proven. |
| Boundary relay code | Remote guardian coordination | **PROVEN** | Coordination-only code/tests exist at code/test scope. |
| Live Cloudflare boundary relay | Two-device live experience | **BLOCKED** | Deployment receipt/runtime identity still missing. |
| Full two-device Live Core Loop | P0 hero value | **BLOCKED** | Requires live relay + mobile MWA + real success/boundary/grant/mutation/replay consequences + evidence binding against the deployed distinct program. |

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

## Exact next gate

**LIVE_CORE_G1 — MOBILE CRESCO TRANSACTION AGAINST DISTINCT DEVNET PROGRAM**

Exact action:

`DEPLOYED DISTINCT PROGRAM → DETERMINISTIC PAYMENT STATE → REAL MOBILE CRESCO ACTION → HERO RECEIPTS/COMMIT/DEPLOYMENT BINDING`

Engineering Quality backfill is now PROVEN / PASS_WITH_ACCEPTED_DEBT. The generic Memo transaction proof remains deferred as a separate lane and must not displace the load-bearing path.

## Review triggers

Review this registry whenever:

- project scope or status changes;
- an integration becomes load-bearing;
- a live runtime/deployment changes;
- an evidence claim is promoted or fails;
- a demo is locked or recorded;
- BUILD_CANDIDATE_READY is approached;
- the project is frozen/submitted/reopened.
