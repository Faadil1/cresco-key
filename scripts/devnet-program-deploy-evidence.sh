#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROGRAM_KEYPAIR_PATH="${CRESCO_KEY_PROGRAM_KEYPAIR_PATH:?CRESCO_KEY_PROGRAM_KEYPAIR_PATH is required}"
DEPLOYER_KEYPAIR_PATH="${CRESCO_KEY_DEPLOYER_KEYPAIR_PATH:?CRESCO_KEY_DEPLOYER_KEYPAIR_PATH is required}"
EVIDENCE_DIR="${CRESCO_KEY_DEPLOY_EVIDENCE_DIR:-$ROOT/evidence/devnet-program-deploy}"
ORIGINAL_PROGRAM_ID="ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk"

mkdir -p "$EVIDENCE_DIR"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Required command '$1' is unavailable." >&2
    exit 1
  }
}

require_command solana
require_command solana-keygen
require_command anchor
require_command python3
require_command sha256sum

PROGRAM_ID="$(solana-keygen pubkey "$PROGRAM_KEYPAIR_PATH")"
DEPLOYER_ID="$(solana-keygen pubkey "$DEPLOYER_KEYPAIR_PATH")"

if [[ -z "$PROGRAM_ID" || "$PROGRAM_ID" == "$ORIGINAL_PROGRAM_ID" ]]; then
  echo "Safety stop: invalid or original CRESCO program id." >&2
  exit 1
fi

SOURCE_PROGRAM_ID="$(python3 - "$ROOT/programs/keys/src/lib.rs" <<'PY'
import re, sys
text=open(sys.argv[1], encoding="utf-8").read()
match=re.search(r'declare_id!\("([1-9A-HJ-NP-Za-km-z]+)"\);', text)
if not match:
    raise SystemExit("DECLARE_ID_NOT_FOUND")
print(match.group(1))
PY
)"

ANCHOR_PROGRAM_ID="$(python3 - "$ROOT/Anchor.toml" <<'PY'
import re, sys
text=open(sys.argv[1], encoding="utf-8").read()
block=re.search(r'(?ms)^\[programs\.devnet\]\s*(.*?)(?=^\[|\Z)', text)
if not block:
    raise SystemExit("PROGRAMS_DEVNET_NOT_CONFIGURED")
match=re.search(r'^keys\s*=\s*"([1-9A-HJ-NP-Za-km-z]+)"\s*$', block.group(1), re.M)
if not match:
    raise SystemExit("DEVNET_KEYS_MAPPING_NOT_FOUND")
print(match.group(1))
PY
)"

if [[ "$SOURCE_PROGRAM_ID" != "$PROGRAM_ID" ]]; then
  echo "Safety stop: committed declare_id does not match protected program keypair public id." >&2
  echo "committed=$SOURCE_PROGRAM_ID protected=$PROGRAM_ID" >&2
  exit 1
fi

if [[ "$ANCHOR_PROGRAM_ID" != "$PROGRAM_ID" ]]; then
  echo "Safety stop: Anchor.toml devnet mapping does not match protected program keypair public id." >&2
  exit 1
fi

SOLANA_VERSION="$(solana --version)"
ANCHOR_VERSION="$(anchor --version)"
BALANCE_BEFORE="$(solana balance "$DEPLOYER_ID" --url devnet 2>&1 || true)"

printf '%s\n' "$SOLANA_VERSION" > "$EVIDENCE_DIR/solana-version.txt"
printf '%s\n' "$ANCHOR_VERSION" > "$EVIDENCE_DIR/anchor-version.txt"
printf '%s\n' "$PROGRAM_ID" > "$EVIDENCE_DIR/program-id.txt"
printf '%s\n' "$DEPLOYER_ID" > "$EVIDENCE_DIR/deployer-public-key.txt"
printf '%s\n' "$BALANCE_BEFORE" > "$EVIDENCE_DIR/deployer-balance-before.txt"

