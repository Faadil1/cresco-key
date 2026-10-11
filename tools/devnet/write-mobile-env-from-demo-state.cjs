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

// Only public, non-secret deployment addresses may enter an Expo bundle.
// Format validation does NOT prove domain ownership, assetlinks or relay deployment.
function optionalHttpsOrigin(raw, name) {
  if (!raw || !raw.trim()) return null;
  let value;
  try { value = new URL(raw.trim()); } catch { throw new Error(`INVALID_${name}_URL`); }
  if (value.protocol !== "https:" || value.username || value.password ||
      value.search || value.hash || value.pathname !== "/" ||
      /replace|example|localhost|127\\.0\\.0\\.1/i.test(value.hostname)) {
    throw new Error(`UNVERIFIED_${name}_ORIGIN`);
  }
  return value.origin;
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
  if (state.network !== "devnet") {
    throw new Error(`DEMO_STATE_NETWORK_NOT_DEVNET ${state.network}`);
  }
  if (state.programId === "ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk") {
    throw new Error("LEGACY_PROGRAM_ID_NOT_ALLOWED");
  }
  if (state.status !== "READY_FOR_MOBILE_RUNTIME") {
    throw new Error(`DEMO_STATE_NOT_READY ${state.status}`);
  }

  const identityUri = optionalHttpsOrigin(
    process.env.CRESCO_MOBILE_IDENTITY_URI, "APP_IDENTITY");
  const relayUrl = optionalHttpsOrigin(
    process.env.CRESCO_MOBILE_RELAY_URL, "BOUNDARY_RELAY");
  if (process.env.CRESCO_REQUIRE_INTEGRATION_CONFIG === "1" &&
      (!identityUri || !relayUrl)) {
    throw new Error("INTEGRATED_MOBILE_BUILD_REQUIRES_IDENTITY_AND_RELAY_ORIGINS");
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

  if (identityUri) env.EXPO_PUBLIC_APP_IDENTITY_URI = identityUri;
  if (relayUrl) env.EXPO_PUBLIC_BOUNDARY_RELAY_URL = relayUrl;

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
