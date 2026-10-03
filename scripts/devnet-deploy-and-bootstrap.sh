#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
ORIGINAL_PROGRAM_ID="ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk"
EXPECTED_PROGRAM_ID="${EXPECTED_PROGRAM_ID:?EXPECTED_PROGRAM_ID is required}"
EVIDENCE="$ROOT/evidence/devnet-distinct-program"
TMP_DIR="$(mktemp -d)"
PROGRAM_KEY="$TMP_DIR/program.json"
GUARDIAN_KEY="$TMP_DIR/guardian.json"
BENEFICIARY_KEY="$TMP_DIR/beneficiary.json"

mkdir -p "$EVIDENCE"
chmod 700 "$TMP_DIR"
umask 077

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

for name in PROGRAM_KEYPAIR_JSON GUARDIAN_KEYPAIR_JSON BENEFICIARY_KEYPAIR_JSON; do
  if [ -z "${!name:-}" ]; then
    echo "Missing required protected secret: $name" >&2
    exit 1
  fi
done

printf '%s' "$PROGRAM_KEYPAIR_JSON" > "$PROGRAM_KEY"
printf '%s' "$GUARDIAN_KEYPAIR_JSON" > "$GUARDIAN_KEY"
printf '%s' "$BENEFICIARY_KEYPAIR_JSON" > "$BENEFICIARY_KEY"
chmod 600 "$PROGRAM_KEY" "$GUARDIAN_KEY" "$BENEFICIARY_KEY"

PROGRAM_ID="$(solana-keygen pubkey "$PROGRAM_KEY")"
GUARDIAN_ID="$(solana-keygen pubkey "$GUARDIAN_KEY")"
BENEFICIARY_ID="$(solana-keygen pubkey "$BENEFICIARY_KEY")"

if [ "$PROGRAM_ID" = "$ORIGINAL_PROGRAM_ID" ]; then
  echo "SAFETY_STOP_ORIGINAL_CRESCO_PROGRAM_ID" >&2
  exit 1
fi

if [ "$PROGRAM_ID" != "$EXPECTED_PROGRAM_ID" ]; then
  echo "PROGRAM_ID_SECRET_INPUT_MISMATCH expected=$EXPECTED_PROGRAM_ID actual=$PROGRAM_ID" >&2
  exit 1
fi

if [ "$GUARDIAN_ID" = "$BENEFICIARY_ID" ]; then
  echo "GUARDIAN_AND_BENEFICIARY_MUST_BE_DISTINCT" >&2
  exit 1
fi

