# CRESCO Key — Current State

Updated: 2026-09-27

This file is the operational handoff for collaborators.

The PRD remains the product source of truth.

## Phase

**CONCEPT LOCKED → P0 IMPLEMENTATION ACTIVE → RUNTIME PROOF NEXT**

## Merged / code-proven

- canonical PRD v0.2;
- Android Expo/React Native app;
- Mobile Wallet Adapter integration code;
- Solana Pay SPL-token QR parsing;
- standing in-Key payment instruction;
- exact one-time guardian allowance instruction;
- exact one-time payment execution;
- amount mutation refusal;
- recipient mutation refusal;
- canonical recipient ATA verification;
- stale/expiry/replay enforcement;
- private two-device boundary relay;
- fail-closed ALLOW / REFUSE / UNKNOWN handling;
- relay deployment workflow;
- distinct-program provisioning script;
- deterministic two-wallet Devnet bootstrap tooling;
- Android debug APK build workflow;
- Rust, relay, mobile and Devnet-tooling CI.

## Verified build evidence

The Android APK evidence workflow has completed successfully.

This proves the project can typecheck, prebuild Android, compile an installable debug APK and upload it as CI evidence.

It does **not** prove physical-device runtime.

## Open runtime gates

### #8 — Distinct CRESCO Key program id

Need:
- generate a new program keypair outside git;
- replace the temporary inherited public program id;
- deploy the new program to Devnet;
- preserve the original CRESCO proof program untouched.

### #6 — App identity URI / Digital Asset Links

Need:
- canonical app identity domain;
- Android signing certificate relationship;
- production-shaped wallet identity verification.

### #2 — Android / MWA runtime

Need:
- install APK on Android/emulator;
- connect wallet;
- capture rejection/cancel behavior;
- sign/send Devnet transaction;
- app-restart state truthfulness.

Current device constraint:
- project owner currently has iPhone only;
- development path is emulator-first;
- physical Android will be borrowed/obtained for final runtime proof.

### #4 — Live boundary relay

Need:
- configure Cloudflare repository secrets;
- manually deploy Worker;
- preserve deployment receipt;
- run two-device request flow.

### #5 — Full CLOCK IN hero run

Need real repeatable evidence for:

1. 5-unit in-bounds payment → ALLOW.
2. 12-unit payment → REFUSE.
3. exact boundary request created.
4. guardian exact Allow Once confirmed.
5. changed recipient → REFUSE.
6. original exact recipient → ALLOW ONCE.
7. replay → REFUSE.
8. standing Mandate version/nonce unchanged by Allow Once.

## Current open PRs

At the time of this handoff, no collaborator should assume an old branch is current. Check GitHub before starting work.

Use `main` as the base unless a specific issue says otherwise.

## Recommended parallel work

While runtime infrastructure is being proven, a collaborator can advance the mobile UX/visual layer without blocking the backend:

- My Key;
- payment review;
- boundary state;
- exact request;
- guardian review;
- allowance-ready state;
- changed-action refusal;
- receipt/used state;
- replay refusal;
- motion grammar;
- accessibility.

Do not create alternate product concepts inside implementation branches.

## Stop conditions

Ask/coordinate before proceeding if a change would:

- widen/narrow the product primitive;
- change who can grant authority;
- make learning/AI/context alter financial authority;
- remove fail-closed behavior;
- move authority into the relay/UI;
- replace exact recipient binding with labels;
- introduce production/mainnet claims;
- change the CLOCK IN hero sequence.

## Useful links

Repository:
https://github.com/Faadil1/cresco-key

PRD:
https://github.com/Faadil1/cresco-key/blob/main/product/PRD.md

Issues:
https://github.com/Faadil1/cresco-key/issues
