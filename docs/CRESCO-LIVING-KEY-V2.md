# CRESCO Visual Direction v2 — The Living Key

**Implementation candidate:** PR #82, not the already-published APK.  
**Identity:** Museum Ledger × warm fiduciary instrument × quiet mobile-first motion.  
**Product truth:** *The exception moves. The boundary does not.*

## Design grammar

The **outer brass ring** is the standing policy boundary. Its diameter, thickness and orientation stay the same regardless of the request or decision. The small **detached marker** represents the current interaction — it never grants, signs or widens financial authority. The center keeper suggests responsibility and custody of one's own choices, **not app custody of tokens**.

| System | Exact token | Meaning |
| --- | --- | --- |
| Base canvas | `#F5F0E6` ivory | Rest, human warmth |
| Paper | `#FBF8F1` | Surface behind an actionable record |
| Ink | `#181813` | Primary information / amounts |
| Brass | `#B28B49` and `#80632F` | Key identity and action hierarchy |
| Verified | `#42664D` | Only independently verified outcomes |
| Boundary | `#AD422C` | Refusal or real limit reached, described precisely |
| Unknown | `#6C675E` | Unable to confirm; never convert to success |

No generic cartoon mascot, oversized motion video, looping halo, counterfeit transaction receipt, game level, vague "trust score" or glowing unlock. Use the same mark at different sizes instead of adding unrelated illustrations.

## Implemented integration points in PR #82

| Screen or state | Visible treatment | Truth requirement |
| --- | --- | --- |
| Welcome | Compact Living Key mark next to wordmark; wallet CTA appears above explanatory steps | Wallet connection result still comes from wallet provider |
| Choose role | Young = fixed standing ring; Guardian = marker for a request; entire role card tappable | Role cards choose screens, not authorization |
| Young payment | Exact token amount more prominent; recipient remains fully selectable, never truncated | Spend outcome only from actual runtime |
| Guardian request | Same ring, separate request dot; exact asset/amount/recipient readable before decision | Pending relay ≠ wallet signature or transfer |
| In-bounds | Standing state, no success animation merely because an intent was entered | Confirm actual allowed state |
| Boundary reached | Vermilion detached marker, one short state cue | Refusal classification must come from actual refusal |
| Allow Once pending | Detached marker, no expansion of ring | Guardian must sign and chain must verify; a relay marker cannot greenlight |
| Exact execution | A verified status requires actual onchain receipt; do not infer from motion | Issue #76 keeps full Guardian loop BLOCKED |
| Read-only judge tour | Actual sample-family Devnet cap and period-use counters, readable before addresses | Read-only RPC, no seeded success |
| SKR / receipts / permanent policy change | Progressive disclosure, separate from primary payment | SKR entitlement and financial authority never implied |

**Important:** labels such as VERIFIED, ALLOW, or REFUSED remain driven by existing app data and must not be inferred from the decorative symbol.

## Motion contract

Use React Native `Animated`, not a generated five-second MP4: native transforms on the detached dot only. **One** approximately 580-ms, low-amplitude `1 → 1.22 → 1` scale pulse on entry to a request/boundary state. **Never** animate the standing ring, loop indefinitely, or animate financial "success" without verified chain results.

Default to stillness until the OS setting is known. Listen to `AccessibilityInfo.isReduceMotionEnabled()` and `reduceMotionChanged`: if motion reduction is enabled, show the same static state color, with no transition. Animation is purely decorative, not the only status cue.

## App performance and UX release gates

1. **First fold:** On a representative 360–390 dp Android screen, see the value proposition and **Connect wallet** without scrolling. Read-only sample action is immediately after; the Key cannot push primary CTA off-screen.
2. **Young:** Load a real configured intent, inspect exact recipient and token amount, check live connected-wallet Key setup, and observe an honest mismatch refusal. No client mismatch is advertised as an onchain cap refusal.
3. **Guardian:** Exact request visible before action; Allow Once is visually distinct from **permanent limit change**. The latter is collapsed and cannot be mistaken for the former.
4. **Accessibility:** Accessible button labels, touch targets at least 44 dp, real amount text and account IDs selectable, readable text at larger Android font settings, keyboard/focus navigation where supported; reduced motion tested on and off.
5. **Technical truth:** Never show a token payment or Guardian approval due only to pressing a UI button, displaying an animated seal, a relay response, or passing static CI.
6. **Performance:** No runtime image/video fetch, no extra network dependency, no continuous animation, no impact to signature/message/PDA/transfer execution.
7. **Evidence:** Green Mobile CI + APK build + emulator screenshots + physical device verification are separate classifications. A passing emulator is NOT physical Solflare evidence.
8. **Deadline:** Preserve current public fallback APK [a11b090e prerelease](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-ci-android-candidate-a11b090e) until the new PR build and relevant on-device UX are independently verified. Submission on Radiants remains a separate actual user action.

## Out of scope, consciously

- Trust levels or gamification not grounded in actual user-authorized onchain history
- New Guardian contract claims or bypassing issue [#76](https://github.com/Faadil1/cresco-key/issues/76)
- Production wallet identity, Mainnet transactions or SKR prize eligibility
- Random character animation simply to emulate a social-media design trend

**Approval boundary:** design/source implementation ≠ release-ready. Promote only after TypeScript, finance/enrollment tests, real Android screenshots, accessibility check and truth-boundary review. Keep PR #82 separate from the live, time-limited Radiants submission until validated.
