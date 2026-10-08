# CRESCO Key — CURRENT

Updated: 2026-10-07

## Project status

**ACTIVE**

This is an existing, authorized hackathon product project. It is not FROZEN, SUBMITTED, or REOPENED.

System Control Plane v1 and Product Reality / Integration-First v1.5 are adopted **from 2026-10-01 forward** at this material touch. They are not backdated into prior project history.

## North Star

Give a young person real standing financial authority inside explicit bounds, with exact single-use exceptions that do not widen the standing Key.

Canonical sentence:

> The exception moved. The boundary did not.

## Current phase

**CONCEPT LOCKED → P0 IMPLEMENTATION ACTIVE → LIVE INTEGRATION / LIVE DEPTH**

Canonical product source:

- `product/PRD.md`

Canonical project control:

- `governance/PROJECT-CONTROL-PLANE.yaml`
- `governance/BUILD-LIFECYCLE-COVERAGE.yaml`
- `governance/CONDITIONAL-GATEWAY-REGISTRY.md`
- `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`
- `evidence/REALITY-LEDGER.md`

Central governance source:

- `Faadil1/faadil-agent-system@main`
- `SYSTEM-CONTROL-PLANE-POLICY.yaml`
- `PRODUCT-REALITY-POLICY.yaml@1.5.0`
- `PROJECT-LIFECYCLE-COMPLETENESS-POLICY.yaml`
- `EVIDENCE-GRAPH-POLICY.yaml`
- `project-profiles/hackathon.yaml`

## Last materially proven gate

**LIVE_CORE_G0 — DISTINCT CRESCO KEY DEVNET PROGRAM DEPLOYMENT + BOOTSTRAP — PROVEN at LIVE_INTEGRATION scope**

Canonical successful run: `37182728261`.

Observed:

- source commit: `0db1f52ff35961fdd1191cff61f8324fe470f504`
- program id: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- deploy signature: `5o2zN6qo9KY9Jhz5VNuuvaRr95p7gdSj858e28nW1PRDYHgpPx88uE2y4Kw4Funh4bzm3evEicmAY1Pf5Ygej2g8`
- program binary SHA-256: `7f45c16253e886160f9c9242edb46ab45c868e2d36767192b8d76e9db605a77c`
- evidence artifact: `https://github.com/Faadil1/cresco-key/actions/runs/37182728261/artifacts/11295688079`
- artifact digest: `sha256:45c8031ed62c0b218e865b51ee1e855f8e8e26868c55e1a21af5695b46f3f819`
- deterministic bootstrap status: `READY_FOR_MOBILE_RUNTIME`
- guardian: `Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov`
- beneficiary: `DD1T86b6vSJd7avUVn23f8TaZxdKEzjRF14XzgffDRSZ`
- charter: `9FjR5U3ELz6oRmMJN8VoH6M2795bBSnkEN6kgz7Y8ZQS`
- mandate: `C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE`
- mint: `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`

Truth boundary:

- distinct Devnet program deployed: **true**
- deterministic payment state ready: **true**
- mobile CRESCO transaction proven: **false**
- full Live Core Loop proven: **false**
- physical Android proven: **false**
- production-wallet compatibility proven: **false**

Prior bounded runtime proof remains valid:

- Android emulator standalone runtime: run `36669206551`
- MWA decline / authorize / signMessage / relaunch behavior: run `36699897176`

The historical generic Devnet MWA transaction workstream remains **NOT PROVEN** and **closed/deferred as a separate proof-only lane**. Run `36761591880` failed before transaction runtime and produced no Devnet transaction, wallet sign/send receipt, or RPC-confirmed signature.

## Integration-First v1.5 reconciliation

The generic Memo transaction proof is useful **technical evidence**, but it is not the core product action.

Therefore it is now **secondary / non-blocking to product direction**.

Primary build priority is the load-bearing product path:

