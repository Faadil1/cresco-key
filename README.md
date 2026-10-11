# CRESCO Key

**Freedom with Boundaries.** An Android-first Solana Mobile product for progressive financial independence.

A young person should be able to make ordinary purchases without asking permission every time. CRESCO Key gives them a *standing Key* with explicit limits. If a payment crosses a limit, the action must be refused first; a guardian may separately authorize **only that exact payment once**, without changing the standing rule.

> **The exception moves. The boundary does not.**

**Solana Mobile CLOCK IN 2026** · React Native / Android · Mobile Wallet Adapter (MWA) · Solana Devnet · Optional SKR Charter Atelier

## See CRESCO in 60 seconds

1. **The artifact:** the Museum Ledger Android interface is a real standalone APK, tested on a physical Samsung with Solflare.
2. **The Key:** connect a compatible wallet and sign a `TRC-01` proof message, with explicit wallet approval.
3. **The intent:** select the young-person flow, scan an exact Solana Pay request or load a configured **5-unit** / **12-unit** Devnet intent.
4. **The boundary:** CRESCO constructs payment instructions against its own Devnet program. A denied or unknown wallet/program outcome **must not** silently create guardian authority.
5. **The exception:** the guardian-side code constructs an exact one-time allowance. An altered recipient, expired/stale authorization, or replay must not inherit consent. This entire two-device execution flow is **not yet physically proven**.

### Current proof — what works and what remains open

| Surface | Evidence class | Current observed status |
| --- | --- | --- |
| Museum Ledger Android APK | **PHYSICAL CLIENT** | Standalone APK launched on a physical Samsung without Expo Metro. |
| Solflare / MWA | **PHYSICAL CLIENT** | Devnet wallet connected; in-app `TRC-01` proof receipt returned `SIGNED`, 64 signature bytes. Independent signature verification remains open. |
| Young payment intent | **PHYSICAL CLIENT** | 5-unit payment intent loaded; amount, mint, and recipient visible; Solflare displayed an approval screen. |
| Young payment execution | **UNKNOWN / NOT PROVEN** | Wallet warned of an unverified app identity and failed simulation. Operator canceled. App receipt: `STANDING_PAYMENT`, `signature: null`, `CancellationException`, **no confirmed on-chain payment**. |
| Distinct CRESCO program | **LIVE_INTEGRATION / DEVNET** | Deployed with deterministic demo bootstrap; **not** evidence of a complete mobile transaction. |
| Emulator + official Mock MWA Wallet | **LOCAL / PARTIAL** | Actual emulator launches and wallet actions recorded; **not** footage of a physical Solflare transaction. |
| Beneficiary provision check | **SOURCE + CI** | PR #59 adds a fail-closed block for wallets that do not own the configured Devnet demo charter. Newly built APK must be validated before treating this as physical proof. |
| Guardian live exception / changed recipient / replay | **NOT PROVEN ON PHYSICAL G1** | Program/client implementation and tests exist; no end-to-end mobile payment-and-guardian receipt bundle is claimed. |
| Optional SKR Charter Atelier | **SOURCE INTEGRATION** | Voluntary read-only public Mainnet SKR-token check and interactive prompts; physical-wallet SKR verification and prize eligibility remain unproven. |

The real Samsung test exposed a genuine beneficiary mismatch: the newly connected wallet differs from the beneficiary who owns the original Devnet charter. CRESCO's preflight blocks use of the other beneficiary's configured mandate **before opening a signing request**. New authority still requires legitimately authorized Guardian and Beneficiary signatures, plus Devnet provisioning.

**G1 status: PARTIAL / BLOCKED**. Neither a client's `SIGNED` message nor an `UNKNOWN` payment is proof of an executed transfer or a verified on-chain refusal.

## Demo footage and receipts

