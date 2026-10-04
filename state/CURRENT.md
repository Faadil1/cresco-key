# CRESCO Key — CURRENT

Updated: 2026-10-04

## Project status

**ACTIVE**

This is an existing, authorized hackathon product project. It is not FROZEN, SUBMITTED, or REOPENED.

System Control Plane v1 and Product Reality / Integration-First v1.3 are adopted **from 2026-10-01 forward** at this material touch. They are not backdated into prior project history.

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
- `PRODUCT-REALITY-POLICY.yaml@1.3.0`
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

## Integration-First v1.3 reconciliation

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

Next action: wire/execute the mobile runtime against those public Devnet identities and capture the first real CRESCO transaction receipt from the product path.

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
