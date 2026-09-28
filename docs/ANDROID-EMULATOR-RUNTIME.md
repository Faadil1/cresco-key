# Android Emulator Runtime Gate

Status: **ACTIVE**

The project owner currently has an iPhone and no physical Android device.

CRESCO Key therefore uses an **emulator-first** runtime strategy for development, while preserving physical Android as a later promotion requirement for the strongest final CLOCK IN proof.

## What the emulator smoke gate proves

The `Android Emulator Smoke Evidence` workflow:

1. builds the current CRESCO Key Android debug APK;
2. checks out and builds Solana Mobile's official **Mock MWA Wallet**;
3. starts an Android API 36 emulator;
4. installs both apps;
5. launches CRESCO Key;
6. requires the CRESCO process to remain alive;
7. requires the wallet-connect UI to be present;
8. verifies Android can discover the installed Mock MWA Wallet as a local `solana-wallet:` handler;
9. captures screenshot, UI dump, activity dump, logcat, hashes and a machine-readable receipt.

Official Mock MWA Wallet:
https://github.com/solana-mobile/mock-mwa-wallet

The wallet is development-only. It must never be described as a production wallet or used with real funds.

## Evidence classification

A successful workflow is:

- **Evidence class:** `LOCAL`
- **Integration depth:** `PARTIAL`
- **Android install/launch:** `OBSERVED`
- **MWA-compatible handler discovery:** `OBSERVED`
- **Production wallet compatibility:** `UNKNOWN`
- **MWA authorization/signing:** `UNKNOWN` until separately exercised
- **Physical-device behavior:** `UNKNOWN`
- **Live Core Loop:** `BLOCKED`

This workflow must not promote CRESCO Key to `LIVE CORE LOOP`.

## Why install the official Mock MWA Wallet

The official testing wallet supports the MWA authorization/signing surface and is explicitly intended for Android device/emulator integration testing.

It gives us a deterministic development target before we borrow/obtain a physical Android.

A mock wallet proving local association is useful technical evidence, but it remains **LOCAL / PARTIAL**, not final user/runtime evidence.

## Next emulator depth step

After launch/discovery proof:

1. authenticate the Mock MWA Wallet in the emulator;
2. invoke CRESCO Key connect;
3. observe real MWA authorization;
4. capture cancel/reject;
5. capture message signature;
6. fund/import a Devnet-only test key;
7. submit a Devnet transaction;
8. kill/relaunch the app and verify state truthfulness.

Those steps can increment the emulator evidence level, but physical-device proof remains a separate gate.

## Physical-device promotion

Before final CLOCK IN submission, prefer at least one real Android device for:

- APK installation;
- real wallet handoff;
- MWA connect/reject/sign/send;
- QR/camera;
- deep links;
- app background/relaunch;
- latency/interaction behavior.

Development may continue without purchasing a device immediately.
