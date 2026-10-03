# CRESCO Key — Product Requirements Document

Version: 0.3  
Status: **CONCEPT LOCKED — P0 IMPLEMENTATION ACTIVE — LIVE INTEGRATION / LIVE DEPTH**  
Repository: `Faadil1/cresco-key`  
Target: Solana Mobile CLOCK IN 2026

## 1. Product definition

CRESCO Key is a mobile-first system for **progressive financial authority**.

A young person receives a versioned **Key** that defines what they may do independently. The guardian does not approve every action. The guardian appears only at the boundary.

Inside the Key:

- the young person acts independently;
- the authority path enforces the standing rules;
- no guardian approval is required for each in-bounds action.

At the boundary:

- the action is refused;
- the product explains why;
- the young person may adjust, practice, or ask for more room.

The guardian has three explicit choices:

1. **Not this time**
2. **Allow this exact action once**
3. **Widen the standing Key**

Only the third choice changes standing authority.

### Canonical principle

> **The exception moved. The boundary did not.**

### Supporting authority law

> **No delegate can create authority it was never given.**

The second law is a product/architecture direction. Recursive delegation such as guardian → young person → agent is **roadmap**, not a capability claimed by the initial CLOCK IN vertical slice.

---

## 2. User promise

**Give someone real independence without giving them unlimited authority.**

CRESCO Key should feel empowering to the young person and non-intrusive to the guardian.

The product must avoid becoming:

- a parental surveillance dashboard;
- an approve-everything wallet;
- a generic allowance app;
- a gamified trading product;
- a financial-advice product for minors.

---

## 3. Primary users

### Young person

The primary active user.

Needs:

- clear understanding of their current standing authority;
- fast independent execution inside bounds;
- a private, non-shaming explanation when a boundary is reached;
- the ability to ask for one exact exception;
- contextual learning that does not control their authority.

### Guardian

The authority issuer.

Needs:

- confidence that standing rules are enforced in the capital path;
- exact visibility into what is being requested at the boundary;
- explicit choices: refuse, allow once, widen;
- low notification burden;
- confidence that an approval cannot silently become a different action;
- confidence that a consumed allowance cannot be replayed.

### Future delegate: agent

Not P0.

A future agent may receive a narrower Key from a human principal. It must never be able to create or widen its own authority.

---

## 4. Core primitive

The product primitive is:

**standing authority + exact single-use exception**

The primitive is not:

- a spending limit by itself;
- a parent approval flow by itself;
- a wallet;
- a brokerage flow;
- a learning score;
- a risk score;
- an AI recommendation system.

### Standing Key / Mandate

A Key should be able to define, where relevant:

- beneficiary / authorized principal;
- allowed action types;
- allowed assets;
- per-action amount;
- per-period amount;
- expiry;
- status;
- version;
- nonce;
- optional evidence conditions.

### Exact allowance

An Allow Once authorization must bind one exact request and one successful use.

For the CLOCK IN payment vertical slice, security-relevant action fields should include at minimum:

- standing Mandate reference;
- Mandate nonce/version;
- action type;
- token mint;
- Solana Pay recipient wallet;
- amount;
- expiry or validity constraints;
- one-time identifier / request commitment.

The capital path must be able to verify the executed action against the authorized action.

For SPL-token Solana Pay requests, the program binds the guardian exception to the recipient wallet and derives/verifies the recipient's canonical associated token account (ATA) from recipient + mint + active token program. A client cannot preserve the approved recipient label while silently routing the vault transfer to another token account.

A client-provided label or UI hash alone is insufficient.

---

## 5. Product invariants

These are non-negotiable.

- Proposal is not authority.
- Evidence is not maturity.
- Profit is not decision quality.
- Silence is not consent.
- UNKNOWN is not eligible.
- Practice is not custody.
- Learning completion is not authority.
- XP, badges, streaks, P&L, lessons, AI scores, and coaching never auto-widen authority.
- Market evidence may restrict, expire, or refuse. It never grants or widens authority.
- Context may narrow or explain authority. Context does not mint authority.
- Old authorization material cannot survive a new Mandate version or nonce.
- Allow Once binds the exact approved action.
- Allow Once is consumed after one successful use.
- A materially changed action must refuse.
- Replay must refuse.
- Private family reasoning is not public-chain data by default.
- Pending or unknown execution is never presented as confirmed success.
- The UI is not the guard. The capital path is.
- **Real failure > fake success.**

