# CRESCO Key — CURRENT

Updated: 2026-09-30

## North Star

Give a young person real standing financial authority inside explicit bounds, with exact single-use exceptions that do not widen the standing Key.

Canonical sentence:

> The exception moved. The boundary did not.

## Current phase

**CONCEPT LOCKED → P0 IMPLEMENTATION ACTIVE → RUNTIME / LIVE DEPTH PROOF**

## Canonical product source

- `product/PRD.md`

## Canonical governance

- `governance/CANONICAL-BUILD-GOVERNANCE.md`
- `governance/CONDITIONAL-GATEWAY-REGISTRY.md`
- `governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md`

## Proven at code/build level

- native Android/React Native application structure;
- Android debug APK build;
- Android emulator smoke gate PROVEN on GitHub Actions run 36669206551: standalone CRESCO Key launch, Connect wallet UI, official Mock MWA Wallet install, and Android local-association intent discovery;
- Mobile Wallet Adapter integration code;
- emulator MWA session gate PROVEN on run 36699897176: explicit authorize decline → authorize/connect → signMessage approve → force-stop/relaunch with CONNECTED_RESTORED;
- Solana Pay SPL-token request parsing;
- standing payment instruction;
- exact one-time allowance instruction;
- exact one-time payment execution;
- amount mismatch refusal;
- recipient mismatch refusal;
- canonical ATA verification;
- stale/expiry/replay enforcement;
- private two-device relay;
- fail-closed ALLOW / REFUSE / UNKNOWN handling;
- relay deployment workflow;
- distinct-program provisioning script;
- deterministic Devnet bootstrap tooling;
- Rust / relay / mobile / Devnet-tooling CI.

## Blocked / not yet live-proven

- distinct CRESCO Key program id deployed to Devnet;
- physical Android runtime;
- real MWA transaction sign/send + Devnet confirmation evidence;
- production-wallet / physical-Android MWA evidence;
- live Cloudflare relay deployment receipt;
- full two-device CLOCK IN hero run;
- changed-recipient hostile runtime proof;
- replay runtime proof;
- clean-room reproduction;
- external user/operator trial;
- final release-signed APK / dApp Store readiness.

## Active hero run

`5 ALLOW → 12 REFUSE → guardian Allow Once → changed recipient REFUSE → original exact action ALLOW ONCE → replay REFUSE`

## Current collaborator lane

Benita / collaborator lane:

- mobile UX / visual direction;
- preserve authority semantics;
- issue #18 is the recommended parallel workstream.

Owner/runtime lane:

- Devnet program identity/deploy;
- MWA Devnet transaction proof;
- relay deployment;
- canonical live evidence;
- runtime/commit binding.

## Protected human checkpoints

- accept collaborator invitations;
- wallet/key custody;
- configure external service secrets;
- final competition submission;
- any irreversible production action.

## Evidence truth

Current product state is not yet `LIVE CORE LOOP`.

Code/build evidence must not be narrated as complete runtime proof.

## Runtime gate progression

**MWA session sub-gate: PROVEN — LOCAL / PARTIAL**

Canonical successful run: `36699897176`.

Observed sequence:

`decline authorize → authorize/connect → signMessage approve → force-stop/relaunch → CONNECTED_RESTORED`

The earlier lock-screen failures remain preserved as negative environment evidence.

**Next active sub-gate:** real Devnet transaction proof:

`authorize MWA → fund connected test wallet on Devnet → construct Memo transaction → wallet approval → sign/send → RPC submission → confirmation receipt → commit/runtime binding`

The proof intentionally uses a Memo transaction first. It proves the wallet/RPC path without claiming the distinct CRESCO Key program is deployed.

Run `36717900238` failed before runtime on a real dependency mismatch: `@solana-program/memo@0.11.2` expects Kit 6.x while CRESCO uses Kit 7.x. The helper package was removed instead of bypassing npm validation; the Memo instruction is now built directly using the Kit instruction shape.

Run `36718132402` then exposed secure-keyguard flakiness in the Mock MWA Wallet harness before transaction runtime. The transaction-specific gate now uses Solana Mobile's official upstream `android/fakewallet` reference implementation, while the earlier Mock MWA decline/authorize/signMessage proof remains unchanged and separately canonical.

Physical Android and production-wallet compatibility remain separate later gates.

## Next promotion conditions

1. new CRESCO Key program id exists and is deployed to Devnet;
2. deterministic demo state is bootstrapped;
3. relay is live with deployment receipt;
4. Android app runs in emulator/physical device;
5. real MWA transaction path is captured;
6. hero run succeeds with representative negative cases;
7. evidence binds to exact commit/runtime;
8. Post-Vertical-Slice Depth Gap Review runs before heavy final polish.
