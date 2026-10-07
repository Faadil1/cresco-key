# CRESCO Key — HANDOVER

Updated: 2026-10-07

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

System Control Plane v1 and Integration-First Product Exploitation v1.5 were adopted prospectively on **2026-10-01**. Do not rewrite earlier history to imply those policies were already active.

## Guardian refusal path delta - 2026-10-07

Central canonical baseline observed at this material touch: `0.1.58-eval-driven-reliability-v1-promoted` at `2ef16fdcf2166385d08676c8dd680962cc3745e2`.

Baseline delta status: **NON_MATERIAL_DELTA**. Eval-Driven Reliability v1 is not materially triggered by this deterministic mobile/relay product-path change because it does not add or modify AI, agentic, stochastic, or load-bearing model behavior.

G1 remains intentionally deferred to the final physical Android/wallet proof.

Material user capability delta since previous milestone: **GUARDIAN_REFUSAL_PATH_ADDED_AT_BUILD_CONFIGURATION_SCOPE**. The Guardian mobile flow can now choose **Not this time** on a pending boundary request, records a `REFUSED` relay event, and emits a public `GUARDIAN_REFUSE` runtime receipt.

Remaining material product-depth gaps:
- live Cloudflare relay deployment with human authorization;
- physical Android/prod-wallet G1 execution;
- mobile CRESCO transaction against Devnet;
- representative failure/recovery evidence beyond branch-level code and CI;
- operator self-serve clean-room replay after the next release artifact.

Current primary workstream: **PRODUCT_EXPLOITATION**.
Workstream drift status: **CLEAR_FOR_THIS_PRODUCT_DELTA**.
Exact next gate: **LIVE_RELAY_DEPLOYMENT_WITH_HUMAN_AUTHORIZATION_OR_FINAL_LIVE_CORE_G1**.
Exact next owner: **Codex for branch/product readiness; human operator for protected deploy and Android/wallet G1**.
Exact next action: merge the guardian refusal product delta after CI, then either authorize live relay deploy or wait for final G1 Android execution.

## PR #52 merge binding - 2026-10-07

Merged product delta: Guardian **Not this time** refusal path in the mobile boundary flow.

Bindings:
- PR: https://github.com/Faadil1/cresco-key/pull/52
- merge commit: `a52000c0c16f073a39c295618e2f9522217e007d`
- product branch head before merge: `430db6a79628df185fa257db535ac461bf34b000`
- merged at: `2026-10-07T10:19:27Z`
- CI evidence on PR head:
  - `verify-mobile`: success
  - `configured-mobile-build`: success
  - `build-debug-apk`: success
  - `emulator-smoke`: success
  - `mwa-session`: success

Truth boundary:
- This proves repository integration plus CI/build/emulator evidence for the Guardian refusal product path.
- It does **not** prove a live Cloudflare relay deployment.
- It does **not** prove physical Android/prod-wallet G1.
- It does **not** prove a mobile CRESCO transaction or complete Live Core Loop.

Material user capability delta since previous milestone: **GUARDIAN_REFUSAL_PATH_MERGED_TO_MAIN_AT_BUILD_CONFIGURATION_SCOPE**.

## Relay readiness endpoint delta - 2026-10-07

Material user/operator capability delta since previous milestone: **RELAY_OPERATOR_READY_CHECK_ADDED_AT_BUILD_CONFIGURATION_SCOPE**.

The boundary relay now exposes `GET /ready`, which fails closed with `503` when the required Durable Object binding is missing and returns `200` only when the relay has the expected coordination binding.

Truth boundary:
- code/test capability only until CI completes and the branch is merged;
- no Cloudflare production deployment is claimed;
- no physical Android/prod-wallet G1 is claimed;
- no mobile CRESCO transaction or Live Core Loop is claimed.

Current primary workstream: **PRODUCT_EXPLOITATION**.
Workstream drift status: **CLEAR_FOR_THIS_PRODUCT_DELTA**.
Next highest-value depth delta after this branch: human-authorized live relay deployment or final LIVE_CORE_G1 physical Android/wallet execution.

## PR #54 merge binding - 2026-10-07

Merged product/operator delta: relay `GET /ready` readiness endpoint.

