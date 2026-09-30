# Android Emulator Smoke — Canonical Proof

Date: 2026-09-30  
Evidence class: **LOCAL / PARTIAL**  
Truth status: **OBSERVED**  
Gateway result: **PROVEN — emulator smoke sub-gate only**

## Bound runtime

- GitHub Actions run: `36669206551`
- Workflow: `Android Emulator Smoke Evidence`
- Head commit: `b95dfd1b53ac1bfb08820d3f06a08a58298fa47f`
- Artifact: `cresco-key-android-emulator-evidence`
- Artifact ID: `11077649828`
- Artifact digest: `sha256:f5df0ebc05b920de4c4aa1fffbbe1f181dcbe240a1d93c41316df1aadc4d1534`

## Observed

The successful run completed all workflow steps, including:

1. CRESCO Key standalone Android test APK build.
2. Official Solana Mobile Mock MWA Wallet build.
3. Installation of both APKs in Android API 36 emulator.
4. Launch of CRESCO Key.
5. CRESCO process alive after launch.
6. `Connect wallet` product UI assertion.
7. Real Android VIEW intent using `solana-wallet:/v1/associate/local`.
8. Resolution/launch evidence for the installed official Mock MWA Wallet.
9. Evidence artifact upload.

## Preserved negative evidence

Earlier runs remain intentionally preserved:

- run 36444987861 exposed that a debug Expo development build required Metro;
- run 36665062722 exposed an invalid Android package-manager test command;
- run 36667070313 confirmed that stale test harness code was still being executed.

These failures were not rewritten as success. Each produced a corrective delta.

## Not proven by this run

This proof does **not** establish:

- physical Android behavior;
- production-wallet compatibility;
- MWA authorization success;
- wallet cancellation/rejection behavior;
- message signing;
- transaction signing/sending;
- Devnet capital movement;
- two-device guardian flow;
- Live Core Loop;
- production release signing.

## Next promotion

Next emulator depth target:

`MWA authorize → reject/cancel → signMessage → Devnet transaction → kill/relaunch recovery`

Physical Android remains a separate final-evidence gate.
