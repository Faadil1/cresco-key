#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
EVIDENCE="$ROOT/evidence/emulator"
MOBILE="$ROOT/apps/mobile"
MOCK_WALLET="$ROOT/vendor/mock-mwa-wallet"

mkdir -p "$EVIDENCE"

echo "== Build CRESCO Key debug APK =="
cd "$MOBILE"
npx expo prebuild --platform android --no-install --non-interactive
cd android
./gradlew assembleDebug

CRESCO_APK="$MOBILE/android/app/build/outputs/apk/debug/app-debug.apk"
test -f "$CRESCO_APK"

echo "== Build official Mock MWA Wallet =="
cd "$MOCK_WALLET"
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > local.properties
./gradlew :app:assembleDebug

MOCK_APK="$MOCK_WALLET/app/build/outputs/apk/debug/app-debug.apk"
test -f "$MOCK_APK"

echo "== Install both APKs =="
adb install -r "$CRESCO_APK"
adb install -r "$MOCK_APK"

adb shell pm list packages | grep -q 'package:com.faadil.crescokey'
adb shell pm list packages | grep -q 'package:com.solana.mwallet'

echo "== Launch CRESCO Key =="
adb logcat -c
adb shell monkey -p com.faadil.crescokey -c android.intent.category.LAUNCHER 1
sleep 10

PID="$(adb shell pidof com.faadil.crescokey | tr -d '\r' || true)"
if [ -z "$PID" ]; then
  echo "CRESCO Key process is not alive after launch." >&2
  adb logcat -d > "$EVIDENCE/logcat.txt" || true
  exit 1
fi

echo "$PID" > "$EVIDENCE/cresco-pid.txt"
adb shell dumpsys activity activities > "$EVIDENCE/activities.txt"
adb shell uiautomator dump /sdcard/cresco-window.xml >/dev/null
adb pull /sdcard/cresco-window.xml "$EVIDENCE/cresco-window.xml" >/dev/null
adb exec-out screencap -p > "$EVIDENCE/cresco-launch.png"
adb logcat -d > "$EVIDENCE/logcat.txt"

if ! grep -q 'Connect wallet' "$EVIDENCE/cresco-window.xml"; then
  echo "Expected CRESCO Key wallet-connect surface was not found." >&2
  exit 1
fi

echo "== Verify an installed MWA-compatible handler is discoverable =="
adb shell cmd package query-intent-activities   -a android.intent.action.VIEW   -c android.intent.category.DEFAULT   -d 'solana-wallet:/v1/associate/local'   > "$EVIDENCE/mwa-intent-handlers.txt" || true

if ! grep -q 'com.solana.mwallet' "$EVIDENCE/mwa-intent-handlers.txt"; then
  echo "Official Mock MWA Wallet is installed, but Android did not report it for the local MWA URI." >&2
  cat "$EVIDENCE/mwa-intent-handlers.txt" >&2 || true
  exit 1
fi

APK_SHA="$(sha256sum "$CRESCO_APK" | awk '{print $1}')"
MOCK_SHA="$(sha256sum "$MOCK_APK" | awk '{print $1}')"
export APK_SHA MOCK_SHA PID

node <<'NODE' > "$EVIDENCE/emulator-smoke-receipt.json"
console.log(JSON.stringify({
  schema: "cresco-key/android-emulator-smoke/v1",
  commit: process.env.GITHUB_SHA ?? null,
  evidenceClass: "LOCAL",
  integrationDepth: "PARTIAL",
  androidRuntime: {
    emulator: true,
    apiLevel: 36,
    packageInstalled: true,
    packageId: "com.faadil.crescokey",
    processAliveAfterLaunch: true,
    connectWalletSurfaceObserved: true
  },
  mwaTestWallet: {
    source: "solana-mobile/mock-mwa-wallet",
    packageId: "com.solana.mwallet",
    installed: true,
    localAssociationHandlerObserved: true,
    realProductionWallet: false,
    signingProven: false
  },
  hashes: {
    crescoDebugApkSha256: process.env.APK_SHA,
    mockWalletApkSha256: process.env.MOCK_SHA
  },
  truthBoundary: {
    physicalDeviceProven: false,
    mwaAuthorizationProven: false,
    transactionSigningProven: false,
    devnetHeroRunProven: false,
    liveCoreLoopProven: false
  },
  generatedAt: new Date().toISOString()
}, null, 2));
NODE

echo "Android emulator smoke evidence complete."
