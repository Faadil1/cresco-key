import { isSignature, type Signature } from "@solana/kit";

export type TransactionOutcome =
  | {
      state: "ALLOW";
      signature: Signature;
      confirmationStatus: string | null;
    }
  | {
      state: "REFUSE";
      signature: Signature | null;
      evidence: string;
    }
  | {
      state: "UNKNOWN";
      signature: Signature | null;
      error: unknown;
    };

type RpcLike = {
  getSignatureStatuses(signatures: Signature[]): {
    send(): Promise<{
      value: ReadonlyArray<
        | Readonly<{
            err: unknown;
            confirmationStatus?: string | null;
          }>
        | null
      >;
    }>;
  };
  getTransaction(
    signature: Signature,
    config: {
      commitment: "confirmed";
      encoding: "json";
      maxSupportedTransactionVersion: 0;
    },
  ): {
    send(): Promise<
      | {
          meta?: {
            err?: unknown;
            logMessages?: ReadonlyArray<string> | null;
          } | null;
        }
      | null
    >;
  };
};

const KNOWN_REFUSAL_MARKERS = [
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
] as const;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function knownRefusalEvidence(value: unknown): string | null {
  const text = errorText(value);
  const marker = KNOWN_REFUSAL_MARKERS.find((candidate) =>
    text.includes(candidate),
  );
  return marker ?? null;
}

export function classifyProgramSubmissionError(
  error: unknown,
): TransactionOutcome {
  const evidence = knownRefusalEvidence(error);
  if (evidence) {
    return {
      state: "REFUSE",
      signature: null,
      evidence,
    };
  }

  return {
    state: "UNKNOWN",
    signature: null,
    error,
  };
}

async function classifyConfirmedFailure(
  rpc: RpcLike,
  signature: Signature,
  statusError: unknown,
): Promise<TransactionOutcome> {
  try {
    const transaction = await rpc
      .getTransaction(signature, {
        commitment: "confirmed",
        encoding: "json",
        maxSupportedTransactionVersion: 0,
      })
      .send();

    const logs = transaction?.meta?.logMessages ?? [];
    const evidence = knownRefusalEvidence(logs.join("\n"));
    if (evidence) {
      return {
        state: "REFUSE",
        signature,
        evidence,
      };
    }
  } catch {
    // Preserve fail-closed behavior below.
  }

  return {
    state: "UNKNOWN",
    signature,
    error: statusError,
  };
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
      return classifyConfirmedFailure(rpc, rawSignature, status.err);
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
