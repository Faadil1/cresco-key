#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
EVIDENCE="$ROOT/evidence/devnet-mwa-transaction"
MOBILE="$ROOT/apps/mobile"
MWA_ANDROID="$ROOT/vendor/mobile-wallet-adapter/android"
RPC_URL="${SOLANA_RPC_URL:-https://api.devnet.solana.com}"

mkdir -p "$EVIDENCE"
export EVIDENCE RPC_URL

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
import os, re, sys, xml.etree.ElementTree as ET

path = os.path.join(os.environ["EVIDENCE"], "tap.xml")
needle = os.environ["NEEDLE"]

try:
    root = ET.parse(path).getroot()
except Exception:
    sys.exit(1)

def center(node):
    match = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", node.attrib.get("bounds", ""))
    if not match:
        return None
    x1, y1, x2, y2 = map(int, match.groups())
    return f"{(x1 + x2) // 2} {(y1 + y2) // 2}"

nodes = list(root.iter("node"))

for node in nodes:
    text = node.attrib.get("text", "")
    desc = node.attrib.get("content-desc", "")
    if needle == text or needle == desc:
        value = center(node)
        if value:
            print(value)
            sys.exit(0)

for node in nodes:
    text = node.attrib.get("text", "")
    desc = node.attrib.get("content-desc", "")
    if needle in text or needle in desc:
        value = center(node)
        if value:
            print(value)
            sys.exit(0)

sys.exit(1)
PY
)" || true

    if [ -n "$coords" ]; then
      read -r x y <<< "$coords"
      adb shell input tap "$x" "$y"
      return 0
    fi

    sleep 1
    elapsed=$((elapsed + 1))
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
    if grep -Fq "$needle" "$EVIDENCE/wait.xml"; then
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done

  echo "Timed out waiting for: $needle" >&2
  dump_ui "timeout"
  return 1
}

rpc_call() {
  method="$1"
  params_json="$2"
  output="$3"

  RPC_METHOD="$method" RPC_PARAMS="$params_json" RPC_OUTPUT="$output" python3 - <<'PY'
import json
import os
import urllib.error
import urllib.request

payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": os.environ["RPC_METHOD"],
    "params": json.loads(os.environ["RPC_PARAMS"]),
}
request = urllib.request.Request(
    os.environ["RPC_URL"],
    data=json.dumps(payload).encode("utf-8"),
    headers={"content-type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read()
except urllib.error.HTTPError as error:
    body = error.read()
    with open(os.environ["RPC_OUTPUT"], "wb") as handle:
        handle.write(body)
    raise

with open(os.environ["RPC_OUTPUT"], "wb") as handle:
    handle.write(body)
PY
}

echo "== Build standalone CRESCO Key test APK =="
cd "$MOBILE"
npx expo prebuild --platform android --no-install --non-interactive
cd android
./gradlew -Dorg.gradle.jvmargs="-Xmx4g -Dfile.encoding=UTF-8" assembleRelease
CRESCO_APK="$MOBILE/android/app/build/outputs/apk/release/app-release.apk"
test -f "$CRESCO_APK"

echo "== Build official Solana Mobile MWA fakewallet =="
yes | sdkmanager --licenses >/dev/null 2>&1 || true
sdkmanager "platforms;android-37" "build-tools;37.0.0" >/dev/null
cd "$MWA_ANDROID"
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > local.properties
./gradlew :fakewallet:assembleV1Debug
FAKEWALLET_APK="$(find "$MWA_ANDROID/fakewallet/build/outputs/apk" -type f -name '*.apk' | grep '/v1/' | head -n 1)"
test -n "$FAKEWALLET_APK"
test -f "$FAKEWALLET_APK"

echo "== Install CRESCO + official fakewallet =="
adb install -r "$CRESCO_APK"
adb install -r "$FAKEWALLET_APK"
adb shell pm list packages | grep -q 'package:com.faadil.crescokey'
adb shell pm list packages | grep -q 'package:com.solana.mobilewalletadapter.fakewallet'

echo "== Authorize MWA session =="
adb logcat -c
adb shell monkey -p com.faadil.crescokey -c android.intent.category.LAUNCHER 1 >/dev/null
wait_text "Connect wallet" 20
dump_ui "01-cresco-disconnected"

tap_text "Connect wallet" 10
wait_text "Authorize dapp" 25
dump_ui "02-fakewallet-authorize"

tap_text "Authorize" 10
wait_text "P0 mobile workspace" 30
dump_ui "03-cresco-connected"

WALLET_ADDRESS="$(python3 - <<'PY'
import os
import re
import xml.etree.ElementTree as ET

path = os.path.join(os.environ["EVIDENCE"], "03-cresco-connected.xml")
root = ET.parse(path).getroot()
for node in root.iter("node"):
    text = node.attrib.get("text", "")
    matches = re.findall(r"(?<![1-9A-HJ-NP-Za-km-z])[1-9A-HJ-NP-Za-km-z]{32,44}(?![1-9A-HJ-NP-Za-km-z])", text)
    if matches:
        print(matches[0])
        raise SystemExit(0)
raise SystemExit(1)
PY
)"
export WALLET_ADDRESS
printf 'walletAddress=%s\n' "$WALLET_ADDRESS" > "$EVIDENCE/wallet-public.txt"

echo "== Fund connected ephemeral wallet from Devnet faucet =="
AIRDROP_SIG=""
for attempt in 1 2 3 4 5; do
  output="$EVIDENCE/airdrop-$attempt.json"
  rpc_call "requestAirdrop" "[\"$WALLET_ADDRESS\",1000000]" "$output" || true

  AIRDROP_SIG="$(python3 - "$output" <<'PY'
