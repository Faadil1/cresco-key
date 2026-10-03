#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-Faadil1/cresco-key}"
SOLANA_VERSION="2.3.0"
ORIGINAL_PROGRAM_ID="ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk"
KEY_DIR="${HOME}/.config/solana/cresco-key-devnet"

mkdir -p "$KEY_DIR"
chmod 700 "$KEY_DIR"
umask 077

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required in this browser/Codespace environment." >&2
  exit 1
fi

gh auth status >/dev/null

if ! command -v solana-keygen >/dev/null 2>&1; then
  echo "Installing official Solana CLI v$SOLANA_VERSION..."
  sh -c "$(curl -sSfL https://release.anza.xyz/v$SOLANA_VERSION/install)"
  export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

PROGRAM_KEY="$KEY_DIR/cresco-key-program.json"
GUARDIAN_KEY="$KEY_DIR/cresco-key-guardian.json"
BENEFICIARY_KEY="$KEY_DIR/cresco-key-beneficiary.json"

generate_if_missing() {
  path="$1"
  label="$2"
  if [ ! -f "$path" ]; then
    echo "Generating $label Devnet-only keypair..."
    solana-keygen new --no-bip39-passphrase --silent --force --outfile "$path"
    chmod 600 "$path"
  fi
}

generate_if_missing "$PROGRAM_KEY" "program"
generate_if_missing "$GUARDIAN_KEY" "guardian"
generate_if_missing "$BENEFICIARY_KEY" "beneficiary"

PROGRAM_ID="$(solana-keygen pubkey "$PROGRAM_KEY")"
GUARDIAN_ID="$(solana-keygen pubkey "$GUARDIAN_KEY")"
BENEFICIARY_ID="$(solana-keygen pubkey "$BENEFICIARY_KEY")"

if [ "$PROGRAM_ID" = "$ORIGINAL_PROGRAM_ID" ]; then
  echo "SAFETY_STOP: generated program id matches the original CRESCO program id." >&2
  exit 1
fi

if [ "$GUARDIAN_ID" = "$BENEFICIARY_ID" ]; then
  echo "SAFETY_STOP: guardian and beneficiary must be distinct." >&2
  exit 1
fi

echo "Uploading encrypted repository secrets to $REPO..."
gh secret set CRESCO_KEY_PROGRAM_KEYPAIR_JSON --repo "$REPO" < "$PROGRAM_KEY"
gh secret set CRESCO_GUARDIAN_KEYPAIR_JSON --repo "$REPO" < "$GUARDIAN_KEY"
gh secret set CRESCO_BENEFICIARY_KEYPAIR_JSON --repo "$REPO" < "$BENEFICIARY_KEY"

echo
echo "Secrets uploaded. Private key material was not printed."
echo "PUBLIC PROGRAM ID:     $PROGRAM_ID"
echo "PUBLIC GUARDIAN ID:    $GUARDIAN_ID"
echo "PUBLIC BENEFICIARY ID: $BENEFICIARY_ID"
echo
echo "Keep the key files private. Do not commit or paste them into chat."
echo "Next human handoff: provide ONLY the PUBLIC PROGRAM ID so the repository can bind declare_id!/Anchor.toml to the secret-backed keypair."
