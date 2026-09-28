# CRESCO Key — HANDOVER

Updated: 2026-09-28

## Purpose

This file is the canonical continuity handoff for the current workstream.

Read with:

1. `product/PRD.md`
2. `state/CURRENT.md`
3. `governance/CONDITIONAL-GATEWAY-REGISTRY.md`
4. `governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md`

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

## Runtime truth

Not yet proven end-to-end on a real Android device.

Do not claim:

- live production custody;
- mainnet readiness;
- production KYC;
- real minor securities execution;
- live physical Android hero run;
- live gateway settlement beyond what actual receipts prove.

## Ownership split

### Runtime/evidence lane

Current focus:

- new program identity + Devnet deploy;
- deterministic demo bootstrap;
- live relay;
- Android MWA runtime;
- hero run receipts;
- commit/runtime binding.

### Benita / design collaborator lane

Recommended issue:

- #18 Mobile UX / visual direction pass

Safe areas:

- My Key;
- payment review;
- boundary/refusal;
- exact request;
- guardian review;
- Allow Once ready;
- changed-action refusal;
- receipt/consumed/replay states;
- motion;
- accessibility.

Coordinate before changing:

- authority semantics;
- transaction classification;
- relay authority role;
- Mandate/nonce/version;
- P0 product law;
- truth-boundary claims.

## Current blockers

- no physical Android owned by project owner;
- emulator-first development path;
- physical Android still desired for strongest final proof;
- new Devnet program identity/deploy still pending;
- Cloudflare relay runtime still pending.

## Promotion discipline

Every gate uses only:

- ACTIVE
- N/A
- BLOCKED
- PROVEN

Evidence classification remains:

- LIVE
- LOCAL
- LOCAL_STUB
- PRESEEDED
- SIMULATED
- PARTIAL
- NOT_IMPLEMENTED

Claims remain:

- OBSERVED
- INFERRED
- UNKNOWN

## End-of-cycle requirement

Before submission/freeze:

- update CURRENT;
- update HANDOVER;
- create final snapshot;
- bind evidence to final commit/runtime;
- run Judge Performance Assurance;
- run Submission Integrity;
- preserve post-mortem after result.
