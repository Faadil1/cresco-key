import { isSignature, type Signature } from "@solana/kit";

export type TransactionOutcome =
  | {
      state: "ALLOW";
      signature: Signature;
      confirmationStatus: string | null;
    }
  | {
      state: "REFUSE";
      signature: Signature;
      error: unknown;
    }
  | {
      state: "UNKNOWN";
      signature: Signature | null;
      error: unknown;
    };

type RpcLike = {
  getSignatureStatuses(signatures: Signature[]): {
    send(): Promise<{
      value: Array<
        | {
            err: unknown;
            confirmationStatus?: string | null;
          }
        | null
      >;
    }>;
  };
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function classifyProgramSubmissionError(
  error: unknown,
): "REFUSE" | "UNKNOWN" {
  const text =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  const knownRefusalMarkers = [
    "ActionAmountExceeded",
    "PeriodAmountExceeded",
    "AllowanceAlreadyUsed",
    "StaleAllowance",
    "AllowanceExpired",
    "AllowanceRequestMismatch",
    "PaymentAllowanceAmountMismatch",
    "PaymentAllowanceRecipientMismatch",
    "PaymentDestinationNotRecipientAta",
    "StaleNonce",
    "MandateNotActive",
    "MandateExpired",
    "ActionNotAllowed",
    "AssetRuleDisabled",
  ];

  return knownRefusalMarkers.some((marker) => text.includes(marker))
    ? "REFUSE"
    : "UNKNOWN";
}

export async function waitForTransactionOutcome(
  rpc: RpcLike,
  rawSignature: string,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<TransactionOutcome> {
  if (!isSignature(rawSignature)) {
    return {
      state: "UNKNOWN",
      signature: null,
      error: "INVALID_TRANSACTION_SIGNATURE",
    };
  }

  const attempts = options.attempts ?? 12;
  const delayMs = options.delayMs ?? 750;

  for (let i = 0; i < attempts; i += 1) {
    const {
      value: [status],
    } = await rpc.getSignatureStatuses([rawSignature]).send();

    if (status?.err) {
      return {
        state: "REFUSE",
        signature: rawSignature,
        error: status.err,
      };
    }

    if (
      status &&
      (status.confirmationStatus === "confirmed" ||
        status.confirmationStatus === "finalized")
    ) {
      return {
        state: "ALLOW",
        signature: rawSignature,
        confirmationStatus: status.confirmationStatus ?? null,
      };
    }

    await delay(delayMs);
  }

  return {
    state: "UNKNOWN",
    signature: rawSignature,
    error: "SIGNATURE_STATUS_TIMEOUT",
  };
}
