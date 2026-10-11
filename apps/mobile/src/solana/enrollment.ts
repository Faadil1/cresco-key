import {
  address,
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
} from "@solana/kit";

// Public, noncustodial onboarding discovery. This module does not provision
// authority: initialize_charter requires BOTH distinct wallets to sign.
const text = new TextEncoder();
const encoder = getAddressEncoder();

export function parseDistinctGuardianWallet(raw: string, beneficiary: Address): Address {
  const normalized = raw.trim();
  if (!normalized) throw new Error("GUARDIAN_PUBLIC_ADDRESS_REQUIRED");
  let guardian: Address;
  try {
    guardian = address(normalized);
    if (encoder.encode(guardian).length !== 32) throw new Error("INVALID_LENGTH");
  } catch {
    throw new Error("INVALID_GUARDIAN_PUBLIC_ADDRESS");
  }
  if (guardian === beneficiary) {
    throw new Error("GUARDIAN_MUST_BE_DISTINCT_FROM_BENEFICIARY");
  }
  return guardian;
}

export async function deriveEnrollmentAccounts(
  programId: Address,
  beneficiary: Address,
): Promise<{ charter: Address; mandate: Address }> {
  const [charter] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [text.encode("charter"), encoder.encode(beneficiary)],
  });
  const [mandate] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [text.encode("mandate"), encoder.encode(charter)],
  });
  return { charter, mandate };
}

export type EnrollmentInspection = {
  beneficiary: string;
  charter: string;
  mandate: string;
  charterExists: boolean;
  mandateExists: boolean;
  walletBalanceLamports: string;
  inspectedAt: string;
  status: "NOT_PROVISIONED" | "PARTIAL_SETUP" | "ACCOUNTS_PRESENT_UNVERIFIED";
};
