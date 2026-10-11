#!/usr/bin/env node
"use strict";
// No wallet, secret, RPC or authority change. Tests public enrollment discovery
// and the fail-closed two-signer requirement in the deployed Anchor source.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const src = fs.readFileSync(path.join(__dirname, "../src/solana/enrollment.ts"), "utf8");
const compiled = ts.transpileModule(src, {
  fileName: "enrollment.ts",
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const valid = new Set([
  "BW5dWcUfrmKNGuwuccWYAKArPseBM23qwV8PiZ96ySkT",
  "Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov",
]);
const encoder = new TextEncoder();
const kit = {
  address(value) {
    if (!valid.has(value) && value !== "CRESCO_PROGRAM" && value !== "CHARTER_PDA") {
      throw Error("NOT_A_VALID_SOLANA_ADDRESS");
    }
    return value;
  },
  getAddressEncoder: () => ({
    encode(value) {
      if (!valid.has(value) && value !== "CHARTER_PDA") throw Error("INVALID");
      return Uint8Array.from({ length: 32 }, (_, i) => i);
    },
  }),
  async getProgramDerivedAddress({ programAddress, seeds }) {
    assert.equal(programAddress, "CRESCO_PROGRAM");
    const label = Buffer.from(seeds[0]).toString();
    if (label === "charter") return ["CHARTER_PDA", 255];
    if (label === "mandate") return ["MANDATE_PDA", 254];
    throw Error("UNEXPECTED_SEEDS");
  },
};
const moduleMock = { exports: {} };
const factory = vm.runInNewContext(
  "(function(require,module,exports){\n" + compiled.outputText + "\n})",
  { TextEncoder, Uint8Array, Error },
);
factory(name => {
  if (name === "@solana/kit") return kit;
  throw Error("UNEXPECTED_IMPORT:" + name);
}, moduleMock, moduleMock.exports);

const { parseDistinctGuardianWallet, deriveEnrollmentAccounts } = moduleMock.exports;
const beneficiary = "BW5dWcUfrmKNGuwuccWYAKArPseBM23qwV8PiZ96ySkT";
const guardian = "Fsm2vU1vzWkowmkU9bRpCfaR8Q5vETCFXtofUCRZUnov";

(async () => {
  assert.equal(parseDistinctGuardianWallet(guardian, beneficiary), guardian);
  assert.throws(() => parseDistinctGuardianWallet(beneficiary, beneficiary), /GUARDIAN_MUST_BE_DISTINCT/);
  assert.throws(() => parseDistinctGuardianWallet("invalid", beneficiary), /INVALID_GUARDIAN_PUBLIC_ADDRESS/);
  assert.throws(() => parseDistinctGuardianWallet("  ", beneficiary), /GUARDIAN_PUBLIC_ADDRESS_REQUIRED/);
  assert.deepEqual({ ...await deriveEnrollmentAccounts("CRESCO_PROGRAM", beneficiary) }, {
    charter: "CHARTER_PDA", mandate: "MANDATE_PDA",
  });

  const rust = fs.readFileSync(path.join(__dirname, "../../../programs/keys/src/lib.rs"), "utf8");
  const charterAccounts = rust.match(/pub struct InitializeCharter<'info> \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(charterAccounts, "Anchor InitializeCharter accounts must exist");
  assert.match(charterAccounts, /pub guardian: Signer<'info>/);
  assert.match(charterAccounts, /pub beneficiary: Signer<'info>/);
  assert.match(charterAccounts, /payer = guardian/);

  const workspace = fs.readFileSync(path.join(__dirname, "../src/BoundaryWorkspace.tsx"), "utf8");
  const setupReader = workspace.match(/const inspectMyKeySetup = async \(\) => \{([\s\S]*?)\n  \};/)?.[1];
  assert.ok(setupReader);
  assert.match(setupReader, /getAccountInfo/);
  assert.match(setupReader, /getBalance/);
  assert.doesNotMatch(setupReader, /sendTransactions\(/, "Read-only setup must never sign a transaction");
  const handoff = workspace.match(/const shareEnrollmentRequest = async \(\) => \{([\s\S]*?)\n  \};/)?.[1];
  assert.ok(handoff);
  assert.match(handoff, /signedEnrollmentTransaction: false/);
  assert.match(handoff, /guardianVerifiedOnchain: false/);
  console.log("PASS: 12 noncustodial Devnet enrollment boundary assertions");
})().catch(e => { console.error(e); process.exitCode = 1; });
