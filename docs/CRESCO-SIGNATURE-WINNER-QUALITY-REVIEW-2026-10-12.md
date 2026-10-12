# CRESCO Key — SIGNATURE v3 / Winner-caliber product review

**Status: UI IMPLEMENTED IN A REVIEW BRANCH; NOT RELEASE-READY; NOT APPROVED AAA.**
**Scope:** actual React Native app, built on the in-review PR #84 design. The earlier “ten screens” graphic was design exploration, **not** a screenshot or an accurate feature inventory.

## Official winner comparison — observed external source vs interpretation

Sources:
- [Solana Mobile first hackathon winners](https://solanamobile.com/blog/solana-mobile-hackathon-winners-announced)
- [Solana Mobile Monolith winners](https://solanamobile.com/blog/solana-mobile-monolith-hackathon-winners-announced)
- [CLOCK IN criteria, required submission artifacts](https://solanamobile.com/blog/clock-in-the-solana-mobile-hackathon)
- [CLOCK IN organizer portal/calendar](https://solanamobile.radiant.nexus/?panel=calendar)

| Public winner / evidence | What actually distinguished the product | What CRESCO must prove | Result here |
| --- | --- | --- | --- |
| SP3ND / Blormmy | Actual stablecoin commerce & understandable consumer action | One exact payment with recipient and amount, mobile wallet, actual consequence | UI streamlined; mobile live settlement and full Guardian loop **NOT PROVEN** |
| Echo Protocol | Real GPS interaction, signed claim onchain and actual deployed-world footprint | Use genuine device + wallet inputs, not fake sample confirmations | Solana Pay scanner / MWA retained; mobile acceptance still **BLOCKED** |
| Tramplin / Cashflow | Verifiable money workflows and instrument surfaces connected to live protocol reads | Standing/period rules directly from onchain state, no seeded euro balances | Real RPC-only read preserved in explorer and Young; claim scope constrained |
| NOMI / Pumpville | Distinct, engaging mobile identity tied to real interactive mechanics | Key itself is recognizable but does **not** depict unverified authority | Native architectural KeyPortal, source-based marker; decorative only |
| CUE / PredictTok | Mobile-first short paths to actual user value | Short connect/explore, short Young scan, focused Guardian exact decision | Navigation reorganized; needs external Android usability validation |

**Do not infer winner causality from these summaries.** The publications establish concrete capabilities and winner selection, not a measured causal design ranking or permission to copy their identity.

## Visual spec (linked to actual implementation)
- **Entry** `WalletGate.tsx`: dark forest gallery, typographic confidence, architectural boundary instrument, real Connect and real read-only Devnet entry in the first screen.
- **Instrument** `KeyPortal.tsx`: outer boundary fixed and non-animated, dot separate; no fake account data.
- **Devnet explorer** `JudgeReadOnlyTour.tsx`: distinct dark entry, large actual per-payment rule and period rule only after live successful RPC; otherwise unknown/unverified text; explicit read-only CTA; exact addresses accessible below.
- **Young** `BoundaryWorkspace.tsx`: payment intent, exact recipient and mint, scanner, live standing rule inspection with native instrument; setup is an optional disclosure, no bypass.
- **Guardian** `BoundaryWorkspace.tsx`: exact token-base-unit amount, full recipient/mint, request/relay state, distinct one-time grant/refusal and separate permanent change.
- **Palette** `museumLedger.ts`: restrained chalk/bronze/forest; not default neon/navy AI SaaS.
- **System status** `App.tsx`: status bar contrast correct in disconnected dark experience and connected light experience.
- **Automation** old hard-coded tour/roles copy in emulator and MWA smoke updated to the new real accessibility targets.

## Features intentionally NOT invented from the concept image

- No EUR 42 / EUR 80 spending balance or fake merchant card
- No faux Activity feed or synthetic transaction timeline
- No invented Family Chat, user identities, profile avatars, contacts or guardian conversation
- No arbitrary slider that would change permanent authority without a signed Solana program instruction
- No green success from a relay response, input, decorative ring, or local-only test

Add features only as actual real flows, including negative/recovery paths and evidence integrity; do not ship empty placeholders as product depth.

## Canonical gates (conditional registry; do not silently omit)

| Registered gate | Current state / interpretation |
| --- | --- |
| QUALIFY → DECIDE → DESIGN → DELIVER → AUDIT → EXPAND | ACTIVE; feature and release classification separate |
| Rubric → Pain → Problem → Negative Event → Differentiator → Execution → Live Depth → Evidence → Story → Demo → Q&A | ACTIVE; user value and reality precede presentation |
| Prior reference / Competitive Novelty / Kill | ACTIVE; winners used as grounded comparators, no claims of equivalent product depth |
| Technical Reality Check | ACTIVE; code CI, emulator MWA and real phone must be independently verified |
| Product Maximum Exploitation / Post-slice Depth | ACTIVE; a screen-only proof is not the product |
| Truth Boundary & Evidence Integrity | ACTIVE; use LIVE / LOCAL / PARTIAL / UNKNOWN precisely, no invented outcomes |
| Negative Path, Refuse/Abstain/Review/Unknown | ACTIVE; remain based on real preflight/RPC/source causes |
| Runtime / Commit Binding, Deterministic Demo | ACTIVE; APK SHA+commit, deterministic replay only secondary evidence |
| Judge Performance Assurance / mobile self-serve | ACTIVE; no user-necessary tap hidden behind an illustration |
| x402 / Nanopayments / Wallets / Contracts / App Kit / LIVE_GATEWAY | N/A unless scope demands; wallets/onchain contract remain ACTIVE through existing mobile code; external payment proof is BLOCKED until confirmed live |
| Eval-Driven Reliability | ACTIVE for MWA and any failure/regression; a single green CI run is not enough |
| Physical Seeker/Samsung MWA | BLOCKED until actual physical check on exact build |
| Guardian Allow Once → pay → replay | BLOCKED; issue #76 |
| Production release APK / final submission | BLOCKED until exact tested APK & required artifacts |

## CLOCK IN package and timeline integrity

The official announcement states: APK, source repository, live-use demo video, and pitch deck. An APK build + GitHub PR is **not** a complete submission.

**Deadline discrepancy requires operator verification:** Solana Mobile's original Sept 8 blog still says Oct 8, while the current Radiants organizer portal calendar displays **Oct 12, 2026 at 23:59 UTC**. Confirm the authenticated portal's active submission state; do not assume this PR is submitted. Keep the known-working fallback APK available rather than replacing a public asset with an unverified design candidate.

## Acceptance required before promotion

1. Exact branch/commit green TypeScript, Mobile CI, G1, APK; emulator no-wallet navigation and MWA negative/positive signMessage smoke.
2. Capture authentic 360x800 and 390x844 Android screenshots for Welcome, Devnet before/after RPC, Role, Young scan, Guardian pending/refuse, permanent-rule disclosure, UNKNOWN and onchain verified states; check font scale >=1.3, touch >=44dp, safe inset and overflow.
3. Explicitly classify any MWA failures as infrastructure vs behavioral; do not “fix” by weakening wallet path assertions.
4. User visually approves **real emulator captures**, not the concept montage; inspect the main Key image on actual devices.
5. Physical Android/Seeker wallet and program authority validations gate public APK replacement. Never claim completion where issue #76 remains.

**Authority:** This document records a review candidate. The existing product canonical rules, contracts, signers, evidence ledger, APK fallback and private credentials remain untouched.
