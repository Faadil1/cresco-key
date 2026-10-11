import {
  AccountRole,
  address,
  getAddressEncoder,
  type Address,
  type Instruction,
} from "@solana/kit";
import { toByteArray } from "react-native-quick-base64";
import { derivePaymentAccounts, type PaymentProgramConfig } from "./programClient";

// Verified against programs/keys/src/lib.rs Anchor account and instruction layouts.
// Not a parallel authority engine: all standing-limit mutations are authorized
// and executed by the actual deployed CRESCO Key program and guardian wallet.
const CHARTER_DISCRIMINATOR = [106, 1, 38, 161, 57, 196, 214, 195];
const MANDATE_DISCRIMINATOR = [113, 216, 98, 159, 185, 63, 55, 18];
const ASSET_RULE_DISCRIMINATOR = [248, 91, 139, 218, 166, 90, 212, 244];
const UPDATE_RULE_DISCRIMINATOR = [251, 162, 6, 133, 5, 134, 145, 74];
const ACTIVE_MANDATE = 0;
const ACTION_TRANSFER = 1;
const U64_MAX = 18446744073709551615n;

type AccountInfo = {
  owner: Address | string;
  data: readonly [string, string];
};

export type StandingKeyRpc = {
  getAccountInfo(key: Address, options: { encoding: "base64" }): {
    send(): Promise<{ value: AccountInfo | null }>;
  };
};

export type StandingKeySnapshot = {
  charter: Address;
  mandate: Address;
  assetRule: Address;
  beneficiary: Address;
  mint: Address;
  programId: Address;
  guardian: Address;
  version: bigint;
  nonce: bigint;
  mandateStage: number;
  mandateStatus: number;
  mandateExpiryUnixSeconds: bigint;
  actionMask: number;
  ruleEnabled: boolean;
  maxActionAmount: bigint;
  maxPeriodAmount: bigint;
  periodSeconds: bigint;
  periodStartedAt: bigint;
  spentThisPeriod: bigint;
  maxUnitPriceMicroUsd: bigint;
  pythFeedId: number;
};

export type KeyInspection =
  | { state: "READY"; key: StandingKeySnapshot }
  | { state: "BLOCKED"; reason: string }
  | { state: "UNKNOWN"; reason: string };

const addressEncoder = getAddressEncoder();

function equalBytes(left: Uint8Array, right: ArrayLike<number>): boolean {
  if (left.length !== right.length) return false;
  return left.every((v, i) => v === right[i]);
}

function readRawAccount(info: AccountInfo, expectedOwner: Address, discriminator: number[], minimumSize: number): Uint8Array {
  if (String(info.owner) !== String(expectedOwner)) throw new Error("WRONG_ACCOUNT_PROGRAM_OWNER");
  if (!Array.isArray(info.data) || info.data[1] !== "base64") {
    throw new Error("EXPECTED_BASE64_ACCOUNT_DATA");
  }
  const bytes = toByteArray(info.data[0]);
  if (bytes.length < minimumSize) throw new Error("TRUNCATED_ACCOUNT_DATA");
  if (!equalBytes(bytes.subarray(0, 8), Uint8Array.from(discriminator))) {
    throw new Error("UNEXPECTED_ANCHOR_ACCOUNT_DISCRIMINATOR");
  }
  return bytes;
}

function uint64(bytes: Uint8Array, offset: number): bigint {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getBigUint64(offset, true);
}
function int64(bytes: Uint8Array, offset: number): bigint {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getBigInt64(offset, true);
}
function uint32(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}
function u64(value: bigint): Uint8Array {
  if (value < 0n || value > U64_MAX) throw new Error("U64_OUT_OF_RANGE");
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigUint64(0, value, true);
  return out;
}
function i64(value: bigint): Uint8Array {
  if (value < -(1n << 63n) || value > (1n << 63n) - 1n) {
    throw new Error("I64_OUT_OF_RANGE");
  }
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigInt64(0, value, true);
  return out;
}
function u32(value: number): Uint8Array {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error("U32_OUT_OF_RANGE");
  }
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value, true);
  return out;
}
function concat(...items: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(items.reduce((total, item) => total + item.length, 0));
  let offset = 0;
  for (const item of items) {
    result.set(item, offset);
    offset += item.length;
  }
  return result;
}