`DISTINCT CRESCO KEY DEVNET PROGRAM → DETERMINISTIC PAYMENT STATE → REAL MOBILE CRESCO ACTION → REAL CONSEQUENCE → EVIDENCE`

Evidence should be emitted from that real path wherever practical instead of creating a parallel proof-only product.

## Engineering Quality Assurance gate

**PROVEN — PASS_WITH_ACCEPTED_DEBT**

Receipt:

- `evidence/engineering-quality/ENGINEERING-QUALITY-RECEIPT-2026-10-02.json`
- covered material code commit: `4c8811b5adf867244fffb3122e69f80c1caccd66`

The bounded backfill repaired relay state/expiry correctness risks and removed an unsafe mobile RPC type escape without changing product law, authority semantics or evidence contracts.

Accepted debt is explicit, not hidden:

- issue #33 tracks mobile dependency reproducibility + Expo transitive audit findings;
- no `npm audit fix --force` or breaking Expo downgrade was applied;
- large mixed-responsibility files remain deferred unless a material correctness/reliability reason justifies refactor.

## Post-G0 configured mobile preflight

**MOBILE_G1_CONFIGURED_PREFLIGHT — PROVEN at BUILD_CONFIGURATION / LOCAL_PARTIAL scope**

Merge: PR #42, merge commit `842ff6cf74e93fbb28bc3fd0dba30c27cf3da6e6`.

Final head: `a2d9e35f8730a4ca97c8324e96c116697c8fbfb2`.

Observed:

- Mobile G1 Configured Preflight: run `37214738255`, artifact `11307638925`, digest `sha256:c63972323dc36477f2207fee6aa3e18b9abe23212918b0f0812579100c281b4c`.
- Mobile CI: run `37214738200`.
- Mobile APK Evidence: run `37214738295`, artifact `11308430993`, digest `sha256:555df236d02a39d92bd67d8206a40133b13c0b02a0516ee907321e4c58999666`.
- Android Emulator Smoke Evidence: run `37214738237`, artifact `11307918176`, digest `sha256:a5ae5cd17a619282357006d1e6b53cae3c7b259976e177b79aaa8ed4532e91b9`.
- MWA Session Evidence: run `37214738207`, artifact `11309055853`, digest `sha256:b376f910f6ba45892817c004a972ec716b30882659a9db79793a06c86a1da988`.

Truth boundary:

- mobile build configured against the distinct Devnet program: **true**
- deterministic Solana Pay intent loaders are available: **true**
- Android emulator and official Mock MWA Wallet session are proven at local/partial scope: **true**
- real mobile CRESCO transaction against the distinct Devnet program: **false**
- physical Android proof: **false**
- production-wallet compatibility: **false**
- full Live Core Loop: **false**

## Mobile G1 runtime receipt capture readiness

**MOBILE_G1_RECEIPT_CAPTURE_READY — PROVEN at BUILD_CONFIGURATION / LOCAL_PARTIAL scope**

Merge: PR #44, merge commit `ffef78e45053e1406b90843d89fe271c9d593466`.

Final head: `f3354b1e9c9f44ebecea8e3ebcc8718e977f1d32`.

Observed:

- Mobile CI: run `37242955089` — success.
- Mobile G1 Configured Preflight: run `37242955074`, artifact `11318066453`, digest `sha256:d46720eff4a821f854d68bfc20041781296d44c8b26211cde4e6545973671dfc`.
- Mobile APK Evidence: run `37242955055`, artifact `11318980161`, digest `sha256:b70160874d451144d51775ba56e7701e6e454052af50a8588424720a915e9281`.
- Android Emulator Smoke Evidence: run `37242955076`, artifact `11318127844`, digest `sha256:338e7c270cdef7bc02f214d64f3892af2107962525f026bedde34762b6d35cf1`.
- MWA Session Evidence: run `37242955096`, artifact `11318282662`, digest `sha256:7f34b57db2dbbfaa6ba36cbf6176bbdb4439e8cdfc626bfebb956ba1ba61c684`.

Truth boundary:

