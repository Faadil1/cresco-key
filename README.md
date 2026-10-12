# CRESCO Key
### Freedom with Boundaries.

### CLOCK IN 2026 — Latest Signature Android Candidate

**[Download latest CRESCO Key Signature APK (public, direct, no GitHub login)](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-clock-in-0bd51d53-devnet.apk)** · [Release evidence and SHA-256](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-signature-0bd51d53) · [Signature source branch / PR #85](https://github.com/Faadil1/cresco-key/pull/85) · [Judge quickstart and proof boundary](docs/CLOCK-IN-2026-SIGNATURE-JUDGE-QUICKSTART.md) · [18-slide deck PDF](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-jury-deck-18-slides.pdf) · [88s real-emulator demo MP4](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-signature-0bd51d53/cresco-key-signature-demo-88sec.mp4)

**Build truth (October 12, 2026):** Signature source `0bd51d53` passed Mobile CI, configured G1 preflight, Android emulator, Mock MWA session (including message signing and role navigation), and standalone APK evidence. This is an **Android/CI-verified Devnet prototype**, not a production financial service. The distinct onchain 5-unit payment and 12-unit limit refusal were executed using **developer-controlled Devnet signers**, *not the Android device*. Guardian exact redemption and replay on the current program are **BLOCKED** ([issue #76](https://github.com/Faadil1/cresco-key/issues/76)); a physical-wallet end-to-end financial test remains open. The original release linked below is **historical**, not the latest Signature version.


**Give a young person room to act. Keep the family's spending boundary intact.**

CRESCO Key is an **Android-first Solana Mobile prototype** that explores a better alternative to two extremes: asking a guardian about every payment, or giving unrestricted wallet access. A family sets a **standing Key** with explicit onchain limits. An ordinary action can proceed within those limits. When an action crosses the boundary, the guardian may choose to refuse it or authorize **that exact payment once** — without silently widening the standing rule.

> **The exception moves. The boundary does not.**

**Built for [Solana Mobile CLOCK IN 2026](https://solanamobile.com/) · React Native / Android · Mobile Wallet Adapter · Solana Pay-style intents · Anchor / Solana Devnet · Optional SKR**

## See CRESCO Key in 90 seconds

**A real mobile product, a real Devnet program, one exact question: should this payment go through?**

**[Download Android APK — permanent public release](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-ci-android-candidate-a11b090e/cresco-key-clock-in-devnet-ci-candidate-a11b090e.apk)** · **[Read the 90-second walkthrough](docs/CLOCK-IN-2026-JUDGE-DEMO-90S.md)** · **[Verify the real 5-token payment](https://explorer.solana.com/tx/3PQLrxQCq3mkt6T14u9h5rUXDxCDV2DTq3dDE3qFB8WP8gLdTK3titWCStLgqFKPvfWnXKpfrQatxsBDZKfEaicS?cluster=devnet)** · **[Submission-ready description & evidence](docs/CLOCK-IN-2026-SUBMISSION-FREEZE.md)**

The APK above was **CI-built from GitHub Actions PR test-merge commit `a11b090e`** (PR head `06abe0ba`, main baseline `160de692`), with the wallet-free read-only Judge Tour, Guardian/Beneficiary Key inspection, optional SKR Charter Atelier and configured public Cloudflare relay. This exact commit passed **Mobile CI, configured G1 preflight, Devnet Tooling, Boundary Relay CI, Android Emulator Smoke, Mock MWA session and standalone APK build**. **It has NOT yet been installed or validated on a physical Samsung; and those green runs are not G1 onchain payment evidence.**

**A real financial consequence, from developer-controlled Devnet signers:** [5 demo SPL tokens moved onchain](https://explorer.solana.com/tx/3PQLrxQCq3mkt6T14u9h5rUXDxCDV2DTq3dDE3qFB8WP8gLdTK3titWCStLgqFKPvfWnXKpfrQatxsBDZKfEaicS?cluster=devnet) and a [12-unit over-limit action was refused onchain](https://explorer.solana.com/tx/BWaa6cAG3hjvvSeBCAAg2hpmteqFg4YpRCVqaFzSPAGjtneBBMepZksbnGbULfDpHXWfhtEuQRtDwbX3bVAZ8C2?cluster=devnet). The exact Guardian allowance **grant** also reached Devnet, but redemption remains blocked by [a reproducible onchain inconsistency](https://github.com/Faadil1/cresco-key/issues/76). These receipts are **not** from the Android APK. They demonstrate partial current-program behavior, not the complete Guardian→payment→replay loop.

**The decisive action:** Within the standing Key, the intended mobile action needs no repeated Guardian approval. Outside its limits, **Allow Once** must bind exactly one request and must never expand the standing rule. The mobile end-to-end transaction + Guardian loop is **still in integration**; a 64-byte MWA message-sign result on Samsung is not a payment signature.

**Origin proof, separately labeled:** the [original CRESCO authority engine](https://github.com/Faadil1/cresco) demonstrated exact Allow Once and replay refusal on Devnet, with public grant/execution signatures in its [canonical proof](https://github.com/Faadil1/cresco/blob/main/evidence/solana/ALLOW-ONCE-EXACT-ACTION-CANONICAL-PROOF-2026-09-25.md). Its program is `ABjE6V5…`, **not** the newer Cresco Key program `6SoGab…`. This is proven *mechanism lineage*, not proof that the newer APK has performed those transactions.

**Judge-visible status:** Samsung + Solflare connect and message signing **observed** · new CRESCO program **deployed** · public relay **verified** · Guardian-to-payment-to-replay on the new mobile program **not yet proven**. View [complete acceptance evidence](evidence/REALITY-LEDGER.md).

---

## The product, in two minutes

**01 — Independent by default.** The young person opens the Museum Ledger Android interface, connects a compatible wallet and sees an exact payment request: **asset, recipient and amount**.

**02 — A real standing boundary.** CRESCO's Solana program models a Guardian–Beneficiary Charter, Mandate, asset-specific limits, nonce and period accounting. The user cannot gain another family's authority just by connecting a wallet.

**03 — Consent for one exception, not a blank cheque.** At the boundary, a Guardian can choose an exact allowance tied to the request's mint, recipient, amount, nonce and request ID. Changed recipients, expired approvals and replays must not inherit the original permission.

**04 — Consequences, not screenshots.** The target product finishes by verifying the payment transaction and changed token state on Solana. **That entire physical mobile sequence has not yet passed its acceptance gate.** UI previews, deterministic fixtures, CI tests and a wallet-message signature are not substitutes for a confirmed transfer.

### What a judge can inspect today

| Capability | Evidence and honest status |
| --- | --- |
| Standalone Android interface | **PHYSICAL / OBSERVED** — APK installed and launched on a Samsung, without Metro; Museum Ledger and Young flow displayed |
| Solflare through Mobile Wallet Adapter | **PHYSICAL / OBSERVED** — Devnet wallet connected, TRC-01 message signing returned `SIGNED` and 64 signature bytes; independent verification of the signed bytes is still open |
| Payment intent and wallet mismatch | **PHYSICAL / OBSERVED** — 5-unit request displayed; a newly connected wallet did **not** match the configured demo Beneficiary; app stopped safely before a payment |
| Distinct CRESCO authority program | **LIVE DEVNET / VERIFIED DEPLOYMENT** — Charter, Mandate, asset-rule and exact one-time payment instructions; independently provisioned sample family, not the Samsung wallet |
| Guardian coordination Worker | **LIVE INFRASTRUCTURE / VERIFIED** — deployed public Cloudflare Worker; `/health` and `/ready` passed the published GitHub deployment check; **coordination only**, never financial authority |
| Wallet-specific Key onboarding inspection | **SOURCE / MOBILE CI** — read-only Charter, Mandate and SOL balance lookup; can share a *public* Guardian setup request; does **not** create a Charter or collect signatures |
| SKR Charter Atelier | **SOURCE CANDIDATE / PHYSICAL TEST PENDING** — optional Mainnet SKR holder check, family prompts, and read-only review of real Devnet Key limits; eligibility for the bonus prize not proven |
| Payment → Guardian Allow Once → exact execution → replay refusal | **BLOCKED / NOT END-TO-END VERIFIED** — program and mobile code exist; no complete physical receipt set demonstrating the sequence |
| Android app identity / production signing | **PARTIAL** — identity Worker source is in the repository, but verified `assetlinks.json` and production wallet identity have not been established |
| CLOCK IN final submission | **NOT CONFIRMED** — a draft packet exists; registration or a GitHub repository is not a submission receipt |

**Important negative observation:** the phone's setup refusal was a **client-side beneficiary mismatch**, not proof of an **onchain** spending-limit rejection. Neither a message-signing receipt nor 10 Devnet SOL in a user's wallet is evidence of money transferred through CRESCO.

## Install and try the Android APK

- **Permanent public standalone APK:** [Download the 134.2 MB Devnet APK](https://github.com/Faadil1/cresco-key/releases/download/clock-in-2026-ci-android-candidate-a11b090e/cresco-key-clock-in-devnet-ci-candidate-a11b090e.apk) · [release provenance, CI receipt and SHA-256](https://github.com/Faadil1/cresco-key/releases/tag/clock-in-2026-ci-android-candidate-a11b090e). The binary was built at verified PR test-merge commit `a11b090e` (PR head `06abe0ba`); original [Actions artifact](https://github.com/Faadil1/cresco-key/actions/runs/38177473369/artifacts/11717138600) is preserved for source comparison. Its own [Android emulator smoke test](https://github.com/Faadil1/cresco-key/actions/runs/38177473382), [Mock MWA session](https://github.com/Faadil1/cresco-key/actions/runs/38177473323) and [Mobile CI](https://github.com/Faadil1/cresco-key/actions/runs/38177473447) passed. **NOT physically retested on Samsung; NOT proven financial G1.**
- **Previously physically tested version / fallback:** [earlier standalone artifact `0d210847`](https://github.com/Faadil1/cresco-key/actions/runs/38173474144/artifacts/11715682262), which lacks the newer Key/SKR/judge additions.
- **Integration source:** [PR #62](https://github.com/Faadil1/cresco-key/pull/62) remains draft; a green build does not prove production release, Solflare end-to-end compatibility or successful signed Devnet transfer.
- Install only on a consenting Android test device with a compatible wallet. Use **Solana Devnet for all CRESCO payment experiments**. The core Devnet family's fixed demo intents **cannot** be exercised by an unrelated Solflare wallet.

The downloadable `app-release.apk` is a **standalone release-mode test build**, not a production-approved app, a verified Solana Mobile dApp Store listing or an Android package with independently verified ownership. Do not use real funds, import another person's recovery phrase or approve a transaction if the wallet warns that its origin/simulation cannot be trusted. A debug APK may require an Expo Metro development server.

### Suggested judge walkthrough

1. Install the **standalone** APK, open **Young person flow**, and inspect the configured Devnet Solana Pay-style request.
2. Connect a consented Devnet wallet using Solflare/MWA, observe the wallet consent surface, and try the **TRC-01 proof message**. This is *only* message signing.
3. View the wallet's **Key setup / live account preflight** in a candidate containing PR #62. For a wallet without its own Charter, expect `NOT_PROVISIONED` or an explicit setup blocker — **not a spending-limit refusal**.
4. Review the Guardian flow and its distinctions: **Refuse**, **Allow Once** and **change standing limits** are intentionally different actions. **Do not infer a successful grant or payment from the UI alone.**
5. Read the [physical phone evidence](docs/G1-PHYSICAL-SAMSUNG-OBSERVATION-2026-10-07.md), [runtime reality ledger](evidence/REALITY-LEDGER.md) and [submission packet](docs/SUBMISSION-PACKET-DRAFT-2026-10-07.md) for the exact verified vs pending claims.

**Video:** a labeled 142-second draft combines emulator footage and separate physical Samsung photographs. **No stable public final-video link has yet been confirmed**; do not mistake it for one continuous live two-device payment.

## Why the architecture matters

```text
Beneficiary Android + Solflare
    │ exact payment intent / user signature
    ▼
CRESCO Key program · Solana Devnet
    ├── Charter: distinct guardian + beneficiary
    ├── Mandate: stage, status, nonce, expiry
    ├── Asset rule: eligible mint, caps, period spending
    └── Exact payment allowance: request, recipient, amount, nonce, one use
                  ▲
                  │ Guardian onchain authorization (still needs full G1 proof)
Guardian wallet ──┘
      ▲
      │ private request routing; no transfer/authority
Cloudflare Boundary Relay
```

**The authority lives in the Solana program**, not in an API, replayable receipt, cloud coordination status, or token holder badge. The deployed public [Boundary Relay](https://cresco-key-boundary-relay.faadil-casecraft.workers.dev/ready) only routes and tracks requests. [Deployment #38174012603](https://github.com/Faadil1/cresco-key/actions/runs/38174012603) verified the Worker and Durable Object readiness; it did **not** grant an onchain allowance.

[Inspect the distinct CRESCO Devnet program on Solana Explorer](https://explorer.solana.com/address/6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP?cluster=devnet). Its deployment and the public demo family are recorded in [the original Devnet bootstrap run](https://github.com/Faadil1/cresco-key/actions/runs/37182728261) and [the saved program state](evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json).

### Noncustodial enrollment: still being integrated

The program's `initialize_charter` operation requires **both the Guardian and Beneficiary to sign**, with Guardian paying the initial account cost. A public setup request is not a transaction or a proxy for either signature. The current tooling can bootstrap a **separate, developer-controlled test family**, but does **not** provision a friend's independently owned Solflare wallet automatically.

The mobile work-in-progress adds a real read-only lookup for the *connected* wallet's Charter and Mandate, checks its SOL balance and creates a shareable request with a **distinct Guardian public address**. A secure two-signature onboarding path, funded asset vault, real payment execution and negative/replay proofs remain the next integrated work.

## Optional bonus: SKR Charter Atelier

The optional SKR feature is designed to make family policy review more useful, **not to buy financial permission**.

On the [PR #62 Android candidate](https://github.com/Faadil1/cresco-key/pull/62), a connected wallet can voluntarily check the official SKR mint on **Solana Mainnet** using public token accounts. A holder can access family discussion prompts. If that same wallet has an independently inspected, valid CRESCO Devnet standing Key as Guardian or Beneficiary, the Atelier can build a **public read-only review** of its real per-action cap, period cap, recorded spending and nonce. It cannot sign, transfer, stake, distribute rewards or widen any Key. Core CRESCO remains available without SKR.

This is a **bonus-bounty candidate**, not proof of real-holder adoption, bonus eligibility or a complete on-device SKR test. A wallet displaying **10 SOL Devnet does not thereby hold any Mainnet SKR**. See [SKR source in PR #62](https://github.com/Faadil1/cresco-key/blob/product/integrated-live-key-capabilities-20261010/apps/mobile/src/skr/SkrCharterAtelier.tsx) and [Key-review logic in PR #62](https://github.com/Faadil1/cresco-key/blob/product/integrated-live-key-capabilities-20261010/apps/mobile/src/skr/liveKeyCharterReview.ts).

## Evidence links

- [Physical Samsung + Solflare observation and public receipt classification](docs/G1-PHYSICAL-SAMSUNG-OBSERVATION-2026-10-07.md) — actual device behavior, wallet mismatch and explicit unverified claims
- [Cloudflare Boundary Relay deployment success](https://github.com/Faadil1/cresco-key/actions/runs/38174012603) — real public `/health` and `/ready` probes, not a payment
- [Devnet demo state](evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json) and [Solana Explorer](https://explorer.solana.com/address/6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP?cluster=devnet)
- [CI-backed MWA session and emulator recording provenance](docs/CLOCK-IN-2026-EMULATOR-VIDEO-PROVENANCE.md) — an emulator is **not** physical Solflare proof
- [Mobile CI](https://github.com/Faadil1/cresco-key/actions/workflows/mobile-ci.yml) · [APK builds](https://github.com/Faadil1/cresco-key/actions/workflows/mobile-apk-evidence.yml) · [G1 readiness preflight](https://github.com/Faadil1/cresco-key/actions/workflows/mobile-g1-configured-preflight.yml)
- [Reality ledger](evidence/REALITY-LEDGER.md) · [G1 physical acceptance/runbook](docs/MOBILE-G1-RUNTIME-RUNBOOK.md)
- [Submission copy and short video narrative](docs/SUBMISSION-PACKET-DRAFT-2026-10-07.md) — **draft**, not a portal submission confirmation

### What must be proved next

**First:** build and open the latest standalone APK, validate its UI and wallet session, then deliver a verified artifact. **Second:** independently authorize the Guardian + Beneficiary onboarding and verify its actual Devnet accounts. **Third:** observe a genuine in-bounds transfer with RPC token consequences. **Fourth:** demonstrate an out-of-bounds decision, an exact Guardian allowance, one approved execution and rejection of recipient mutation/replay. **Fifth:** validate independent judge setup, submit a permanent video URL and retain the actual portal confirmation.

The October 12 Radiants calendar screenshot shown by the operator lists **7:59 p.m. EDT** for submission close and **8:00 p.m. EDT** for judging. **The signed-in portal remains the last authority on whether a submission can be filed; the final entry has not been confirmed.**

## Build locally

Requires Node 22+, JDK 17, Android SDK and a compatible Android wallet for real MWA.

```bash
cd apps/mobile
npm install
# Generates only public test configuration; this binds the original demo beneficiary
# and DOES NOT create a Key for an arbitrary external wallet.
node ../../tools/devnet/write-mobile-env-from-demo-state.cjs \
  ../../evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json .env
npm run typecheck
npm run test:financial-boundaries
npm run test:enrollment
npm run test:skr-live-review
npx expo prebuild --platform android --no-install --non-interactive
cd android
NODE_ENV=production ./gradlew assembleRelease
```

APK output: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. Current committed demos default to a *specific* original Devnet Charter family. The [mobile runtime runbook](docs/MOBILE-G1-RUNTIME-RUNBOOK.md) explains how to inspect real accounts and refuse mismatched setups. Do not use the sample account's identity to authorize another person's wallet.

## Repository guide

| Path | Responsibility |
| --- | --- |
| [`apps/mobile/`](apps/mobile/) | Android client, MWA, Solana Pay parsing, Museum Ledger UI, optional SKR review |
| [`programs/keys/`](programs/keys/) | Anchor charter, mandate, asset-rule, guardian exact allowance and payment instructions |
| [`services/relay/`](services/relay/) | Cloudflare private boundary coordination, not the source of financial authority |
| [`services/identity/`](services/identity/) | Android app-origin identity Worker; availability is **not** verified identity without certificate binding |
| [`tools/devnet/`](tools/devnet/) | Public Devnet configuration, demo family and receipt tooling |
| [`evidence/`](evidence/) | Reality ledger, Devnet receipts and claim-to-evidence traceability |
| [`docs/`](docs/) | Reproduction, device observations, video provenance and draft submission |
| [`state/`](state/) | Current state and handover for collaborators |
| [`governance/`](governance/) | Conditional gateway and claim verification policy |

For contributors: [Start here](docs/COLLABORATOR-START-HERE.md) → [CURRENT](state/CURRENT.md) → [HANDOVER](state/HANDOVER.md) → [living PRD](product/PRD.md) → [gateway registry](governance/CONDITIONAL-GATEWAY-REGISTRY.md).

## What CRESCO does **not** claim

CRESCO Key is a **Devnet prototype**, not a custodial youth banking product. No production KYC/age/guardian-relationship verification, no brokerage license, no mainnet financial readiness, no universal interception of wallet payments and **no proven continuous mobile Guardian payment loop**. Unknown chain outcomes are **UNKNOWN**, not success. Offchain approval markers are **not** onchain financial authority. **The UI is not the guard. The capital path is.**

**Original authority-engine research:** [Faadil1/cresco](https://github.com/Faadil1/cresco).
