#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
EVIDENCE="$ROOT/evidence/devnet-mwa-transaction"
MOBILE="$ROOT/apps/mobile"
MOCK_WALLET="$ROOT/vendor/mock-mwa-wallet"
RPC_URL="${SOLANA_RPC_URL:-https://api.devnet.solana.com}"
PIN="1234"
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
  needle="$1"; timeout="$2"; elapsed=0
  while [ "$elapsed" -lt "$timeout" ]; do
    adb shell uiautomator dump /sdcard/tap.xml >/dev/null 2>&1 || true
    adb pull /sdcard/tap.xml "$EVIDENCE/tap.xml" >/dev/null 2>&1 || true
    coords="$(NEEDLE="$needle" python3 - <<'PY'
import os,re,sys,xml.etree.ElementTree as ET
p=os.path.join(os.environ["EVIDENCE"],"tap.xml"); n=os.environ["NEEDLE"]
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
      read -r x y <<< "$coords"; adb shell input tap "$x" "$y"; return 0
    fi
    sleep 1; elapsed=$((elapsed+1))
  done
  echo "Could not find UI text: $needle" >&2
  dump_ui "missing-text"
  return 1
}

wait_text() {
  needle="$1"; timeout="$2"; elapsed=0
  while [ "$elapsed" -lt "$timeout" ]; do
    adb shell uiautomator dump /sdcard/wait.xml >/dev/null 2>&1 || true
    adb pull /sdcard/wait.xml "$EVIDENCE/wait.xml" >/dev/null 2>&1 || true
    if grep -Fq "$needle" "$EVIDENCE/wait.xml"; then return 0; fi
    sleep 1; elapsed=$((elapsed+1))
  done
  echo "Timed out waiting for: $needle" >&2
  dump_ui "timeout"
  return 1
}

unlock_emulator() {
  adb shell input keyevent 224 || true
  sleep 1
  adb shell input swipe 540 2100 540 650 500 || true
  sleep 2
  adb shell input keyevent 8 || true
  adb shell input keyevent 9 || true
  adb shell input keyevent 10 || true
  adb shell input keyevent 11 || true
  adb shell input keyevent 66 || true
  sleep 4
  adb shell input keyevent 82 || true
  sleep 2
  adb shell uiautomator dump /sdcard/unlock.xml >/dev/null 2>&1 || true
  adb pull /sdcard/unlock.xml "$EVIDENCE/unlock.xml" >/dev/null 2>&1 || true
  if grep -Eq 'Unlock for all features and data|Enter PIN|Emergency call' "$EVIDENCE/unlock.xml" 2>/dev/null; then
    echo "Emulator remained locked." >&2
    return 1
  fi
}

rpc_call() {
  payload="$1"; output="$2"
  curl --fail-with-body -sS "$RPC_URL" -H 'content-type: application/json' --data "$payload" > "$output"
}

echo "== Configure/unlock emulator =="
adb shell locksettings set-pin "$PIN" > "$EVIDENCE/locksettings.txt" 2>&1
unlock_emulator

echo "== Build CRESCO =="
cd "$MOBILE"
npx expo prebuild --platform android --no-install --non-interactive
cd android
NODE_ENV=production EXPO_PUBLIC_SOLANA_RPC_URL="$RPC_URL" ./gradlew assembleRelease
CRESCO_APK="$MOBILE/android/app/build/outputs/apk/release/app-release.apk"
test -f "$CRESCO_APK"

echo "== Build official Mock MWA Wallet =="
cd "$MOCK_WALLET"
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > local.properties
./gradlew :app:assembleDebug
MOCK_APK="$MOCK_WALLET/app/build/outputs/apk/debug/app-debug.apk"
test -f "$MOCK_APK"

echo "== Install/connect wallet =="
adb install -r "$CRESCO_APK"
adb install -r "$MOCK_APK"
adb logcat -c
adb shell monkey -p com.faadil.crescokey -c android.intent.category.LAUNCHER 1 >/dev/null
wait_text "Connect wallet" 20
tap_text "Connect wallet" 10
wait_text "Connect" 20
dump_ui "01-wallet-authorize"
tap_text "Connect" 10
wait_text "P0 mobile workspace" 30
dump_ui "02-cresco-connected"

WALLET_ADDRESS="$(python3 - <<'PY'
import os,re,xml.etree.ElementTree as ET
p=os.path.join(os.environ["EVIDENCE"],"02-cresco-connected.xml")
root=ET.parse(p).getroot()
candidates=[]
for n in root.iter("node"):
    t=n.attrib.get("text","")
    for m in re.findall(r"[1-9A-HJ-NP-Za-km-z]{32,44}",t):
        candidates.append(m)
if not candidates: raise SystemExit(1)
print(candidates[0])
PY
)"
export WALLET_ADDRESS
echo "walletAddress=$WALLET_ADDRESS" > "$EVIDENCE/wallet-public.txt"

echo "== Fund connected random wallet with Devnet faucet =="
AIRDROP_SIG=""
for attempt in 1 2 3 4 5; do
  rpc_call "{"jsonrpc":"2.0","id":1,"method":"requestAirdrop","params":["$WALLET_ADDRESS",10000000]}" "$EVIDENCE/airdrop-$attempt.json" || true
  AIRDROP_SIG="$(python3 - "$EVIDENCE/airdrop-$attempt.json" <<'PY'
