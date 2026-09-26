# CRESCO Key — Product Requirements Document

Version: 0.2  
Status: **CONCEPT LOCKED — P0 IMPLEMENTATION ACTIVE**  
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

Each relevant gateway must be marked ACTIVE, N/A, BLOCKED, or PROVEN.

| Gateway | P0 state | Rule |
|---|---|---|
| Solana authority program | DELTA CODE PROVEN / DEVNET BLOCKED | Exact amount + recipient + one-time semantics are implemented and Rust-tested; distinct CRESCO Key Devnet deployment remains #8. |
| Mobile Wallet Adapter | CODE PROVEN / RUNTIME BLOCKED | Native provider, signing and transaction construction are implemented; physical-device proof remains #2. |
| Android APK | ACTIVE | Installable debug-APK evidence gate is in PR #14; physical-device install/runtime remains separate. |
| Two-device relay | CODE PROVEN / RELAY_LIVE BLOCKED | Coordination logic and deployment gate exist; real Cloudflare deployment receipt still required. |
| Solana Pay / payment QR | CODE PROVEN / RUNTIME ACTIVE | Native QR parsing is implemented; hero runtime still requires live Devnet state. |
| Seed Vault | INDIRECT | Wallet-layer security, not direct dApp API. |
| SGT | N/A | Do not force into P0. |
| SKR | N/A | Add only if meaningful product value is identified. |
| x402 / nanopayments | N/A | Not required by concept. |
| Cards / fiat off-ramp | N/A | Out of P0 scope. |
| Mainnet | N/A for P0 | Do not imply production settlement. |
| AI agent authority | ROADMAP | Chain of Keys, not P0. |

---

## 16. Technical Reality Check

### PROVEN

- versioned Mandates;
- in-bound autonomous action;
- out-of-bound refusal;
- exact one-time grant;
- changed-action refusal;
- stale-authorization refusal;
- replay refusal;
- Solana Devnet receipts;
- capital-path enforcement;
- Pyth evidence in the prior investment lane.

### CODE PROVEN / RUNTIME PENDING

- native Expo/React Native Android prebuild;
- MWA provider, local wallet connection and signing surfaces;
- direct construction of standing-payment, exact-grant and exact-execution instructions;
- Solana Pay SPL-token QR parsing;
- private request relay with capability-protected request access;
- exact recipient-wallet binding and canonical ATA verification;
- fail-closed ALLOW / REFUSE / UNKNOWN transaction outcome handling;
- deterministic two-wallet Devnet setup tooling;
- Rust, relay, mobile and Devnet-tooling CI.

### RUNTIME BLOCKED / ACTIVE

- distinct CRESCO Key Devnet program deployment (#8);
- physical-device MWA proof (#2);
- live Cloudflare relay deployment (#4);
- repeatable two-device hero run (#5);
- canonical app identity URI + Digital Asset Links (#6);
- installable APK evidence artifact and device install;
- judge-visible transaction/program receipts.

### N/A for P0

- remote MWA dependency;
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

## 20. Implementation state snapshot — 2026-09-26

The concept is locked; implementation has moved past architecture-only work.

### Merged code evidence

- native Android/React Native client with Mobile Wallet Adapter;
- exact Solana Pay SPL-token request parsing;
- CRESCO Key payment program delta:
  - standing in-Key payment;
  - exact Allow Once grant;
  - exact one-time payment;
  - recipient mutation refusal;
  - replay/stale/expiry enforcement;
- private two-device boundary relay;
- direct native construction/submission of CRESCO Key instructions;
- fail-closed transaction classification: unclassified failures remain UNKNOWN;
- guarded relay deployment workflow;
- guarded distinct-program provisioning script;
- deterministic two-wallet Devnet demo bootstrap with recipient A/B ATAs.

### Active evidence work

- PR #14 — Android debug APK build artifact + checksum receipt.

### Promotion blockers

The product must not claim the complete CLOCK IN hero run until all of these exist:

1. distinct CRESCO Key program id deployed to Devnet;
2. live relay deployment receipt;
3. Android APK installed on the target device;
4. local MWA connection/sign/send evidence;
5. real in-bounds ALLOW transaction;
6. real out-of-bounds REFUSE;
7. guardian exact Allow Once confirmation;
8. changed-recipient REFUSE;
9. exact ALLOW ONCE;
10. replay REFUSE;
11. evidence that standing Mandate version/nonce did not change because of Allow Once.

Until then, code/CI evidence and runtime evidence must remain explicitly distinguished.

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