Bindings:
- PR: https://github.com/Faadil1/cresco-key/pull/54
- merge commit: `313a4b130261a57d971e611db27c2d38eb2dd612`
- product branch head before merge: `ac381c0b2b38a3e0c2302b86ef5751ec4aa62317`
- merged at: `2026-10-07T11:51:39Z`
- CI evidence on PR head:
  - `relay-check`: success, run `37607355212`

Truth boundary:
- This proves repository integration plus relay CI for the operator readiness endpoint.
- It does **not** prove a live Cloudflare relay deployment.
- It does **not** prove physical Android/prod-wallet G1.
- It does **not** prove a mobile CRESCO transaction or complete Live Core Loop.

Material user/operator capability delta since previous milestone: **RELAY_OPERATOR_READY_CHECK_MERGED_TO_MAIN_AT_BUILD_CONFIGURATION_SCOPE**.

## Mobile judge-path UX delta - 2026-10-07

Material user/operator capability delta since previous milestone: **JUDGE_SELF_ORIENTATION_LOOP_ADDED_AT_BUILD_CONFIGURATION_SCOPE**.

The mobile app now exposes a judge/operator-facing product loop checklist across the role selection, young-person, and guardian surfaces:

1. payment intent;
2. boundary/guardian decision;
3. exact retry or replay/mutation refusal;
4. shareable public receipt.

This is a product-readiness and UX clarity delta: an external reviewer can understand what the app is trying to prove before the final G1 device run.

Truth boundary:
- code/build capability only until CI completes and the branch is merged;
- no live Cloudflare relay deployment is claimed;
- no physical Android/prod-wallet G1 is claimed;
- no mobile CRESCO transaction or Live Core Loop is claimed;
- current CLOCK IN submission-comparison against live/current submissions remains **UNKNOWN** because no reliable public gallery was observed.

Current primary workstream: **PRODUCT_EXPLOITATION**.
Workstream drift status: **CLEAR_FOR_THIS_PRODUCT_DELTA**.
Next highest-value depth delta after this branch: live relay deployment with explicit human authorization or final LIVE_CORE_G1 on physical Android/prod wallet.

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

**LIVE_CORE_G0 — DISTINCT CRESCO KEY DEVNET PROGRAM DEPLOYMENT + BOOTSTRAP — PROVEN / LIVE_INTEGRATION**

Run: `37182728261`

Observed:

- source commit: `0db1f52ff35961fdd1191cff61f8324fe470f504`
- program id: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- deploy signature: `5o2zN6qo9KY9Jhz5VNuuvaRr95p7gdSj858e28nW1PRDYHgpPx88uE2y4Kw4Funh4bzm3evEicmAY1Pf5Ygej2g8`
- program binary SHA-256: `7f45c16253e886160f9c9242edb46ab45c868e2d36767192b8d76e9db605a77c`
- artifact: `https://github.com/Faadil1/cresco-key/actions/runs/37182728261/artifacts/11295688079`
- artifact digest: `sha256:45c8031ed62c0b218e865b51ee1e855f8e8e26868c55e1a21af5695b46f3f819`
- deterministic bootstrap status: `READY_FOR_MOBILE_RUNTIME`
- guardian: `Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov`
- beneficiary: `DD1T86b6vSJd7avUVn23f8TaZxdKEzjRF14XzgffDRSZ`
- charter: `9FjR5U3ELz6oRmMJN8VoH6M2795bBSnkEN6kgz7Y8ZQS`
- mandate: `C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE`
- mint: `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`

This proves the distinct Devnet program and deterministic bootstrap state only. Do not upgrade it to:

- real mobile CRESCO transaction;
- full two-device hero loop;
- physical Android;
- production wallet;
- production evidence.

Prior bounded runtime evidence remains valid:

- Android emulator standalone launch: `36669206551`
- MWA decline / authorize / signMessage / relaunch: `36699897176`

Historical secondary PR #28 / run `36761591880` remains a failed proof-only lane: no Devnet transaction receipt and no RPC confirmation were produced.

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

## Post-G0 configured mobile preflight

**MOBILE_G1_CONFIGURED_PREFLIGHT — PROVEN / BUILD_CONFIGURATION + LOCAL_PARTIAL**

PR #42 is merged at merge commit `842ff6cf74e93fbb28bc3fd0dba30c27cf3da6e6`.

