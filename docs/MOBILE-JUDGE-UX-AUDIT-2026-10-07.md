# Mobile Judge UX Audit — 2026-10-07

Scope: non-G1 UI/UX product pass for the current CRESCO Key mobile app.

## Verdict

The product concept is strong, but the previous mobile surface made judges infer the product loop from scattered controls. The highest-value non-G1 UX delta is to make the live core loop readable before the final physical Android proof:

1. intent loaded;
2. standing Key boundary reached;
3. guardian refuses or submits exact Allow Once;
4. young person retries exact action, mutation/replay refuses, and shares receipt.

## Findings

1. **Role choice screen was functional but under-explained.**
   - Health before: partial.
   - Fix: added a Judge Path card with the product thesis and a core-loop checklist.

2. **Young-person flow had strong mechanics but weak orientation.**
   - Health before: partial.
   - Fix: added the same checklist directly above the scan/load actions so the next step is visible.

3. **Guardian flow showed exact request data but not the whole product consequence.**
   - Health before: good mechanics, weaker narrative.
   - Fix: added the checklist on the guardian screen so "Not this time" and "Allow Once" are framed as boundary outcomes, not generic buttons.

4. **Receipt evidence was present but not visually connected to the loop.**
   - Health before: good evidence, weaker hierarchy.
   - Fix: receipt readiness is now one of the four visible loop states.

## Accessibility and evidence limits

- This audit is code-level and layout-level only; it is not a physical-device accessibility proof.
- It does not prove G1, a live relay deployment, production wallet compatibility, or a mobile CRESCO transaction.
- Final device testing should still verify text wrapping, touch target comfort, reduced-motion behavior, screen reader labels, and wallet handoff clarity.

## Material capability delta

External judges/operators can now understand and self-orient through the product's core mobile trust loop before the final G1 run. This is a UX/product-readiness delta, not a live integration proof.