import json
import sys

try:
    with open(sys.argv[1], encoding="utf-8") as handle:
        document = json.load(handle)
    print(document.get("result") or "")
except Exception:
    print("")
PY
)"

  if [ -n "$AIRDROP_SIG" ]; then
    break
  fi

  sleep $((attempt * 5))
done

if [ -z "$AIRDROP_SIG" ]; then
  echo "Devnet faucet did not return an airdrop signature." >&2
  exit 1
fi
export AIRDROP_SIG

BALANCE=0
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  rpc_call "getBalance" "[\"$WALLET_ADDRESS\",{\"commitment\":\"confirmed\"}]" "$EVIDENCE/balance.json" || true

  BALANCE="$(python3 - "$EVIDENCE/balance.json" <<'PY'
import json
import sys

try:
    with open(sys.argv[1], encoding="utf-8") as handle:
        document = json.load(handle)
    print(((document.get("result") or {}).get("value")) or 0)
except Exception:
    print(0)
PY
)"

  if [ "$BALANCE" -gt 0 ]; then
    break
  fi

  sleep 2
done

if [ "$BALANCE" -le 0 ]; then
  echo "Devnet wallet remained unfunded." >&2
  exit 1
fi
export BALANCE

echo "== Submit real Devnet Memo transaction through MWA =="
tap_text "Send Devnet proof transaction" 15
wait_text "Sign transaction(s)" 25
dump_ui "04-fakewallet-sign-transaction"

tap_text "Authorize" 10
wait_text "Send transaction to cluster" 25
dump_ui "05-fakewallet-send-transaction"

tap_text "Send transaction to cluster" 10
wait_text "DEVNET_TX_CONFIRMED" 60
dump_ui "06-cresco-devnet-confirmed"

SIGNATURE="$(python3 - <<'PY'
import os
import re
import xml.etree.ElementTree as ET

path = os.path.join(os.environ["EVIDENCE"], "06-cresco-devnet-confirmed.xml")
root = ET.parse(path).getroot()
for node in root.iter("node"):
    text = node.attrib.get("text", "")
    if "DEVNET_TX_CONFIRMED" in text:
        match = re.search(r"([1-9A-HJ-NP-Za-km-z]{80,100})", text)
        if match:
            print(match.group(1))
            raise SystemExit(0)
raise SystemExit(1)
PY
)"
export SIGNATURE

echo "== Independently verify signature through Devnet RPC =="
rpc_call "getSignatureStatuses" "[[\"$SIGNATURE\"],{\"searchTransactionHistory\":true}]" "$EVIDENCE/rpc-signature-status.json"
rpc_call "getTransaction" "[\"$SIGNATURE\",{\"encoding\":\"json\",\"commitment\":\"confirmed\",\"maxSupportedTransactionVersion\":0}]" "$EVIDENCE/rpc-transaction.json"

python3 - <<'PY'
import json
import os

evidence = os.environ["EVIDENCE"]

with open(os.path.join(evidence, "rpc-signature-status.json"), encoding="utf-8") as handle:
    status_document = json.load(handle)
with open(os.path.join(evidence, "rpc-transaction.json"), encoding="utf-8") as handle:
    transaction_document = json.load(handle)

status = ((status_document.get("result") or {}).get("value") or [None])[0]
transaction = transaction_document.get("result")

if not status:
    raise SystemExit("RPC_STATUS_MISSING")
if status.get("err") is not None:
    raise SystemExit("RPC_STATUS_ERROR")
if status.get("confirmationStatus") not in ("confirmed", "finalized"):
    raise SystemExit("RPC_NOT_CONFIRMED")
if not transaction or ((transaction.get("meta") or {}).get("err") is not None):
    raise SystemExit("RPC_TRANSACTION_NOT_SUCCESSFUL")

receipt = {
    "schema": "cresco-key/devnet-mwa-transaction-evidence/v1",
    "commit": os.environ.get("GITHUB_SHA"),
    "network": "devnet",
    "evidenceClass": "LOCAL",
    "integrationDepth": "PARTIAL",
    "walletImplementation": "solana-mobile/mobile-wallet-adapter android/fakewallet",
    "walletAddress": os.environ["WALLET_ADDRESS"],
    "funding": {
        "airdropSignature": os.environ["AIRDROP_SIG"],
        "balanceBeforeProofLamports": int(os.environ["BALANCE"]),
    },
    "transactionSignature": os.environ["SIGNATURE"],
    "confirmationStatus": status.get("confirmationStatus"),
    "slot": status.get("slot"),
    "feeLamports": (transaction.get("meta") or {}).get("fee"),
    "observed": {
        "realMwaAuthorize": True,
        "explicitWalletTransactionApproval": True,
        "walletSignAndSend": True,
        "rpcSubmission": True,
        "rpcConfirmation": True,
    },
    "truthBoundary": {
        "memoProofTransactionOnly": True,
        "crescoProgramInstructionProven": False,
        "distinctCrescoProgramDeployed": False,
        "physicalDeviceProven": False,
        "productionWalletCompatibilityProven": False,
        "liveCoreLoopProven": False,
    },
}

with open(os.path.join(evidence, "devnet-mwa-transaction-receipt.json"), "w", encoding="utf-8") as handle:
    json.dump(receipt, handle, indent=2)
    handle.write("\n")
PY

adb logcat -d > "$EVIDENCE/logcat.txt" || true
sha256sum "$CRESCO_APK" "$FAKEWALLET_APK" > "$EVIDENCE/apk-sha256.txt"

echo "DEVNET_MWA_TRANSACTION_EVIDENCE=PASS signature=$SIGNATURE"
