export const REQUEST_ID_PATTERN = /^[0-9a-f]{64}$/i;

export const REQUEST_STATUSES = Object.freeze([
  "PENDING",
  "REFUSED",
  "ALLOWANCE_SUBMITTED",
  "EXPIRED",
]);

export const RELAY_EVENT_TYPES = Object.freeze([
  "GUARDIAN_OPENED",
  "REFUSED",
  "ALLOWANCE_SUBMITTED",
  "EXPIRED",
]);

function requireString(value, field, { max = 256 } = {}) {
  if (typeof value !== "string" || value.length === 0 || value.length > max) {
    throw new Error(`INVALID_${field.toUpperCase()}`);
  }
  return value;
}

export function validateCreatePayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_BODY");
  }

  const requestId = requireString(input.requestId, "requestId", { max: 64 });
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    throw new Error("INVALID_REQUEST_ID");
  }

  const amountBaseUnits = requireString(input.amountBaseUnits, "amountBaseUnits", {
    max: 32,
  });
  if (!/^[1-9][0-9]*$/.test(amountBaseUnits)) {
    throw new Error("INVALID_AMOUNT_BASE_UNITS");
  }

  const mandateNonce = requireString(input.mandateNonce, "mandateNonce", {
    max: 32,
  });
  if (!/^(0|[1-9][0-9]*)$/.test(mandateNonce)) {
    throw new Error("INVALID_MANDATE_NONCE");
  }

  const expiresAt =
    input.expiresAt === null || input.expiresAt === undefined
      ? null
      : Number(input.expiresAt);

  if (
    expiresAt !== null &&
    (!Number.isSafeInteger(expiresAt) || expiresAt <= 0)
  ) {
    throw new Error("INVALID_EXPIRES_AT");
  }

  const display =
    input.display && typeof input.display === "object" && !Array.isArray(input.display)
      ? {
          label:
            typeof input.display.label === "string"
              ? input.display.label.slice(0, 120)
              : null,
          reason:
            typeof input.display.reason === "string"
              ? input.display.reason.slice(0, 280)
              : null,
        }
      : null;

  return {
    requestId: requestId.toLowerCase(),
    mandate: requireString(input.mandate, "mandate"),
    mandateNonce,
    mint: requireString(input.mint, "mint"),
    recipient: requireString(input.recipient, "recipient"),
    amountBaseUnits,
    requesterWallet: requireString(input.requesterWallet, "requesterWallet"),
    guardianWallet: requireString(input.guardianWallet, "guardianWallet"),
    expiresAt,
    display,
  };
}

export function validateRelayEvent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_EVENT");
  }

  if (!RELAY_EVENT_TYPES.includes(input.type)) {
    throw new Error("INVALID_EVENT_TYPE");
  }

  const event = {
    type: input.type,
    txSignature: null,
  };

  if (input.type === "ALLOWANCE_SUBMITTED") {
    event.txSignature = requireString(input.txSignature, "txSignature", {
      max: 128,
    });
  }

  return event;
}

export function isRequestExpired(expiresAt, nowSeconds) {
  return expiresAt !== null && nowSeconds >= expiresAt;
}

export function statusAfterEvent(currentStatus, eventType) {
  // Relay states are monotonic. Once a coordination request has reached a
  // terminal outcome, later bearer-capability events cannot rewrite history.
  if (currentStatus !== "PENDING") {
    return currentStatus;
  }

  switch (eventType) {
    case "REFUSED":
      return "REFUSED";
    case "ALLOWANCE_SUBMITTED":
      return "ALLOWANCE_SUBMITTED";
    case "EXPIRED":
      return "EXPIRED";
    default:
      return currentStatus;
  }
}

export function publicRequest(record) {
  const { relayTokenHash: _relayTokenHash, ...safe } = record;
  return safe;
}