- mobile app can emit/share public G1 runtime receipt JSON: **true**
- receipt schema available: `cresco-key.mobile-g1-runtime-receipt.v1`
- real mobile CRESCO transaction against the distinct Devnet program: **false**
- physical Android proof: **false**
- production-wallet compatibility: **false**
- full Live Core Loop: **false**


## Mobile G1 receipt validation readiness

**MOBILE_G1_RECEIPT_VALIDATION_READY — PROVEN at BUILD_CONFIGURATION / LOCAL_PARTIAL scope**

Merge: PR #46, merge commit `451b862f78fdf46de53877ca08d1a06dcb5d30cb`.

Final head: `798ff453f62822aaa6b0d9e5bec8d82517238702`.

Observed:

- Devnet Tooling CI: run `37245241219` — success.
- Validator self-test CI: run `37251332445` — success.
- Receipt validator CLI: `tools/devnet/validate-mobile-g1-receipts.cjs`.
- Receipt validator self-test: `tools/devnet/test-mobile-g1-receipt-validator.cjs`.
- Validator schema: `cresco-key.mobile-g1-receipt-validation.v1`.
- Target receipt schema: `cresco-key.mobile-g1-runtime-receipt.v1`.

Truth boundary:

- exported G1 receipt coverage can be validated before promotion review: **true**
- suspicious private-key/seed/mnemonic/keypair/recovery/secret field names are flagged: **true**
- validator behavior is self-tested for complete, incomplete, partial-debug and secret-like-field cases: **true**
- real mobile CRESCO transaction against the distinct Devnet program: **false**
- physical Android proof: **false**
- production-wallet compatibility: **false**
- full Live Core Loop: **false**

## Canonical baseline reconciliation — 2026-10-05

Canonical baseline version: `0.1.56-canonical-baseline-drift-tripwire-promoted`.

Canonical baseline exact SHA / continuity SHA: `8a7e8a4ff5461641c595e2cf052a95fdc32a6340`.

Central active-project reconciliation wave merge: `fb062d6cd792cab8e27c342120824f285120bc2f`.

Central Product Reality policy: **v1.5.0**.

Project baseline delta status: **MATERIAL_RECONCILIATION_REQUIRED** at resume time; this reconciliation records the v1.5 pin and restores the product-first workstream. The material delta is baseline pinning plus the drift tripwire; it does not change CRESCO product law, authority semantics, hero flow, or P0 scope.