import json,sys
try:
    d=json.load(open(sys.argv[1],encoding="utf-8"))
    print(d.get("result") or "")
except Exception:
    print("")
PY
)"
  if [ -n "$AIRDROP_SIG" ]; then break; fi
  sleep $((attempt*5))
done
if [ -z "$AIRDROP_SIG" ]; then
  echo "Devnet faucet did not return an airdrop signature." >&2
  exit 1
fi
export AIRDROP_SIG

for attempt in 1 2 3 4 5 6 7 8 9 10; do
  rpc_call "{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["$WALLET_ADDRESS",{"commitment":"confirmed"}]}" "$EVIDENCE/balance.json"
  BALANCE="$(python3 - "$EVIDENCE/balance.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1],encoding="utf-8"))
print(((d.get("result") or {}).get("value")) or 0)
PY
)"
  if [ "$BALANCE" -gt 0 ]; then break; fi
  sleep 2
done
if [ "${BALANCE:-0}" -le 0 ]; then
  echo "Devnet wallet remained unfunded." >&2
  exit 1
fi
export BALANCE

echo "== Submit real Devnet transaction via MWA =="
tap_text "Send Devnet proof transaction" 15
wait_text "Approve" 25
dump_ui "03-wallet-transaction-approval"
tap_text "Approve" 10
wait_text "DEVNET_TX_CONFIRMED" 45
dump_ui "04-cresco-devnet-confirmed"

SIGNATURE="$(python3 - <<'PY'
import os,re,xml.etree.ElementTree as ET
p=os.path.join(os.environ["EVIDENCE"],"04-cresco-devnet-confirmed.xml")
root=ET.parse(p).getroot()
for n in root.iter("node"):
    t=n.attrib.get("text","")
    if "DEVNET_TX_CONFIRMED" in t:
        m=re.search(r"([1-9A-HJ-NP-Za-km-z]{80,100})",t)
        if m: print(m.group(1)); raise SystemExit(0)
raise SystemExit(1)
PY
)"
export SIGNATURE

echo "== Independently verify Devnet signature =="
rpc_call "{"jsonrpc":"2.0","id":1,"method":"getSignatureStatuses","params":[["$SIGNATURE"],{"searchTransactionHistory":true}]}" "$EVIDENCE/rpc-signature-status.json"
rpc_call "{"jsonrpc":"2.0","id":1,"method":"getTransaction","params":["$SIGNATURE",{"encoding":"json","commitment":"confirmed","maxSupportedTransactionVersion":0}]}" "$EVIDENCE/rpc-transaction.json"

python3 - <<'PY'
import json,os
ev=os.environ["EVIDENCE"]
status_doc=json.load(open(os.path.join(ev,"rpc-signature-status.json"),encoding="utf-8"))
tx_doc=json.load(open(os.path.join(ev,"rpc-transaction.json"),encoding="utf-8"))
status=((status_doc.get("result") or {}).get("value") or [None])[0]
tx=tx_doc.get("result")
if not status: raise SystemExit("RPC_STATUS_MISSING")
if status.get("err") is not None: raise SystemExit("RPC_STATUS_ERROR")
if status.get("confirmationStatus") not in ("confirmed","finalized"): raise SystemExit("RPC_NOT_CONFIRMED")
if not tx or ((tx.get("meta") or {}).get("err") is not None): raise SystemExit("RPC_TRANSACTION_NOT_SUCCESSFUL")
receipt={
 "schema":"cresco-key/devnet-mwa-transaction-evidence/v1",
 "commit":os.environ.get("GITHUB_SHA"),
 "network":"devnet",
 "evidenceClass":"LOCAL",
 "integrationDepth":"PARTIAL",
 "walletImplementation":"solana-mobile/mock-mwa-wallet",
 "walletAddress":os.environ["WALLET_ADDRESS"],
 "funding":{"airdropSignature":os.environ["AIRDROP_SIG"],"balanceBeforeProofLamports":int(os.environ["BALANCE"])},
 "transactionSignature":os.environ["SIGNATURE"],
 "confirmationStatus":status.get("confirmationStatus"),
 "slot":status.get("slot"),
 "feeLamports":(tx.get("meta") or {}).get("fee"),
 "observed":{"realMwaAuthorize":True,"explicitWalletTransactionApproval":True,"walletSignAndSend":True,"rpcSubmission":True,"rpcConfirmation":True},
 "truthBoundary":{"memoProofTransactionOnly":True,"crescoProgramInstructionProven":False,"distinctCrescoProgramDeployed":False,"physicalDeviceProven":False,"productionWalletCompatibilityProven":False,"liveCoreLoopProven":False}
}
with open(os.path.join(ev,"devnet-mwa-transaction-receipt.json"),"w",encoding="utf-8") as f:
    json.dump(receipt,f,indent=2)
    f.write("\n")
PY

adb logcat -d > "$EVIDENCE/logcat.txt" || true
echo "DEVNET_MWA_TRANSACTION_EVIDENCE=PASS signature=$SIGNATURE"
