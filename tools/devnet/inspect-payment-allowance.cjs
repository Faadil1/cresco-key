#!/usr/bin/env node
"use strict";
/**
 * Read-only RPC inspection of a public Devnet payment allowance. NO signing,
 * secret keys, transfer, account mutation, or repair. Reconciles a signed
 * Grant -> erroneous AlreadyUsed refusal with the actual account bytes.
 */
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { web3 } = require("@coral-xyz/anchor");

const program = "6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP";
const allowance = process.env.CRESCO_PUBLIC_PAYMENT_ALLOWANCE ||
  "2x4NZztgoauD5sTbPL7noSv8QQiTNwW6sHanTaQMKzRm";
const rpc = "https://api.devnet.solana.com";
const output = path.resolve(__dirname, "../../evidence/devnet-distinct-program/public-allowance-inspection.json");
function publicKey(raw) {
  return new web3.PublicKey(raw).toBase58();
}
async function post(body) {
  const response = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, ...body }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw Error("SOLANA_RPC_HTTP_" + response.status);
  const result = await response.json();
  if (result.error) throw Error("SOLANA_RPC_" + JSON.stringify(result.error).slice(0, 250));
  return result.result;
}
(async () => {
  const info = await post({
    method: "getAccountInfo",
    params: [publicKey(allowance), { encoding: "base64", commitment: "confirmed" }],
  });
  if (!info?.value) throw Error("ALLOWANCE_ACCOUNT_MISSING");
  const account = info.value;
  if (account.owner !== program) throw Error("WRONG_ACCOUNT_PROGRAM_OWNER");
  if (!Array.isArray(account.data) || account.data[1] !== "base64")
    throw Error("INVALID_ACCOUNT_ENCODING");
  const bytes = Buffer.from(account.data[0], "base64");
  const discriminator = createHash("sha256")
    .update("account:PaymentAllowanceReceipt").digest().subarray(0, 8);
  if (bytes.length < 234 || !bytes.subarray(0, 8).equals(discriminator)) {
    throw Error("UNEXPECTED_PAYMENT_ALLOWANCE_LAYOUT_OR_PROGRAM_VERSION");
  }
  const pk = (i) => new web3.PublicKey(bytes.subarray(i, i + 32)).toBase58();
  const parsed = {
    schema: "cresco-key.public-payment-allowance-inspection.v1",
    evidenceClass: "LIVE_DEVNET_RPC_READ_ONLY",
    sourceRun: 38183110494,
    program,
    address: allowance,
    slot: info.context.slot,
    owner: account.owner,
    accountSpace: bytes.length,
    mandate: pk(8),
    guardian: pk(40),
    beneficiary: pk(72),
    mint: pk(104),
    recipient: pk(136),
    amountBaseUnits: bytes.readBigUInt64LE(168).toString(),
    requestIdHex: bytes.subarray(176, 208).toString("hex"),
    nonce: bytes.readBigUInt64LE(208).toString(),
    expiresAt: bytes.readBigInt64LE(216).toString(),
    used: bytes[224] === 1,
    usedRawByte: bytes[224],
    usedAt: bytes.readBigInt64LE(225).toString(),
    bump: bytes[233],
    inspectedAt: new Date().toISOString(),
    financialAuthorityChangedByInspection: false,
    physicalAndroidProof: false,
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(parsed, null, 2) + "\n");
  console.log(JSON.stringify(parsed, null, 2));
  if (parsed.mandate !== "C6H6bUXTZBqBJVBSVNx3m2pXXDhuySZVnbWcrVgP6qaE") {
    throw Error("UNEXPECTED_DEMO_MANDATE");
  }
  if (parsed.usedRawByte !== 0 && parsed.usedRawByte !== 1)
    throw Error("INVALID_BOOLEAN_LAYOUT");
  console.log("PUBLIC_ALLOWANCE_INSPECTION=COMPLETE");
})().catch(error => {
  console.error("PUBLIC_ALLOWANCE_INSPECTION=BLOCKED", error.message);
  process.exitCode = 1;
});