Current project source head observed before this reconciliation: `b75225ef59386b81aef3a61b2f70c13a3f6f7ca4` (merge of PR #49).

First live slice status: **NOT PROVEN**.

Material user capability delta since previous milestone: **NONE**. PRs #46-#49 added receipt validation, validator self-test coverage, and state/evidence updates; they did not add or verify a new external user/operator product capability and did not prove a mobile CRESCO Devnet transaction.

Workstream drift status: **WORKSTREAM_DRIFT**. Recent progress was primarily validator/evidence/state work while material product-depth gaps remain. Demo, receipt, replay, screenshot, video, README and packaging work are secondary until the next live product delta advances.

Current primary workstream: **PRODUCT_EXPLOITATION**.

Next highest-value depth delta: execute the real mobile CRESCO transaction path against the distinct Devnet program, export the public `cresco-key.mobile-g1-runtime-receipt.v1` receipts, and validate them before any G1 promotion review.

Valid stop condition: **NONE**. Protected human actions still exist for wallet/key custody, external secrets and final submission, but no valid stop condition currently replaces the product-exploitation step.

Demo packaging permission: **SECONDARY_SUPPORT_ONLY**. Demo packaging may only follow or support live product evidence; it must not displace LIVE_CORE_G1.

## Reproducibility / clean-room dependency lock delta — 2026-10-06

G1 mobile physical-device execution remains pending and is not promoted.

Material user capability delta since previous milestone: **NONE** for external users; **OPERATOR_DEPTH_DELTA** for clean-room setup/reproducibility because npm dependency resolution is now pinned for mobile, relay and Devnet tooling.

Current primary workstream: **PRODUCT_EXPLOITATION**, with G1 explicitly deferred until an Android/wallet operator can execute the real mobile path.

Workstream drift status: **MITIGATED_FOR_THIS_STEP**. This step is not demo/story/packaging work; it reduces a recorded product-depth gap: setup/reproducibility and judge/operator self-serve.

Files added:

- `apps/mobile/package-lock.json`
- `services/relay/package-lock.json`
- `tools/devnet/package-lock.json`

Truth boundary:

- deterministic dependency lockfiles improve clean-room reproducibility;
- they do **not** prove physical Android runtime, production wallet compatibility, Cloudflare live relay deployment, a mobile CRESCO transaction, or Live Core Loop.

Next highest-value depth delta remains one of:

1. execute LIVE_CORE_G1 with a real Android/wallet operator; or
2. if explicitly authorized, deploy the live Cloudflare boundary relay and capture its deployment/health receipt.

## Guardian refusal path delta - 2026-10-07

Central canonical baseline observed at this material touch: `0.1.58-eval-driven-reliability-v1-promoted` at `2ef16fdcf2166385d08676c8dd680962cc3745e2`.

Baseline delta status: **NON_MATERIAL_DELTA**. Eval-Driven Reliability v1 is not materially triggered by this deterministic mobile/relay product-path change because it does not add or modify AI, agentic, stochastic, or load-bearing model behavior.

G1 remains intentionally deferred to the final physical Android/wallet proof.

Material user capability delta since previous milestone: **GUARDIAN_REFUSAL_PATH_ADDED_AT_BUILD_CONFIGURATION_SCOPE**. The Guardian mobile flow can now choose **Not this time** on a pending boundary request, records a `REFUSED` relay event, and emits a public `GUARDIAN_REFUSE` runtime receipt.

Truth boundary:
- code/build capability only until CI/runtime evidence is observed;
- no live Cloudflare relay deployment is claimed;
- no physical Android proof is claimed;
- no production-wallet compatibility is claimed;
- no mobile CRESCO transaction or Live Core Loop is claimed.

Current primary workstream: **PRODUCT_EXPLOITATION**.
Workstream drift status: **CLEAR_FOR_THIS_PRODUCT_DELTA**.
Next highest-value depth delta: live Cloudflare relay deployment if explicitly authorized, otherwise final LIVE_CORE_G1 with Android/wallet operator evidence.

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


## PR #56 merge binding and no-G1 contingency - 2026-10-07

Merged product/readiness delta: mobile judge-path UX surface.

Bindings:
- PR: https://github.com/Faadil1/cresco-key/pull/56
- merge commit: `32faa302e0253485482f6e1ac1d7c3bd71b0df14`
- product branch head before merge: `d6c11d4231d220378485a06d3b85b2073bfed48f`
- merged at: `2026-10-07T23:12:41Z`
- CI evidence on PR head:
  - `verify-mobile`: success
  - `configured-mobile-build`: success
  - `build-debug-apk`: success after runner retry
  - `emulator-smoke`: success
  - `mwa-session`: success

Central canonical baseline observed at this material touch: `0.1.59-adaptive-best-of-system-execution-v1-promoted` at `3243720286b5d17d9415c9d12ff5ac742ab773d6`.

Baseline delta status: **NON_MATERIAL_DELTA** for CRESCO product/runtime obligations. Adaptive Best-of-System Execution v1 affects execution routing but does not change CRESCO product law, authority semantics, Solana/MWA requirements, or the remaining G1 proof obligations.

First live slice status: **NOT PROVEN**.

Material user/operator capability delta since previous milestone: **JUDGE_SELF_ORIENTATION_LOOP_MERGED_TO_MAIN_AT_BUILD_CONFIGURATION_SCOPE**. External judges/operators can now see the intended product loop directly in the mobile app before the final physical G1 run.

Current submission contingency: prepare `docs/SUBMISSION-CONTINGENCY-NO-G1-2026-10-07.md` as a deadline fallback while preserving a late-G1 insertion slot if a physical Android/prod-wallet operator becomes available tonight.

Truth boundary:
- repository integration plus PR-head CI/build/emulator/MWA evidence is proven;
- no physical Android proof is claimed;
- no production-wallet compatibility is claimed;
- no mobile CRESCO transaction or full Live Core Loop is claimed;
- final competition submission remains a protected human action and is not executed by this state update.

Current primary workstream: **PRODUCT_EXPLOITATION_WITH_DEADLINE_CONTINGENCY**.

Workstream drift status: **NOT_DRIFT_FOR_THIS_STEP** only while contingency packaging preserves explicit truth boundaries and does not claim G1, LIVE, COMPLETE, READY, or SUBMITTED.

Valid stop condition: **PARTIAL_EXTERNAL_OPERATOR_BLOCKER** for physical Android/prod-wallet G1 if no operator/device is available before the submission safety boundary.

Demo packaging permission: **CONTINGENCY_SUPPORT_ONLY**. Demo/video/deck work may proceed only as truthful fallback packaging, not as evidence upgrade.

Remaining material product-depth gaps:
- physical Android runtime;
- production-wallet compatibility;
- live Cloudflare relay deployment receipt;
- mobile CRESCO transaction against the distinct Devnet program;
- in-bounds/boundary/Allow Once/mutation/replay runtime receipts;
- receipt validation on real G1 receipts;
- clean-room/judge self-serve final replay;
- final submission receipt.

Exact next gate: **NO_G1_CONTINGENCY_SUBMISSION_PACKET_OR_LATE_LIVE_CORE_G1**.

Exact next owner: **Codex for packet/state updates; human operator for Android/wallet G1; human for final submission**.

Exact next action: package the truthful fallback evidence/video/deck around build/emulator/MWA/program facts, and replace the fallback with validated G1 receipts if the Android operator becomes available in time.

## Exact next gate

**LIVE_CORE_G1 — MOBILE CRESCO TRANSACTION AGAINST DISTINCT DEVNET PROGRAM**

## Exact next action

Use the deployed distinct Devnet program and deterministic bootstrap state to execute the real mobile CRESCO action path.

Available bounded inputs:

- distinct program id: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- deterministic charter: `9FjR5U3ELz6oRmMJN8VoH6M2795bBSnkEN6kgz7Y8ZQS`
- deterministic mandate: `C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE`
- deterministic mint: `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`
- guardian public key: `Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov`
- beneficiary public key: `DD1T86b6vSJd7avUVn23f8TaZxdKEzjRF14XzgffDRSZ`
- deployment/bootstrap run: `37182728261`

Next action: execute the mobile runtime against those public Devnet identities, use `Share latest receipt JSON` to capture the public G1 receipts, then run `npm --prefix tools/devnet run validate-mobile-g1 -- <receipt-folder>` before any G1 promotion review.

The next proof must cover the product path, not a generic Memo lane:

`REAL MOBILE CRESCO ACTION → REAL CONSEQUENCE → SUCCESS/BOUNDARY/ALLOW-ONCE/MUTATION/REPLAY RECEIPTS → COMMIT/DEPLOYMENT BINDING`

Private key material must not be pasted into chat, committed, or uploaded as a public artifact.

## Product Exploitation Loop

Status: **ACTIVE — PENDING FIRST LIVE CORE SLICE**

Integration-First behavior is active now.

The formal post-vertical-slice exploitation loop begins immediately after the first real CRESCO live core slice is proven. At that point, do not jump straight to polish or submission packaging; run the depth-gap review and continue while marginal user value, differentiation, integration depth, consequence, or resilience justifies the remaining cost/risk/deadline.

Highest safe justified action tier for the P0 hero path:

**APPROVAL_GATED_WRITE**

The product is supposed to cause a real Devnet authority/payment consequence under explicit wallet/guardian approval. Read-only is not an adequate primary experience.

## Evidence Graph

Status: **ACTIVE / REQUIRED**

Path:

- `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`

Current material claim states:

- Android emulator standalone runtime: **COMPLETE at LOCAL/PARTIAL claim scope**
- MWA session behavior: **COMPLETE at LOCAL/PARTIAL claim scope**
- real Devnet MWA transaction: **PARTIAL / NOT PROVEN**
- distinct CRESCO Key Devnet program + deterministic bootstrap: **COMPLETE at LIVE_INTEGRATION claim scope**
- full Live Core Loop: **MISSING**
- live two-device relay: **MISSING**

Missing edges are preserved explicitly.

## Lifecycle / quality reconciliation

Lifecycle coverage:

- `governance/BUILD-LIFECYCLE-COVERAGE.yaml`
- terminal completeness: **false**

Engineering Quality Assurance:

- **PROVEN — PASS_WITH_ACCEPTED_DEBT**
- current receipt: `evidence/engineering-quality/ENGINEERING-QUALITY-RECEIPT-2026-10-02.json`
- dependency/reproducibility debt remains tracked in issue #33 and must be re-evaluated before PRE_SUBMISSION / RELEASE

TRACE / Design Experience Assurance:

- **ACTIVE / unresolved**
- evaluator-facing mobile UX makes the capability applicable
- Benita's design lane does not substitute for a TRACE verdict if TRACE remains triggered at terminal transition

## Reference Intelligence

Relevant current primary sources:

- official Solana Mobile CLOCK IN 2026 rules;
- official `solana-mobile/mobile-wallet-adapter` repository;
- official `solana-mobile/mock-mwa-wallet` repository;
- Solana Mobile / MWA primary documentation when a material implementation claim depends on it.

No matching Solana/MWA pattern is currently registered in the central Reference Intelligence registry. Therefore there is no registered pattern packet to auto-adopt. Primary sources remain inputs, not authority beyond their own official domain.

Ossium is not material to the current runtime/deployment gate.

## Proven at code/build or bounded-runtime level

- native Android/React Native application structure;
- Android APK build;
- Android emulator standalone launch;
- Mobile Wallet Adapter integration code;
- emulator MWA decline / authorize / signMessage / relaunch behavior;
- Solana Pay SPL-token request parsing;
- standing payment instruction;
- exact one-time allowance instruction;
- exact one-time payment execution;
- amount mismatch refusal;
- recipient mismatch refusal;
- canonical ATA verification;
- stale/expiry/replay enforcement;
- private two-device relay code;
- fail-closed ALLOW / REFUSE / UNKNOWN handling;
- relay deployment workflow;
- distinct-program provisioning script;
- deterministic Devnet bootstrap tooling;
- distinct CRESCO Key Devnet program deployment at LIVE_INTEGRATION scope;
- deterministic Devnet payment state bootstrapped at LIVE_INTEGRATION scope;
- mobile G1 runtime receipt export, validation tooling and validator self-test at BUILD_CONFIGURATION / LOCAL_PARTIAL scope;
- Rust / relay / mobile / Devnet-tooling CI.

## Blocked / not live-proven

- real CRESCO program payment transaction from the mobile path;
- physical Android runtime;
- production-wallet compatibility;
- live Cloudflare relay deployment receipt;
- full two-device CLOCK IN hero run;
- changed-recipient hostile runtime proof;
- replay runtime proof;
- standing Key unchanged before/after Allow Once in the mobile live loop;
- clean-room reproduction;
- external user/operator trial;
- terminal TRACE/design verdict;
- Project Finisher terminal assurance;
- final release-signed APK / dApp Store readiness.

## Active hero run

`5 ALLOW → 12 REFUSE → guardian Allow Once → changed recipient REFUSE → original exact action ALLOW ONCE → replay REFUSE`

## Protected human checkpoints

- wallet/program-key custody;
- configure external service secrets;
- accept collaborator access;
- final competition submission;
- any irreversible production action.

## Evidence truth

Current product state is **not LIVE CORE LOOP**.

Code, CI, local emulator behavior, a generic transaction spike, or a replay must not be narrated as complete product runtime proof.

## Submission timing / official rule boundary

Official Solana Mobile CLOCK IN 2026 submissions close **October 8, 2026** and require a functional Android APK, GitHub repository, demo video, and pitch deck/presentation.

Deadline pressure changes sequencing, not evidence class or safety/authority boundaries.

## Next promotion conditions

Before BUILD_CANDIDATE_READY or equivalent terminal promotion, applicable material dimensions must be SATISFIED or NOT_APPLICABLE_WITH_REASON. Current blocking chain includes:

1. live relay with deployment receipt;
2. actual mobile MWA transaction through the CRESCO program;
3. real in-bounds / boundary / Allow Once / mutation / replay consequences;
4. runtime → receipt → commit → deployment binding for relay/mobile hero runtime;
5. failure/recovery coverage;
6. dependency/reproducibility debt #33 re-evaluated before PRE_SUBMISSION / RELEASE;
7. TRACE/design assurance when still triggered;
8. clean-room / judge self-serve path;
9. post-first-live-slice Product Exploitation / Depth Gap Review;
10. Project Finisher terminal assurance before submission-ready.

## Museum Ledger native product UX + optional SKR access — PR #59 (2026-10-07)

Owner selected the **Museum Ledger** artistic direction. PR #59 adds genuine native React Native screens and a typed design system; this is NOT just reference imagery.

Product changes at code/build scope:
- Museum Ledger wallet entry, young action/Key overview, refusal/boundary, guardian exact decision, conditional success and live latest-receipt card;
- links remain on pre-existing real wallet/relay/Solana instruction handlers; no fabricated payments or receipt history;
- opt-in Guardian SKR Charter Atelier: official SKR mint read-only presence check on Solana **mainnet**, and an interactive shareable family learning prompt gated by nonzero SKR; no Solana mainnet signing or transfers and no influence on CRESCO spending rules;
- conditional SKR gateway classification changed from N/A to ACTIVE / NOT YET RUNTIME PROVEN, separate from G1.

Scope and truth:
- current_primary_workstream: PRODUCT_EXPLOITATION
- material_user_capability_delta_since_previous_milestone: MUSEUM_LEDGER_NATIVE_UI_AND_READ_ONLY_SKR_ACCESS_AT_CODE_SCOPE; physical or external-run delta UNKNOWN
- first_live_slice_proven: false
- workstream_drift_status: NO_PROOF_ONLY_PROMOTION; code-bearing product enhancement, but Android/runtime validation still required
- latest_project_canonical_baseline: non-material delta from 0.1.56 to central 0.1.59 as previously recorded; no retroactive rewriting
- blocked_transition: LIVE_CORE_G1 / LIVE / BUILD_CANDIDATE_READY / SUBMISSION_READY pending live relay, physical wallet transaction, negative/recovery evidence, release QA
- exact_next_gate: CI_TYPECHECK_AND_APK_EMULATOR_MWA_ON_PR59, followed by physical LIVE_CORE_G1 and optional SKR mainnet read-only access test
- exact_next_owner: code/CI automation until merge; protected wallet/device proof and final submission stay human
- exact_next_action: require successful Mobile CI + configured preflight + APK Evidence + Emulator Smoke + MWA Session on final PR head, merge after review, and download the newly built APK (not an earlier #56 artifact)
- valid_stop_condition: no live proof when physical operator/device or protected deployment not available; do not silently upgrade
- demo_packaging_permission: SUPPORT_ONLY / NO_NEW_LIVE_CLAIM

Claims: SKR bonus integration is **a candidate at code scope**, not a proven prize-eligible live integration, payout, reward distribution or custody rail. No image-generated mockup is used as a runtime screenshot.
