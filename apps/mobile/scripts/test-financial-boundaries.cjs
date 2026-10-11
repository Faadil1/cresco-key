#!/usr/bin/env node
"use strict";
// Native dependency-free financial-regression tests using the TypeScript
// compiler already installed by Mobile CI. No Solana RPC, wallet or private key.
// Live signatures and full G1 integration still require physical verification.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

const root = path.resolve(__dirname, "../src/solana");
const ids = new Map([
  ["Guardian", 1], ["Beneficiary", 2], ["CHARTER", 3],
  ["MANDATE", 4], ["Mint", 5], ["ASSET_RULE", 6], ["PROGRAM", 7],
]);
const byId = new Map([...ids].map(([key, value]) => [value, key]));
const bytesFor = (name) => Uint8Array.from({ length: 32 }, () => ids.get(name) ?? 255);
const mockedKit = {
  address: (v) => v,
  AccountRole: { READONLY: 0, WRITABLE: 1, READONLY_SIGNER: 2, WRITABLE_SIGNER: 3 },
  getAddressEncoder: () => ({ encode: bytesFor }),
  getAddressDecoder: () => ({
    decode: (value) => byId.get(value[0]) ?? "UNKNOWN",
  }),
  isSignature: (v) => typeof v === "string" && v.length > 20,
};
const mockProgram = {
  derivePaymentAccounts: async () => ({
    charter: "CHARTER", mandate: "MANDATE", assetRule: "ASSET_RULE",
    vault: "VAULT", destinationAta: "DESTINATION",
  }),
};
function load(file) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal((compiled.diagnostics ?? []).filter(x => x.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} };
  const requireMock = (name) => {
    if (name === "@solana/kit") return mockedKit;
    if (name === "./programClient") return mockProgram;
    if (name === "react-native-quick-base64") {
      return { toByteArray: (raw) => Uint8Array.from(Buffer.from(raw, "base64")) };
    }
    throw new Error("UNEXPECTED_IMPORT:" + name);
  };
  const wrapped = vm.runInNewContext(
    `(function(require,module,exports) {\n${compiled.outputText}\n})`,
    { Buffer, Uint8Array, DataView, TextEncoder, BigInt, setTimeout, console },
  );
  wrapped(requireMock, module, module.exports);
  return module.exports;
}

function discriminator(kind, name) {
  return crypto.createHash("sha256").update(kind + ":" + name).digest().subarray(0, 8);
}
function account(type, size, fill) {
  const b = Buffer.alloc(size);
  discriminator("account", type).copy(b, 0);
  fill(b);
  return { owner: "PROGRAM", data: [b.toString("base64"), "base64"] };
}
const charter = account("Charter", 129, (b) => {
  Buffer.from(bytesFor("Guardian")).copy(b, 8);
  Buffer.from(bytesFor("Beneficiary")).copy(b, 40);
});
const mandate = account("Mandate", 123, (b) => {
  Buffer.from(bytesFor("CHARTER")).copy(b, 8);
  b[40] = 3; b[41] = 0;
  b.writeBigUInt64LE(8n, 42);
  b.writeBigUInt64LE(12n, 50);
});
const rule = account("AssetRule", 135, (b) => {
  Buffer.from(bytesFor("MANDATE")).copy(b, 8);
  Buffer.from(bytesFor("Mint")).copy(b, 40);
  b[72] = 1; b[73] = 1;
  b.writeBigUInt64LE(500n, 74); // 500 base units max/action
  b.writeBigUInt64LE(1000n, 82); // 1000 base units max/period
  b.writeBigInt64LE(600n, 90);  // 600s period
  b.writeBigInt64LE(1000n, 98); // period began at 1000
  b.writeBigUInt64LE(700n, 106); // already spent 700
});
const records = { CHARTER: charter, MANDATE: mandate, ASSET_RULE: rule };
const rpc = (overrides = {}) => ({
  getAccountInfo: (key) => ({
    send: async () => ({ value: (key in overrides ? overrides[key] : records[key]) ?? null }),
  }),
});
const { inspectStandingKey, assessStandingIntent, buildWidenStandingKeyInstruction } = load("standingKey.ts");
const { classifyProgramSubmissionError, knownRefusalEvidence } = load("outcome.ts");
const input = {
  chain: "solana:devnet",
  config: { programId: "PROGRAM", tokenProgramId: "TOKEN" },
  beneficiaryWallet: "Beneficiary", mint: "Mint",
};

