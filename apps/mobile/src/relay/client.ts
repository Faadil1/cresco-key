export type BoundaryRelayRequest = {
  requestId: string;
  mandate: string;
  mandateNonce: string;
  mint: string;
  recipient: string;
  amountBaseUnits: string;
  requesterWallet: string;
  guardianWallet: string;
  expiresAt: number | null;
  display: {
    label: string | null;
    reason: string | null;
  } | null;
  status: "PENDING" | "REFUSED" | "ALLOWANCE_SUBMITTED" | "EXPIRED";
  createdAt: number;
  updatedAt: number;
  events: Array<{
    type: string;
    at: number;
    txSignature: string | null;
  }>;
};

export type CreateBoundaryRequestInput = {
  requestId: string;
  mandate: string;
  mandateNonce: string;
  mint: string;
  recipient: string;
  amountBaseUnits: string;
  requesterWallet: string;
  guardianWallet: string;
  expiresAt?: number | null;
  display?: {
    label?: string | null;
    reason?: string | null;
  } | null;
};

function relayBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_BOUNDARY_RELAY_URL?.trim();
  if (!value) throw new Error("BOUNDARY_RELAY_NOT_CONFIGURED");
  return value.replace(/\/$/, "");
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code =
      body && typeof body === "object" && "error" in body
        ? String(body.error)
        : `HTTP_${response.status}`;
    throw new Error(code);
  }
  return body;
}

export async function createBoundaryRequest(
  input: CreateBoundaryRequestInput,
): Promise<{ request: BoundaryRelayRequest; relayToken: string }> {
  const response = await fetch(`${relayBaseUrl()}/v1/requests`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson(response);
}

export async function getBoundaryRequest(
  requestId: string,
  relayToken: string,
): Promise<BoundaryRelayRequest> {
  const response = await fetch(
    `${relayBaseUrl()}/v1/requests/${encodeURIComponent(requestId)}`,
    {
      headers: { authorization: `Bearer ${relayToken}` },
    },
  );
  const body = await readJson(response);
  return body.request as BoundaryRelayRequest;
}

export async function postBoundaryRelayEvent(
  requestId: string,
  relayToken: string,
  event:
    | { type: "GUARDIAN_OPENED" | "REFUSED" | "EXPIRED" }
    | { type: "ALLOWANCE_SUBMITTED"; txSignature: string },
): Promise<BoundaryRelayRequest> {
  const response = await fetch(
    `${relayBaseUrl()}/v1/requests/${encodeURIComponent(requestId)}/events`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${relayToken}`,
      },
      body: JSON.stringify(event),
    },
  );
  const body = await readJson(response);
  return body.request as BoundaryRelayRequest;
}
