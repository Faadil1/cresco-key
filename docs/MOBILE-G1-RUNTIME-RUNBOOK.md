# Mobile G1 Runtime Runbook

Updated: 2026-10-04

Purpose: execute the first real mobile CRESCO transaction against the distinct Devnet program without overstating proof class.

## Canonical inputs

Use only public runtime identifiers here. Do not paste private key material into chat, GitHub issues, PRs, logs, screenshots, or public artifacts.

- Program id: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`
- Charter: `9FjR5U3ELz6oRmMJN8VoH6M2795bBSnkEN6kgz7Y8ZQS`
- Mandate: `C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE`
- Mint: `B5G9WPQrgrvoFuJm53ZmT5gyJb5k1g9VdqLLeh4eK9V5`
- Guardian public key: `Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov`
- Beneficiary public key: `DD1T86b6vSJd7avUVn23f8TaZxdKEzjRF14XzgffDRSZ`
- G0 deployment/bootstrap run: `37182728261`
- G1 configured preflight head: `a2d9e35f8730a4ca97c8324e96c116697c8fbfb2`

## Current proof boundary

Already proven:

- Mobile app can be configured from the public Devnet bootstrap state.
- Android build/typecheck/prebuild passes against the distinct Devnet configuration.
- Debug APK builds.
- Emulator smoke passes.
- Official Mock MWA Wallet decline/authorize/signMessage/relaunch passes at local/partial scope.

Not yet proven:

- Physical Android runtime.
- Production wallet compatibility.
- A real mobile CRESCO transaction against the distinct Devnet program.
- Devnet account-state change caused by the mobile product path.
- Full Live Core Loop.

## Prepare mobile environment

From `apps/mobile`:

```bash
node ../../tools/devnet/write-mobile-env-from-demo-state.cjs \
  ../../evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json \
  .env
```

The generated `.env` contains public Devnet configuration only. It must not contain private keys, keypairs, seed phrases, API secrets, or wallet recovery material.

## Required run scenarios

Capture screenshots/logs/receipts for each scenario. A missing scenario stays missing; do not promote partial evidence.

| Scenario | Expected result | Evidence needed |
|---|---|---|
| 5-unit in-bounds action | Real CRESCO transaction succeeds on Devnet | wallet approval, transaction signature, RPC confirmation, relevant before/after account state |
| 12-unit boundary action | Product refuses or routes exact exception request without widening standing authority | UI state, program/client refusal marker, no unauthorized transfer |
| Guardian exact Allow Once | Guardian wallet submits the exact allowance grant | grant transaction signature, mandate/allowance state receipt |
| Changed-recipient mutation | Changed recipient refuses without consuming allowance | refusal marker, allowance still available if applicable |
| Exact retry after grant | Exact approved action succeeds once | transaction signature, recipient/vault/account state |
| Replay after consumption | Replay refuses | refusal marker, no second transfer, allowance consumed/invalid |
| Recovery interruption | Wallet/RPC/relay interruption fails closed or restores truthful state | logs, UI state, no false success |

## Evidence package

A sufficient G1 evidence package should include:

- source commit and branch;
- mobile app configuration receipt;
- wallet/device class used;
- transaction signatures where present;
- RPC confirmation output;
- account addresses inspected;
- before/after token/account state;
- screenshots or screen recording of approval/refusal surfaces;
- explicit truth boundary.

## Promotion rule

Only promote `LIVE_CORE_G1` when the real product path produces the required Devnet receipts. Emulator/mock-wallet behavior is useful support evidence, but it cannot by itself prove physical Android, production wallet, or Live Core Loop.