---

## 6. CLOCK IN concept lock

### Product name

**CRESCO Key**

### Wedge

Progressive financial agency for young people.

### Mobile transformation

The CLOCK IN product is **not** a mobile port of the prior web application.

The central mobile behavior is a two-device authority loop:

```text
YOUNG PERSON
  ↓
attempt exact action
  ↓
ALLOW inside Key
or
REFUSE at boundary
  ↓
ask for this exact action
  ↓
GUARDIAN PHONE
review exact request
  ↓
refuse / allow once / widen
  ↓
YOUNG PERSON PHONE
execute exact allowed action once
```

The guardian is remote by default.

Each phone should use its own local wallet flow through Mobile Wallet Adapter.

The product should not depend on keeping one transaction open while the guardian decides.

---

## 7. Hero CLOCK IN journey

The hero flow uses a stablecoin/payment-intent style action rather than AAPL/investing.

### Beat 1 — Standing autonomy

A young user has a Key that allows up to **10 units** per action.

They receive or scan a payment request for **5 units**.

Expected result:

- action is inside standing authority;
- the young user's wallet authorizes locally;
- CRESCO authority path returns ALLOW;
- transaction executes on Solana Devnet;
- receipt is visible.

No guardian intervention.

### Beat 2 — Boundary

The user attempts **12 units**.

Expected result:

- CRESCO refuses in the execution path;
- UI says the action is outside the current Key;
- the user may request this exact action.

### Beat 3 — Remote exact exception

The guardian receives the request on another device.

Guardian sees the exact security-relevant action details.

Guardian chooses:

**Allow this exact action once**

Guardian signs the grant through their own wallet flow.

Standing Key remains unchanged.

### Beat 4 — Changed action refusal

Before execution, one material field changes.

Preferred proof:

- recipient A → recipient B;

acceptable secondary proof:

- 12 → 11.

Expected result:

**REFUSE / action mismatch**

The allowance remains unconsumed.

### Beat 5 — Exact execution

Restore the originally approved action.

Expected result:

- ALLOW;
- transaction executes;
- allowance becomes USED;
- standing Key version remains unchanged.

### Beat 6 — Replay refusal

Retry the exact same allowed action.

Expected result:

**REFUSE / already used**

---

## 8. Mobile-native requirements

P0 must include:

- functional Android APK;
- React Native or equivalent native Android product surface;
- Mobile Wallet Adapter;
- local wallet authorization on the young person's phone;
- local wallet authorization on the guardian's phone;
- QR/payment-intent input suitable for a phone camera or mobile deep link;
- deep-link/push-driven guardian request flow;
- mobile-resilient state restoration;
- clear states for ALLOW / REFUSE / PENDING / UNKNOWN;
- a Solana receipt judges can independently inspect.

### Seed Vault truth boundary

CRESCO Key does not directly access Seed Vault secrets.

The dApp requests wallet actions through MWA. On Seeker, a compatible wallet may use Seed Vault for hardware-protected custody/signing.

### SGT truth boundary

SGT may prove current Seeker-related wallet/device ownership when correctly verified.

It does **not** prove:

- age;
- parenthood;
- guardianship;
- family relationship;
- consent to a specific financial action.

SGT is not required for P0.

### Notifications truth boundary

Push notifications/deep links are UX transport.

They are not authority.

If notifications fail, the financial boundary must still hold.

---

## 9. Solana requirements

P0 must preserve or adapt the proven CRESCO authority behavior:

1. in-bounds action executes without guardian approval;
2. out-of-bounds action refuses in the capital path;
3. guardian may grant one exact exception;
4. materially changed exception refuses;
5. exact exception executes once;
6. replay refuses;
7. standing Key does not change when Allow Once is used;
8. explicit widening changes version/nonce;
9. stale authorization refuses;
10. uncertain execution remains PENDING or UNKNOWN.

