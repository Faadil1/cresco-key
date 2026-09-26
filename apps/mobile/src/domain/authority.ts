export type DecisionState = "ALLOW" | "REFUSE" | "PENDING" | "UNKNOWN";

export type PaymentAction = {
  kind: "PAYMENT";
  mandate: string;
  mandateNonce: bigint;
  mint: string;
  destination: string;
  amountBaseUnits: bigint;
  requestId: string;
};

export type BoundaryRequestStatus =
  | "CREATED"
  | "REFUSED"
  | "ALLOWANCE_GRANTED"
  | "CONSUMED"
  | "EXPIRED";

export type BoundaryRequest = {
  id: string;
  action: PaymentAction;
  status: BoundaryRequestStatus;
  createdAt: string;
};

export const PRODUCT_INVARIANTS = {
  learningNeverWidensAuthority: true,
  contextNeverMintsAuthority: true,
  unknownIsNotSuccess: true,
  allowanceIsSingleUse: true,
} as const;