/** Read real wallet-bound standing rules; never infer policy from a UI label. */
export async function inspectStandingKey(
  rpc: StandingKeyRpc,
  input: {
    chain: string | null | undefined;
    config: PaymentProgramConfig;
    beneficiaryWallet: string;
    guardianWallet: string;
    mint: string;
  },
): Promise<KeyInspection> {
  if (input.chain !== "solana:devnet") {
    return { state: "BLOCKED", reason: "WALLET_NOT_ON_SOLANA_DEVNET" };
  }
  try {
    const beneficiary = address(input.beneficiaryWallet);
    const guardian = address(input.guardianWallet);
    const mint = address(input.mint);
    // Recipient address does not affect the charter, mandate or asset rule.
    const accounts = await derivePaymentAccounts({
      config: input.config, beneficiary, mint, recipient: beneficiary,
    });

    const get = async (label: string, key: Address, discriminator: number[], length: number) => {
      const response = await rpc.getAccountInfo(key, { encoding: "base64" }).send();
      if (!response.value) throw new Error(`${label}_ACCOUNT_MISSING`);
      return readRawAccount(response.value, input.config.programId, discriminator, length);
    };
    const [charter, mandate, rule] = await Promise.all([
      get("CHARTER", accounts.charter, CHARTER_DISCRIMINATOR, 129),
      get("MANDATE", accounts.mandate, MANDATE_DISCRIMINATOR, 123),
      get("ASSET_RULE", accounts.assetRule, ASSET_RULE_DISCRIMINATOR, 135),
    ]);

    if (!equalBytes(charter.subarray(8, 40), addressEncoder.encode(guardian))) {
      return { state: "BLOCKED", reason: "CONNECTED_WALLET_IS_NOT_CHARTER_GUARDIAN" };
    }
    if (!equalBytes(charter.subarray(40, 72), addressEncoder.encode(beneficiary))) {
      return { state: "BLOCKED", reason: "CHARTER_BENEFICIARY_MISMATCH" };
    }
    if (!equalBytes(mandate.subarray(8, 40), addressEncoder.encode(accounts.charter))) {
      return { state: "BLOCKED", reason: "MANDATE_CHARTER_MISMATCH" };
    }
    if (!equalBytes(rule.subarray(8, 40), addressEncoder.encode(accounts.mandate)) ||
        !equalBytes(rule.subarray(40, 72), addressEncoder.encode(mint))) {
      return { state: "BLOCKED", reason: "ASSET_RULE_IDENTITY_MISMATCH" };
    }
    const status = mandate[41];
    const enabled = rule[73] === 1;
    const mask = rule[72];
    if (status !== ACTIVE_MANDATE) {
      return { state: "BLOCKED", reason: "MANDATE_NOT_ACTIVE" };
    }
    if (!enabled || (mask & ACTION_TRANSFER) === 0) {
      return { state: "BLOCKED", reason: "STANDING_PAYMENT_RULE_NOT_ENABLED" };
    }

    return {
      state: "READY",
      key: {
        charter: accounts.charter,
        mandate: accounts.mandate,
        assetRule: accounts.assetRule,
        beneficiary, guardian, mint,
        programId: input.config.programId,
        version: uint64(mandate, 42),
        nonce: uint64(mandate, 50),
        mandateStage: mandate[40],
        mandateStatus: status,
        mandateExpiryUnixSeconds: int64(mandate, 74),
        actionMask: mask,
        ruleEnabled: enabled,
        maxActionAmount: uint64(rule, 74),
        maxPeriodAmount: uint64(rule, 82),
        periodSeconds: int64(rule, 90),
        periodStartedAt: int64(rule, 98),
        spentThisPeriod: uint64(rule, 106),
        maxUnitPriceMicroUsd: uint64(rule, 122),
        pythFeedId: uint32(rule, 130),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "STANDING_KEY_READ_FAILED";
    if (message.endsWith("_ACCOUNT_MISSING") ||
        message === "WRONG_ACCOUNT_PROGRAM_OWNER" ||
        message === "UNEXPECTED_ANCHOR_ACCOUNT_DISCRIMINATOR" ||
        message === "TRUNCATED_ACCOUNT_DATA" ||
        message === "EXPECTED_BASE64_ACCOUNT_DATA") {
      return { state: "BLOCKED", reason: message };
    }
    return { state: "UNKNOWN", reason: message };
  }
}

/** Guardian's *standing* policy update: explicitly not an Allow Once exception. */
export function buildWidenStandingKeyInstruction(input: {
  key: StandingKeySnapshot;
  nextMaxActionAmount: bigint;
  nextMaxPeriodAmount: bigint;
}): Instruction {
  const { key, nextMaxActionAmount, nextMaxPeriodAmount } = input;
  if (nextMaxActionAmount <= key.maxActionAmount) {
    throw new Error("NEW_ACTION_LIMIT_MUST_EXCEED_CURRENT");
  }
  if (nextMaxPeriodAmount < key.maxPeriodAmount ||
      nextMaxPeriodAmount < nextMaxActionAmount) {
    throw new Error("PERIOD_LIMIT_CANNOT_SHRINK_OR_FALL_BELOW_ACTION_LIMIT");
  }
  if (key.periodSeconds <= 0n || key.actionMask === 0 || !key.ruleEnabled) {
    throw new Error("STANDING_RULE_NOT_ELIGIBLE_FOR_WIDEN");
  }
  return {
    programAddress: key.programId,
    accounts: [
      { address: key.charter, role: AccountRole.READONLY },
      { address: key.mandate, role: AccountRole.WRITABLE },
      { address: key.assetRule, role: AccountRole.WRITABLE },
      { address: key.guardian, role: AccountRole.READONLY_SIGNER },
    ],
    data: concat(
      Uint8Array.from(UPDATE_RULE_DISCRIMINATOR),
      u64(key.nonce),
      Uint8Array.of(1, key.actionMask),
      u64(nextMaxActionAmount),
      u64(nextMaxPeriodAmount),
      i64(key.periodSeconds),
      u64(key.maxUnitPriceMicroUsd),
      u32(key.pythFeedId),
    ),
  };
}

/** Integer-only formatter: never round or use floating point for a Key limit. */
export function displayTokenUnits(amount: bigint, decimals: number): string {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("INVALID_TOKEN_DECIMALS");
  }
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const part = (amount % divisor).toString().padStart(decimals, "0").replace(/0+$/, "");
  return part ? `${whole}.${part}` : whole.toString();
}
