#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
EVIDENCE="$ROOT/evidence/mwa-session"
MOBILE="$ROOT/apps/mobile"
MOCK_WALLET="$ROOT/vendor/mock-mwa-wallet"
PIN="1234"
mkdir -p "$EVIDENCE"
export EVIDENCE

dump_ui() {
  name="$1"
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml "$EVIDENCE/$name.xml" >/dev/null 2>&1 || true
  adb exec-out screencap -p > "$EVIDENCE/$name.png" || true
  adb shell dumpsys activity activities > "$EVIDENCE/$name-activities.txt" || true
}

tap_text() {
  needle="$1"
  timeout="$2"
  elapsed=0
  while [ "$elapsed" -lt "$timeout" ]; do
    adb shell uiautomator dump /sdcard/tap.xml >/dev/null 2>&1 || true
    adb pull /sdcard/tap.xml "$EVIDENCE/tap.xml" >/dev/null 2>&1 || true
    coords="$(NEEDLE="$needle" python3 - <<'PY'
import os,re,sys,xml.etree.ElementTree as ET
p=os.path.join(os.environ["EVIDENCE"],"tap.xml")
n=os.environ["NEEDLE"]
try: root=ET.parse(p).getroot()
except Exception: sys.exit(1)
for x in root.iter("node"):
    t=x.attrib.get("text",""); d=x.attrib.get("content-desc","")
    if n==t or n==d or n in t or n in d:
        m=re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]",x.attrib.get("bounds",""))
        if m:
            a,b,c,e=map(int,m.groups()); print((a+c)//2,(b+e)//2); sys.exit(0)
sys.exit(1)
PY
)" || true
    if [ -n "$coords" ]; then
      read -r x y <<< "$coords"
      adb shell input tap "$x" "$y"
      return 0
    fi
    sleep 1
    elapsed=$((elapsed+1))
  done
  echo "Could not find UI text: $needle" >&2
  dump_ui "missing-text"
  return 1
}

wait_text() {
  needle="$1"
  timeout="$2"
  elapsed=0
  while [ "$elapsed" -lt "$timeout" ]; do
    adb shell uiautomator dump /sdcard/wait.xml >/dev/null 2>&1 || true
    adb pull /sdcard/wait.xml "$EVIDENCE/wait.xml" >/dev/null 2>&1 || true
    if grep -Fq "$needle" "$EVIDENCE/wait.xml"; then return 0; fi
    sleep 1
    elapsed=$((elapsed+1))
  done
  echo "Timed out waiting for: $needle" >&2
  dump_ui "timeout"
  return 1
}

unlock_emulator() {
  keyguard_visible() {
    label="$1"
    adb shell dumpsys window > "$EVIDENCE/$label-window.txt" 2>&1 || true
    adb shell uiautomator dump /sdcard/"$label".xml >/dev/null 2>&1 || true
    adb pull /sdcard/"$label".xml "$EVIDENCE/$label.xml" >/dev/null 2>&1 || true

    if grep -Eq 'mDreamingLockscreen=true|mShowingLockscreen=true|mKeyguardShowing=true|isKeyguardShowing=true|KeyguardController.*mShowing=true' "$EVIDENCE/$label-window.txt" 2>/dev/null; then
      return 0
    fi

    grep -Eq 'Unlock for all features and data|Enter PIN|Emergency call|Password required' "$EVIDENCE/$label.xml" 2>/dev/null
  }

  enter_pin() {
    # KEYCODE_1..4 are 8..11. This PIN is emulator-only.
    adb shell input keyevent 8 || true
    adb shell input keyevent 9 || true
    adb shell input keyevent 10 || true
    adb shell input keyevent 11 || true
    adb shell input keyevent 66 || true
  }

  tap_pin_keypad() {
    adb shell input tap 270 1420 || true
    adb shell input tap 540 1420 || true
    adb shell input tap 810 1420 || true
    adb shell input tap 270 1625 || true
    adb shell input keyevent 66 || true
  }

  for attempt in 1 2 3; do
    adb shell input keyevent 224 || true
    adb shell wm dismiss-keyguard || true
    adb shell input swipe 540 2100 540 650 500 || true
    sleep 2

    if ! keyguard_visible "unlock-attempt-$attempt-before"; then
      echo "Emulator keyguard dismissed before PIN attempt $attempt." > "$EVIDENCE/unlock-result.txt"
      return 0
    fi

    enter_pin
    sleep 3

    if ! keyguard_visible "unlock-attempt-$attempt-after-keyevents"; then
      echo "Emulator keyguard dismissed with PIN key events on attempt $attempt." > "$EVIDENCE/unlock-result.txt"
      return 0
    fi

    adb shell input text "$PIN" || true
    adb shell input keyevent 66 || true
    sleep 2

    if ! keyguard_visible "unlock-attempt-$attempt-after-text"; then
      echo "Emulator keyguard dismissed with PIN text on attempt $attempt." > "$EVIDENCE/unlock-result.txt"
      return 0
    fi

    tap_pin_keypad
    sleep 3

    if ! keyguard_visible "unlock-attempt-$attempt-after-taps"; then
      echo "Emulator keyguard dismissed with PIN keypad taps on attempt $attempt." > "$EVIDENCE/unlock-result.txt"
      return 0
    fi
  done

  echo "Emulator remained locked after PIN key events, PIN text, and keypad taps." >&2
  dump_ui "unlock-failed"
  return 1
}