DECLARED_ID="$(sed -n 's/.*declare_id!("\([^"]*\)").*/\1/p' programs/keys/src/lib.rs | head -n 1)"
ANCHOR_ID="$(awk '
  /^\[programs\.devnet\]$/ { in_devnet=1; next }
  /^\[/ { in_devnet=0 }
  in_devnet && /^keys[[:space:]]*=/ {
    gsub(/.*=[[:space:]]*"/, "")
    gsub(/".*/, "")
    print
    exit
  }
' Anchor.toml)"

if [ "$DECLARED_ID" != "$PROGRAM_ID" ]; then
  echo "COMMITTED_DECLARE_ID_MISMATCH expected=$PROGRAM_ID actual=$DECLARED_ID" >&2
  exit 1
fi

if [ "$ANCHOR_ID" != "$PROGRAM_ID" ]; then
  echo "COMMITTED_ANCHOR_DEVNET_ID_MISMATCH expected=$PROGRAM_ID actual=$ANCHOR_ID" >&2
  exit 1
fi

echo "Program public identity validated: $PROGRAM_ID"
echo "Guardian public identity: $GUARDIAN_ID"
echo "Beneficiary public identity: $BENEFICIARY_ID"

solana config set --url devnet --keypair "$GUARDIAN_KEY" >/dev/null

echo "Attempting bounded Devnet faucet funding for deployment/bootstrap."
for attempt in 1 2 3 4; do
  if solana airdrop 2 "$GUARDIAN_ID" --url devnet >/dev/null 2>&1; then
    echo "Devnet airdrop attempt $attempt succeeded."
  else
    echo "Devnet airdrop attempt $attempt unavailable; continuing with current balance."
  fi
  sleep 2
done

solana balance "$GUARDIAN_ID" --url devnet > "$EVIDENCE/guardian-balance-before-deploy.txt"

echo "Building exact committed CRESCO Key program..."
anchor build

PROGRAM_BINARY="$ROOT/target/deploy/keys.so"
test -f "$PROGRAM_BINARY"
sha256sum "$PROGRAM_BINARY" > "$EVIDENCE/program-binary-sha256.txt"

echo "Deploying distinct CRESCO Key program to Devnet..."
DEPLOY_RAW="$TMP_DIR/deploy-output.raw"
set +e
solana program deploy "$PROGRAM_BINARY" \
  --program-id "$PROGRAM_KEY" \
  --url devnet \
  --keypair "$GUARDIAN_KEY" \
  > "$DEPLOY_RAW" 2>&1
DEPLOY_STATUS=$?
set -e

# Solana prints a temporary buffer recovery phrase on failed deploys; never publish it.
awk '
  /^Recover the intermediate account/ {
    redacting = 1
    print "REDACTED_SOLANA_DEPLOY_BUFFER_RECOVERY_BLOCK"
    next
  }
  redacting && /^Error:/ {
    redacting = 0
    print
    next
  }
  redacting {
    next
  }
  { print }
' "$DEPLOY_RAW" | tee "$EVIDENCE/deploy-output.txt"

if [ "$DEPLOY_STATUS" -ne 0 ]; then
  exit "$DEPLOY_STATUS"
fi

echo "Verifying deployed program account..."
solana program show "$PROGRAM_ID" \
  --url devnet \
  --output json > "$EVIDENCE/program-show.json"

echo "Refreshing bounded Devnet funding before deterministic bootstrap."
for attempt in 1 2; do
  solana airdrop 2 "$GUARDIAN_ID" --url devnet >/dev/null 2>&1 || true
  sleep 2
done
solana balance "$GUARDIAN_ID" --url devnet > "$EVIDENCE/guardian-balance-before-bootstrap.txt"

echo "Bootstrapping deterministic CRESCO payment state..."
(
  cd "$ROOT/tools/devnet"
  npm install
)

export ANCHOR_PROVIDER_URL="https://api.devnet.solana.com"
export ANCHOR_WALLET="$GUARDIAN_KEY"
export CRESCO_GUARDIAN_KEYPAIR="$GUARDIAN_KEY"
export CRESCO_BENEFICIARY_KEYPAIR="$BENEFICIARY_KEY"
export CRESCO_KEY_EXPECTED_PROGRAM_ID="$PROGRAM_ID"
export CRESCO_KEY_DEMO_STATE="$EVIDENCE/cresco-key-demo-state.json"
export SOLANA_RPC_URL="https://api.devnet.solana.com"

node "$ROOT/tools/devnet/bootstrap-payment-demo.cjs" \
  > "$EVIDENCE/bootstrap-output.txt"

test -f "$EVIDENCE/cresco-key-demo-state.json"

PROGRAM_ID="$PROGRAM_ID" GUARDIAN_ID="$GUARDIAN_ID" BENEFICIARY_ID="$BENEFICIARY_ID" SOURCE_COMMIT="${GITHUB_SHA:-unknown}" node <<'NODE' > "$EVIDENCE/deployment-receipt.json"
const fs = require("node:fs");

const programShow = JSON.parse(
  fs.readFileSync("evidence/devnet-distinct-program/program-show.json", "utf8"),
);
const demo = JSON.parse(
  fs.readFileSync(
    "evidence/devnet-distinct-program/cresco-key-demo-state.json",
    "utf8",
  ),
);

const receipt = {
  schema: "cresco-key/distinct-devnet-program/v1",
  network: "devnet",
  evidenceClass: "LIVE_INTEGRATION",
  sourceCommit: process.env.SOURCE_COMMIT,
  programId: process.env.PROGRAM_ID,
  guardian: process.env.GUARDIAN_ID,
  beneficiary: process.env.BENEFICIARY_ID,
  programShow,
  deterministicBootstrap: {
    status: demo.status,
    charter: demo.charter,
    mandate: demo.mandate,
    mandateVersion: demo.mandateVersion,
    mandateNonce: demo.mandateNonce,
    mint: demo.mint,
    assetRule: demo.assetRule,
    vaultTokenAccount: demo.vaultTokenAccount,
    recipientA: demo.recipientA,
    recipientB: demo.recipientB,
  },
  truthBoundary: {
    distinctProgramDeployed: true,
    deterministicPaymentStateReady: demo.status === "READY_FOR_MOBILE_RUNTIME",
    mobileCrescoTransactionProven: false,
    fullLiveCoreLoopProven: false,
    physicalAndroidProven: false,
    productionWalletCompatibilityProven: false,
  },
  generatedAt: new Date().toISOString(),
};

process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
NODE

echo "CRESCO_KEY_DISTINCT_DEVNET_PROGRAM=PASS programId=$PROGRAM_ID"
