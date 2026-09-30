# Devnet MWA Transaction Evidence Gate

Status: **ACTIVE**

This gate proves a real Devnet transaction path through CRESCO and Mobile Wallet Adapter before the distinct CRESCO program is promoted as live.

## Proof chain

`authorize MWA → discover connected wallet address → Devnet faucet funding → construct Memo transaction → explicit wallet approval → signAndSendTransactions → RPC submission → confirmation → independent RPC verification`

The transaction gate now uses Solana Mobile's official `mobile-wallet-adapter/android/fakewallet` reference wallet. That wallet is explicitly a testing implementation from the upstream MWA repository and stores an ephemeral random test key without requiring the secure-keyguard path used by the separate Mock MWA Wallet.

The workflow never exports or reads the wallet private key. It reads only the public address exposed to CRESCO after authorization and funds that public address with Devnet SOL.

The earlier emulator-session gate remains separately proven with the official Mock MWA Wallet; switching this transaction-only harness to the upstream fakewallet does not rewrite that evidence.

## First run — preserved dependency failure

Run `36717900238` failed before runtime because `@solana-program/memo@0.11.2` declares a peer dependency on `@solana/kit ^6.4.0`, while CRESCO Key uses Kit 7.1.x.

The fix does not weaken npm resolution. The external Memo package was removed, and the standard Memo instruction is constructed directly with the Kit `Instruction` shape and the canonical Memo program address.

Run `36718132402` then failed before transaction runtime because the separate Mock MWA Wallet harness again hit Android API 36 secure-keyguard flakiness. Rather than weakening or bypassing the wallet's authentication design, this transaction-specific CI gate now uses the official upstream MWA `fakewallet`, which is designed for protocol/reference testing and does not require that secure-keyguard setup.

## Evidence class

A green run remains **LOCAL / PARTIAL**.

It may prove explicit MWA transaction approval in the emulator, wallet sign-and-send, real Devnet RPC submission, a confirmed onchain signature, and commit/signature binding for this proof.

It does not prove a deployed distinct CRESCO Key program, a CRESCO payment instruction, Allow Once runtime, physical Android, production-wallet compatibility, or Live Core Loop.

The transaction is intentionally a Memo proof transaction. The next gate is distinct CRESCO Key Devnet deployment + deterministic payment-demo bootstrap.
