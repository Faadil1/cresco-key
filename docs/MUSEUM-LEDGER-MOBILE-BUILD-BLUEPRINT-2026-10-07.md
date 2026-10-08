# CRESCO Key — Museum Ledger / Mobile Build Blueprint v1

Date: 2026-10-07
Status: DESIGN DIRECTION LOCKED BY PROJECT OWNER / IMPLEMENTATION BLUEPRINT
Source of truth: `Faadil1/cresco-key@main`, `state/CURRENT.md`, `state/HANDOVER.md`, `product/PRD.md`, existing mobile implementations.
Selected visual reference: owner-selected Museum Ledger screen ("Freedom with Boundaries"). It is a visual reference, **not** a screenshot of implemented app behavior.

## Intent and non-goals

Turn CRESCO Key into a tactile, premium, editorial mobile product with an original *family money instrument* signature. Contrast museum catalogue labels / heirloom key materials with an exact, verifiable Solana authority mechanism. Keep the user-first business behavior; no new fake payment flows, mock merchants, approval shortcuts, or marketing-only loop.

No new spending authority. No direct SDK custody or mainnet. No claims of physical-Android G1, live relay, production-wallet support, full transaction loop, or SKR integration before their actual evidence exists. G1 remains separate and pending. This blueprint does **not** itself prove a new external-user capability.

Source code: `apps/mobile/App.tsx`, `src/MobileExperience.tsx`, `src/BoundaryWorkspace.tsx`, `src/WalletGate.tsx`; preserve payment, relay and wallet functions. Cross-check canonical issue #33, TRACE design assurance and gateway registry before terminal promotion.

## Design grammar

- **One visual contrast**: archival ivory/paper + precise instrument behavior. Harmony: consistent hairline brass dividers, uppercase micro-labels, typographic grid and product nouns.
- Brand mark: bespoke **key/sunburst** as original vector asset; no third-party logo or arbitrary full-screen hero photographic dependency.
- Colors (see `apps/mobile/src/design/museumLedger.ts`): ivory `#F5F0E6`, ink `#181813`, aged brass `#B28B49`, vermilion `#AD422C` (boundary only), verified green `#42664D`, muted slate `#66635E`.
- Hierarchy: editorial serif display (headlines only), readable body/system sans, narrow tracked uppercase microcopy. No Google font hotlink without license/packaging review. Native `serif` fallback is allowed pending vetted font packaging.
- Layout: 20–24 px horizontal safe-area padding; single-column phone-first; 8-pt vertical rhythm with optical editorial spacing; 1 px rules; 12–16 px corner radius on operational surfaces (not every block is a card); main tap targets >=44x44; 320 px minimum viewport QA.
- Accessibility: text contrast >=4.5:1 for regular text; accessible labels; no color-only states; dynamic text; keyboard/screen-reader order; reduce-motion alternative; distinguish live/pending/error verbally.
- Motion: only state transitions get restrained key-seal micro-interactions (approx 180–260ms). No animation as authorization evidence. No reliance on blur/shader/3D to understand or complete a payment.

## IA / routing

Entry — **Connect / choose role**: wallet is required for protected actions; users choose young person or guardian in the current app. Replace "P0 mobile workspace" and "JUDGE PATH" wording on consumer-facing screens, but retain identifiable test selectors/button text required by MWA evidence until tests are updated. Preserve the functional `Connect wallet` and `Sign TRC-01 proof message` behavior.

After role:
1. **THE KEY** (young home, no intent or default state)
2. **THE BOUNDARY** (young intent refused, exact request pending)
3. **THE DECISION** (guardian incoming exact request)
4. **THE LEDGER** (only real available latest receipts/events until real history exists)
5. **WITHIN THE KEY** (verified, in-bounds ALLOW state)

Routes should derive from actual state, not hardcoded narrative/scenes. User can always return to role selection and inspect last known outcome. Reset display state should never reset on-chain state or manufacture receipts.

## Screen 01 — THE KEY / overview

Goal: answer "What may I do on my own?"; impress through the symbol but prioritize the action.