cd "$ROOT"
anchor build

PROGRAM_BINARY="$ROOT/target/deploy/keys.so"
test -f "$PROGRAM_BINARY"
BINARY_SHA256="$(sha256sum "$PROGRAM_BINARY" | awk '{print $1}')"
printf '%s\n' "$BINARY_SHA256" > "$EVIDENCE_DIR/program-binary-sha256.txt"

solana config set --url devnet --keypair "$DEPLOYER_KEYPAIR_PATH" >/dev/null

set +e
solana program deploy "$PROGRAM_BINARY"   --program-id "$PROGRAM_KEYPAIR_PATH"   --url devnet   >"$EVIDENCE_DIR/deploy-output.txt" 2>&1
DEPLOY_EXIT=$?
set -e

cat "$EVIDENCE_DIR/deploy-output.txt"

if [[ "$DEPLOY_EXIT" -ne 0 ]]; then
  echo "Devnet deployment failed." >&2
  exit "$DEPLOY_EXIT"
fi

solana program show "$PROGRAM_ID" --url devnet > "$EVIDENCE_DIR/program-show.txt"
cat "$EVIDENCE_DIR/program-show.txt"

DEPLOY_SIGNATURE="$(python3 - "$EVIDENCE_DIR/deploy-output.txt" <<'PY'
import re, sys
text=open(sys.argv[1], encoding="utf-8", errors="replace").read()
patterns=[
    r'(?im)^Signature:\s*([1-9A-HJ-NP-Za-km-z]{64,100})\s*$',
    r'(?im)^Transaction Signature:\s*([1-9A-HJ-NP-Za-km-z]{64,100})\s*$',
]
for pattern in patterns:
    m=re.search(pattern, text)
    if m:
        print(m.group(1))
        break
PY
)"

export PROGRAM_ID DEPLOYER_ID SOURCE_PROGRAM_ID ANCHOR_PROGRAM_ID
export BINARY_SHA256 DEPLOY_SIGNATURE SOLANA_VERSION ANCHOR_VERSION
export EVIDENCE_DIR

python3 - <<'PY'
import json, os
receipt={
  "schema":"cresco-key/devnet-program-deploy/v1",
  "project":"CRESCO Key",
  "network":"devnet",
  "sourceCommit":os.environ.get("GITHUB_SHA"),
  "programId":os.environ["PROGRAM_ID"],
  "sourceDeclareId":os.environ["SOURCE_PROGRAM_ID"],
  "anchorDevnetProgramId":os.environ["ANCHOR_PROGRAM_ID"],
  "deployerPublicKey":os.environ["DEPLOYER_ID"],
  "programBinarySha256":os.environ["BINARY_SHA256"],
  "deploymentSignature":os.environ.get("DEPLOY_SIGNATURE") or None,
  "solanaCliVersion":os.environ["SOLANA_VERSION"],
  "anchorCliVersion":os.environ["ANCHOR_VERSION"],
  "observed":{
    "distinctFromOriginalCresco":True,
    "committedProgramIdMatchesProtectedKeypair":True,
    "anchorDevnetMappingMatchesProtectedKeypair":True,
    "anchorBuildSucceeded":True,
    "solanaProgramDeploySucceeded":True,
    "solanaProgramShowSucceeded":True
  },
  "truthBoundary":{
    "devnetProgramDeploymentProven":True,
    "deterministicPaymentBootstrapProven":False,
    "mobileCrescoTransactionProven":False,
    "liveCoreLoopProven":False,
    "productionOrMainnetProven":False
  }
}
path=os.path.join(os.environ["EVIDENCE_DIR"],"devnet-program-deploy-receipt.json")
with open(path,"w",encoding="utf-8") as f:
    json.dump(receipt,f,indent=2)
    f.write("\n")
PY

echo "CRESCO_KEY_DEVNET_DEPLOY=PASS program_id=$PROGRAM_ID"
