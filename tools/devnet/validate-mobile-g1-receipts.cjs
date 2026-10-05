#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const EXPECTED_SCHEMA = "cresco-key.mobile-g1-runtime-receipt.v1";

const REQUIRED_CHECKS = [
  {
    id: "wallet-proof-signed",
    label: "wallet proof signed",
    match: (receipt) =>
      receipt.scenario === "WALLET_PROOF" &&
      receipt.details?.state === "SIGNED" &&
      Number.isFinite(Number(receipt.details?.signatureByteLength)) &&
      Number(receipt.details.signatureByteLength) > 0,
  },
  {
    id: "standing-5-allow",
    label: "5-unit standing payment ALLOW with signature",
    match: (receipt) =>
      receipt.scenario === "STANDING_PAYMENT" &&
      receipt.intent?.amountUi === "5" &&
      receipt.details?.outcome?.state === "ALLOW" &&
      hasSignature(receipt.details.outcome.signature),
  },
  {
    id: "standing-12-refuse",
    label: "12-unit boundary payment REFUSE",
    match: (receipt) =>
      receipt.scenario === "STANDING_PAYMENT" &&
      receipt.intent?.amountUi === "12" &&
      receipt.details?.outcome?.state === "REFUSE" &&
      Boolean(receipt.details.outcome.evidence),
  },
  {
    id: "boundary-request-created",
    label: "boundary request created after verified refusal",
    match: (receipt) =>
      receipt.scenario === "BOUNDARY_REQUEST" &&
      receipt.details?.state === "PENDING" &&
      Boolean(receipt.details?.requestId) &&
      receipt.details?.refusal?.state === "REFUSE",
  },
  {
    id: "guardian-allow-once",
    label: "guardian Allow Once ALLOW with grant signature",
    match: (receipt) =>
      receipt.scenario === "GUARDIAN_ALLOW_ONCE" &&
      receipt.details?.outcome?.state === "ALLOW" &&
      hasSignature(receipt.details.outcome.signature),
  },
  {
    id: "changed-recipient-refuse",
    label: "changed-recipient mutation REFUSE",
    match: (receipt) =>
      receipt.scenario === "CHANGED_RECIPIENT_MUTATION" &&
      receipt.details?.outcome?.state === "REFUSE" &&
      Boolean(receipt.details.outcome.evidence),
  },
  {
    id: "exact-execution-allow",
    label: "exact approved execution ALLOW with signature",
    match: (receipt) =>
      receipt.scenario === "EXACT_ALLOWANCE_EXECUTION" &&
      receipt.details?.outcome?.state === "ALLOW" &&
      hasSignature(receipt.details.outcome.signature),
  },
  {
    id: "replay-refuse",
    label: "replay refuses after allowance consumption",
    match: (receipt) =>
      receipt.scenario === "EXACT_ALLOWANCE_EXECUTION" &&
      receipt.details?.outcome?.state === "REFUSE" &&
      Boolean(receipt.details.outcome.evidence),
  },
];

const FORBIDDEN_KEY_PATTERN =
  /(private|secret|seed|mnemonic|keypair|recovery|phrase)/i;

function usage() {
  console.error(
    [
      "Usage:",
      "  node tools/devnet/validate-mobile-g1-receipts.cjs <receipt.json|directory> [...]",
      "",
      "Options:",
      "  --json           Print machine-readable JSON only.",
      "  --allow-partial  Exit 0 even when required G1 receipt checks are missing.",
    ].join("\n"),
  );
}

