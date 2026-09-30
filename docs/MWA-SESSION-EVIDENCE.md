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

## Evidence classification

A successful run remains **LOCAL / PARTIAL**.

It may promote emulator MWA decline, authorization, signMessage and relaunch truthfulness to OBSERVED. It does not prove a production wallet, physical Android, Devnet transaction, or Live Core Loop.

## Next sub-gate

After this passes:

`Devnet transaction construction → wallet approval → RPC submit → confirmation receipt → commit/runtime binding`
