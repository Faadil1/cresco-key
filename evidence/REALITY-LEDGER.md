# CRESCO Key — Reality Ledger

Updated: 2026-10-02

Purpose: distinguish what is **LIVE / TESTED / LOCAL / MOCKED / PLANNED / NOT PROVEN** today. The ledger is factual state, not marketing copy.

| Claim / component | Evidence class | Truth status | Current evidence | Promotion blocker |
|---|---|---|---|---|
| Product concept / authority semantics are locked | LOCAL | OBSERVED | Living PRD on main; concept law unchanged by 2026-10-01 reconciliation | None at concept level |
| System Control Plane v1 is reconciled into this active project | LOCAL / GOVERNANCE | OBSERVED | `governance/PROJECT-CONTROL-PLANE.yaml` + lifecycle manifest created prospectively on 2026-10-01 | Keep CURRENT/HANDOVER/gates current |
| Lifecycle coverage manifest exists | LOCAL / GOVERNANCE | OBSERVED | `governance/BUILD-LIFECYCLE-COVERAGE.yaml` | Material capabilities inside remain MISSING |
| Claim → Runtime → Evidence Graph exists | LOCAL / GOVERNANCE | OBSERVED | `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml` | Missing live/program/deployment edges remain explicit |
| Android native project exists | LOCAL | OBSERVED | Expo/React Native source on main | None for code existence |
| Android APK can compile | LOCAL | OBSERVED | Successful GitHub Actions APK builds | Physical-device/runtime class remains separate |
| Android APK installs and process launches in emulator | LOCAL / PARTIAL | OBSERVED | Run `36669206551` | Physical-device runtime |
| CRESCO product UI launches standalone in emulator | LOCAL / PARTIAL | OBSERVED | Run `36669206551`, commit `b95dfd1b53ac1bfb08820d3f06a08a58298fa47f` | Physical-device runtime |
| Official Mock MWA Wallet is discoverable in emulator | LOCAL / PARTIAL | OBSERVED | Run `36669206551` | Production-wallet / physical-device proof |
| MWA integration exists in code | LOCAL | OBSERVED | Mobile provider/client code | Real product transaction path |
| MWA explicit decline on emulator | LOCAL / PARTIAL | OBSERVED | Run `36699897176` captured authorize surface, explicit decline and CRESCO REFUSED state | Physical Android / production wallet |
| MWA authorize on emulator | LOCAL / PARTIAL | OBSERVED | Run `36699897176` captured second authorize/connect and connected workspace | Physical Android / production wallet |
| MWA signMessage on emulator | LOCAL / PARTIAL | OBSERVED | Run `36699897176` captured signing approval and CRESCO SIGNED state | Product transaction / physical device |
| App relaunch after MWA session | LOCAL / PARTIAL | OBSERVED | Run `36699897176` force-stop/relaunch, receipt `CONNECTED_RESTORED` | Physical-device recovery |
| Generic real Devnet MWA sign/send transaction | TECHNICAL_PROOF TARGET / PARTIAL | UNKNOWN | Latest run `36761591880` failed before transaction runtime; PR #28 and issue #27 are now closed/deferred as a separate proof-only lane | If needed, prove sign/send through the actual CRESCO product path rather than reviving parallel proof theater |
| Generic Memo proof is the CRESCO live core | NOT_APPLICABLE | OBSERVED_FALSE | Integration-First v1.3 reconciliation: Memo spike is not the load-bearing product action | Must use actual CRESCO program path |
| MWA works on physical Android | NOT_IMPLEMENTED | UNKNOWN | No physical-device proof | Borrow/obtain Android and run when live path is ready |
| Production-wallet compatibility | NOT_IMPLEMENTED | UNKNOWN | Official test-wallet evidence only | Real compatible wallet/device |
| Solana Pay QR parsing exists | LOCAL | OBSERVED | Mobile parser/scanner code | Integrated scan + product transaction |
| Exact amount + recipient allowance logic exists | LOCAL / TECHNICAL_PROOF | OBSERVED | Anchor code + Rust tests | Distinct Devnet deployment + mobile runtime |
| Distinct CRESCO Key Devnet program exists | NOT_IMPLEMENTED / LIVE TARGET | UNKNOWN | Provisioning script exists only | **Exact next gate:** human-controlled distinct key + Devnet deploy + receipt/commit binding |
| Deterministic CRESCO payment state bootstrapped against distinct program | NOT_IMPLEMENTED | UNKNOWN | Bootstrap tooling exists | Deploy distinct program first |
| In-bounds 5-unit payment executes through CRESCO program from mobile | NOT_IMPLEMENTED | UNKNOWN | Product/code path exists; no integrated runtime receipt | Deploy/bootstrap + mobile MWA |
| 12-unit boundary refuses in real CRESCO capital path | NOT_IMPLEMENTED | UNKNOWN | Negative semantics exist in code | Integrated hero run |
| Guardian exact Allow Once is confirmed onchain in mobile loop | NOT_IMPLEMENTED | UNKNOWN | Grant instruction/code exists | Live relay + guardian wallet + deployed program |
| Changed-recipient runtime refusal | NOT_IMPLEMENTED | UNKNOWN | Code path exists; no live receipt | Integrated hero run |
| Exact approved action succeeds once | NOT_IMPLEMENTED | UNKNOWN | Code path exists; no live receipt | Integrated hero run |
| Replay runtime refusal | NOT_IMPLEMENTED | UNKNOWN | Code path exists; no live receipt | Integrated hero run |
| Standing Key remains unchanged by Allow Once in integrated loop | NOT_IMPLEMENTED | UNKNOWN | Program semantics support it; no before/after live account receipt | Hero run + before/after state |
| Boundary relay code exists | LOCAL | OBSERVED | Worker/Durable Object source + tests | Live deployment |
| Boundary relay is live | NOT_IMPLEMENTED | UNKNOWN | Deployment workflow exists | Cloudflare deployment receipt/runtime identity |
| Full two-device Live Core Loop | NOT_IMPLEMENTED / LIVE TARGET | UNKNOWN | Components exist separately; no same-product integrated run | Program + bootstrap + relay + mobile + representative scenarios + binding |
| Failure/recovery on full product loop | PARTIAL | UNKNOWN | Wallet cancellation and app relaunch are locally observed; RPC/relay/product-state recovery not yet integrated | Representative recovery run |
| Runtime → receipt → commit → deployment binding for live product | NOT_IMPLEMENTED | UNKNOWN | Evidence Graph identifies missing edges | Deployed program/relay + canonical run |
| Engineering Quality receipt | GOVERNANCE / QUALITY | OBSERVED | `evidence/engineering-quality/ENGINEERING-QUALITY-RECEIPT-2026-10-02.json` — **PASS_WITH_ACCEPTED_DEBT**; Mobile CI `37039621579` and Relay CI `37039621677` pass | Issue #33 dependency/reproducibility debt must be re-evaluated before PRE_SUBMISSION / RELEASE |
| Mobile dependency audit debt | GOVERNANCE / SECURITY-DEBT | OBSERVED | Mobile CI `37039621579`: 13 transitive audit findings (8 moderate / 5 high), including node-forge via Expo tooling; issue #33 tracks remediation | Do not force-downgrade Expo; add deterministic dependency locking and re-evaluate before PRE_SUBMISSION / RELEASE |
| TRACE / Design Experience terminal verdict | NOT_IMPLEMENTED / GOVERNANCE | UNKNOWN | Design collaboration exists; no TRACE verdict | Run before design-sensitive terminal transition |
| External user/operator trial | NOT_IMPLEMENTED | UNKNOWN | None recorded | Usable live build |
| Clean-room / judge self-serve core path | NOT_IMPLEMENTED | UNKNOWN | Setup scripts/docs exist; no fresh-environment proof | Live core first |
| Mainnet production readiness | N/A P0 | UNKNOWN | Not claimed | Out of P0 |
| Production custody / KYC | N/A P0 | UNKNOWN | Not claimed | Out of P0 |
| Real minor securities execution | N/A P0 | UNKNOWN | Not claimed | Out of P0 |

## Current proof-class summary

- **TECHNICAL / LOCAL proof exists** for substantial program/mobile/relay mechanisms.
- **BEHAVIOR proof exists at LOCAL/PARTIAL scope** for Android launch and MWA decline/authorize/signMessage/relaunch.
- **No OUTCOME proof is claimed.**
- **No PRODUCTION_EVIDENCE is claimed.**
- **LIVE CORE LOOP is not proven.**

## Ledger rules

- Update this ledger on every material claim/gate transition.
- Reuse existing evidence only at its real class.
- Bind runtime promotions through the Evidence Graph.
- Captured video/replay documents a run; it cannot convert a broken or absent live path into LIVE.
- Test wallets, simulated/preseeded/local-stub behavior remain explicitly labeled.
- A failed run remains evidence and must not be rewritten as success.
- UNKNOWN remains UNKNOWN until observed evidence resolves it.
- Proof sufficiency is never a reason to stop a materially incomplete product.