- Masthead `CRESCO / Key`; top micro-label `FAMILY MONEY, PROGRAMMABLE`. Small network truth line `SOLANA DEVNET`.
- Editorial display: **Freedom with Boundaries.** Supporting: `Act independently inside your Key. Ask only when you reach a boundary.`
- Key/sunburst vector occupies a fixed portion of the hero; responsive not blocking the CTA.
- `EXHIBIT A / YOUR STANDING KEY`: actual fetched/known limit, mint and authorized recipient data. If not fetched, show `Rules not loaded`, NOT `$25/day` or invented merchant approvals. Seeded public demo scenarios must be visibly tagged `Configured Devnet test intent`.
- Primary action `Scan a payment` → existing `setScanning(true)` and `PaymentScanner`.
- Secondary `Choose configured test intent` → existing `loadDemoIntent` options; only show when configured.
- Optional `Inspect last receipt` → latest receipt viewer only if available.
- Loading/empty/error: `Connect a wallet to inspect this Key`, `No intent loaded`, `RPC unavailable — no authorization decision recorded`.
- No invented token balance/merchant logos, no fake "ACTIVE" if state has not been read.

## Screen 02 — THE BOUNDARY / refusal

Goal: show a real refusal is product behavior, not a crash.
- Vermilion rule + `EXHIBIT B / BOUNDARY REACHED`.
- Title `This action is outside your Key.`
- Exact attempted `amount / mint / recipient` from `intent`; plain-language reason only when the observed on-chain failure/result supports it. Show a fallback `Why this was refused is not yet confirmed` otherwise.
- Refusal proof pill: `REFUSED` only for observed `TransactionOutcome.state === "REFUSE"`, `UNKNOWN` for RPC uncertainty, not a guessed failure.
- Primary `Ask guardian` only after verified refusal and relay configured → reuse `createBoundaryFromVerifiedRefusal` and existing capability link. **Do not** create guardian request on merely unverified client error.
- Next step displays relay `PENDING / REFUSED / ALLOWANCE_SUBMITTED / EXPIRED / UNKNOWN` as coordination, not payment approval.
- Secondary `Inspect details` opens exact on-chain/public request fields, with no secret relay tokens in sharable screen or receipt.
- Connection offline/relay missing: actionable fail-closed message and safe return.

## Screen 03 — THE DECISION / guardian

Goal: give guardian an understandable decision about **this exact action**, no silent widening.
- `EXHIBIT C / THE DECISION`; headline `One action. Your call.`
- Request card: amount in base units if decimals absent, mint, recipient, request expiry, nonce, request state. If no incoming capability: `Open a protected request from the young person's device`. Do not imply notifications/push or real-time syncing exists where it does not.
- Primary `Allow this exact payment once` → `grantExactAllowanceOnce` using current wallet adapter and Solana program. Hold in loading while signing/confirming. A relay marker is NOT payment execution.
- Secondary `Not this time` → `refuseBoundaryRequest` (existing `REFUSED` relay event).
- Explain `Approval applies only to this recipient, amount, nonce and expiry. The standing Key remains unchanged.`
- Terminal: `Declined`, `Allowance confirmed on Devnet; payment not yet executed`, or `Unknown — do not retry blindly`.
- Disable decisions when request not `PENDING`. No `Widen Key` button: charter widening is PRD scope/roadmap, not implemented P0.

## Screen 04 — THE LEDGER / inspect proof

Goal: answer "What actually happened?" not show marketing badges.
- `EXHIBIT D / THE LEDGER`; title `Every decision leaves a record.`
- Initially show **Latest recorded receipt**, not a fake scrollable historical ledger. Current `latestReceiptJson` is in-memory and can be shared. A persistent timeline needs separately implemented secure state/provenance.
- Fields from public runtime receipt: schema, scenario, observed outcome (ALLOW / REFUSE / UNKNOWN), timestamp, program id, public signature (when present), request id, and RPC confirmation if present; redact relay capability URL/token and wallet secret fields.
- Tier labels: `CODE/BUILD`, `LOCAL / Mock MWA`, `DEVNET PROGRAM DEPLOYED`, `MOBILE G1 PENDING` as appropriate. Do not label generic Devnet/bootstrap evidence as user payment evidence.
- Primary `Share latest receipt JSON` → existing `Share.share`. If no receipt, show `No runtime receipt captured yet`.
- An exact receipt / explorer deep link only for a verified public signature, using a trusted devnet explorer target.
- Never fabricate ledger rows for UI polish. Use explicit `ILLUSTRATIVE / NOT A TRANSACTION` if design QA requires visual fixtures, excluded from production evidence.

## Screen 05 — WITHIN THE KEY / verified success