echo "== Configure and unlock emulator credential =="
adb shell locksettings set-pin "$PIN" > "$EVIDENCE/locksettings.txt" 2>&1
unlock_emulator

echo "== Build CRESCO standalone test APK =="
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

echo "== Install apps =="
adb install -r "$CRESCO_APK"
adb install -r "$MOCK_APK"
adb shell pm list packages | grep -q 'package:com.faadil.crescokey'
adb shell pm list packages | grep -q 'package:com.solana.mwallet'

echo "== Launch CRESCO =="
adb logcat -c
adb shell monkey -p com.faadil.crescokey -c android.intent.category.LAUNCHER 1 >/dev/null
wait_text "Connect wallet" 20
dump_ui "01-cresco-disconnected"

echo "== Negative path: decline authorize =="
tap_text "Connect wallet" 10
wait_text "Cancel" 20
dump_ui "02-wallet-authorize-request"
tap_text "Cancel" 10
wait_text "REFUSED" 20
dump_ui "03-cresco-declined"

echo "== Success path: authorize =="
tap_text "Connect wallet" 10
wait_text "Connect" 20
dump_ui "04-wallet-authorize-request"
tap_text "Connect" 10

echo "== Wait for authorization completion or device credential prompt =="
elapsed=0
while [ "$elapsed" -lt 30 ]; do
  adb shell uiautomator dump /sdcard/auth.xml >/dev/null 2>&1 || true
  adb pull /sdcard/auth.xml "$EVIDENCE/auth-prompt.xml" >/dev/null 2>&1 || true

  if grep -Fq "P0 mobile workspace" "$EVIDENCE/auth-prompt.xml"; then
    break
  fi

  if grep -Eq "Use PIN|Use password|Use device credential|Log in to" "$EVIDENCE/auth-prompt.xml"; then
    for label in "Use PIN" "Use password" "Use device credential"; do
      if grep -Fq "$label" "$EVIDENCE/auth-prompt.xml"; then
        tap_text "$label" 5 || true
        sleep 1
        break
      fi
    done
    adb shell input keyevent 8 || true
    adb shell input keyevent 9 || true
    adb shell input keyevent 10 || true
    adb shell input keyevent 11 || true
    adb shell input keyevent 66 || true
  fi

  sleep 1
  elapsed=$((elapsed+1))
done

wait_text "P0 mobile workspace" 15
dump_ui "05-cresco-connected"

echo "== signMessage path =="
tap_text "Sign TRC-01 proof message" 15
wait_text "Approve" 20
dump_ui "06-wallet-sign-message"
tap_text "Approve" 10
wait_text "SIGNED" 30
dump_ui "07-cresco-signed"

echo "== Kill/relaunch truthfulness =="
adb shell am force-stop com.faadil.crescokey
sleep 2
adb shell monkey -p com.faadil.crescokey -c android.intent.category.LAUNCHER 1 >/dev/null
sleep 8
dump_ui "08-cresco-relaunch"

RELAUNCH_STATE="UNKNOWN"
if grep -Fq "P0 mobile workspace" "$EVIDENCE/08-cresco-relaunch.xml"; then
  RELAUNCH_STATE="CONNECTED_RESTORED"
elif grep -Fq "Connect wallet" "$EVIDENCE/08-cresco-relaunch.xml"; then
  RELAUNCH_STATE="DISCONNECTED_TRUTHFUL"
fi
if [ "$RELAUNCH_STATE" = "UNKNOWN" ]; then
  echo "Relaunch state could not be classified." >&2
  exit 1
fi

adb logcat -d > "$EVIDENCE/logcat.txt" || true
APK_SHA="$(sha256sum "$CRESCO_APK" | awk '{print $1}')"
MOCK_SHA="$(sha256sum "$MOCK_APK" | awk '{print $1}')"
export APK_SHA MOCK_SHA RELAUNCH_STATE

node <<'NODE' > "$EVIDENCE/mwa-session-receipt.json"
console.log(JSON.stringify({
  schema: "cresco-key/mwa-session-evidence/v1",
  commit: process.env.GITHUB_SHA || null,
  evidenceClass: "LOCAL",
  integrationDepth: "PARTIAL",
  wallet: {
    implementation: "solana-mobile/mock-mwa-wallet",
    productionWallet: false,
    explicitDeclineObserved: true,
    authorizeObserved: true,
    signMessageObserved: true
  },
  android: {
    emulator: true,
    apiLevel: 36,
    relaunchState: process.env.RELAUNCH_STATE
  },
  hashes: {
    crescoTestApkSha256: process.env.APK_SHA,
    mockWalletApkSha256: process.env.MOCK_SHA
  },
  truthBoundary: {
    physicalDeviceProven: false,
    productionWalletCompatibilityProven: false,
    devnetTransactionProven: false,
    liveCoreLoopProven: false
  },
  generatedAt: new Date().toISOString()
}, null, 2));
NODE

echo "MWA session evidence complete."
