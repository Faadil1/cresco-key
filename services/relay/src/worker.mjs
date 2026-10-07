import {
  isRequestExpired,
  publicRequest,
  statusAfterEvent,
  validateCreatePayload,
  validateRelayEvent,
} from "./model.mjs";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bearerToken(request) {
  const value = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([0-9a-f]{64})$/i.exec(value);
  return match?.[1]?.toLowerCase() ?? null;
}

export function relayReadiness(env) {
  const boundaryRequests = env?.BOUNDARY_REQUESTS;
  const durableObjectConfigured =
    typeof boundaryRequests?.idFromName === "function" &&
    typeof boundaryRequests?.get === "function";

  return {
    ok: durableObjectConfigured,
    service: "cresco-key-boundary-relay",
    authority: "coordination-only",
    checks: {
      boundaryRequestsDurableObject: durableObjectConfigured
        ? "configured"
        : "missing",
    },
  };
}

function expirePendingRecord(record, nowMs) {
  if (
    record.status !== "PENDING" ||
    !isRequestExpired(record.expiresAt, Math.floor(nowMs / 1000))
  ) {
    return null;
  }

  return {
    ...record,
    status: "EXPIRED",
    updatedAt: nowMs,
    events: [
      ...record.events,
      { type: "EXPIRED", at: nowMs, txSignature: null },
    ],
  };
}

export class BoundaryRequestObject {
  constructor(state) {
    this.state = state;
  }

  async authorizedRecord(request) {
    const token = bearerToken(request);
    if (!token) return { response: json({ error: "UNAUTHORIZED" }, 401) };

    const record = await this.state.storage.get("request");
    if (!record) return { response: json({ error: "NOT_FOUND" }, 404) };

    const tokenHash = await sha256Hex(token);
    if (tokenHash !== record.relayTokenHash) {
      return { response: json({ error: "UNAUTHORIZED" }, 401) };
    }

    return { record };
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/create" && request.method === "POST") {
      const existing = await this.state.storage.get("request");
      if (existing) return json({ error: "REQUEST_EXISTS" }, 409);

      try {
        const payload = validateCreatePayload(await request.json());
        const now = Date.now();

        if (isRequestExpired(payload.expiresAt, Math.floor(now / 1000))) {
          return json({ error: "INVALID_EXPIRES_AT" }, 400);
        }

        const token = randomToken();
        const relayTokenHash = await sha256Hex(token);

        const record = {
          ...payload,
          status: "PENDING",
          relayTokenHash,
          createdAt: now,
          updatedAt: now,
          events: [{ type: "CREATED", at: now, txSignature: null }],
        };

        await this.state.storage.put("request", record);

        return json(
          {
            request: publicRequest(record),
            relayToken: token,
          },
          201,
        );
      } catch (error) {
        return json(
          {
            error: error instanceof Error ? error.message : "INVALID_REQUEST",
          },
          400,
        );
      }
    }

    if (url.pathname === "/read" && request.method === "GET") {
      const auth = await this.authorizedRecord(request);
      if (auth.response) return auth.response;

      let record = auth.record;
      const expired = expirePendingRecord(record, Date.now());
      if (expired) {
        record = expired;
        await this.state.storage.put("request", record);
      }

      return json({ request: publicRequest(record) });
    }

    if (url.pathname === "/event" && request.method === "POST") {
      const auth = await this.authorizedRecord(request);
      if (auth.response) return auth.response;

      try {
        const event = validateRelayEvent(await request.json());
        const at = Date.now();

        let current = auth.record;
        const expired = expirePendingRecord(current, at);
        if (expired) {
          current = expired;
          await this.state.storage.put("request", current);
          return json({ request: publicRequest(current) });
        }

        if (current.status !== "PENDING") {
          return json({ request: publicRequest(current) });
        }

        const record = {
          ...current,
          status: statusAfterEvent(current.status, event.type),
          updatedAt: at,
          events: [...current.events, { ...event, at }],
        };

        await this.state.storage.put("request", record);

        return json({ request: publicRequest(record) });
      } catch (error) {
        return json(
          {
            error: error instanceof Error ? error.message : "INVALID_EVENT",
          },
          400,
        );
      }
    }

    return json({ error: "NOT_FOUND" }, 404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "cresco-key-boundary-relay",
        authority: "coordination-only",
      });
    }

    if (url.pathname === "/ready" && request.method === "GET") {
      const readiness = relayReadiness(env);
      return json(readiness, readiness.ok ? 200 : 503);
    }

    if (url.pathname === "/v1/requests" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "INVALID_JSON" }, 400);
      }

      if (typeof body?.requestId !== "string") {
        return json({ error: "INVALID_REQUEST_ID" }, 400);
      }

      const id = env.BOUNDARY_REQUESTS.idFromName(body.requestId.toLowerCase());
      const stub = env.BOUNDARY_REQUESTS.get(id);

      return stub.fetch("https://relay.internal/create", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
      });
    }

    const match = /^\/v1\/requests\/([0-9a-f]{64})(?:\/events)?$/i.exec(
      url.pathname,
    );

    if (!match) return json({ error: "NOT_FOUND" }, 404);

    const requestId = match[1].toLowerCase();
    const id = env.BOUNDARY_REQUESTS.idFromName(requestId);
    const stub = env.BOUNDARY_REQUESTS.get(id);
    const authorization = request.headers.get("authorization") ?? "";

    if (url.pathname.endsWith("/events") && request.method === "POST") {
      return stub.fetch("https://relay.internal/event", {
        method: "POST",
        headers: {
          ...JSON_HEADERS,
          authorization,
        },
        body: await request.text(),
      });
    }

    if (request.method === "GET") {
      return stub.fetch("https://relay.internal/read", {
        method: "GET",
        headers: { authorization },
      });
    }

    return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  },
};