Final head commit: `a2d9e35f8730a4ca97c8324e96c116697c8fbfb2`.

Final CI evidence:

- Devnet Tooling CI: `37214738229` — success.
- Mobile G1 Configured Preflight: `37214738255`, artifact `11307638925`, digest `sha256:c63972323dc36477f2207fee6aa3e18b9abe23212918b0f0812579100c281b4c`.
- Mobile CI: `37214738200` — success.
- Mobile APK Evidence: `37214738295`, artifact `11308430993`, digest `sha256:555df236d02a39d92bd67d8206a40133b13c0b02a0516ee907321e4c58999666`.
- Android Emulator Smoke Evidence: `37214738237`, artifact `11307918176`, digest `sha256:a5ae5cd17a619282357006d1e6b53cae3c7b259976e177b79aaa8ed4532e91b9`.
- MWA Session Evidence: `37214738207`, artifact `11309055853`, digest `sha256:b376f910f6ba45892817c004a972ec716b30882659a9db79793a06c86a1da988`.

This proves configuration/build/emulator readiness for the G1 path. It does not prove physical-device runtime, production-wallet compatibility, a CRESCO transaction, or Live Core Loop.

Operator handoff for the next real run: `docs/MOBILE-G1-RUNTIME-RUNBOOK.md`. The app now includes `Share latest receipt JSON` for public runtime evidence capture.

## Mobile G1 runtime receipt capture readiness

**MOBILE_G1_RECEIPT_CAPTURE_READY — PROVEN / BUILD_CONFIGURATION + LOCAL_PARTIAL**

PR #44 is merged at merge commit `ffef78e45053e1406b90843d89fe271c9d593466`.

Final head commit: `f3354b1e9c9f44ebecea8e3ebcc8718e977f1d32`.

Final CI evidence:

- Mobile CI: `37242955089` — success.
- Mobile G1 Configured Preflight: `37242955074`, artifact `11318066453`, digest `sha256:d46720eff4a821f854d68bfc20041781296d44c8b26211cde4e6545973671dfc`.
- Mobile APK Evidence: `37242955055`, artifact `11318980161`, digest `sha256:b70160874d451144d51775ba56e7701e6e454052af50a8588424720a915e9281`.
- Android Emulator Smoke Evidence: `37242955076`, artifact `11318127844`, digest `sha256:338e7c270cdef7bc02f214d64f3892af2107962525f026bedde34762b6d35cf1`.
- MWA Session Evidence: `37242955096`, artifact `11318282662`, digest `sha256:7f34b57db2dbbfaa6ba36cbf6176bbdb4439e8cdfc626bfebb956ba1ba61c684`.

This proves receipt-capture readiness for the mobile G1 path. It does not prove a physical-device runtime, production-wallet compatibility, a CRESCO transaction, or Live Core Loop.

Operator instruction for the next real run: use `Share latest receipt JSON` after wallet proof, standing payment, boundary request, guardian Allow Once, exact execution, changed-recipient mutation and replay attempts.


## Mobile G1 receipt validation readiness

**MOBILE_G1_RECEIPT_VALIDATION_READY — PROVEN / BUILD_CONFIGURATION + LOCAL_PARTIAL**

PR #46 is merged at merge commit `451b862f78fdf46de53877ca08d1a06dcb5d30cb`.

Final head commit: `798ff453f62822aaa6b0d9e5bec8d82517238702`.

Final CI evidence:

- Devnet Tooling CI: `37245241219` — success.
- Validator self-test CI: `37251332445` — success.

PR #48 is merged at merge commit `8af1bc3dc75754d7eddc7b211f54970fcbee650e`.

Final self-test head commit: `c95758f7fcb0db4c1623a70ac800805eae9896ae`.

This proves the public receipt validator exists, passes tooling CI, and has self-test coverage for complete receipt validation, incomplete receipt refusal, partial debug mode, and secret-like field refusal. It validates exported `cresco-key.mobile-g1-runtime-receipt.v1` coverage and flags suspicious private-key/seed/mnemonic/keypair/recovery/secret field names.

It does not prove physical-device runtime, production-wallet compatibility, a CRESCO transaction, Devnet account-state changes, or Live Core Loop.

Operator instruction for the next real run: after exporting all material mobile receipts, run `npm --prefix tools/devnet run validate-mobile-g1 -- <receipt-folder>` and attach the validation summary to the evidence package.

