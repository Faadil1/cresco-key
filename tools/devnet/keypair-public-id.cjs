const fs = require("node:fs");
const path = require("node:path");
const anchor = require("@coral-xyz/anchor");

const file = process.argv[2];
if (!file) {
  throw new Error("KEYPAIR_PATH_REQUIRED");
}

const resolved = path.resolve(file);
const value = JSON.parse(fs.readFileSync(resolved, "utf8"));

if (
  !Array.isArray(value) ||
  value.length !== 64 ||
  value.some(
    (byte) => !Number.isInteger(byte) || byte < 0 || byte > 255,
  )
) {
  throw new Error("INVALID_SOLANA_KEYPAIR_JSON");
}

const keypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(value));
process.stdout.write(keypair.publicKey.toBase58());
