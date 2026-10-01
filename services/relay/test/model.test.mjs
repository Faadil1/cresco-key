import test from "node:test";
import assert from "node:assert/strict";

import {
  isRequestExpired,
  publicRequest,
  statusAfterEvent,
  validateCreatePayload,
  validateRelayEvent,
} from "../src/model.mjs";

const validPayload = {
  requestId: "ab".repeat(32),
  mandate: "Mandate111111111111111111111111111111111",
  mandateNonce: "7",
  mint: "Mint1111111111111111111111111111111111111",
  recipient: "Recipient1111111111111111111111111111111",
  amountBaseUnits: "12000000",
  requesterWallet: "Requester111111111111111111111111111111",
  guardianWallet: "Guardian1111111111111111111111111111111",
  expiresAt: 1893456000,
  display: {
    label: "Coffee Demo",
    reason: "Outside your 10 USDC Key",
  },
};

test("validates canonical boundary request fields", () => {
  const value = validateCreatePayload(validPayload);
  assert.equal(value.requestId, validPayload.requestId);
  assert.equal(value.amountBaseUnits, "12000000");
  assert.equal(value.mandateNonce, "7");
});

test("refuses non-integer or zero amount", () => {
  assert.throws(
    () => validateCreatePayload({ ...validPayload, amountBaseUnits: "0" }),
    /INVALID_AMOUNT_BASE_UNITS/,
  );
  assert.throws(
    () => validateCreatePayload({ ...validPayload, amountBaseUnits: "12.5" }),
    /INVALID_AMOUNT_BASE_UNITS/,
  );
});

test("allowance submitted is not named ALLOW", () => {
  const event = validateRelayEvent({
    type: "ALLOWANCE_SUBMITTED",
    txSignature: "sig123",
  });
  assert.equal(event.type, "ALLOWANCE_SUBMITTED");
  assert.equal(statusAfterEvent("PENDING", event.type), "ALLOWANCE_SUBMITTED");
});

test("terminal refusal cannot be overwritten by a later submitted event", () => {
  assert.equal(
    statusAfterEvent("REFUSED", "ALLOWANCE_SUBMITTED"),
    "REFUSED",
  );
});

test("submitted allowance marker cannot be downgraded by later relay events", () => {
  assert.equal(
    statusAfterEvent("ALLOWANCE_SUBMITTED", "REFUSED"),
    "ALLOWANCE_SUBMITTED",
  );
  assert.equal(
    statusAfterEvent("ALLOWANCE_SUBMITTED", "EXPIRED"),
    "ALLOWANCE_SUBMITTED",
  );
});

test("expired request remains expired", () => {
  assert.equal(statusAfterEvent("EXPIRED", "GUARDIAN_OPENED"), "EXPIRED");
  assert.equal(statusAfterEvent("EXPIRED", "ALLOWANCE_SUBMITTED"), "EXPIRED");
});

test("request expiry is fail-closed at the expiry second", () => {
  assert.equal(isRequestExpired(null, 100), false);
  assert.equal(isRequestExpired(101, 100), false);
  assert.equal(isRequestExpired(100, 100), true);
  assert.equal(isRequestExpired(99, 100), true);
});

test("public request strips capability hash", () => {
  const publicValue = publicRequest({
    ...validPayload,
    relayTokenHash: "secret-hash",
    status: "PENDING",
  });
  assert.equal("relayTokenHash" in publicValue, false);
});

test("guardian submitted event requires a tx signature", () => {
  assert.throws(
    () => validateRelayEvent({ type: "ALLOWANCE_SUBMITTED" }),
    /INVALID_TXSIGNATURE/,
  );
});