### Required CLOCK IN program delta

The mobile payment lane must bind and verify the actual payment intent, not only a human-readable amount.

The program must bind the exact payment semantics through explicit program state containing at least:

- token mint;
- Solana Pay recipient wallet;
- exact amount;
- one-time request identifier;
- mandate nonce/version;
- expiry/validity where applicable.

The payment instruction itself fixes the action type. For SPL-token execution, the recipient's canonical ATA must be derived and verified rather than trusted as an arbitrary client-selected destination account.

The program must reject an approved request if any material bound field changes.

---

## 10. Network and money truth boundary

P0 may run on Solana Devnet.

The product must clearly say:

- demo / test capital where applicable;
- Devnet;
- no production custody claim;
- no mainnet production claim;
- no brokerage claim;
- no real minor securities execution claim.

The CLOCK IN hero flow should avoid securities-specific framing.

---

## 11. Learning and Practice

Learning remains part of CRESCO Key, but it is not an authority engine.

### P0

At a boundary:

- explain which condition failed;
- explain what changed in a mismatch;
- allow Practice without affecting capital authority.

### P2 — Scam Lab

Potential recurring loop:

- malicious destination mutation;
- broad permission pattern;
- stale authorization;
- replay;
- suspicious request;
- social-pressure scenario.

The user learns against real or faithful Solana permission patterns.

Scam Lab progress must never widen the Key.

---

## 12. Retention principles

The product should not create artificial boundary events to increase engagement.

A healthy user should not need frequent refusals.

Retention may come from:

- contextual learning;
- Practice / Scam Lab;
- meaningful activity history;
- receipts;
- review of standing authority;
- useful in-bounds actions.

No:

- trading streaks;
- confetti for spending;
- financial leaderboards;
- speculative rewards tied to maturity;
- XP → authority conversion.

---

## 13. UX principles

### Young person first

The first hero moment must show autonomy.

Do not begin the demo with guardian controls.

### Boundary without shame

A refusal is a product state, not a punishment.

Prefer:

**Outside your Key**

over:

**Parent denied you**

### Exactness must be legible

The guardian must understand exactly what they are authorizing.

The young person must understand why a changed action no longer matches.

### Motion must have a job

Motion may communicate:

- boundary;
- causality;
- continuity;
- one-time exception;
- consumption;
- hierarchy;
- feedback.

The standing boundary should remain visually stable while a discrete exception crosses it.

---

## 14. Non-goals for CLOCK IN P0

Do not build:

- a generic family wallet;
- a universal OS transaction interceptor;
- a brokerage;
- a production card network;
- a Visa/Mastercard HCE bridge;
- geolocation as a source of financial authority;
- SGT family lineage;
- direct Seed Vault access by CRESCO;
- auto-signing through Seed Vault;
- an AI financial adviser for minors;
- an agent-first product;
- a CRESCO token;
- forced SKR integration;
- a generic policy SDK as the hero experience;
- mainnet claims not proven by runtime evidence.

---

## 15. Conditional Gateway Registry

The detailed project registry is canonical at:

- `governance/CONDITIONAL-GATEWAY-REGISTRY.md`

From the 2026-10-01 System Control Plane reconciliation forward, operational gateway state may use:

`PROVEN / ACTIVE / BLOCKED / PENDING / N/A / UNKNOWN`.

This extends the earlier local four-state convention without rewriting historical records.

Current P0 summary:

