# CRESCO Visual Direction v2 — Living Boundary

**Status:** DESIGN CANDIDATE / IMPLEMENTATION IN PR #82. **Not a validated production UI.** Adapted from NimCarry's product-native **Living Route** principle and Breeje Anadkat's three-stage workflow (direction → motion → integration), not an obligation to add a cartoon mascot.

## Intent

- **Brand idea:** *The exception moves. The boundary does not.*
- **Product semantics:** autonomy within a standing Key; precise Guardian judgment beyond a limit; an exception does **not** permanently raise limits.
- **Visual identity:** Museum Ledger meets human-centered money decisions. Tactile, architectural, slightly editorial, calm; never navy AI dashboard, cyber gradients, glassmorphism, generic blob or crypto particles.
- **Narrative system:** Living Boundary. A **constant outer ring** represents the onchain standing limit. A **small independent side marker** represents the exact request. A consumed/refused request never changes the diameter of the ring. The visual system is an explanation, not a claim of confirmed payment.
- **Mascot decision:** NO cartoon person or animal. A modular abstract **Living Key Seal** (a recognizable ring + fixed central keeper + movable side marker) at small sizes. It should read as a brand mark without its color or copy. Never call a state VERIFIED based on visual animation.
- **Product first:** live wallet/payment/Guardian UI always leads; branded mark never pushes CTA out of first viewport.

## Palette and type

| Semantic role | Hex | Use |
| --- | --- | --- |
| Ivory / foundation | `#F5F0E6` | calm app canvas |
| Paper | `#FBF8F1` | consumer panels, financial details |
| Ink | `#181813` | readable copy, important amounts |
| Secondary ink | `#5B5750` | explanatory text |
| Brass | `#B28B49` | fixed Key structure, primary CTA |
| Deep brass | `#80632F` | boundaries/labels, never warning |
| Verified green | `#42664D` | **only** real verified state, otherwise neutral |
| Boundary vermilion | `#AD422C` | explicit refusal / obstacle / risk, not decorative optimism |
| Border | `#D4C8B4` | separation, no card overload |

**Type:** existing serif for identity/editorial headers; compact readable sans for buttons (16–17px) and financial data. The number/recipient must be higher hierarchy than chain metadata. No custom fonts required for this pass.

## Five-state semantic vocabulary (truth-gated)

| State | Seal meaning | Product text | Evidence boundary |
| --- | --- | --- | --- |
| STANDING | outer ring closed, centered core | “Within your Key” | only after actual standing-rule read/assessment |
| BOUNDARY | same ring, vermilion side marker | “This needs a Guardian” | only if program/runtime rejection supports it; never treat a frontend wallet mismatch as onchain refusal |
| REQUEST | same ring, brass separate marker | “Waiting for Guardian” | offchain relay may coordinate but **cannot** authorize |
| CONFIRMED | center + small green proof dot | “Payment confirmed on Devnet” | only confirmed signature and independently checked token consequences, **not implemented via decorative icon alone** |
| BLOCKED / UNKNOWN | same ring, muted side marker | “Could not confirm” | never imply success |

**Critical:** Changing a *permanent* Key limit is visually separate from a one-time request; the same emblem must never imply a new limit has been granted. Do not show fake Trust Levels, growth badges, spend graphs or social use counts. Where spend is shown, bind to actual onchain rule counters, never infer spend from fiat or wallet balance.

## Screen-by-screen art direction

### 01 — Welcome (P0)
- Compact CRESCO wordmark + 42px Living Key Seal, right-aligned “SOLANA DEVNET” network pill.
- Hero: “More freedom. Clear limits.” Two lines maximum on a typical 390px device.
- Primary above fold: “Connect wallet”; one alternative “Explore live Devnet Key — no wallet”.
- “How it works” three plain-language steps below. Technical matrix behind disclosure.
- Animation: no animated background and no looping video. Native press feedback only in this release candidate.

### 02 — Young / Guardian role (P0)
- Two large thumb targets (height >= 110), each one distinct action and exact human copy.
- Young = independent ordinary payment; Guardian = exact decision. Do not classify either as lower-trust, lesser security or child avatar.
- No giant key artwork above the two role cards; compact seal as supporting identifier only.

