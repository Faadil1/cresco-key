# CRESCO Key — HANDOVER

Updated: 2026-10-02

## Resume rule

Read in this order before material work:

1. `Faadil1/faadil-agent-system/state/CURRENT.yaml`
2. `Faadil1/faadil-agent-system/state/HANDOVER.yaml`
3. central System Control Plane / Product Reality / Lifecycle / Evidence Graph policies
4. `state/CURRENT.md`
5. this HANDOVER
6. `product/PRD.md`
7. `governance/PROJECT-CONTROL-PLANE.yaml`
8. `governance/BUILD-LIFECYCLE-COVERAGE.yaml`
9. `governance/CONDITIONAL-GATEWAY-REGISTRY.md`
10. `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`
11. `evidence/REALITY-LEDGER.md`

Canonical GitHub state outranks chat/memory. Observed runtime can correct stale factual state but does not create authority.

## Project state

**ACTIVE**

Current production phase:

**P0 IMPLEMENTATION → LIVE INTEGRATION / LIVE DEPTH**

System Control Plane v1 and Integration-First Product Exploitation v1.3 were adopted prospectively on **2026-10-01**. Do not rewrite earlier history to imply those policies were already active.

## What is locked

- Product: **CRESCO Key**
- Wedge: progressive financial agency for young people
- Primitive: **standing authority + exact single-use exceptions**
- Mobile proof: two-device boundary relay + local wallet signing + exact onchain allowance
- Hero asset/action: SPL-token payment intent / Solana Pay style request
- Non-hero: AAPL/investing-specific flow
- Roadmap only: Chain of Keys / narrower agent delegation

## Product invariants

- standing authority is versioned;
- in-bounds actions do not require guardian approval each time;
- out-of-bounds actions refuse;
- Allow Once is exact and one-use;
- changed amount/recipient refuses;
- replay refuses;
- Allow Once does not widen standing authority;
- learning/XP/AI/context do not mint authority;
- UNKNOWN is never success;
- relay/UI never becomes authority;
- capital path is the guard.

## Last proven runtime state

**MWA SESSION — PROVEN / LOCAL-PARTIAL**

Run: `36699897176`

Observed:

`decline → REFUSED → authorize/connect → signMessage approve → SIGNED → relaunch → CONNECTED_RESTORED`

Android emulator standalone launch is separately proven on `36669206551`.

Do not upgrade these to:

- physical Android;
- production wallet;
- real Devnet CRESCO transaction;
- live two-device hero loop;
- production evidence.

## Latest failed / partial workstream

Historical secondary PR: **#28 — P0: prove real Devnet transaction through MWA — CLOSED WITHOUT MERGE after v1.3 reconciliation**

Latest material run inspected:

- `36761591880`
- result: **FAILURE BEFORE TRANSACTION RUNTIME**
- CRESCO release APK build: success
- upstream Solana Mobile fakewallet build prerequisite: failed because CI could not install `platforms;android-37`
- Devnet transaction receipt: absent
- RPC confirmation: absent

This failure remains evidence. It does not become a PASS.

Under Integration-First v1.3, the generic Memo proof is now a **secondary technical proof lane**, not the primary product gate.

## Engineering Quality Assurance

Status:

**PROVEN — PASS_WITH_ACCEPTED_DEBT**

Receipt:

- `evidence/engineering-quality/ENGINEERING-QUALITY-RECEIPT-2026-10-02.json`

Material repairs:

- relay terminal states made monotonic;
- expiry enforced before event application;
- unsafe mobile RPC double-cast removed through a typed adapter / readonly-compatible response boundary.

Accepted debt:

- issue #33 — dependency locking + Expo transitive audit findings;
- no breaking force-fix;
- broad structural refactors deferred unless materially justified.

## Exact next gate

**LIVE_CORE_G0 — DISTINCT CRESCO KEY DEVNET PROGRAM DEPLOYMENT + BOOTSTRAP**

Exact chain:

`HUMAN-CONTROLLED NEW DISTINCT PROGRAM ID → DEVNET DEPLOY → DEPLOYMENT RECEIPT → COMMIT BINDING → DETERMINISTIC PAYMENT BOOTSTRAP → MOBILE CRESCO TRANSACTION`

Prepared automation:

