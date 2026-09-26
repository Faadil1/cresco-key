# CRESCO Key Mobile

Native Android client for the CLOCK IN vertical slice.

## Stack decision

- Expo SDK 57 / React Native
- TypeScript
- `@wallet-ui/react-native-kit`
- `@solana/kit`
- Mobile Wallet Adapter
- custom Expo development build — **not Expo Go**
- Solana Devnet for P0

This follows the current Solana Mobile React Native guidance.

## Current scaffold scope

This initial scaffold proves only:

- a native Android project exists;
- the app is configured around Devnet;
- MWA provider wiring is present;
- wallet connect/disconnect UI exists;
- product states are represented as domain types.

It does **not** yet claim:

- payment execution;
- guardian relay;
- onchain exact destination binding;
- production notifications;
- signed release APK.

Those move to PROVEN only with evidence.

## Local setup

From `apps/mobile`:

```bash
npm install
npx expo prebuild --platform android
npm run android
```

MWA uses native modules, so use a custom development build / `expo run:android`, not Expo Go.

Install an MWA-compatible wallet on the emulator/device before testing.

## Environment

Copy:

```bash
cp .env.example .env
```

Set a real app identity URI before wallet compatibility testing.

The identity URI should ultimately host the Digital Asset Links relationship required by wallets for production verification.

## P0 next tasks

1. confirm MWA connect/sign/send on Devnet;
2. port/adapt the authority instruction client;
3. add Solana Pay parsing / QR input;
4. add exact destination-bound payment instructions;
5. add boundary request relay;
6. add guardian role flow;
7. add app lifecycle restoration;
8. produce signed release APK.


## Current mobile boundary-flow branch

The P0 mobile flow now includes:

- Solana Pay QR scanning through `expo-camera`;
- strict parsing of exact SPL-token payment requests;
- secure local storage for private relay capabilities;
- a young-person relay integration harness;
- guardian deep-link loading and exact-request review;
- explicit UI copy that relay state is **not** financial authority.

The relay harness is intentionally not wired to the hero claim yet. It may create a private request for integration testing, but the final product must call that path only after a real onchain standing-authority REFUSE.

The guardian screen deliberately has no fake Approve button until the actual `grant_payment_allowance_once` program transaction is connected.


## P0 capital-path client

The native client now has a direct `@solana/kit` instruction builder for the CRESCO Key payment delta.

It derives the same PDAs as the Anchor program:

- `charter`;
- `mandate`;
- `asset-rule`;
- `vault`;
- `payment-allowance`;
- recipient ATA.

The Android flow can now construct and submit:

- `execute_payment_within_mandate`;
- `grant_payment_allowance_once`;
- `execute_payment_once`.

Transaction handling is fail-closed:

- a confirmed successful transaction is `ALLOW`;
- a failed transaction becomes `REFUSE` only when the client can identify a known CRESCO Key refusal marker in program logs;
- unclassified failures and timeouts are `UNKNOWN`;
- no guardian request is created from an `UNKNOWN` result.

The guardian's "Allow this exact payment once" control therefore submits the real program instruction when a distinct CRESCO Key Devnet program id is configured. It is no longer a simulated approval surface.

The young-person flow supports the target sequence once Devnet state is provisioned:

`standing attempt → verified REFUSE → private request → guardian exact grant → changed-recipient refusal → exact retry → replay refusal`.

### Required before runtime claims

The app intentionally refuses to use the inherited CRESCO program id by default. Set `EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID` only after issue #8 provisions a distinct program identity and deployment.

A successful TypeScript/prebuild CI run proves client construction, not on-device MWA execution or Devnet capital movement. Those remain runtime gates.
