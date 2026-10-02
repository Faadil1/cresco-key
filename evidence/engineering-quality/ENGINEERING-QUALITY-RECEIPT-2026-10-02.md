# Engineering Quality Assurance Receipt — 2026-10-02

Verdict: **PASS_WITH_ACCEPTED_DEBT**

Covered code commit: `4c8811b5adf867244fffb3122e69f80c1caccd66`

## What changed

The bounded EQA backfill repaired three material quality findings without changing product law:

1. relay coordination states are now monotonic after leaving `PENDING`;
2. expiry is enforced before relay event application, not only on later reads;
3. the mobile RPC outcome boundary no longer uses an unsafe `as unknown as` escape and instead adapts Solana Kit's readonly response shapes explicitly.

## Regression evidence

- Boundary Relay CI `37039621677`: **PASS**
- Mobile CI `37039621579`: **PASS**
  - dependency audit remains visible as tracked accepted debt;
  - TypeScript typecheck: PASS;
  - Expo Android prebuild: PASS.
- existing Rust and Devnet-tooling code remained unchanged from previously successful CI-proven source states;
- existing Android-emulator/MWA-session canonical receipts are preserved at their original LOCAL/PARTIAL evidence class.

## Accepted / deferred debt

Issue #33 tracks the current Expo/mobile dependency graph:

- 13 transitive audit findings: 8 moderate / 5 high;
- notable high advisory path: `node-forge` through Expo CLI/config/code-signing packages;
- npm's available force path proposes a breaking Expo 44 downgrade and is therefore **not** applied;
- deterministic dependency locking + compatible upstream remediation must be revisited before PRE_SUBMISSION / RELEASE.

Large mixed-responsibility files (`BoundaryWorkspace.tsx`, `programs/keys/src/lib.rs`) remain explicit maintainability debt. They are not refactored merely for a quality score during the live-integration deadline window.

## Protected contracts

Preserved:

- standing authority + exact Allow Once semantics;
- exact amount/recipient binding;
- fail-closed REFUSE / UNKNOWN behavior;
- relay = coordination only;
- evidence schemas and deterministic hero sequence;
- human-controlled key/secrets boundaries;
- PRD scope.

This receipt is engineering-quality evidence only. It does **not** promote the Live Core Loop or submission readiness.