## Canonical baseline / drift handoff — 2026-10-05

Canonical baseline version: `0.1.56-canonical-baseline-drift-tripwire-promoted`.

Canonical baseline exact SHA / continuity SHA: `8a7e8a4ff5461641c595e2cf052a95fdc32a6340`.

Central active-project reconciliation wave merge: `fb062d6cd792cab8e27c342120824f285120bc2f`.

Product Reality policy: **v1.5.0**.

Project pinned baseline before this handoff was stale/missing in project-local truth and still worded around v1.3. Classification at resume: **MATERIAL_RECONCILIATION_REQUIRED**.

Material delta for CRESCO: baseline pinning, material user capability delta recording, workstream drift classification, primary workstream restoration, and fail-closed terminal transition handling. No global retrofit or product-law rewrite is authorized by this handoff.

Material user capability delta since previous milestone: **NONE**. Validator and state/evidence work improved review readiness, but did not create a new externally usable product capability.

Workstream drift status: **WORKSTREAM_DRIFT** until product work resumes on the live mobile CRESCO path.

Current primary workstream: **PRODUCT_EXPLOITATION**.

Remaining material product-depth gaps: mobile CRESCO Devnet transaction, physical/prod-wallet evidence when feasible, live relay/two-device flow, success/boundary/Allow Once/mutation/replay receipts, before/after state proof, recovery, clean-room/self-serve, external operator evidence, TRACE/design verdict, and terminal assurance.

Exact next owner: Codex may maintain truth/source state; the human/operator owns protected wallet/runtime/submission actions.

Exact next action: return to LIVE_CORE_G1 by executing the real mobile runtime against the public Devnet identities, exporting receipts, and running the validator.

## Reproducibility handoff — 2026-10-06

G1 is intentionally deferred until a real Android/wallet operator can run it. No G1 claim is promoted.

This step adds deterministic npm lockfiles for:

- mobile app;
- boundary relay;
- Devnet tooling.

Material capability delta: **OPERATOR_DEPTH_DELTA** for setup/reproducibility and clean-room readiness. External user capability delta remains **NONE**.

Current primary workstream remains **PRODUCT_EXPLOITATION**.

Exact next owner:

- Codex: dependency-lock PR, CI review, and state/evidence updates;
- human/operator: Android/wallet G1 runtime;
- human authorization required before any protected Cloudflare relay deployment.

Exact next action after this PR: verify CI, then either run G1 with Android receipts or explicitly authorize the live relay deployment gate.

## Exact next gate

**LIVE_CORE_G1 — MOBILE CRESCO TRANSACTION AGAINST DISTINCT DEVNET PROGRAM**

Exact chain:

`DEPLOYED DISTINCT DEVNET PROGRAM → DETERMINISTIC PAYMENT STATE → MOBILE CRESCO TRANSACTION → SUCCESS/BOUNDARY/ALLOW-ONCE/MUTATION/REPLAY RECEIPTS → RECEIPT VALIDATION`

Ready public inputs:

- program id: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- charter: `9FjR5U3ELz6oRmMJN8VoH6M2795bBSnkEN6kgz7Y8ZQS`
- mandate: `C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE`
- mint: `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`
- guardian: `Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov`
- beneficiary: `DD1T86b6vSJd7avUVn23f8TaZxdKEzjRF14XzgffDRSZ`

Completed automation:

- `scripts/seed-devnet-repo-secrets.sh`
- `scripts/devnet-deploy-and-bootstrap.sh`
- `.github/workflows/deploy-distinct-devnet-program.yml`
- `docs/DEVNET-DISTINCT-PROGRAM-GATE.md`

Required evidence graph binding for the next gate:

`CK_LIVE_CORE_LOOP → MOBILE CRESCO SCENARIO → MOBILE/RELAY/DEVNET RUNTIME EXECUTION → REAL RECEIPTS → SOURCE COMMIT → DEPLOYED PROGRAM/RELAY IDENTITY`

Do not revive or expand a separate generic proof-only transaction lane unless it materially helps this real product chain.

## Product Exploitation Loop

Status:

**ACTIVE / WAITING FOR FIRST REAL LIVE CORE SLICE**

The v1.5 Product Reality priority applies immediately.

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
