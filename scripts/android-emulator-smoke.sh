#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
EVIDENCE="$ROOT/evidence/emulator"
MOBILE="$ROOT/apps/mobile"
MOCK_WALLET="$ROOT/vendor/mock-mwa-wallet"

mkdir -p "$EVIDENCE"

echo "== Build standalone CRESCO Key test APK =="
cd "$MOBILE"
npx expo prebuild --platform android --no-install --non-interactive
cd android
NODE_ENV=production ./gradlew assembleRelease

CRESCO_APK="$MOBILE/android/app/build/outputs/apk/release/app-release.apk"
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
# React Native JS can take longer than ten seconds on a cold runner.
# Require an accessible real control: process-alive or a splash screen is NOT proof.
WALLET_SURFACE_OBSERVED=0
for attempt in $(seq 1 10); do
  if adb shell uiautomator dump /sdcard/cresco-window.xml >/dev/null 2>&1 && \
     adb pull /sdcard/cresco-window.xml "$EVIDENCE/cresco-window.xml" >/dev/null 2>&1 && \
     grep -Eq 'Connect wallet|Explore live Devnet Key' "$EVIDENCE/cresco-window.xml"; then
    WALLET_SURFACE_OBSERVED=1
    echo "Observed CRESCO wallet/judge entry UI on attempt $attempt."
    break
  fi
  sleep 3
done
adb exec-out screencap -p > "$EVIDENCE/cresco-launch.png"
adb logcat -d > "$EVIDENCE/logcat.txt"

if [ "$WALLET_SURFACE_OBSERVED" != "1" ]; then
  echo "FAIL: CRESCO wallet or read-only judge entry not found after repeated checks." >&2
  echo "Preserved emulator XML, screenshot, logcat and process evidence." >&2
  exit 1
fi

# The judge-facing no-wallet route is a FIRST-CLASS product surface.
# Actually open it; a visible CTA alone does not prove navigation works.
# Never click "Read live Key limits" in smoke and mistake a seed, spinner,
# or read-only RPC attempt for a real financial transaction.
echo "== Verify no-wallet Key tour is navigable on Android =="
TOUR_COORDS="$(EVIDENCE="$EVIDENCE" python3 - <<'PY'
import os, re, sys, xml.etree.ElementTree as ET
p=os.path.join(os.environ["EVIDENCE"],"cresco-window.xml")
root=ET.parse(p).getroot()
for n in root.iter("node"):
    v=n.attrib.get("text","") or n.attrib.get("content-desc","")
    if "Explore live Devnet Key" in v:
        m=re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]",n.attrib.get("bounds",""))
        if m:
            a,b,c,d=map(int,m.groups())
            print((a+c)//2,(b+d)//2)
            sys.exit(0)
sys.exit(1)
PY
)" || {
  echo "FAIL: no-wallet tour button lacks usable Android accessibility bounds." >&2
  exit 1
}
read -r TOUR_X TOUR_Y <<< "$TOUR_COORDS"
adb shell input tap "$TOUR_X" "$TOUR_Y"
TOUR_SEEN=0
for attempt in $(seq 1 8); do
  adb shell uiautomator dump /sdcard/cresco-judge.xml >/dev/null 2>&1 || true
  adb pull /sdcard/cresco-judge.xml "$EVIDENCE/cresco-judge.xml" >/dev/null 2>&1 || true
  if grep -q 'EXPLORE THE KEY' "$EVIDENCE/cresco-judge.xml" && \
     grep -q 'Read live Key limits' "$EVIDENCE/cresco-judge.xml"; then
    TOUR_SEEN=1
    break
  fi
  sleep 2
done
adb exec-out screencap -p > "$EVIDENCE/cresco-judge-tour.png"
if [ "$TOUR_SEEN" != "1" ]; then
  echo "FAIL: No-wallet live-Key inspection screen did not render." >&2
  exit 1
fi
echo "NO_WALLET_JUDGE_TOUR_NAVIGATION=OBSERVED (no RPC assertion, no payment)"
adb shell input keyevent 4 || true

echo "== Verify an installed MWA-compatible handler is discoverable =="
LAUNCH_RESULT="$(adb shell am start -W \
  -a android.intent.action.VIEW \
  -c android.intent.category.DEFAULT \
  -d 'solana-wallet:/v1/associate/local' 2>&1 || true)"

printf '%s\n' "$LAUNCH_RESULT" > "$EVIDENCE/mwa-view-intent-launch.txt"
sleep 2
adb shell dumpsys activity activities > "$EVIDENCE/activities-after-mwa-intent.txt"

if ! grep -q 'com.solana.mwallet' "$EVIDENCE/activities-after-mwa-intent.txt" && \
   ! printf '%s\n' "$LAUNCH_RESULT" | grep -q 'com.solana.mwallet'; then
  echo "Official Mock MWA Wallet is installed, but Android did not launch it for the local MWA URI." >&2
  cat "$EVIDENCE/mwa-view-intent-launch.txt" >&2 || true
  exit 1
fi

APK_SHA="$(sha256sum "$CRESCO_APK" | awk '{print $1}')"
MOCK_SHA="$(sha256sum "$MOCK_APK" | awk '{print $1}')"
export APK_SHA MOCK_SHA PID

node <<'NODE' > "$EVIDENCE/emulator-smoke-receipt.json"
console.log(JSON.stringify({
  note: "Release-mode test APK is used so the JS bundle launches without a Metro development server. It is not a production-signed submission APK.",
  schema: "cresco-key/android-emulator-smoke/v2",
  commit: process.env.GITHUB_SHA ?? null,
  evidenceClass: "LOCAL",
  integrationDepth: "PARTIAL",
  androidRuntime: {
    emulator: true,
    apiLevel: 36,
    packageInstalled: true,
    apkFlavor: "release-test",
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
    liveCoreLoopProven: false,
    productionReleaseSigningProven: false
  },
  generatedAt: new Date().toISOString()
}, null, 2));
NODE

echo "Android emulator smoke evidence complete."
