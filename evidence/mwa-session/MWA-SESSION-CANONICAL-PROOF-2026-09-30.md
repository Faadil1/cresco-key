# MWA Session Evidence — Canonical Proof

Date: 2026-09-30  
Evidence class: **LOCAL / PARTIAL**  
Truth status: **OBSERVED**  
Gateway result: **PROVEN — emulator MWA session sub-gate only**

## Bound evidence

- GitHub Actions run: `36699897176`
- Workflow: `MWA Session Evidence`
- PR head SHA: `aaeacbe37610a282993dde8ddc96dca2a3e64347`
- GitHub pull-request test merge SHA recorded by the artifact: `6f541585b34a71b4128be4752b36406f909e3fde`
- Fix PR #25 merged to main as: `1beb8d798a165726ab55ff0013df076a926a8f0d`
- Artifact: `cresco-key-mwa-session-evidence`
- Artifact ID: `11091056144`
- Artifact digest: `sha256:5942081742403f5a33b49b5de80ba3209284638eaea2ed6abdd228835a14d870`

## Observed sequence

The successful run completed the full emulator sequence:

1. CRESCO standalone test APK built and installed.
2. Official Solana Mobile Mock MWA Wallet built and installed.
3. Emulator device credential configured and keyguard dismissed.
4. CRESCO launched to the disconnected `Connect wallet` surface.
5. CRESCO invoked a real MWA authorize request.
6. The wallet displayed the authorize surface.
7. Explicit **Cancel** was selected.
8. CRESCO returned to a non-success / **REFUSED** state.
9. A second real authorize request was invoked.
10. Explicit **Connect** was selected.
11. CRESCO entered the connected P0 workspace.
12. CRESCO invoked `signMessage` for the TRC-01 proof.
13. The wallet displayed the sign-message approval surface.
14. Explicit **Approve** was selected.
15. CRESCO displayed the **SIGNED** proof state.
16. CRESCO was force-stopped and relaunched.
17. The receipt classified the relaunch as `CONNECTED_RESTORED`.

## Machine-readable receipt

The uploaded receipt records:

- `explicitDeclineObserved: true`
- `authorizeObserved: true`
- `signMessageObserved: true`
- `android.apiLevel: 36`
- `android.relaunchState: CONNECTED_RESTORED`
- `productionWallet: false`
- `physicalDeviceProven: false`
- `devnetTransactionProven: false`
- `liveCoreLoopProven: false`

APK hashes:

- CRESCO test APK: `9e8e90dd2b1d71e6bbb171353647394e64d2cbcec4ebab9c0b6777f29de13836`
- Mock MWA Wallet APK: `0015c6d508e18430c74b2f193473df7afb9fa3bda8929749e013d46f88402b4f`

## Preserved negative evidence

The preceding failures remain part of the evidence trail:

- run `36673316075`: setting a PIN left the API 36 emulator on secure keyguard;
- run `36677207011`: text-based PIN input still failed to unlock secure keyguard;
- corrective delta: direct PIN key events + explicit keyguard verification.

Those failures are environment/harness failures, not rewritten as MWA failures.

## Not proven

This successful run does **not** prove:

- physical Android behavior;
- production-wallet compatibility;
- Devnet transaction signing/sending;
- RPC confirmation;
- distinct CRESCO Key program deployment;
- full guardian two-device flow;
- full Live Core Loop.

## Next promotion

Next runtime target:

`Devnet transaction construction → wallet approval → sign/send → RPC submission → confirmation receipt → commit/runtime binding`