- **Real Android Emulator + Mock MWA:** [recording provenance and evidence limitations](docs/CLOCK-IN-2026-EMULATOR-VIDEO-PROVENANCE.md); [GitHub Actions recorded session](https://github.com/Faadil1/cresco-key/actions/runs/37723102919), artifact `cresco-key-mwa-session-evidence`. Video is an actual emulator screen recording, not a fabricated animation.
- **Physical Samsung + Solflare:** [observed test and public receipt classification](docs/G1-PHYSICAL-SAMSUNG-OBSERVATION-2026-10-07.md).
- **Distinct program deployment:** [Devnet bootstrap run](https://github.com/Faadil1/cresco-key/actions/runs/37182728261) and [program state](evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json).
- **Narrated submission video:** 142-second edited film combines a real emulator excerpt with separately labeled Samsung photographs. Public permanent viewing URL **pending upload**; don't mistake the film for a continuous G1 on-chain run.
- **Submission copy and pitch outline:** [submission packet](docs/SUBMISSION-PACKET-DRAFT-2026-10-07.md), updated runtime caveats above. Actual competition submission receipt is a separate human-operated step.

**Deployed Devnet program:** [`6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`](https://explorer.solana.com/address/6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP?cluster=devnet)

### APK for judges / testers

- [Previously installed standalone Devnet APK artifact](https://github.com/Faadil1/cresco-key/actions/runs/37714261722/artifacts/11524177478) (ZIP contains `app-release.apk`). This is the **physical-tested, earlier build**, without the new beneficiary-mismatch preflight.
- [PR #59 — Museum Ledger, preflight and recording updates](https://github.com/Faadil1/cresco-key/pull/59). Use its **successful** `Mobile APK Evidence` run's `cresco-key-standalone-devnet-apk` artifact for the newer code only after the run completes and the APK is inspected. An Android *debug* APK from CI can require a Metro server and is **not** a standalone judge build.
- This APK is a **release-mode standalone test APK**, not a Play Store certified or production-signed mainnet application.

**Safety:** only Devnet for payment tests. Do not import demo keypairs into a friend's wallet, expose seed phrases, or approve a wallet transaction when the origin is unverified or simulation fails.

## Product mechanism

1. A **charter** binds the beneficiary and guardian to a controlled spending relationship.
2. A **mandate** grants bounded standing authority.
3. An **asset rule** constrains permitted token and amount behavior.
4. The young user presents an **exact intent** with the amount, mint, and recipient visible.
5. An in-bounds action requires the beneficiary wallet's signature and the on-chain rule to permit execution.
6. An out-of-bounds action must be **verifiably refused** before generating a private guardian request.
7. The guardian may explicitly refuse or authorize the **identical payment once**; that exception is not a broader allowance.
8. Mutation, stale use, and replay must fail closed. Unverifiable results remain **UNKNOWN**, not an invented success or on-chain refusal.

The Cloudflare boundary relay, where deployed, is for coordination only. Financial authority is determined by the Solana program and valid wallet signatures, **never by the relay or presentation layer**.

## Optional SKR bounty — Charter Atelier

`apps/mobile/src/skr/SkrCharterAtelier.tsx` includes a voluntary read-only query of the official SKR mint on **Solana Mainnet**, separate from CRESCO's **Devnet payment** path. If a connected public wallet holds SKR, it can access family-discussion prompts on independence, exceptions, and reflection. It **does not** sign, stake, transfer, distribute rewards, prove identity/parental status, or expand financial authority.

This is an **optional source-level bounty candidate**, not a claim of production readiness, a verified SKR-holder test, or bonus-prize qualification. Core spending permissions do not require SKR.

## Build and development

```bash
cd apps/mobile
npm install
# From apps/mobile — uses only already-public Devnet bootstrap parameters:
node ../../tools/devnet/write-mobile-env-from-demo-state.cjs \
  ../../evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json .env
npm run typecheck
npx expo prebuild --platform android --no-install --non-interactive
cd android
NODE_ENV=production ./gradlew assembleRelease
```

The APK is at `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. A real MWA-compatible Android wallet is needed for connection; Expo Go cannot execute this native MWA path. The generated `.env` references the *original* demo Beneficiary, and is **not** a provisioner for a new wallet.

Relevant verification workflows: `Mobile CI`, `Devnet Tooling CI`, `Mobile G1 Configured Preflight`, `Mobile APK Evidence`, `Android Emulator Smoke Evidence`, and `MWA Session Evidence`. A green workflow proves only what that particular runner actually tested.

For the end-to-end operator procedure see [Mobile G1 runtime runbook](docs/MOBILE-G1-RUNTIME-RUNBOOK.md). Do not promote a live claim until matching wallet identities, provisioned accounts, transaction signatures, RPC state consequences, guardian path, and negative/replay receipts are independently checked.

## Repository map

| Folder | Purpose |
| --- | --- |
| [`apps/mobile/`](apps/mobile/) | React Native Android client, MWA, Solana Pay, Museum Ledger UX, SKR optional module |
| [`programs/keys/`](programs/keys/) | Distinct Anchor authority program, charter/mandate rules and exact one-time allowances |
| [`services/relay/`](services/relay/) | Private coordination; not a financial authority source |
| [`tools/devnet/`](tools/devnet/) | Public Devnet bootstrap/configuration and runtime receipt validation |
| [`evidence/`](evidence/) | Evidence graph, Devnet proof and reality ledger |
| [`docs/`](docs/) | Architecture, runtime runbooks, live observations, submission and video provenance |
| [`state/`](state/) | Canonical CURRENT/HANDOVER project continuity |
| [`governance/`](governance/) | Lifecycle completeness, gateway registry and claim/proof boundaries |

## Canonical project continuity

Read in this order:

1. [Collaborator start](docs/COLLABORATOR-START-HERE.md)
2. [Current state](state/CURRENT.md)
3. [Handover](state/HANDOVER.md)
4. [Living PRD](product/PRD.md)
5. [Project control plane](governance/PROJECT-CONTROL-PLANE.yaml)
6. [Lifecycle coverage](governance/BUILD-LIFECYCLE-COVERAGE.yaml)
7. [Conditional gateway registry](governance/CONDITIONAL-GATEWAY-REGISTRY.md)
8. [Claim-to-evidence graph](evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml)
9. [Reality ledger](evidence/REALITY-LEDGER.md)

The living PRD owns the scope. GitHub + CURRENT/HANDOVER remain the project's source of truth; central cross-project governance remains `Faadil1/faadil-agent-system@main`. The submission narrative does not override the Product Reality or Evidence Integrity gates.

## Explicit non-goals and truth boundary

CRESCO does **not** claim production custody, KYC/age verification, parental-relationship validation, licensed brokerage, real securities execution for minors, mainnet financial-readiness, universal interception of payments from other apps, or a completed live two-device payment loop. **The UI is not the guard. The capital path is.**

## Original authority-engine baseline

The original CRESCO engine predates this Android-first product: [`Faadil1/cresco`](https://github.com/Faadil1/cresco).
