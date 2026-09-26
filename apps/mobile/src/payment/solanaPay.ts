const BASE58_PUBLIC_KEY = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const DECIMAL_AMOUNT = /^(0|[1-9][0-9]*)(?:\.([0-9]+))?$/;

export type SolanaPayTransferIntent = {
  recipient: string;
  amountUi: string;
  mint: string;
  label: string | null;
  message: string | null;
  memo: string | null;
  references: string[];
  raw: string;
};

function singleParam(params: URLSearchParams, key: string): string | null {
  const values = params.getAll(key);
  if (values.length > 1) {
    throw new Error(`MULTIPLE_${key.toUpperCase().replace("-", "_")}`);
  }
  return values[0] ?? null;
}

export function parseSolanaPayTransferRequest(
  raw: string,
): SolanaPayTransferIntent {
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().startsWith("solana:")) {
    throw new Error("NOT_SOLANA_PAY");
  }

  const url = new URL(trimmed);
  const recipient = decodeURIComponent(url.pathname);

  if (!BASE58_PUBLIC_KEY.test(recipient)) {
    throw new Error("INVALID_RECIPIENT");
  }

  const amountUi = singleParam(url.searchParams, "amount");
  const mint = singleParam(url.searchParams, "spl-token");

  if (!amountUi || !DECIMAL_AMOUNT.test(amountUi) || Number(amountUi) <= 0) {
    throw new Error("P0_REQUIRES_POSITIVE_AMOUNT");
  }

  if (!mint || !BASE58_PUBLIC_KEY.test(mint)) {
    throw new Error("P0_REQUIRES_SPL_TOKEN_MINT");
  }

  return {
    recipient,
    amountUi,
    mint,
    label: singleParam(url.searchParams, "label"),
    message: singleParam(url.searchParams, "message"),
    memo: singleParam(url.searchParams, "memo"),
    references: url.searchParams.getAll("reference"),
    raw: trimmed,
  };
}

export function decimalToBaseUnits(value: string, decimals: number): string {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("INVALID_TOKEN_DECIMALS");
  }

  const match = DECIMAL_AMOUNT.exec(value);
  if (!match) throw new Error("INVALID_DECIMAL_AMOUNT");

  const whole = match[1];
  const fraction = match[2] ?? "";

  if (fraction.length > decimals) {
    throw new Error("AMOUNT_EXCEEDS_TOKEN_DECIMALS");
  }

  const padded = fraction.padEnd(decimals, "0");
  const baseUnits = `${whole}${padded}`.replace(/^0+(?=\d)/, "");
  return baseUnits || "0";
}