| Gateway | P0 state | Rule |
|---|---|---|
| Solana authority program code | **PROVEN** | Exact amount + recipient + one-time semantics are implemented and Rust-tested. |
| Distinct CRESCO Key Devnet program | **ACTIVE** | Public program identity `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP` is committed for the secret-backed keypair; next gate is Devnet deployment, receipt and commit binding. |
| Mobile Wallet Adapter session | **PROVEN — LOCAL/PARTIAL** | Run `36699897176` proves decline → authorize/connect → signMessage → relaunch recovery in the emulator. |
| Real MWA Devnet sign/send | **ACTIVE / NOT PROVEN** | Generic Memo proof is secondary technical evidence; it must not displace the actual CRESCO program path. |
| Android standalone emulator runtime | **PROVEN — LOCAL/PARTIAL** | Run `36669206551`; physical Android remains separate. |
| Two-device relay code | **PROVEN at code/test scope** | Coordination logic exists; live Cloudflare deployment remains BLOCKED. |
| Solana Pay / payment QR | **ACTIVE** | Native parsing exists; real hero scan/payment execution remains unproven. |
| Product Reality / Integration-First v1.3 | **ACTIVE** | Product value and real action outrank proof-only artifacts; evidence should exhaust the canonical product runtime. |
| Claim → Runtime → Evidence Graph | **ACTIVE** | Material live/payment/recovery claims now trace through `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`. |
| Engineering Quality Assurance | **PENDING / BACKFILL_REQUIRED** | Must be completed before terminal-sensitive promotion. |
| TRACE / Design Experience Assurance | **ACTIVE** | Evaluator-facing mobile UX makes the design-assurance route applicable. |
| Seed Vault direct dApp access | **N/A** | CRESCO uses MWA; compatible wallets may use Seed Vault underneath. |
| SGT | **N/A** | Do not force into P0. |
| SKR | **N/A** | Add only if meaningful product value is identified. |
| x402 / nanopayments | **N/A** | Not required by concept. |
| Cards / fiat off-ramp | **N/A** | Out of P0 scope. |
| Mainnet | **N/A for P0** | Do not imply production settlement. |
| AI agent authority | **N/A P0** | Chain of Keys remains roadmap. |

---

## 16. Technical Reality Check

### PROVEN at bounded code / local runtime scope

- versioned Mandates and standing authority semantics;
- exact one-time grant;
- amount / recipient mismatch refusal logic;
- stale / expiry / replay enforcement logic;
- canonical recipient ATA verification;
- Android standalone emulator launch;
- MWA authorize decline / authorize-connect / signMessage / app-relaunch behavior in the emulator;
- Solana Pay SPL-token request parsing;
- private relay code and tests;
- fail-closed ALLOW / REFUSE / UNKNOWN classification;
- deterministic two-wallet Devnet bootstrap tooling;
- Rust / relay / mobile / Devnet-tooling CI.

### ACTIVE / NOT YET PROVEN as integrated product runtime

- distinct CRESCO Key program deployment to Devnet;
- deterministic payment state bootstrapped against that distinct program;
- real CRESCO payment transaction from the mobile MWA path;
- in-bounds 5-unit ALLOW consequence;
- 12-unit capital-path REFUSE;
- guardian exact Allow Once confirmation;
- changed-recipient runtime refusal;
- exact one-use success;
- replay refusal;
- standing Key unchanged before/after Allow Once;
- live Cloudflare relay;
- full two-device hero path;
- runtime → receipt → commit → deployment binding;
- clean-room / judge self-serve reproduction.

### Secondary technical proof lane

A generic Memo transaction through MWA may prove wallet/RPC mechanics, but under Integration-First v1.3 it is **not** the CRESCO live core and must not displace the load-bearing program/payment path.

Latest inspected generic transaction run `36761591880` failed before transaction runtime because its upstream fakewallet build required Android platform 37, which the CI SDK environment could not install. No transaction success is claimed from that run.

### UNKNOWN / later evidence

- physical Android behavior;
- production-wallet compatibility;
- external user/operator usability;
- production-like persistence/security/latency beyond the current bounded test environment.

### N/A for P0

- remote MWA as a core dependency;
- durable nonce requirement;
- SGT family identity;
- geofence authority;
- HCE/card bridge;
- mainnet production settlement.

---
## 17. Demo-First Architecture

Target P0 flow:

