# CRESCO Key — Reality Ledger

Updated: 2026-09-28

Purpose: preserve the distinction between what exists in code, what has been built, what has run, and what remains unknown.

| Claim / component | Evidence class | Truth status | Current evidence | Promotion blocker |
|---|---|---|---|---|
| Product concept / authority semantics are locked | LOCAL | OBSERVED | PRD v0.2 on main | None for concept level |
| Android native project exists | LOCAL | OBSERVED | Expo/React Native source on main | None for code existence |
| Android debug APK can compile | LOCAL | OBSERVED | Successful GitHub Actions APK build | Physical-device runtime |
| Android APK installs and process launches in emulator | LOCAL / PARTIAL | OBSERVED | Run 36669206551 installed CRESCO Key and official Mock MWA Wallet and completed the smoke job successfully | Physical-device runtime |
| CRESCO product UI launches standalone in emulator | LOCAL / PARTIAL | OBSERVED | Run 36669206551 passed the standalone launch + Connect wallet UI assertion on commit b95dfd1b53ac1bfb08820d3f06a08a58298fa47f | Physical-device runtime |
| Official Mock MWA Wallet is discoverable on emulator | LOCAL / PARTIAL | OBSERVED | Run 36669206551 launched/resolved the official mock wallet through a real Android VIEW intent for solana-wallet:/v1/associate/local | Real MWA authorization/signing still pending |
| MWA integration exists in code | LOCAL | OBSERVED | Mobile provider/client code | Real Android wallet runtime |
| MWA explicit decline on emulator | LOCAL / PARTIAL | UNKNOWN | Run 36673316075 was blocked by emulator lock-screen setup before MWA interaction; harness correction pending re-run | Re-run MWA session evidence |
| MWA authorize on emulator | LOCAL / PARTIAL | UNKNOWN | Not reached in run 36673316075 because emulator remained locked after PIN setup | Re-run MWA session evidence |
| MWA signMessage on emulator | LOCAL / PARTIAL | UNKNOWN | Not reached in run 36673316075 | Re-run MWA session evidence |
| App relaunch state after MWA session | LOCAL / PARTIAL | UNKNOWN | Workflow classifies restored-connected vs disconnected truthfully | Run MWA session evidence |
| MWA works on physical device | NOT_IMPLEMENTED | UNKNOWN | No physical Android proof yet | Borrow/obtain Android and run |
| Solana Pay QR parsing exists | LOCAL | OBSERVED | Mobile parser/scanner code | Runtime scan proof |
| Exact amount + recipient allowance logic exists | LOCAL | OBSERVED | Anchor code + Rust tests | Distinct Devnet deployment + runtime |
| Changed-recipient runtime refusal | NOT_IMPLEMENTED | UNKNOWN | Code path exists; no live receipt | Devnet hero run |
| Replay runtime refusal | NOT_IMPLEMENTED | UNKNOWN | Code path exists; no live receipt | Devnet hero run |
| Standing Key unchanged by Allow Once in live mobile loop | NOT_IMPLEMENTED | UNKNOWN | Product/program semantics support it; no final mobile receipt | Hero run + before/after account proof |
| Boundary relay code exists | LOCAL | OBSERVED | Worker/Durable Object source + tests | Live Cloudflare deployment |
| Boundary relay is live | NOT_IMPLEMENTED | UNKNOWN | Deployment workflow exists | Cloudflare secrets + deployment receipt |
| Distinct CRESCO Key Devnet program exists | NOT_IMPLEMENTED | UNKNOWN | Provision script exists | Human provisioning/deployment |
| Full two-device Live Core Loop | NOT_IMPLEMENTED | UNKNOWN | Components exist separately in code | Program + relay + Android + MWA + canonical run |
| External user/operator trial | NOT_IMPLEMENTED | UNKNOWN | None recorded | Live usable build |
| Mainnet production readiness | NOT_IMPLEMENTED | UNKNOWN | Not claimed | Out of P0 |
| Production custody/KYC | NOT_IMPLEMENTED | UNKNOWN | Not claimed | Out of P0 |
| Real minor securities execution | NOT_IMPLEMENTED | UNKNOWN | Not claimed | Out of P0 |

## Ledger rules

- Update this ledger when a material claim changes evidence class or truth status.
- Bind runtime promotions to the demonstrated commit/runtime.
- Captured video can document a runtime proof but does not convert a currently broken/dead runtime into LIVE.
- PRESEEDED / SIMULATED / LOCAL_STUB evidence must remain labeled as such.
- UNKNOWN remains UNKNOWN until evidence exists.