function main() {
  const args = process.argv.slice(2);
  const jsonOnly = takeFlag(args, "--json");
  const allowPartial = takeFlag(args, "--allow-partial");

  if (args.length === 0) {
    usage();
    process.exit(2);
  }

  const files = [...new Set(args.flatMap(expandPath))].sort();
  if (files.length === 0) {
    fail("No JSON receipt files found.", jsonOnly);
  }

  const loaded = files.map(loadReceipt);
  const receipts = loaded
    .filter((entry) => entry.receipt)
    .map((entry) => entry.receipt);
  const invalid = loaded.filter((entry) => entry.error);

  const schemaMismatches = receipts.filter(
    (receipt) => receipt.schema !== EXPECTED_SCHEMA,
  );
  const secretFindings = receipts.flatMap((receipt, index) =>
    findForbiddenKeys(receipt).map((keyPath) => ({
      file: receipts[index].__file,
      keyPath,
    })),
  );

  const checks = REQUIRED_CHECKS.map((check) => ({
    id: check.id,
    label: check.label,
    passed: receipts.some(check.match),
  }));
  const missing = checks.filter((check) => !check.passed);

  const signatures = receipts
    .flatMap(extractSignatures)
    .filter((value, index, array) => array.indexOf(value) === index);

  const summary = {
    schema: "cresco-key.mobile-g1-receipt-validation.v1",
    checkedAt: new Date().toISOString(),
    files: files.length,
    validReceiptCount: receipts.length,
    invalidFiles: invalid,
    schemaMismatches: schemaMismatches.map((receipt) => ({
      file: receipt.__file,
      schema: receipt.schema ?? null,
    })),
    forbiddenKeyFindings: secretFindings,
    checks,
    missing: missing.map((check) => check.id),
    signatures,
    truthBoundary:
      "Validator checks exported receipt coverage only. It does not prove physical Android, production wallet compatibility, or Devnet account-state changes by itself.",
    status:
      invalid.length === 0 &&
      schemaMismatches.length === 0 &&
      secretFindings.length === 0 &&
      missing.length === 0
        ? "READY_TO_REVIEW_FOR_LIVE_CORE_G1"
        : "INCOMPLETE",
  };

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    printHuman(summary);
  }

  if (
    summary.invalidFiles.length > 0 ||
    summary.schemaMismatches.length > 0 ||
    summary.forbiddenKeyFindings.length > 0 ||
    (!allowPartial && summary.missing.length > 0)
  ) {
    process.exit(1);
  }
}

function takeFlag(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return false;
  args.splice(index, 1);
  return true;
}

function expandPath(inputPath) {
  const resolved = path.resolve(inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Path does not exist: ${inputPath}`);
  }

  const stat = fs.statSync(resolved);
  if (stat.isFile()) return [resolved];
  if (!stat.isDirectory()) return [];

  return fs
    .readdirSync(resolved, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(resolved, entry.name);
      if (entry.isDirectory()) return expandPath(entryPath);
      if (entry.isFile() && entry.name.endsWith(".json")) return [entryPath];
      return [];
    });
}

function loadReceipt(file) {
  try {
    const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
    receipt.__file = file;
    return { file, receipt };
  } catch (error) {
    return {
      file,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function hasSignature(value) {
  return typeof value === "string" && value.length >= 32;
}

function extractSignatures(receipt) {
  const out = [];
  visit(receipt, (key, value) => {
    if (/signature/i.test(key) && hasSignature(value)) out.push(value);
  });
  return out;
}

function findForbiddenKeys(value) {
  const findings = [];
  visit(value, (key, entry, keyPath) => {
    if (
      FORBIDDEN_KEY_PATTERN.test(key) &&
      entry !== null &&
      entry !== undefined
    ) {
      findings.push(keyPath);
    }
  });
  return findings;
}

function visit(value, visitor, prefix = "") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      visit(entry, visitor, `${prefix}[${index}]`),
    );
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    visitor(key, entry, keyPath);
    visit(entry, visitor, keyPath);
  }
}

function printHuman(summary) {
  console.log(`Mobile G1 receipt validation: ${summary.status}`);
  console.log(`Receipts: ${summary.validReceiptCount}/${summary.files}`);
  console.log("");

  for (const check of summary.checks) {
    console.log(`${check.passed ? "PASS" : "MISSING"} ${check.label}`);
  }

  if (summary.signatures.length > 0) {
    console.log("");
    console.log("Observed signatures:");
    for (const signature of summary.signatures) console.log(`- ${signature}`);
  }

  if (summary.invalidFiles.length > 0) {
    console.log("");
    console.log("Invalid JSON files:");
    for (const entry of summary.invalidFiles) {
      console.log(`- ${entry.file}: ${entry.error}`);
    }
  }

  if (summary.schemaMismatches.length > 0) {
    console.log("");
    console.log("Schema mismatches:");
    for (const entry of summary.schemaMismatches) {
      console.log(`- ${entry.file}: ${entry.schema}`);
    }
  }

  if (summary.forbiddenKeyFindings.length > 0) {
    console.log("");
    console.log("Forbidden key findings:");
    for (const entry of summary.forbiddenKeyFindings) {
      console.log(`- ${entry.file}: ${entry.keyPath}`);
    }
  }

  console.log("");
  console.log(summary.truthBoundary);
}

function fail(message, jsonOnly) {
  if (jsonOnly) {
    console.log(
      JSON.stringify(
        {
          schema: "cresco-key.mobile-g1-receipt-validation.v1",
          status: "INCOMPLETE",
          error: message,
        },
        null,
        2,
      ),
    );
  } else {
    console.error(message);
  }
  process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