- `scripts/seed-devnet-repo-secrets.sh`
- `scripts/devnet-deploy-and-bootstrap.sh`
- `.github/workflows/deploy-distinct-devnet-program.yml`
- `docs/DEVNET-DISTINCT-PROGRAM-GATE.md`

**Immediate human handoff:** run the secret-seeding helper in a private GitHub Codespace and return only the PUBLIC PROGRAM ID. The repository source cannot be commit-bound to the secret-backed deployment identity until that public id exists.

Required evidence graph binding:

`CLAIM → PROGRAM DEPLOY SCENARIO → DEVNET RUNTIME EXECUTION → SOLANA DEPENDENCY → DEPLOY RECEIPT → SOURCE COMMIT → DEVNET PROGRAM ID`

Do not revive or expand a separate generic proof-only transaction lane unless it materially helps this real product chain.

## Product Exploitation Loop

Status:

**ACTIVE / WAITING FOR FIRST REAL LIVE CORE SLICE**

The v1.3 integration-first priority applies immediately.

Once the first real end-to-end CRESCO slice works, run:

**Post-Vertical-Slice Depth Gap Review**

before heavy visual polish or submission packaging.

The loop continues while marginal product value, differentiation, native integration, consequence, resilience, or workflow completeness justifies the remaining cost/risk/deadline.

## Highest safe justified action tier

For P0:

**APPROVAL_GATED_WRITE**

Reason:

The core value is actual bounded financial authority. The young person's permitted action and the guardian's exact one-time exception must create real Devnet state/transaction consequences under wallet approval. A read-only primary flow would materially weaken the product.

## Lifecycle coverage / terminal truth

Coverage manifest:

- `governance/BUILD-LIFECYCLE-COVERAGE.yaml`

Current terminal completeness:

- **false**

Material unresolved capabilities:

- Product Reality / live depth
- Evidence & Evaluation
- TRACE / Design Experience Assurance
- post-build reconciliation
- Project Finisher terminal assurance
- protected human actions

## Engineering Quality Assurance

Status:

**PROVEN — PASS_WITH_ACCEPTED_DEBT**

Receipt: `evidence/engineering-quality/ENGINEERING-QUALITY-RECEIPT-2026-10-02.json`

Issue #33 remains explicit accepted/deferred dependency debt and must be revisited before PRE_SUBMISSION / RELEASE. A quality score or audit result remains evidence only, never terminal authority.

## Reference Intelligence

Current material references are official primary sources:

- Solana Mobile CLOCK IN 2026 rules
- `solana-mobile/mobile-wallet-adapter`
- `solana-mobile/mock-mwa-wallet`
- Solana Mobile/MWA documentation where required

No Solana/MWA resource is currently registered as an adopted central Reference Intelligence pattern. Do not infer adoption or canon from repository use.

Ossium is not required for the exact current gate.

## Evidence Graph

Required and active:

- `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`

The graph must be updated whenever a material runtime/payment/recovery/terminal claim changes.

Missing edges stay missing. A receipt without runtime binding does not upgrade the product, and a commit without deployment binding does not prove the current live runtime.

## Collaborator lane

Benita / design collaborator:

- mobile UX / visual direction;
- preserve authority semantics;
- issue #18 remains a parallel UX workstream.

Design work may continue in parallel, but product polish must not displace the load-bearing live integration gate.

## Protected human checkpoints

- wallet/program-key custody;
- external service secrets;
- collaborator permissions;
- final competition submission;
- irreversible production actions.

## Pre-submission path

CRESCO Key is not yet SUBMISSION_READY.

Before terminal promotion:

- close live-core and real-consequence gaps;
- re-evaluate dependency/reproducibility debt #33 before release/submission;
- complete TRACE/design assurance if still triggered;
- verify clean-room / judge self-serve setup;
- update Reality Ledger + Evidence Graph;
- run Product Exploitation / Depth Gap Review after first live slice;
- route BUILD_CANDIDATE_READY to Project Finisher;
- run Judge Performance Assurance;
- run Submission Integrity;
- bind final demo evidence to final commit/runtime;
- human performs protected final submission.

## Frozen / submitted rule

Not currently applicable.

If the project is later submitted/frozen, no silent retrofit is allowed. Any further build requires explicit reopen/delta and preservation of the prior submission snapshot.
