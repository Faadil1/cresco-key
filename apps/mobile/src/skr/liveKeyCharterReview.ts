import type { StandingKeySnapshot } from "../solana/standingKey";

// A valuable optional SKR-holder review of REAL, independently inspected
// Devnet Key authority. No invented chart, simulated payment or transaction.
export type SkrKeyReview = {
  schema: "cresco-key.skr-optional-public-key-review.v1";
  source: "LIVE_DEVNET_STANDING_KEY_SNAPSHOT";
  authority: "READ_ONLY_REVIEW_NOT_FINANCIAL_AUTHORIZATION";
  inspectedAt: string;
  reviewerWallet: string;
  reviewerRole: "GUARDIAN" | "BENEFICIARY";
  charter: string;
  mandate: string;
  mint: string;
  guardian: string;
  beneficiary: string;
  nonce: string;
  stage: number;
  mandateStatus: number;
  ruleEnabled: boolean;
  maxActionBaseUnits: string;
  maxPeriodBaseUnits: string;
  spentThisPeriodBaseUnits: string;
  remainingPeriodBaseUnits: string;
  expiresAtUnixSeconds: string;
  status: "REVIEW_ACTIVE_RULE" | "REVIEW_INACTIVE_RULE" | "INCONSISTENT_LIVE_SNAPSHOT";
  caveat: string;
};

export function buildLiveSkrKeyReview(
  key: StandingKeySnapshot,
  reviewerWallet: string,
  inspectedAt: string,
): SkrKeyReview {
  if (!reviewerWallet || !inspectedAt || Number.isNaN(Date.parse(inspectedAt))) {
    throw new Error("LIVE_KEY_REVIEW_CONTEXT_MISSING");
  }
  const reviewerRole = reviewerWallet === key.guardian.toString()
    ? "GUARDIAN"
    : reviewerWallet === key.beneficiary.toString()
      ? "BENEFICIARY" : null;
  if (!reviewerRole) throw new Error("REVIEWER_IS_NOT_A_CHARTER_PARTICIPANT");

  const inconsistent = key.maxActionAmount < 0n ||
    key.maxPeriodAmount < 0n ||
    key.spentThisPeriod < 0n ||
    key.spentThisPeriod > key.maxPeriodAmount;
  const remaining = !inconsistent
    ? key.maxPeriodAmount - key.spentThisPeriod
    : 0n;
  const status = inconsistent
    ? "INCONSISTENT_LIVE_SNAPSHOT"
    : key.mandateStatus === 0 && key.ruleEnabled
      ? "REVIEW_ACTIVE_RULE"
      : "REVIEW_INACTIVE_RULE";

  return {
    schema: "cresco-key.skr-optional-public-key-review.v1",
    source: "LIVE_DEVNET_STANDING_KEY_SNAPSHOT",
    authority: "READ_ONLY_REVIEW_NOT_FINANCIAL_AUTHORIZATION",
    inspectedAt,
    reviewerWallet,
    reviewerRole,
    charter: key.charter.toString(),
    mandate: key.mandate.toString(),
    mint: key.mint.toString(),
    guardian: key.guardian.toString(),
    beneficiary: key.beneficiary.toString(),
    nonce: key.nonce.toString(),
    stage: key.mandateStage,
    mandateStatus: key.mandateStatus,
    ruleEnabled: key.ruleEnabled,
    maxActionBaseUnits: key.maxActionAmount.toString(),
    maxPeriodBaseUnits: key.maxPeriodAmount.toString(),
    spentThisPeriodBaseUnits: key.spentThisPeriod.toString(),
    remainingPeriodBaseUnits: remaining.toString(),
    expiresAtUnixSeconds: key.mandateExpiryUnixSeconds.toString(),
    status,
    caveat: "Base units only. Snapshot may become stale immediately. Balances, spendability, expiry, signature authorization and vault funds are NOT verified by this review. This does not grant, change or consume a Key. SKR status is optional and separate from Solana Devnet.",
  };
}
