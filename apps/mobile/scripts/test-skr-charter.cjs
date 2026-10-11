#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise actual production charter formatter, not a copy of its logic.
const input = fs.readFileSync(
  path.resolve(__dirname, "../src/skr/charterReview.ts"), "utf8",
);
const js = ts.transpileModule(input, {
  fileName: "charterReview.ts",
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
const module = { exports: {} };
vm.runInNewContext(
  `(function(module,exports) {\n${js.outputText}\n})`,
  { BigInt },
)(module, module.exports);
const { tokenUnits, createFamilyCharterReview } = module.exports;
assert.equal(tokenUnits(1500000n, 6), "1.5");
assert.equal(tokenUnits(1n, 0), "1");
assert.equal(tokenUnits(0n, 6), "0");
assert.throws(() => tokenUnits(-1n, 6), /INVALID_REVIEW_AMOUNT/);
const rule = {
  mint: "PublicDevnetTokenMint",
  actionCapBaseUnits: 10000000n,
  periodCapBaseUnits: 25000000n,
  spentBaseUnits: 5000000n,
  nonce: 6n,
  periodSeconds: 3600n,
  decimals: 6,
};
const report = createFamilyCharterReview({
  rule, topic: "exception", familyNote: "Discuss one exact purchase, not new standing authority.",
});
assert.match(report, /10 tokens/);
assert.match(report, /25 tokens/);
assert.match(report, /Spent this period .*5 tokens/);
assert.match(report, /Remaining by period cap .*20 tokens/);
assert.match(report, /Mandate nonce .*6/);
assert.match(report, /ONE-TIME approval/);
assert.match(report, /NOT FINANCIAL AUTHORIZATION/);
assert.match(report, /not a guardian signature/);
assert.doesNotMatch(report, /guardianWallet|beneficiaryWallet|relayToken|privateKey/i);
assert.throws(
  () => createFamilyCharterReview({ rule, topic: "review", familyNote: "  " }),
  /REVIEW_NOTE_REQUIRED/,
);
assert.throws(
  () => createFamilyCharterReview({ rule: { ...rule, periodSeconds: -1n },
    topic: "review", familyNote: "Review limits" }),
  /INVALID_OBSERVED/,
);
assert.match(createFamilyCharterReview({
  rule: { ...rule, spentBaseUnits: 30000000n },
  topic: "independence", familyNote: "Discuss limits",
}), /Remaining by period cap .*0 tokens/);
// A non-wallet mainnet check or UNKNOWN SKR status never creates financial
// authorization. This pure formatter has no wallet/RPC/program write path.
console.log("PASS: SKR family charter derived only from observed Key policy, no spending authority");
