# CRESCO Key — Collaborator Start Here

This is the fastest path to become productive without breaking the product or authority model.

## 1. Read these first

In order:

1. `product/PRD.md` — canonical product source of truth.
2. `docs/CURRENT-STATE.md` — what is done, what is blocked, what is safe to work on now.
3. `docs/DEMO-FIRST-ARCHITECTURE.md` — P0 mobile flow and evidence requirements.
4. `docs/EXACT-PAYMENT-INTENT.md` — exact amount/recipient semantics.
5. `docs/TECHNICAL-REALITY-CHECK.md` — code proof vs runtime proof.

If an implementation decision conflicts with the PRD, the PRD wins until the PRD is deliberately changed.

## 2. Product in one minute

CRESCO Key gives a young person real standing financial authority inside explicit bounds.

Inside the Key:
- act independently;
- no per-action guardian approval.

At the boundary:
- the capital path refuses;
- the user may ask for this exact action;
- the guardian may refuse, widen the standing Key, or allow one exact action once.

Canonical principle:

> The exception moved. The boundary did not.

Hero CLOCK IN sequence:

`5 ALLOW → 12 REFUSE → guardian Allow Once → changed recipient REFUSE → original exact action ALLOW ONCE → replay REFUSE`

## 3. Non-negotiable product laws

Do not silently change these in implementation:

- learning never auto-widens authority;
- context can narrow/explain authority but cannot mint authority;
- UNKNOWN is never shown as success;
- Allow Once binds the exact approved action;
- changed amount/recipient must refuse;
- replay must refuse;
- one-time exception does not change the standing Key;
- the UI is not the guard; the capital path is;
- real failure is better than fake success.

If a change affects one of these, update `product/PRD.md` in the same PR.

## 4. Repository map

- `apps/mobile/` — Expo/React Native Android client, MWA, QR, two-device UI.
- `programs/keys/` — Anchor/Solana authority program.
- `services/relay/` — Cloudflare boundary relay; coordination only.
- `tools/devnet/` — deterministic Devnet demo setup.
- `scripts/` — guarded program provisioning/deployment tooling.
- `product/PRD.md` — canonical shared product requirements.
- `docs/` — architecture, evidence, runtime and collaboration docs.
- `.github/workflows/` — CI/evidence gates.

## 5. Current work split

### Safe parallel lane: mobile UX / visual direction

A collaborator can work independently on:

- young-person-first mobile hierarchy;
- My Key screen;
- payment review;
- boundary/refusal state;
- exact exception request;
- guardian exact-request review;
- allowance-ready / consumed states;
- receipt/evidence presentation;
- motion language where motion has a job;
- responsive Android layout;
- accessibility and legibility.

Do not change security semantics to make a screen easier to design.

### Coordination-required lane

Coordinate before changing:

- Anchor program instruction semantics;
- Mandate/nonce/version behavior;
- Allow Once state;
- transaction outcome classification;
- relay authority boundaries;
- truth-boundary claims;
- P0 Definition of Done.

## 6. Design direction

Avoid:

- generic dark fintech/SaaS dashboards;
- admin-first parental-control aesthetics;
- excessive cards;
- decorative gradients/motion;
- gamification that links progress to financial authority;
- screens that hide exact payment details.

Prefer:

- young person first;
- calm, legible authority state;
- clear boundary without shame;
- exact action details before approval;
- standing Key visually stable;
- exception represented as discrete and consumable;
- motion for causality, boundary, continuity, feedback and consumption.

## 7. Branch / PR workflow

1. Pull latest `main`.
2. Create a focused branch:
   - `ux/<scope>`
   - `fix/<scope>`
   - `p0/<scope>`
3. Keep one product concern per PR when practical.
4. In the PR body, state:
   - what changed;
   - which PRD requirement it serves;
   - what is code-proven;
   - what remains runtime-unproven;
   - screenshots/video for visual work.
5. Do not commit secrets, wallets, keypairs or private relay capabilities.

## 8. Local mobile setup

From `apps/mobile`:

```bash
npm install
npx expo prebuild --platform android
npm run android
```

Use Node 22.13+.

MWA requires a custom Android development build; Expo Go is not the runtime proof path.

If no physical Android is available, emulator-first work is acceptable for development. Physical Android evidence remains a later gate.

## 9. What not to claim yet

Do not describe any of these as proven until the corresponding runtime evidence exists:

- physical-device MWA success;
- live CRESCO Key Devnet program;
- live two-device relay;
- full end-to-end CLOCK IN hero run;
- production custody/KYC;
- mainnet production readiness;
- real securities execution for minors.

## 10. First collaborator task

Recommended first contribution:

**Mobile UX / visual-direction pass over the P0 hero journey.**

Start from the existing flow rather than redesigning the product concept.

See the open collaboration issue once created in GitHub for acceptance criteria.
