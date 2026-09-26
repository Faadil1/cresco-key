import {
  AccountRole,
  address,
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
  type Instruction,
} from "@solana/kit";

const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
const ASSOCIATED_TOKEN_PROGRAM = address(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

const DISCRIMINATORS = {
  grantPaymentAllowanceOnce: new Uint8Array([
    166, 182, 55, 111, 54, 213, 239, 120,
  ]),
  executePaymentOnce: new Uint8Array([
    229, 85, 199, 26, 244, 6, 23, 93,
  ]),
  executePaymentWithinMandate: new Uint8Array([
    71, 68, 247, 0, 67, 244, 246, 60,
  ]),
} as const;

const encoder = new TextEncoder();
const addressEncoder = getAddressEncoder();

export type PaymentProgramConfig = {
  programId: Address;
  tokenProgramId: Address;
};

export type PaymentAccounts = {
  charter: Address;
  mandate: Address;
  assetRule: Address;
  vault: Address;
  destinationAta: Address;
};

export type PaymentAllowanceAccounts = PaymentAccounts & {
  paymentAllowance: Address;
};

function concat(...chunks: Uint8Array[]): Uint8Array {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function u64Le(value: bigint): Uint8Array {
  if (value < 0n || value > 0xffff_ffff_ffff_ffffn) {
    throw new Error("U64_OUT_OF_RANGE");
  }
  const out = new Uint8Array(8);
  const view = new DataView(out.buffer);
  view.setBigUint64(0, value, true);
  return out;
}

function i64Le(value: bigint): Uint8Array {
  const min = -(1n << 63n);
  const max = (1n << 63n) - 1n;
  if (value < min || value > max) throw new Error("I64_OUT_OF_RANGE");
  const out = new Uint8Array(8);
  const view = new DataView(out.buffer);
  view.setBigInt64(0, value, true);
  return out;
}

export function requestIdBytes(requestId: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(requestId)) {
    throw new Error("INVALID_REQUEST_ID");
  }

  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(requestId.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function addressBytes(value: Address): Uint8Array {
  return new Uint8Array(addressEncoder.encode(value));
}

export function paymentProgramConfigFromEnv(): PaymentProgramConfig {
  const programId = process.env.EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID?.trim();
  const tokenProgramId =
    process.env.EXPO_PUBLIC_DEMO_TOKEN_PROGRAM_ID?.trim();

  if (!programId) throw new Error("CRESCO_KEY_PROGRAM_ID_NOT_CONFIGURED");
  if (!tokenProgramId) throw new Error("TOKEN_PROGRAM_ID_NOT_CONFIGURED");

  return {
    programId: address(programId),
    tokenProgramId: address(tokenProgramId),
  };
}

export async function derivePaymentAccounts(input: {
  config: PaymentProgramConfig;
  beneficiary: Address;
  mint: Address;
  recipient: Address;
}): Promise<PaymentAccounts> {
  const [charter] = await getProgramDerivedAddress({
    programAddress: input.config.programId,
    seeds: [encoder.encode("charter"), addressBytes(input.beneficiary)],
  });

  const [mandate] = await getProgramDerivedAddress({
    programAddress: input.config.programId,
    seeds: [encoder.encode("mandate"), addressBytes(charter)],
  });

  const [assetRule] = await getProgramDerivedAddress({
    programAddress: input.config.programId,
    seeds: [
      encoder.encode("asset-rule"),
      addressBytes(mandate),
      addressBytes(input.mint),
    ],
  });

  const [vault] = await getProgramDerivedAddress({
    programAddress: input.config.programId,
    seeds: [
      encoder.encode("vault"),
      addressBytes(mandate),
      addressBytes(input.mint),
    ],
  });

  const [destinationAta] = await getProgramDerivedAddress({
    programAddress: ASSOCIATED_TOKEN_PROGRAM,
    seeds: [
      addressBytes(input.recipient),
      addressBytes(input.config.tokenProgramId),
      addressBytes(input.mint),
    ],
  });

  return {
    charter,
    mandate,
    assetRule,
    vault,
    destinationAta,
  };
}

export async function derivePaymentAllowanceAccounts(input: {
  config: PaymentProgramConfig;
  beneficiary: Address;
  mint: Address;
  recipient: Address;
  requestId: string;
}): Promise<PaymentAllowanceAccounts> {
  const base = await derivePaymentAccounts(input);
  const [paymentAllowance] = await getProgramDerivedAddress({
    programAddress: input.config.programId,
    seeds: [
      encoder.encode("payment-allowance"),
      addressBytes(base.mandate),
      addressBytes(input.mint),
      requestIdBytes(input.requestId),
    ],
  });

  return { ...base, paymentAllowance };
}

export async function buildExecutePaymentWithinMandateInstruction(input: {
  config: PaymentProgramConfig;
  beneficiary: Address;
  mint: Address;
  recipient: Address;
  amountBaseUnits: bigint;
  expectedNonce: bigint;
}): Promise<Instruction> {
  const accounts = await derivePaymentAccounts(input);

  return {
    programAddress: input.config.programId,
    accounts: [
      { address: accounts.charter, role: AccountRole.READONLY },
      { address: accounts.mandate, role: AccountRole.WRITABLE },
      { address: accounts.assetRule, role: AccountRole.WRITABLE },
      { address: accounts.vault, role: AccountRole.WRITABLE },
      { address: input.mint, role: AccountRole.READONLY },
      { address: input.beneficiary, role: AccountRole.WRITABLE_SIGNER },
      { address: accounts.destinationAta, role: AccountRole.WRITABLE },
      { address: input.recipient, role: AccountRole.READONLY },
      { address: input.config.tokenProgramId, role: AccountRole.READONLY },
    ],
    data: concat(
      DISCRIMINATORS.executePaymentWithinMandate,
      u64Le(input.amountBaseUnits),
      u64Le(input.expectedNonce),
    ),
  };
}

export async function buildGrantPaymentAllowanceOnceInstruction(input: {
  config: PaymentProgramConfig;
  guardian: Address;
  beneficiary: Address;
  mint: Address;
  recipient: Address;
  requestId: string;
  expectedNonce: bigint;
  amountBaseUnits: bigint;
  expiresAtUnixSeconds: bigint;
}): Promise<Instruction> {
  const accounts = await derivePaymentAllowanceAccounts(input);

  return {
    programAddress: input.config.programId,
    accounts: [
      { address: accounts.charter, role: AccountRole.READONLY },
      { address: accounts.mandate, role: AccountRole.READONLY },
      { address: input.mint, role: AccountRole.READONLY },
      { address: input.recipient, role: AccountRole.READONLY },
      { address: accounts.paymentAllowance, role: AccountRole.WRITABLE },
      { address: input.guardian, role: AccountRole.WRITABLE_SIGNER },
      { address: SYSTEM_PROGRAM, role: AccountRole.READONLY },
    ],
    data: concat(
      DISCRIMINATORS.grantPaymentAllowanceOnce,
      requestIdBytes(input.requestId),
      u64Le(input.expectedNonce),
      u64Le(input.amountBaseUnits),
      i64Le(input.expiresAtUnixSeconds),
    ),
  };
}

export async function buildExecutePaymentOnceInstruction(input: {
  config: PaymentProgramConfig;
  beneficiary: Address;
  mint: Address;
  recipient: Address;
  requestId: string;
  expectedNonce: bigint;
  amountBaseUnits: bigint;
}): Promise<Instruction> {
  const accounts = await derivePaymentAllowanceAccounts(input);

  return {
    programAddress: input.config.programId,
    accounts: [
      { address: accounts.charter, role: AccountRole.READONLY },
      { address: accounts.mandate, role: AccountRole.WRITABLE },
      { address: accounts.assetRule, role: AccountRole.WRITABLE },
      { address: accounts.paymentAllowance, role: AccountRole.WRITABLE },
      { address: accounts.vault, role: AccountRole.WRITABLE },
      { address: input.mint, role: AccountRole.READONLY },
      { address: input.beneficiary, role: AccountRole.WRITABLE_SIGNER },
      { address: accounts.destinationAta, role: AccountRole.WRITABLE },
      { address: input.recipient, role: AccountRole.READONLY },
      { address: input.config.tokenProgramId, role: AccountRole.READONLY },
    ],
    data: concat(
      DISCRIMINATORS.executePaymentOnce,
      requestIdBytes(input.requestId),
      u64Le(input.expectedNonce),
      u64Le(input.amountBaseUnits),
    ),
  };
}
