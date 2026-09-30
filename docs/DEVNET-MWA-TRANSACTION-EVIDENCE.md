# Devnet MWA Transaction Evidence Gate

Status: **ACTIVE**

This gate proves a real Devnet transaction path through CRESCO and Mobile Wallet Adapter before the distinct CRESCO program is promoted as live.

## Proof chain

`authorize MWA → discover connected wallet address → Devnet faucet funding → construct Memo transaction → explicit wallet approval → signAndSendTransactions → RPC submission → confirmation → independent RPC verification`

The official Mock MWA Wallet generates its own random test key. The workflow never exports or reads its private key. It only reads the public wallet address from CRESCO after authorization and funds that address with Devnet SOL.

## First run — preserved dependency failure

Run `36717900238` failed before runtime because `@solana-program/memo@0.11.2` declares a peer dependency on `@solana/kit ^6.4.0`, while CRESCO Key uses Kit 7.1.x.

The fix does not weaken npm resolution. The external Memo package was removed, and the standard Memo instruction is constructed directly with the Kit `Instruction` shape and the canonical Memo program address.

## Evidence class

A green run remains **LOCAL / PARTIAL**.

It may prove explicit MWA transaction approval in the emulator, wallet sign-and-send, real Devnet RPC submission, a confirmed onchain signature, and commit/signature binding for this proof.

It does not prove a deployed distinct CRESCO Key program, a CRESCO payment instruction, Allow Once runtime, physical Android, production-wallet compatibility, or Live Core Loop.

The transaction is intentionally a Memo proof transaction. The next gate is distinct CRESCO Key Devnet deployment + deterministic payment-demo bootstrap.
