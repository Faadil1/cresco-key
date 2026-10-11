#!/usr/bin/env node
"use strict";
// Tests actual observed-Key review logic. No wallet, private keys, network
// or fake SKR balances. This is source-level / CI evidence, not live bounty proof.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const name = path.resolve(__dirname, "../src/skr/liveKeyCharterReview.ts");
const source = fs.readFileSync(name, "utf8");
const compiled = ts.transpileModule(source, {
  fileName: name,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const testModule = { exports: {} };
const wrapper = vm.runInNewContext(
  "(function(require,module,exports){\n" + compiled.outputText + "\n})",
  { BigInt, Date },
);
wrapper(importName => { throw Error("NO_RUNTIME_EXTERNAL_DEPENDENCY_EXPECTED:" + importName); }, testModule, testModule.exports);
const { buildLiveSkrKeyReview } = testModule.exports;
const beneficiary = "BENEFICIARY";
const guardian = "GUARDIAN";
const key = {
  charter: "CHARTER", mandate: "MANDATE", assetRule: "ASSET_RULE",
  beneficiary, guardian, mint: "MINT", programId: "DEVNET_PROGRAM",
  version: 1n, nonce: 2n, mandateStage: 3, mandateStatus: 0,
  mandateExpiryUnixSeconds: 0n, actionMask: 1, ruleEnabled: true,
  maxActionAmount: 10_000_000n, maxPeriodAmount: 100_000_000n,
  periodSeconds: 2592000n, periodStartedAt: 0n,
  spentThisPeriod: 12_000_000n, maxUnitPriceMicroUsd: 0n,
  pythFeedId: 0,
};
const timestamp = "2026-10-11T21:00:00.000Z";
const normal = buildLiveSkrKeyReview(key, guardian, timestamp);
assert.equal(normal.status, "REVIEW_ACTIVE_RULE");
assert.equal(normal.reviewerRole, "GUARDIAN");
assert.equal(normal.remainingPeriodBaseUnits, "88000000");
assert.equal(normal.maxActionBaseUnits, "10000000");
assert.equal(normal.nonce, "2");
assert.equal(normal.authority, "READ_ONLY_REVIEW_NOT_FINANCIAL_AUTHORIZATION");
assert.equal(buildLiveSkrKeyReview(key, beneficiary, timestamp).reviewerRole, "BENEFICIARY");
assert.throws(() => buildLiveSkrKeyReview(key, "UNRELATED_WALLET", timestamp), /REVIEWER_IS_NOT_A_CHARTER_PARTICIPANT/);
assert.throws(() => buildLiveSkrKeyReview(key, guardian, ""), /LIVE_KEY_REVIEW_CONTEXT_MISSING/);
assert.equal(buildLiveSkrKeyReview({ ...key, mandateStatus: 1 }, guardian, timestamp).status, "REVIEW_INACTIVE_RULE");
assert.equal(buildLiveSkrKeyReview({ ...key, ruleEnabled: false }, guardian, timestamp).status, "REVIEW_INACTIVE_RULE");
const inconsistent = buildLiveSkrKeyReview({ ...key, spentThisPeriod: 110_000_000n }, guardian, timestamp);
assert.equal(inconsistent.status, "INCONSISTENT_LIVE_SNAPSHOT");
assert.equal(inconsistent.remainingPeriodBaseUnits, "0");
const atelier = fs.readFileSync(path.resolve(__dirname, "../src/skr/SkrCharterAtelier.tsx"), "utf8");
assert.match(atelier, /state !== "HAS_SKR" \|\| !liveKey/);
assert.match(atelier, /state !== "HAS_SKR" \|\| !review/);
assert.match(atelier, /getTokenAccountsByOwner/);
assert.match(atelier, /const MAINNET_RPC = "https:\/\/api.mainnet-beta.solana.com"/);
assert.doesNotMatch(atelier, /sendTransactions\(|signTransactions\(|grantPaymentAllowanceOnce\(/);
const workspace = fs.readFileSync(path.resolve(__dirname, "../src/BoundaryWorkspace.tsx"), "utf8");
assert.match(workspace, /<SkrCharterAtelier[^>]*liveKey=\{guardianKeyInspection/);
assert.match(workspace, /<SkrCharterAtelier[^>]*liveKey=\{youngKeyInspection/);
console.log("PASS: SKR optional read-only live-Key review and non-authority boundaries");
