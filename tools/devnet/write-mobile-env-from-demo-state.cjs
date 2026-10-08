const fs = require("node:fs");
const path = require("node:path");

function usage() {
  console.error(
    "Usage: node tools/devnet/write-mobile-env-from-demo-state.cjs <demo-state.json> [output.env]",
  );
}

function requireString(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`INVALID_${name}`);
  }
  return value;
}

function shellLine(key, value) {
  return `${key}=${String(value).replace(/\n/g, "")}`;
}

function main() {
  const input = process.argv[2];
  const output = process.argv[3];

  if (!input) {
    usage();
    process.exit(2);
  }

  const state = JSON.parse(fs.readFileSync(input, "utf8"));
  if (state.schema !== "cresco-key/devnet-payment-demo/v1") {
    throw new Error(`UNSUPPORTED_DEMO_STATE_SCHEMA ${state.schema}`);
  }
  if (state.status !== "READY_FOR_MOBILE_RUNTIME") {
    throw new Error(`DEMO_STATE_NOT_READY ${state.status}`);
  }

  const env = {
    EXPO_PUBLIC_SOLANA_RPC_URL: requireString(state.rpcUrl, "RPC_URL"),
    EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID: requireString(
      state.programId,
      "PROGRAM_ID",
    ),
    EXPO_PUBLIC_DEMO_TOKEN_PROGRAM_ID: requireString(
      state.tokenProgramId,
      "TOKEN_PROGRAM_ID",
    ),
    EXPO_PUBLIC_DEMO_TOKEN_DECIMALS: String(state.tokenDecimals),
    EXPO_PUBLIC_DEMO_MANDATE_NONCE: String(state.mandateNonce),
    EXPO_PUBLIC_DEMO_GUARDIAN_WALLET: requireString(
      state.guardian,
      "GUARDIAN",
    ),
    // Strictly bind the public demo mandate to the originally provisioned beneficiary.
    // A new wallet requires an independently authorized Devnet charter/bootstrap.
    EXPO_PUBLIC_DEMO_BENEFICIARY_WALLET: requireString(
      state.beneficiary,
      "BENEFICIARY",
    ),
    EXPO_PUBLIC_DEMO_MUTATED_RECIPIENT: requireString(
      state.recipientB,
      "RECIPIENT_B",
    ),
    EXPO_PUBLIC_DEMO_SOLANA_PAY_IN_BOUNDS_5: requireString(
      state.solanaPay?.inBounds5,
      "SOLANA_PAY_IN_BOUNDS_5",
    ),
    EXPO_PUBLIC_DEMO_SOLANA_PAY_BOUNDARY_12: requireString(
      state.solanaPay?.boundary12,
      "SOLANA_PAY_BOUNDARY_12",
    ),
    EXPO_PUBLIC_DEMO_SOLANA_PAY_CHANGED_RECIPIENT_12: requireString(
      state.solanaPay?.changedRecipient12,
      "SOLANA_PAY_CHANGED_RECIPIENT_12",
    ),
  };

  const body =
    [
      "# Generated from public CRESCO Key Devnet demo state.",
      "# Contains no private key material.",
      ...Object.entries(env).map(([key, value]) => shellLine(key, value)),
      "",
    ].join("\n");

  if (output) {
    fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
    fs.writeFileSync(output, body);
  } else {
    process.stdout.write(body);
  }
}

main();
