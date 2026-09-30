# MWA Session Evidence Gate

Status: **ACTIVE**

This gate extends the proven Android emulator smoke test into real Mobile Wallet Adapter session behavior using Solana Mobile's official Mock MWA Wallet.

## Target proof

The workflow attempts to observe:

1. disconnected CRESCO surface;
2. real MWA authorize request;
3. explicit wallet Cancel / decline;
4. CRESCO REFUSED non-success state;
5. a second authorize request;
6. explicit wallet Connect;
7. Android device credential when required;
8. connected CRESCO workspace;
9. signMessage request;
10. explicit wallet Approve;
11. CRESCO signed proof state;
12. force-stop / relaunch;
13. truthful restored-connected or disconnected state.

## First run — preserved negative evidence

Run `36673316075` failed before the MWA interaction itself. The test configured a device PIN with `locksettings set-pin`, which immediately left the Android emulator on the lock screen. CRESCO had launched behind the lock screen, so the harness timed out waiting for `Connect wallet`.

This is classified as a **test-environment failure**, not an app or MWA failure.

The correction explicitly unlocks the emulator after configuring the PIN and verifies that the lock screen is gone before launching CRESCO. The authorization step also now distinguishes between an already-satisfied recent device credential and an actual biometric/device-credential prompt.

## Evidence classification

A successful run remains **LOCAL / PARTIAL**.

It may promote emulator MWA decline, authorization, signMessage and relaunch truthfulness to OBSERVED. It does not prove a production wallet, physical Android, Devnet transaction, or Live Core Loop.

## Next sub-gate

After this passes:

`Devnet transaction construction → wallet approval → RPC submit → confirmation receipt → commit/runtime binding`
