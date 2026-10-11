import { address, type Address } from "@solana/kit";
import {
  derivePaymentAccounts,
  type PaymentProgramConfig,
} from "./programClient";

/**
 * Capital-path READINESS is based on actual read-only Devnet RPC accounts.
 * It does NOT verify the live mandate nonce or spending policy, authorize,
 * simulate, broadcast, or assert a successful payment.
 */
export type PaymentReadiness =
  | {
      state: "READY_FOR_WALLET_ATTEMPT";
      evidence: ReadonlyArray<string>;
      caveat: string;
    }
  | {
      state: "BLOCKED";
      reasons: ReadonlyArray<string>;
      evidence: ReadonlyArray<string>;
    }
  | {
      state: "UNKNOWN";
      reason: string;
      evidence: ReadonlyArray<string>;
    };

export type ReadinessRpc = {
  getAccountInfo(account: Address, options: { encoding: "base64" }): {
    send(): Promise<{
      value: null | {
        owner: Address | string;
        executable?: boolean;
      };
    }>;
  };
  getBalance(account: Address): {
    send(): Promise<{ value: bigint | number }>;
  };
  getTokenAccountBalance(account: Address): {
    send(): Promise<{ value: { amount: string } }>;
  };
};

export type ReadinessInputs = {
  chain: string | null | undefined;
  connectedWallet: string;
  expectedBeneficiary?: string;
  config: PaymentProgramConfig;
  mint: string;
  recipient: string;
  requestedAmountBaseUnits: bigint;
};

const NON_AUTHORITY_CAVEAT =
  "These are live read-only account and balance checks, not a mandate policy " +
  "or nonce verification and not a successful Devnet payment. The CRESCO " +
  "program is the financial guard.";

export async function checkPaymentReadiness(
  rpc: ReadinessRpc,
  input: ReadinessInputs,
): Promise<PaymentReadiness> {
  const evidence: string[] = [];
  const reasons: string[] = [];
  if (input.chain !== "solana:devnet") {
    return { state: "BLOCKED", reasons: ["CONNECTED_WALLET_NOT_DEVNET"], evidence };
  }
  // An old APK's configured sample beneficiary is only a DEMO hint.
  // Real payments are bound to the connected wallet's derived onchain
  // charter/mandate, which inspectStandingKey validates before signing.
  if (input.expectedBeneficiary &&
      input.connectedWallet !== input.expectedBeneficiary) {
    return {
      state: "BLOCKED",
      reasons: ["CONNECTED_WALLET_NOT_PROVISIONED_BENEFICIARY"],
      evidence,
    };
  }
  if (input.requestedAmountBaseUnits <= 0n) {
    return { state: "BLOCKED", reasons: ["INVALID_PAYMENT_AMOUNT"], evidence };
  }

  let accounts: Awaited<ReturnType<typeof derivePaymentAccounts>>;
  try {
    accounts = await derivePaymentAccounts({
      config: input.config,
      beneficiary: address(input.connectedWallet),
      mint: address(input.mint),
      recipient: address(input.recipient),
    });
  } catch {
    return { state: "BLOCKED", reasons: ["INVALID_PAYMENT_ADDRESSES"], evidence };
  }

  // Check the program itself as well as the on-chain charter and mandate
  // belonging to THIS wallet. UI labels/config are never proof of custody.
  const probes = [
    ["PROGRAM", input.config.programId, null, true],
    ["CHARTER", accounts.charter, input.config.programId, false],
    ["MANDATE", accounts.mandate, input.config.programId, false],
    ["ASSET_RULE", accounts.assetRule, input.config.programId, false],
    ["VAULT", accounts.vault, input.config.tokenProgramId, false],
    ["MINT", address(input.mint), input.config.tokenProgramId, false],
    ["RECIPIENT_ATA", accounts.destinationAta, input.config.tokenProgramId, false],
  ] as const;

  try {
    for (const [label, key, expectedOwner, executable] of probes) {
      const found = (await rpc.getAccountInfo(key, { encoding: "base64" }).send()).value;
      if (!found) {
        reasons.push(`${label}_ACCOUNT_NOT_FOUND`);
        continue;
      }
      if (expectedOwner && String(found.owner) !== String(expectedOwner)) {
        reasons.push(`${label}_OWNER_MISMATCH`);
        continue;
      }
      if (executable && found.executable !== true) {
        reasons.push("PROGRAM_NOT_EXECUTABLE");
        continue;
      }
      evidence.push(`${label}:${key.toString()}`);
    }

    const balance = await rpc.getBalance(address(input.connectedWallet)).send();
    if (BigInt(balance.value) === 0n) {
      reasons.push("WALLET_NO_DEVNET_SOL_FOR_FEES");
    } else {
      evidence.push("WALLET_DEVNET_SOL_NONZERO");
    }

    if (!reasons.some((value) => value.startsWith("VAULT_"))) {
      const vaultBalance = await rpc.getTokenAccountBalance(accounts.vault).send();
      const available = BigInt(vaultBalance.value.amount);
      if (available < input.requestedAmountBaseUnits) {
        reasons.push("VAULT_INSUFFICIENT_TOKEN_BALANCE");
      } else {
        evidence.push("VAULT_TOKEN_BALANCE_COVERS_REQUEST");
      }
    }
  } catch (error) {
    return {
      state: "UNKNOWN",
      reason: error instanceof Error ? error.message : "DEVNET_RPC_READ_FAILED",
      evidence,
    };
  }

  if (reasons.length > 0) {
    return { state: "BLOCKED", reasons, evidence };
  }
  return {
    state: "READY_FOR_WALLET_ATTEMPT",
    evidence,
    caveat: NON_AUTHORITY_CAVEAT,
  };
}