### 03 — Young payment intent (P0)
- Amount first in large ink numerals, exact recipient below in selectable untruncated text; network and asset as compact metadata.
- QR scan and configured test intents immediately accessible. Setup is an honest optional disclosure; readiness and safety blockers still load and function.
- Devnet Key per-period use ring/bar is tied to live onchain `spentThisPeriod/maxPeriodAmount`, **not** wallet token balances, not earned trust.
- Wallet mismatch = explicit setup blocker, **not** a spending limit refusal.

### 04 — Guardian exact exception (P0)
- The user sees recipient, token, amount and request identity first; primary “Allow this exact payment once”; destructive “Not this time”.
- A permanent standing-limit change is behind a **separately named disclosure**, including period counter reset warning, nonce and explicit acknowledgement.
- “Request routed” ≠ “authorization recorded onchain” ≠ “payment completed”. Use plain text with source-specific status.
- Blocked issue #76 remains visible in evidence; no green invented success.

### 05 — Boundary / refusal (P0)
- The ring stays the same size, small side marker becomes vermilion. No jittering, fake red flash or crying mascot.
- Human copy: “This action needs a Guardian” versus “This wallet does not have this Key” depending on **actual cause**.
- One next action at a time, no network retry that silently duplicates payment.

### 06 — Receipt (P0/P1)
- Large actual state (“Payment confirmed” only if chain confirmation), amount + recipient, full selectable signature and Explorer link if available.
- Raw JSON remains in a technical disclosure, never the primary success screen. UNKNOWN remains visibly UNKNOWN.

### 07 — Optional SKR (P1)
- Do not put bonus bounty in core financial flow. Disclosure only, source/CI candidate until real holder and on-device behavior are verified.

## Motion specification (conditional P1)

The creator's sequence becomes **direction → state-driven micro-motion → lightweight native integration**.

- Ring **never** scales to imply changing authority. Only a side marker can shift subtly (<= 6px, <= 220ms) when *a real state transition* is observed. On request/refusal, mark remains static after transition.
- No autonomous pulsing, no indefinite spin, no JS-driven 60fps loops, no MP4 in the main payment surface.
- Honor OS reduced motion with **0ms** and ensure fully meaningful static state.
- Accept an MP4 only as an optional offline marketing render; compress it and never ship as a blocking dependency in the Android app.
- Do not add animation until Android smoke, physical device UX and accessibility audit pass; a static intentional icon is preferred to unreliable motion.

## Implementation / acceptance gates

**Current implementation target:** [PR #82](https://github.com/Faadil1/cresco-key/pull/82). Reuse existing `museumLedgerTokens`; add one code-based `LivingKeySeal` (not remote video or fragile AI sprite). Use it sparingly in welcome + role hierarchy + explanatory decisions. **Do not alter signer, token or permission semantics to fit the animation.**

**Visual QA checklist:**
- 360×800 and 390×844: first primary button accessible; screenshot captured and visually reviewed; no unwanted clipping/overflow.
- 44px touch targets, accessible role and label, usable at text scale >= 1.3.
- Important addresses fully selectable; amounts and token decimals correctly interpreted.
- Guardian Allow Once vs permanent Key change are visually and verbally unmistakable.
- Unknown, refused, pending and verified states grounded in wallet/RPC receipts; no false green.
- Android build and MWA tests pass at exact commit, APK has actual hash/source provenance.
- Physical on-device trial needed for UX promotion; CI/emulator ≠ production readiness.

## Film and judging treatment

NimCarry's successful principle was to use **authentic product UI as the hero**, not cover it with decorative overlays. For CRESCO video, keep the interface visible, overlays below 15–20% of screen height, and show *existing real* Devnet transactions separately labeled as developer-signature proof, not physical Samsung payments. The Living Key Seal is a signature punctuation, **not** the evidence.

**Decision:** **ACTIVE — lightweight native visual pass**; **PENDING — motion and physical acceptance**; **BLOCKED — full Guardian Allow Once / issue #76**.