```text
Payment QR / mobile request
        ↓
CRESCO mobile parses exact action
        ↓
Young person's local MWA wallet
        ↓
CRESCO onchain authority program
        ↓
 ┌───────────────┬────────────────┐
 │ IN BOUNDS     │ AT BOUNDARY    │
 │ ALLOW         │ REFUSE         │
 │ execute       │ request exact  │
 └───────────────┴───────┬────────┘
                         ↓
                  private relay
                         ↓
                 guardian mobile
                         ↓
                  guardian MWA
                         ↓
             grant exact allowance
                         ↓
                  allowance receipt
                         ↓
          young person retries action
                         ↓
 changed action → REFUSE
 exact action → ALLOW ONCE
 replay → REFUSE
```

The relay can carry private coordination metadata.

The onchain program remains the financial authority.

---

## 18. Build priorities

### P0 — submission-critical vertical slice

- project structure;
- Android/React Native app;
- MWA;
- role/account connection;
- Key display;
- payment QR/deep-link parsing;
- in-bound execution;
- boundary refusal;
- guardian request relay;
- exact guardian grant;
- changed destination/amount refusal;
- exact one-time execution;
- replay refusal;
- Devnet receipt;
- signed release APK;
- deterministic demo path.

### P1 — product quality

- polished boundary motion;
- exact exception visual treatment;
- notification/deep-link hardening;
- degraded-network UX;
- accessibility;
- state restoration;
- judge-safe evidence screen.

### P2 — retention

- Practice / Scam Lab;
- contextual learning;
- post-action review;
- useful history without surveillance framing.

### P3 — roadmap proof

- Chain of Keys:
  guardian → young person → narrower agent Key;
- no delegate may grant more authority than it holds.

---

## 19. Definition of Done — P0

P0 is not done until a reviewer can reproduce the following on the mobile build:

1. install a signed Android APK;
2. connect the young person's wallet through MWA;
3. connect the guardian's wallet on a separate device or clearly separate mobile role flow;
4. inspect the current standing Key;
5. submit an in-bounds payment action and see real Devnet execution;
6. submit an out-of-bounds payment action and see real capital-path refusal;
7. create an exact boundary request;
8. guardian grants exactly that request once;
9. mutate a material field and see refusal;
10. restore the exact approved action and execute once;
11. replay and see refusal;
12. verify the standing Key did not widen;
13. inspect transaction/program evidence independently;
14. see no fake production, brokerage, custody, KYC, minor-securities, or mainnet claim.

---

## 20. Implementation state snapshot — 2026-10-01

The concept remains locked. The project is **ACTIVE** and is now in live-integration / live-depth work.

### Proven / merged evidence

- native Android/React Native client with Mobile Wallet Adapter;
- Android standalone emulator runtime — run `36669206551`;
- emulator MWA decline / authorize / signMessage / relaunch behavior — run `36699897176`;
- exact Solana Pay SPL-token request parsing;
- CRESCO Key payment program delta:
  - standing in-Key payment;
  - exact Allow Once grant;
  - exact one-time payment;
  - amount / recipient mutation refusal;
  - replay / stale / expiry enforcement;
- private two-device boundary relay code;
- direct native construction/submission of CRESCO Key instructions;
- fail-closed transaction classification;
- guarded relay deployment workflow;
- guarded distinct-program provisioning script;
- deterministic two-wallet Devnet demo bootstrap with recipient A/B ATAs;
- current Reality Ledger and Claim → Runtime → Evidence Graph.

### Current live-integration priority

The primary sequence is now:

`DISTINCT CRESCO PROGRAM ID → DEVNET DEPLOY → DEPLOYMENT RECEIPT/COMMIT BINDING → DETERMINISTIC PAYMENT BOOTSTRAP → REAL MOBILE CRESCO ACTION → HERO NEGATIVE/BOUNDARY/REPLAY CASES`

The open generic Memo/MWA transaction proof is secondary technical evidence. It is not the product's Definition of Done and is not a substitute for the actual CRESCO program path.

### Promotion blockers

The product must not claim the complete CLOCK IN hero run until all materially applicable items are satisfied:

