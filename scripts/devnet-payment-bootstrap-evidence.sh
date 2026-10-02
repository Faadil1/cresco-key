#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GUARDIAN_PATH="${CRESCO_GUARDIAN_KEYPAIR_PATH:?CRESCO_GUARDIAN_KEYPAIR_PATH is required}"
BENEFICIARY_PATH="${CRESCO_BENEFICIARY_KEYPAIR_PATH:?CRESCO_BENEFICIARY_KEYPAIR_PATH is required}"
EVIDENCE_DIR="${CRESCO_KEY_BOOTSTRAP_EVIDENCE_DIR:-$ROOT/evidence/devnet-payment-bootstrap}"
ORIGINAL_PROGRAM_ID="ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk"

mkdir -p "$EVIDENCE_DIR"

PROGRAM_ID="$(python3 - "$ROOT/programs/keys/src/lib.rs" <<'PY'
import re, sys
text=open(sys.argv[1], encoding="utf-8").read()
m=re.search(r'declare_id!\("([1-9A-HJ-NP-Za-km-z]+)"\);', text)
if not m:
    raise SystemExit("DECLARE_ID_NOT_FOUND")
print(m.group(1))
PY
)"

if [[ "$PROGRAM_ID" == "$ORIGINAL_PROGRAM_ID" ]]; then
  echo "Safety stop: original CRESCO program id is still active." >&2
  exit 1
fi

GUARDIAN_ID="$(solana-keygen pubkey "$GUARDIAN_PATH")"
BENEFICIARY_ID="$(solana-keygen pubkey "$BENEFICIARY_PATH")"
if [[ "$GUARDIAN_ID" == "$BENEFICIARY_ID" ]]; then
  echo "Guardian and beneficiary must be distinct." >&2
  exit 1
fi

cd "$ROOT"
anchor build

cd "$ROOT/tools/devnet"
npm install

STATE_FILE="$RUNNER_TEMP/cresco-key-demo-state.json"
LOG_FILE="$EVIDENCE_DIR/bootstrap-output.txt"

export ANCHOR_PROVIDER_URL="https://api.devnet.solana.com"
export ANCHOR_WALLET="$GUARDIAN_PATH"
export SOLANA_RPC_URL="https://api.devnet.solana.com"
export CRESCO_GUARDIAN_KEYPAIR="$GUARDIAN_PATH"
export CRESCO_BENEFICIARY_KEYPAIR="$BENEFICIARY_PATH"
export CRESCO_KEY_EXPECTED_PROGRAM_ID="$PROGRAM_ID"
export CRESCO_KEY_DEMO_STATE="$STATE_FILE"

node "$ROOT/tools/devnet/bootstrap-payment-demo.cjs" | tee "$LOG_FILE"

test -f "$STATE_FILE"
cp "$STATE_FILE" "$EVIDENCE_DIR/devnet-payment-demo-state.json"

export PROGRAM_ID GUARDIAN_ID BENEFICIARY_ID EVIDENCE_DIR
python3 - <<'PY'
import json, os
state_path=os.path.join(os.environ["EVIDENCE_DIR"],"devnet-payment-demo-state.json")
state=json.load(open(state_path,encoding="utf-8"))
if state.get("status")!="READY_FOR_MOBILE_RUNTIME":
    raise SystemExit("BOOTSTRAP_STATUS_NOT_READY")
if state.get("programId")!=os.environ["PROGRAM_ID"]:
    raise SystemExit("BOOTSTRAP_PROGRAM_ID_MISMATCH")
receipt={
  "schema":"cresco-key/devnet-payment-bootstrap-binding/v1",
  "network":"devnet",
  "sourceCommit":os.environ.get("GITHUB_SHA"),
  "programId":os.environ["PROGRAM_ID"],
  "guardianPublicKey":os.environ["GUARDIAN_ID"],
  "beneficiaryPublicKey":os.environ["BENEFICIARY_ID"],
  "bootstrapStatus":state.get("status"),
  "mandate":state.get("mandate"),
  "mandateVersion":state.get("mandateVersion"),
  "mandateNonce":state.get("mandateNonce"),
  "mint":state.get("mint"),
  "assetRule":state.get("assetRule"),
  "vaultTokenAccount":state.get("vaultTokenAccount"),
  "recipientA":state.get("recipientA"),
  "recipientB":state.get("recipientB"),
  "observed":{
    "distinctGuardianAndBeneficiary":True,
    "programIdMatchesCommittedSource":True,
    "deterministicPaymentStateReady":True
  },
  "truthBoundary":{
    "setupEvidenceOnly":True,
    "mobileCrescoTransactionProven":False,
    "fullHeroRunProven":False,
    "liveCoreLoopProven":False
  }
}
with open(os.path.join(os.environ["EVIDENCE_DIR"],"devnet-payment-bootstrap-binding.json"),"w",encoding="utf-8") as f:
    json.dump(receipt,f,indent=2)
    f.write("\n")
PY

echo "CRESCO_KEY_DEVNET_BOOTSTRAP=PASS program_id=$PROGRAM_ID"
