# Android APK Evidence Gate

This workflow exists to separate **build evidence** from **runtime evidence**.

## What a green APK workflow proves

A successful `Mobile APK Evidence` run proves that the current native project can:

- install its JavaScript/native dependencies;
- typecheck;
- generate the Android project from Expo;
- compile an installable Android debug APK;
- publish that APK as a GitHub Actions artifact.

It does **not** prove:

- Mobile Wallet Adapter works on a physical Seeker;
- the wallet identity URI is verified;
- the boundary relay is deployed;
- the CRESCO Key program is deployed to Devnet;
- the hero payment path moves demo capital;
- changed-recipient and replay refusals are live.

Those remain runtime gates.

## Why debug APK first

The debug artifact is for deterministic device testing while the CRESCO Key Devnet program identity, app domain, and release signing are still being provisioned.

Do not present the debug artifact as the final dApp Store release package.

## Runtime promotion path

`APK_BUILDS → INSTALLS_ON_DEVICE → MWA_CONNECTS → PROGRAM_DEPLOYED → RELAY_LIVE → HERO_PATH_PROVEN → RELEASE_SIGNED`

The product may not claim the next state until evidence for that state exists.
