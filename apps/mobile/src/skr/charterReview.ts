/**
 * SKR bonus access utility: a grounded, non-authoritative Family Charter
 * review for the current CRESCO Key. This file never builds transactions,
 * writes onchain accounts, or changes parent/young spending authority.
 */

export type LiveCharterRule = {
  mint: string;
  actionCapBaseUnits: bigint;
  periodCapBaseUnits: bigint;
  spentBaseUnits: bigint;
  nonce: bigint;
  periodSeconds: bigint;
  decimals: number;
};

export type FamilyReviewTopic = "independence" | "exception" | "review";

export function tokenUnits(amount: bigint, decimals: number): string {
  if (amount < 0n || !Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("INVALID_REVIEW_AMOUNT_OR_DECIMALS");
  }
  const unit = 10n ** BigInt(decimals);
  const whole = (amount / unit).toString();
  if (decimals === 0) return whole;
  const fraction = (amount % unit).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function createFamilyCharterReview(input: {
  rule: LiveCharterRule;
  topic: FamilyReviewTopic;
  familyNote: string;
}): string {
  const { rule, topic } = input;
  if (!["independence", "exception", "review"].includes(topic)) {
    throw new Error("UNRECOGNIZED_FAMILY_REVIEW_TOPIC");
  }
  const note = input.familyNote.trim();
  if (!note || note.length > 240) {
    throw new Error("REVIEW_NOTE_REQUIRED_MAX_240_CHARS");
  }
  if (rule.spentBaseUnits < 0n || rule.periodSeconds <= 0n ||
      rule.actionCapBaseUnits <= 0n ||
      rule.periodCapBaseUnits < rule.actionCapBaseUnits) {
    throw new Error("INVALID_OBSERVED_KEY_POLICY");
  }
  const action = tokenUnits(rule.actionCapBaseUnits, rule.decimals);
  const period = tokenUnits(rule.periodCapBaseUnits, rule.decimals);
  const spent = tokenUnits(rule.spentBaseUnits, rule.decimals);
  const remaining = tokenUnits(
    rule.periodCapBaseUnits > rule.spentBaseUnits
      ? rule.periodCapBaseUnits - rule.spentBaseUnits : 0n,
    rule.decimals,
  );
  const prompt = topic === "independence"
    ? "Which purchases should be independent within this standing Key?"
    : topic === "exception"
      ? "Which exact recipient, amount and purpose deserve a ONE-TIME approval without increasing the Key?"
      : "Should the family keep the current limits, or discuss a separate permanent guardian change?";

  // Do not share the guardian/beneficiary wallet addresses, relay capability,
  // signatures, SKR balance, or exact spending identity by default.
  return [
    "CRESCO Key · SKR Family Charter Atelier",
    "PRIVATE FAMILY DISCUSSION — NOT FINANCIAL AUTHORIZATION",
    "",
    "Observed CRESCO Solana Devnet rule at the time of this review:",
    `Token mint: ${rule.mint}`,
    `Per-action standing limit: ${action} tokens`,
    `Per-period standing limit: ${period} tokens`,
    `Spent this period (last observed): ${spent} tokens`,
    `Remaining by period cap (estimate): ${remaining} tokens`,
    `Mandate nonce (last observed): ${rule.nonce.toString()}`,
    "",
    `Family question: ${prompt}`,
    `Our discussion: ${note}`,
    "",
    "This is an optional SKR-access family discussion based on read-only",
    "onchain observations. It is not a guardian signature, rule update,",
    "recipient consent, live payment, or transaction receipt.",
    "Limits may already have changed. Re-read the actual CRESCO Key before",
    "any future payment. Only the onchain program and wallet signatures",
    "can grant, refuse, consume, or widen financial authority.",
  ].join("\n");
}
