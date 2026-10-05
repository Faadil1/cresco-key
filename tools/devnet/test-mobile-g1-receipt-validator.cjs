#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname);
const validator = path.join(root, "validate-mobile-g1-receipts.cjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cresco-g1-receipts-"));

try {
  const completeDir = path.join(tmp, "complete");
  fs.mkdirSync(completeDir);

  writeReceipt(completeDir, "01-wallet-proof.json", {
    scenario: "WALLET_PROOF",
    details: {
      state: "SIGNED",
      signatureByteLength: 64,
    },
  });

  writeReceipt(completeDir, "02-standing-5.json", {
    scenario: "STANDING_PAYMENT",
    intent: { amountUi: "5" },
    details: {
      outcome: {
        state: "ALLOW",
        signature: fakeSignature("standing5"),
      },
    },
  });

  writeReceipt(completeDir, "03-standing-12.json", {
    scenario: "STANDING_PAYMENT",
    intent: { amountUi: "12" },
    details: {
      outcome: {
        state: "REFUSE",
        evidence: "amount-exceeds-standing-boundary",
      },
    },
  });

  writeReceipt(completeDir, "04-boundary-request.json", {
    scenario: "BOUNDARY_REQUEST",
    details: {
      state: "PENDING",
      requestId: "boundary-request-demo-001",
      refusal: { state: "REFUSE" },
    },
  });

  writeReceipt(completeDir, "05-guardian-allow-once.json", {
    scenario: "GUARDIAN_ALLOW_ONCE",
    details: {
      outcome: {
        state: "ALLOW",
        signature: fakeSignature("guardianallow"),
      },
    },
  });

  writeReceipt(completeDir, "06-changed-recipient.json", {
    scenario: "CHANGED_RECIPIENT_MUTATION",
    details: {
      outcome: {
        state: "REFUSE",
        evidence: "recipient-mismatch",
      },
    },
  });

  writeReceipt(completeDir, "07-exact-execution.json", {
    scenario: "EXACT_ALLOWANCE_EXECUTION",
    details: {
      outcome: {
        state: "ALLOW",
        signature: fakeSignature("exactexecution"),
      },
    },
  });

  writeReceipt(completeDir, "08-replay.json", {
    scenario: "EXACT_ALLOWANCE_EXECUTION",
    details: {
      outcome: {
        state: "REFUSE",
        evidence: "allowance-consumed",
      },
    },
  });

  const complete = JSON.parse(
    execFileSync(process.execPath, [validator, "--json", completeDir], {
      encoding: "utf8",
    }),
  );
  assert.equal(complete.status, "READY_TO_REVIEW_FOR_LIVE_CORE_G1");
  assert.deepEqual(complete.missing, []);
  assert.equal(complete.forbiddenKeyFindings.length, 0);

  const incompleteDir = path.join(tmp, "incomplete");
  fs.mkdirSync(incompleteDir);
  writeReceipt(incompleteDir, "01-wallet-proof.json", {
    scenario: "WALLET_PROOF",
    details: {
      state: "SIGNED",
      signatureByteLength: 64,
    },
  });

  const incomplete = spawnSync(
    process.execPath,
    [validator, "--json", incompleteDir],
    { encoding: "utf8" },
  );
  assert.equal(incomplete.status, 1);
  const incompleteSummary = JSON.parse(incomplete.stdout);
  assert.equal(incompleteSummary.status, "INCOMPLETE");
  assert.ok(incompleteSummary.missing.includes("standing-5-allow"));

  const partial = spawnSync(
    process.execPath,
    [validator, "--json", "--allow-partial", incompleteDir],
    { encoding: "utf8" },
  );
  assert.equal(partial.status, 0);

  const secretDir = path.join(tmp, "secret");
  fs.mkdirSync(secretDir);
  writeReceipt(secretDir, "01-secret-like-field.json", {
    scenario: "WALLET_PROOF",
    details: {
      state: "SIGNED",
      signatureByteLength: 64,
      seedPhrase: "redacted-test-fixture",
    },
  });

  const secret = spawnSync(
    process.execPath,
    [validator, "--json", "--allow-partial", secretDir],
    { encoding: "utf8" },
  );
  assert.equal(secret.status, 1);
  const secretSummary = JSON.parse(secret.stdout);
  assert.equal(secretSummary.status, "INCOMPLETE");
  assert.deepEqual(secretSummary.forbiddenKeyFindings.map((entry) => entry.keyPath), [
    "details.seedPhrase",
  ]);

  console.log("Mobile G1 receipt validator self-test passed.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

function writeReceipt(dir, filename, receipt) {
  fs.writeFileSync(
    path.join(dir, filename),
    JSON.stringify(
      {
        schema: "cresco-key.mobile-g1-runtime-receipt.v1",
        app: "cresco-key",
        capturedAt: "2026-10-05T00:00:00.000Z",
        ...receipt,
      },
      null,
      2,
    ),
  );
}

function fakeSignature(label) {
  return `11111111111111111111111111111111${label}`;
}
