import test from "node:test";
import assert from "node:assert/strict";
import relayWorker, { BoundaryRequestObject } from "../src/worker.mjs";

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

test("guardian Key change report is separate from an exact allowance and needs a signature", () => {
  assert.throws(
    () => validateRelayEvent({ type: "KEY_CHANGE_REPORTED" }),
    /INVALID_TXSIGNATURE/,
  );
  const event = validateRelayEvent({ type: "KEY_CHANGE_REPORTED", txSignature: "devnetSig" });
  assert.equal(event.type, "KEY_CHANGE_REPORTED");
  assert.equal(event.txSignature, "devnetSig");
  assert.equal(statusAfterEvent("PENDING", event.type), "KEY_CHANGE_REPORTED");
  assert.equal(statusAfterEvent("KEY_CHANGE_REPORTED", "ALLOWANCE_SUBMITTED"), "KEY_CHANGE_REPORTED");
  assert.equal(statusAfterEvent("REFUSED", "KEY_CHANGE_REPORTED"), "REFUSED");
  assert.equal(statusAfterEvent("EXPIRED", "KEY_CHANGE_REPORTED"), "EXPIRED");
  // The relay marker never grants financial authority or transitions to ALLOW.
  assert.notEqual(statusAfterEvent("PENDING", event.type), "ALLOWANCE_SUBMITTED");
});


test("worker + Durable Object HTTP lifecycle: capability privacy, readiness and terminal coordination", async () => {
  const objects = new Map();
  const storageFor = (key) => {
    if (!objects.has(key)) {
      const records = new Map();
      const durable = new BoundaryRequestObject({
        storage: {
          get: async (name) => records.get(name) ?? null,
          put: async (name, value) => { records.set(name, value); },
        },
      });
      objects.set(key, durable);
    }
    return objects.get(key);
  };
  const env = {
    BOUNDARY_REQUESTS: {
      idFromName: (name) => name,
      get: (id) => ({
        fetch: (url, init) => storageFor(id).fetch(new Request(url, init)),
      }),
    },
  };
  const invoke = (url, init) => relayWorker.fetch(new Request(url, init), env);
  const origin = "https://relay.test.invalid";
  const ready = await invoke(origin + "/ready");
  assert.equal(ready.status, 200);
  assert.equal((await ready.json()).checks.boundaryRequestsDurableObject, "configured");
  const missingReady = await relayWorker.fetch(new Request(origin + "/ready"), {});
  assert.equal(missingReady.status, 503, "Missing binding must fail closed");

  const create = await invoke(origin + "/v1/requests", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(validPayload),
  });
  assert.equal(create.status, 201);
  const created = await create.json();
  assert.equal(created.request.status, "PENDING");
  assert.match(created.relayToken, /^[0-9a-f]{64}$/);
  assert.equal("relayTokenHash" in created.request, false);
  const target = origin + "/v1/requests/" + validPayload.requestId;

  const unauth = await invoke(target);
  assert.equal(unauth.status, 401);
  const wrong = await invoke(target, { headers: { authorization: "Bearer " + "fa".repeat(32) } });
  assert.equal(wrong.status, 401);
  const headers = { authorization: "Bearer " + created.relayToken, "content-type": "application/json" };
  const authorized = await invoke(target, { headers });
  assert.equal(authorized.status, 200);
  assert.equal((await authorized.json()).request.amountBaseUnits, validPayload.amountBaseUnits);
  const submitted = await invoke(target + "/events", {
    method: "POST", headers,
    body: JSON.stringify({ type: "ALLOWANCE_SUBMITTED", txSignature: "locally-reported-not-onchain-proven" }),
  });
  assert.equal(submitted.status, 200);
  assert.equal((await submitted.json()).request.status, "ALLOWANCE_SUBMITTED");
  const refusedLate = await invoke(target + "/events", {
    method: "POST", headers,
    body: JSON.stringify({ type: "REFUSED" }),
  });
  assert.equal(refusedLate.status, 200);
  assert.equal((await refusedLate.json()).request.status, "ALLOWANCE_SUBMITTED");
  const duplicate = await invoke(origin + "/v1/requests", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(validPayload),
  });
  assert.equal(duplicate.status, 409);
  // All outcomes above are relay markers only, never financial authority.
});
