# CRESCO Key — AAA minimal mobile redesign / reference-to-screen critique

**Scope:** UI-only derivative of PR #82 at `eb8c51a2`, implemented as an isolated review branch. Not a release, not a passing visual QA claim.

## Reference router: reused from the user's system

- **CRESCO Visual Lab:** Bit/Living Key, The Shear Line, Key Island, Family Chat, Stay in Key, First Pass. Prior screenshots are not currently accessible: preserve all as **unverified visual sources** rather than fabricating their composition.
- **Chosen earlier brand heritage:** Museum Ledger: warmth, an editorial instrument, clear standing financial authority, exact exception separate from the rule. Retain the useful tactile dignity; *remove museum label overload and stacks of nearly identical parchment plates*.
- **Mobile journey intelligence:** Mobbin, Pageflows, Screenlane, UX Archive, Refero, UI Sources. Mobbin MCP was attempted explicitly on 12 Oct 2026 and returned **requires paid plan** for each screen search; therefore **NO Mobbin screenshots were accessed or compared** in this implementation.
- **Interaction and brand references:** Rare UI, 60FPS Design, Motion Primitives, Transitions.dev, Interior, Inspora, Zajno Motion, Canvas UI, Awwwards, Studio Thonik, Cue Design, The Met Collection; use pattern principles, not copied assets.
- **Internal pattern libraries and prior decisions:** TRACE, Winning Intelligence, CARI, NimCarry Living Route; proof has to come from real product state, never an overlay. “Motion must have a job.” No generic navy dashboards, neon, cryptocurrency particles, fairy-glow, random elevation, generic serif-heavy museum brochure or fabricated usage data.
- **UX invariants:** a standing Key is independent from a single-use exception; approval is not payment; a relay is not onchain authority; UNKNOWN/REFUSED are not green, wallet mismatch is not an onchain limit refusal.

## Before → after: concrete critique

| Criterion | PR #82 on emulator | Contemporary Atelier review branch | Residual gap |
| --- | --- | --- | --- |
| First-fold clarity | Connect + Devnet both accessible, but framed by two long explanations | Cleaner brand, substantial but compact title, one illustrative financial principle, directly paired wallet & read-only actions | Need exact Android screenshot at 360×800/390×844, scale 1.3 |
| Product prominence | Oversized editorial copy, CRESCO badges repeated, little live-data hierarchy | Simplified plates, high-contrast value typography, fewer redundant plaques | Read-only remains manual fetch; show live counters only after verified RPC |
| Hierarchy, spacing | Similar beige cards and brass CTAs throughout | Near-white surfaces, chalk canvas, charcoal primary action, restrained sage for *explanation*, not a success claim | Need real user test on thumb hierarchy and Guardian |
| Visual identity | Small Living Key seal; card labels `EXHIBIT` and `CRESCO` overused | Preserve fixed ring/marker; no fake visual paid state; reduce inscriptions | Mark still may feel like a logo rather than a functional instrument |
| Young path | Technical setup disclosure ahead of payment | Payment-first; optional wallet setup moved after action; exact recipient still selectable | Representative test on physical Android required |
| Guardian path | Amount in same low-emphasis fact stack as mint/nonce | Exact base-unit amount prominently above recipient; nonce/status below | Still base units; must not guess decimals, integrate verified mint decimals upstream |
| Financial truth | Source-controlled statuses | Readiness no longer receives generic VERIFIED badge | Independent verification of all states needed |

## Three alternate directions, with explicit trade-offs

These are **critique candidates**, not visually prototyped alternatives.

1. **Contemporary Atelier (implemented for testing):** warm chalk foundation, monochrome financial controls, discreet sage explanatory artifact, sparing editorial type. Strongest for legibility and financial trust. Risk: still too conventional unless live state visualisation adds unmistakable CRESCO identity.
2. **Instrument Minimal (unimplemented):** more structural key diagram, measured geometric dividers, ultra-low text density, direct amounts and neutral statuses. Strongest for differentiation, risk of sterile fintech utility and insufficient Guardian empathy.
3. **Human Ledger (unimplemented):** restrained archival typographic warmth, tactile affordances, descriptive family language. Strongest for brand storytelling, but PR #82 revealed high risk of text-heavy brochure UX; should not be promoted without strong action-first design.

**Current working recommendation:** validate *Contemporary Atelier* with actual screenshots and real financial states, then judge whether Instrument Minimal contributes a better functional Key visualization. No conclusion that this is AAA approved has been made. A real source-to-image comparison with Mobbin requires authorized paid access.

## Design constraints for next review

- **Screens:** Welcome, read-only Key before/after live RPC, role, Young intent, Young refusal, Guardian pending/refused, permanent-limit disclosure, ALLOW/UNKNOWN receipt, Android reduced-motion.
- **Devices:** 360×800, 390×844, font >=1.3; safe-area, thumb targets >=44dp, no overflow; full recipient/mint selectable, no amounts abbreviated/truncated into changed semantics.
- **Data:** no generated balances, no mock confirmed receipts, no fake payment actions. Devnet live Key read only after RPC success; failed read stays unknown.
- **Risk:** signers, PDA derivation, wallet provider, authorizations, Solana program, MWA and receipts are outside the UI-change contract.
- **Acceptance:** screenshot-level visual criticism; TypeScript/build/CI; Android emulator screenshots; independent physical MWA/Guardian validation; issue #76 not assumed resolved; release APK untouched.
