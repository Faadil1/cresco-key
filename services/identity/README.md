# Cresco Key — dedicated Cloudflare Android identity

This is a **separate, public-only Cloudflare Worker**, not the Boundary Relay. It serves:

- `/`: a transparent public Cresco Key introduction;
- `/favicon.png`: a minimal fallback icon requested by some wallet adapters;
- `/ready`: a configuration check, **not** proof of Android or wallet runtime;
- `/.well-known/assetlinks.json`: an exact Android Digital Asset Links statement.

The Cloudflare Worker has **no wallet keys, user session state, payment code, relay bearer credentials or custody**.

## Prerequisites

1. Cloudflare account with Workers enabled and a `workers.dev` subdomain (or a controlled custom domain).
2. GitHub repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` granted only necessary Cloudflare Workers write permissions.
3. A stable, deliberately controlled Android app signing key. The package is `com.faadil.crescokey`. Obtain the real certificate SHA-256 fingerprint from the **exact signing key used to install the Android APK**, for example `apksigner verify --print-certs app-release.apk`. **Do not publish, copy or request the private keystore or its password.**
4. Configure public GitHub Actions repository **variable** `CRESCO_ANDROID_SIGNING_SHA256` to that fingerprint. This fingerprint is public metadata, not a secret. Use a long-lived signing key. Note: the existing disposable CI debug-signing build is **not a stable Android release-signing policy**; fix this before considering the identity persistent.

## Deploy

The code and CI can merge independently of the open product PR #62. After code review, merge this infrastructure PR into `main`. Then run `Deploy Cresco Key Cloudflare Identity` from GitHub Actions.

The workflow installs/tests, deploys with Wrangler, then checks both the live `/ready` and the publicly accessible `/.well-known/assetlinks.json` for the configured certificate and package. A misconfigured fingerprint causes a hard failure; the Worker never publishes a fake association. Deploy is **not** automatic on pull requests.

A `workers.dev` address is a supported identity origin if the wallet accepts it and can verify the Digital Asset Links statement. For an own custom domain, bind the same Worker to the domain in Cloudflare and re-verify the exact origin the APK presents. Do not invent the generated `workers.dev` hostname; use the actual deployment URL from the successful run.

After publishing, set `EXPO_PUBLIC_APP_IDENTITY_URI` to the **actual Cloudflare HTTPS origin**, rebuild/sign the mobile APK with the matching certificate and install it on the test Android phone. Confirm the wallet verifies it in reality. The identity Worker itself cannot do this final device-side check.

## Release truth

- Source tests: LOCAL_TEST, not LIVE.
- Cloudflare deployed + HTTPS 200 assetlinks: PUBLIC_INFRASTRUCTURE, not wallet/device verified.
- Wallet identifies the right domain on physical Android: PHYSICAL_DEVICE only when observed.
- Full Cresco payment + guardian loop remains separately BLOCKED until transaction and recovery consequences are verified on Devnet.

Official references:
- https://github.com/solana-mobile/mobile-wallet-adapter/blob/main/spec/spec.md
- https://developer.android.com/training/app-links/configure-assetlinks
- https://developers.cloudflare.com/workers/wrangler/configuration/