1. distinct CRESCO Key program id is deployed to Devnet;
2. deterministic demo/payment state is bootstrapped against that program;
3. live relay deployment receipt exists;
4. mobile MWA path executes the real CRESCO program action;
5. real in-bounds ALLOW consequence is observed;
6. real out-of-bounds REFUSE is observed;
7. guardian exact Allow Once is confirmed;
8. changed-recipient REFUSE is observed without consuming the allowance;
9. exact original action succeeds once;
10. replay refuses;
11. standing Mandate version/nonce remains unchanged because Allow Once is not Widen;
12. runtime evidence binds through receipt → commit → deployment;
13. failure/recovery and clean-room/self-serve paths are exercised;
14. Engineering Quality backfill receipt exists;
15. TRACE/design assurance is resolved when still triggered;
16. Post-Vertical-Slice Product Exploitation / Depth Gap Review runs after the first live slice;
17. Project Finisher performs terminal assurance before SUBMISSION_READY.

Until then, technical, local, behavior, outcome and production evidence classes remain explicitly separated.

---
## 21. Collaboration rule

This file is the canonical shared product source of truth for collaborators.

Changes that alter any of the following require a deliberate PRD update before or with implementation:

- target user;
- product primitive;
- product invariants;
- authority semantics;
- hero demo;
- truth boundary;
- P0/P1/P2 scope;
- network/custody claims;
- mobile architecture;
- definition of done.

Implementation convenience must not silently change product law.


---

## 22. System Control Plane / Integration-First reconciliation — 2026-10-01

This project predates System Control Plane v1. The new central canon is adopted **from this material touch forward** and is not backdated.

### No product-law change

This reconciliation does **not** change:

- target user;
- progressive-authority wedge;
- standing authority + exact single-use exception primitive;
- hero flow;
- authority invariants;
- Devnet truth boundary;
- roadmap separation for agent delegation.

### Build-priority change

The product now explicitly follows Integration-First / Maximum Product Exploitation v1.3:

- product value + real action outrank proof-only artifacts;
- evidence should be generated from or bound to the canonical product runtime;
- live product mode is primary; replay/deterministic mode is fallback;
- read-only is not the default when a safe value-creating action is feasible;
- the highest safe justified P0 action tier is **APPROVAL_GATED_WRITE**;
- a generic wallet/RPC transaction spike is useful technical proof but is not the live CRESCO product loop.

### Product Exploitation Loop

Status:

**ACTIVE — formal post-slice loop pending the first real live CRESCO vertical slice.**

Immediately after the first integrated live slice works, run the Post-Vertical-Slice Depth Gap Review before heavy polish or submission packaging. Continue material product depth while marginal user value, differentiation, integration, consequence, resilience, or workflow completeness justifies cost/risk/deadline.

### Evidence Graph

Material live, payment, reliability/recovery and terminal claims must now trace through:

`CLAIM → SCENARIO → RUNTIME_EXECUTION → DEPENDENCY → RECEIPT/TELEMETRY → COMMIT → DEPLOYMENT`

Project graph:

- `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`

A missing edge remains PARTIAL / MISSING / UNKNOWN; it is never silently promoted.

### Lifecycle completeness

Project lifecycle coverage now lives at:

- `governance/BUILD-LIFECYCLE-COVERAGE.yaml`

Earlier stages are reconstructed only where existing canonical evidence supports them and are explicitly labeled as such.

### Quality / design / terminal routing

- Engineering Quality Assurance: **BACKFILL_REQUIRED** before the next terminal-sensitive promotion.
- TRACE / Design Experience Assurance: **triggered** for evaluator-facing mobile experience and must be resolved before a design-sensitive terminal transition.
- Project Finisher: remains required only after BUILD_CANDIDATE_READY.
- protected human actions remain human-owned.

### Exact next gate

**LIVE_CORE_G0 — DISTINCT CRESCO KEY DEVNET PROGRAM DEPLOYMENT + BOOTSTRAP**

Exact next product action:

`HUMAN-CONTROLLED DISTINCT PROGRAM KEY → DEVNET DEPLOY → RECEIPT/PROGRAM ID → COMMIT BINDING → DETERMINISTIC PAYMENT BOOTSTRAP → REAL MOBILE CRESCO TRANSACTION`