Goal: make independent agency and consequence clear.
- `EXHIBIT E / WITHIN THE KEY` + green seal, never simply an optimistic animation.
- `This action was permitted by your Key.` only after observed `TransactionOutcome.state === "ALLOW"` + qualifying RPC confirmation.
- Amount, mint, recipient, signature, and `View transaction` when available. `No guardian approval needed` only on standing-rule path (not exact Allow Once).
- Single next action `Inspect receipt`; secondary `Back to my Key`.
- For exact allowance execution, show distinct `Allowed once` label and no suggestion that standing limit grew.
- Changed recipient / replay: use separate refusal view with proof from actual outcome. If RPC is unknown, show uncertainty rather than "safe/refused" victory.

## Component map — React Native / no redesign of money logic

1. `MuseumLedgerShell`: SafeArea, scroll, masthead, background, focus order, network scope, responsive spacing.
2. `KeyEmblem`: own original small vector asset/shape with decorative accessibility hidden; no dynamic claim from decoration.
3. `ExhibitHeading`: index + eyebrow + serif title + subtitle; identical across all screens.
4. `CharterPlate`: labeled, real authority data; loading/missing states.
5. `ExactActionPlate`: amount, mint, recipient with provenance and context.
6. `DecisionSeal`: `ALLOW/REFUSE/PENDING/UNKNOWN` with text, color and icon. State from actual result only.
7. `ActionPair`: prominent filled brass/ink button + outlined secondary; disabled/busy states and accessibility.
8. `EvidenceDrawer`: public evidence only, truth tier, signature link, safe Share.
9. `BoundaryTimeline`: progression is derived from actual `intent`, `relayRequest`, `exactExecutionState`, `latestReceiptJson`; never self-advances via timer.
10. `StatusNotice`: errors/unknowns/high latency; actionable recovery.

Reuse existing hooks and business functions inside `BoundaryWorkspace.tsx`. Extract display-only subcomponents first; no change to Solana instruction/account builders, signing, on-chain schema or relay contract. Preserve MWA smoke automation selectors or update tests with equivalent behavior.

## Copy reference / exact CTA wording

- Brand line: `Freedom with Boundaries.`
- Product principle: `The exception moves. The boundary does not.`
- Young CTA: `Scan a payment` / `Try payment inside my Key`.
- Boundary CTA: `Ask guardian` / `Inspect why`.
- Guardian CTA: `Allow this exact payment once` / `Not this time`.
- Evidence CTA: `Share latest receipt JSON`.
- Error: `We couldn't confirm what happened. Your Key has not been widened here.`
- No public proof: `Mobile transaction proof is still pending.`

## Build order / actual checkpoints

**Build A — real entry + standing Key home:** tokens + branded header + connected/empty/role views + original key asset + existing scan/test-intent handlers. Acceptance: role/wallet handoff unchanged, first task visible above fold, no fabricated rule/merchant.
**Build B — boundary + guardian decision:** bind existing `TransactionOutcome` and `BoundaryRelayRequest`, display exact values and conditions, refuse/allow actions correctly gated. Acceptance: REFUSE/UNKNOWN distinct, no standing-Key widening, negative tests remain.
**Build C — verified result + receipt:** surface ALLOW versus exact Allow Once versus pending/unknown and latest receipt only. Acceptance: clear provenance, no fake ledger/history, no secret material in Share.
**Build D — fit and finish:** micro-motion with reduced-motion path, 320/390/430 widths, dark text contrast, 200%-font overflow, accessibility labels, offline/failure states. Automated emulator screenshots from actual build, not design concept imagery.
**Build E — terminal assurance:** Mobile CI, APK, emulator smoke, MWA session, baseline/gateway states, TRACE/design review, clean-room, dependency issue #33 review, G1 kept blocked until physical live receipt bundle.

No standalone Story/Demo gate can promote product state. Until Build A–E actually run, this document is `DESIGN_SPEC_ONLY`; every check remains governed by source truth.

## Drift tripwire after this design decision

`material_user_capability_delta_since_previous_milestone: NONE` (blueprint only).
`current_primary_workstream: PRODUCT_EXPLOITATION`.
`workstream_drift_status: WATCH` (do not chain additional mockups/captures/packaging; immediately implement Build A as next engineering action).
`first_live_slice_proven: false`.
`G1: BLOCKED` (physical Android + production wallet + live relay + mobile Devnet transaction not observed).
`exact_next_owner: product engineer`.
`exact_next_action: Build A code changes + CI; then B/C/D without waiting for extra concept ideation`.