async function run() {
  const keyRead = await inspectStandingKey(rpc(), input);
  assert.equal(keyRead.state, "READY");
  const key = keyRead.key;
  assert.equal(key.guardian, "Guardian", "guardian must come from actual charter");
  assert.equal(key.beneficiary, "Beneficiary");
  assert.equal(key.version, 8n);
  assert.equal(key.nonce, 12n);
  assert.equal(key.spentThisPeriod, 700n);

  const mismatched = await inspectStandingKey(rpc(), { ...input, guardianWallet: "Other" });
  assert.equal(mismatched.state, "BLOCKED");
  assert.match(mismatched.reason, /CHARTER_GUARDIAN/);
  assert.equal((await inspectStandingKey(rpc({ MANDATE: null }), input)).state, "BLOCKED");
  assert.equal((await inspectStandingKey(rpc({ CHARTER: { ...charter, owner: "OTHER" } }), input)).state, "BLOCKED");
  assert.equal((await inspectStandingKey(rpc(), { ...input, chain: "solana:mainnet" })).state, "BLOCKED");
  const deadRpc = { getAccountInfo: () => ({ send: async () => { throw new Error("RPC_UNAVAILABLE"); } }) };
  assert.equal((await inspectStandingKey(deadRpc, input)).state, "UNKNOWN");

  assert.equal(assessStandingIntent(key, 200n, 1100n).state, "WITHIN_STANDING_KEY");
  assert.deepEqual(
    { ...assessStandingIntent(key, 400n, 1100n) },
    { state: "BOUNDARY", code: "PERIOD_LIMIT", effectiveSpent: 700n },
  );
  assert.equal(assessStandingIntent(key, 501n, 1100n).code, "ACTION_LIMIT");
  assert.equal(assessStandingIntent(key, 400n, 1600n).state, "WITHIN_STANDING_KEY",
    "New spending period must reset the effective spent counter");
  assert.equal(assessStandingIntent(key, 0n, 1100n).state, "BLOCKED");
  assert.equal(assessStandingIntent({ ...key, mandateStage: 2 }, 1n, 1100n).state, "BLOCKED");
  assert.equal(assessStandingIntent({ ...key, mandateExpiryUnixSeconds: 1100n }, 1n, 1101n).state, "BLOCKED");

  const ix = buildWidenStandingKeyInstruction({
    key, nextMaxActionAmount: 600n, nextMaxPeriodAmount: 1100n,
  });
  const expected = discriminator("global", "update_asset_rule");
  assert.deepEqual([...ix.data.subarray(0, 8)], [...expected]);
  const d = new DataView(ix.data.buffer, ix.data.byteOffset, ix.data.byteLength);
  assert.equal(d.getBigUint64(8, true), 12n, "nonce must match the live mandate");
  assert.equal(d.getBigUint64(18, true), 600n);
  assert.equal(d.getBigUint64(26, true), 1100n);
  assert.equal(ix.accounts[3].address, "Guardian");
  assert.equal(ix.accounts[3].role, mockedKit.AccountRole.READONLY_SIGNER);
  assert.throws(() => buildWidenStandingKeyInstruction({
    key, nextMaxActionAmount: 500n, nextMaxPeriodAmount: 1100n,
  }), /MUST_EXCEED/);
  assert.throws(() => buildWidenStandingKeyInstruction({
    key, nextMaxActionAmount: 600n, nextMaxPeriodAmount: 500n,
  }), /PERIOD_LIMIT/);

  const unknown = classifyProgramSubmissionError(new Error("simulated ActionAmountExceeded"));
  assert.equal(unknown.state, "UNKNOWN", "unsigned simulated errors are not chain refusals");
  assert.equal(unknown.signature, null);
  assert.equal(knownRefusalEvidence(["ActionAmountExceeded"].join(" ")), "ActionAmountExceeded");
  // Guard against a misleading UI button that changes status without
  // emitting the promised PRECHECK_BLOCKED public receipt.
  const workspace = fs.readFileSync(path.join(root, "../BoundaryWorkspace.tsx"), "utf8");
  const setupGuard = workspace.match(/if \(demoBeneficiaryBlocker\) \{([\s\S]*?)\n    \}/)?.[1];
  assert.ok(setupGuard, "Beneficiary setup mismatch guard must remain present");
  assert.match(setupGuard, /recordReceipt\("PRECHECK_BLOCKED"/,
    "Setup blocker button must produce a new PRECHECK_BLOCKED receipt");
  assert.match(setupGuard, /transactionSubmitted:\s*false/,
    "The public receipt must never imply a real payment was submitted");
  assert.match(setupGuard, /financialAuthorityDecision:\s*false/,
    "A configuration mismatch is not an onchain refusal or guardian decision");
  assert.doesNotMatch(setupGuard, /sendTransactions\(/,
    "Setup mismatch must stop before MWA wallet transaction signing");
  console.log("PASS: financial-boundary tests + setup blocker receipt regression");
}
run().catch(err => { console.error(err); process.exitCode = 1; });
