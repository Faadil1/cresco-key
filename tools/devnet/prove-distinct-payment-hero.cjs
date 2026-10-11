#!/usr/bin/env node
"use strict";
/**
 * Live, source-matched DEVNET capital-path proof for the DISTINCT Cresco Key
 * Anchor program (not the original Cresco program and not physical Android).
 *
 * This spends ONLY preexisting developer-controlled Devnet demo SPL tokens
 * from a pre-provisioned, publicly recorded sample Charter. No mainnet, no
 * real stablecoins, no wallet import or custody.
 *
 * Explicit dispatch opt-in plus expected public addresses and signer match
 * are required. Negative paths are real signed, failed Devnet transactions:
 * no client-only mock refusal; check confirmed tx meta.err + program logs.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { randomBytes, createHash } = require("node:crypto");
const { web3 } = require("@coral-xyz/anchor");
const { TOKEN_PROGRAM_ID, getAccount, getMint } = require("@solana/spl-token");

const {
  Connection, Keypair, PublicKey, Transaction,
  TransactionInstruction, SystemProgram,
  sendAndConfirmTransaction,
} = web3;

const DEVNET_RPC = "https://api.devnet.solana.com";
const EXPECTED_PROGRAM = "6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP";
const ORIGINAL_PROGRAM = "ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk";
const TOKEN5 = 5_000_000n;
const TOKEN12 = 12_000_000n;
const statePath = path.resolve(__dirname,
  "../../evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json");
const receiptPath = path.resolve(__dirname,
  "../../evidence/devnet-distinct-program/payment-hero-live-receipt.json");
let receipt = {
  schema: "cresco-key.distinct-devnet-payment-hero.v1",
  evidenceClass: "PENDING_UNTIL_CONFIRMED",
  sourceProgram: EXPECTED_PROGRAM,
  priorCrescoProgram: ORIGINAL_PROGRAM,
  physicalAndroidTest: false,
  mobileWalletAdapterTest: false,
  mainnetExecution: false,
  realMoney: false,
  expectedNegativePaths: ["BOUNDARY12", "RECIPIENT_MUTATION", "EXACT_REPLAY"],
  assertions: {},
  transactions: {},
  recordedAt: new Date().toISOString(),
};

function save() {
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
}
function requireDeveloperKey(envName, expectedAddress) {
  const raw = process.env[envName];
  if (!raw) throw Error("MISSING_DEVNET_ONLY_SIGNER_" + envName);
  const bytes = JSON.parse(raw);
  if (!Array.isArray(bytes) || bytes.length !== 64) throw Error("INVALID_DEVNET_KEYPAIR_FORMAT");
  const key = Keypair.fromSecretKey(Uint8Array.from(bytes));
  if (key.publicKey.toBase58() !== expectedAddress) {
    throw Error("DEVNET_SIGNER_PUBLIC_KEY_MISMATCH_" + envName);
  }
  return key;
}
function pub(value) { return new PublicKey(value); }
function findPda(seeds, programId) {
  return PublicKey.findProgramAddressSync(seeds, programId)[0];
}
function u64(v) {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(BigInt(v));
  return out;
}
function i64(v) {
  const out = Buffer.alloc(8);
  out.writeBigInt64LE(BigInt(v));
  return out;
}
function instruction(name, keys, ...args) {
  const discriminator = createHash("sha256").update("global:" + name).digest().subarray(0, 8);
  return new TransactionInstruction({
    programId: pub(EXPECTED_PROGRAM),
    keys: keys.map(([key, isSigner = false, isWritable = false]) => ({
      pubkey: key,
      isSigner,
      isWritable,
    })),
    data: Buffer.concat([discriminator, ...args]),
  });
}
function getLogs(tx) {
  return (tx.meta?.logMessages ?? []).filter(v =>
    /Program log:|Program failed:|AnchorError|Error Code:/.test(v)
  ).slice(-18);
}
async function getConfirmedTx(connection, signature) {
  for (let i = 0; i < 18; i++) {
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if (tx?.meta) return tx;
    await new Promise(resolve => setTimeout(resolve, 1400));
  }
  throw Error("TRANSACTION_NOT_CONFIRMABLE_" + signature);
}
async function goodTx(connection, label, ix, guardian, beneficiary) {
  const tx = new Transaction().add(ix);
  const signature = await sendAndConfirmTransaction(
    connection, tx, [guardian, beneficiary].filter(Boolean),
    { commitment: "confirmed", preflightCommitment: "confirmed" },
  );
  const verified = await getConfirmedTx(connection, signature);
  if (verified.meta.err) throw Error("CONFIRMED_TRANSACTION_HAS_ERROR_" + label);
  const result = {
    classification: "LIVE_DEVNET_CONFIRMED_TRANSACTION",
    signature,
    slot: verified.slot,
    transactionSucceeded: true,
    explorer: "https://explorer.solana.com/tx/" + signature + "?cluster=devnet",
  };
  receipt.transactions[label] = result;
  save();
  return result;
}
async function failedTx(connection, label, ix, guardian, beneficiary, wantedLog) {
  const tx = new Transaction().add(ix);
  const fresh = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = fresh.blockhash;
  tx.feePayer = guardian.publicKey;
  tx.sign(...[guardian, beneficiary].filter(Boolean));
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
    maxRetries: 3,
  });
  const confirmed = await getConfirmedTx(connection, signature);
  const logs = getLogs(confirmed);
  const matchingError = logs.some(x => wantedLog.test(x));
  receipt.transactions[label] = {
    classification: confirmed.meta.err && matchingError
      ? "LIVE_DEVNET_CONFIRMED_PROGRAM_REFUSAL"
      : "UNKNOWN_OR_UNEXPECTED_RESULT",
    signature,
    slot: confirmed.slot,
    transactionFailed: confirmed.meta.err !== null,
    expectedProgramErrorFound: matchingError,
    programLogs: logs,
    explorer: "https://explorer.solana.com/tx/" + signature + "?cluster=devnet",
  };
  save();
  assert.ok(confirmed.meta.err, label + "_UNEXPECTEDLY_SUCCEEDED");
  assert.ok(matchingError, label + "_EXPECTED_PROGRAM_ERROR_NOT_OBSERVED");
}
async function balances(connection, state) {
  const [vault, recipientA, recipientB] = await Promise.all([
    getAccount(connection, pub(state.vaultTokenAccount), "confirmed"),
    getAccount(connection, pub(state.recipientAAta), "confirmed"),
    getAccount(connection, pub(state.recipientBAta), "confirmed"),
  ]);
  for (const a of [vault, recipientA, recipientB]) {
    assert.equal(a.mint.toBase58(), state.mint, "TOKEN_MINT_IDENTITY_MISMATCH");
  }
  return {
    vault: vault.amount.toString(),
    recipientA: recipientA.amount.toString(),
    recipientB: recipientB.amount.toString(),
  };
}
function assertSameTokens(before, after, reason) {
  assert.deepEqual(after, before, reason + "_MUST_NOT_MOVE_TOKENS");
}
function paymentAccounts(s, recipient, recipientAta) {
  return [
    [pub(s.charter)],
    [pub(s.mandate), false, true],
    [pub(s.assetRule), false, true],
    [pub(s.vaultTokenAccount), false, true],
    [pub(s.mint)],
    [pub(s.beneficiary), true, true],
    [pub(recipientAta), false, true],
    [pub(recipient)],
    [TOKEN_PROGRAM_ID],
  ];
}
function grantAccounts(s, allowance) {
  return [
    [pub(s.charter)],
    [pub(s.mandate)],
    [pub(s.mint)],
    [pub(s.recipientA)],
    [allowance, false, true],
    [pub(s.guardian), true, true],
    [SystemProgram.programId],
  ];
}
function exactAccounts(s, allowance, recipient, recipientAta) {
  return [
    [pub(s.charter)],
    [pub(s.mandate), false, true],
    [pub(s.assetRule), false, true],
    [allowance, false, true],
    [pub(s.vaultTokenAccount), false, true],
    [pub(s.mint)],
    [pub(s.beneficiary), true, true],
    [pub(recipientAta), false, true],
    [pub(recipient)],
    [TOKEN_PROGRAM_ID],
  ];
}
async function run() {
  if (process.env.CRESCO_EXPLICIT_DEVNET_HERO_OPT_IN !==
      "I_ACCEPT_DEVNET_DEMO_TOKEN_TRANSACTIONS") {
    throw Error("EXPLICIT_DEVNET_TRANSACTION_OPT_IN_REQUIRED");
  }
  const s = JSON.parse(fs.readFileSync(statePath, "utf8"));
  assert.equal(s.status, "READY_FOR_MOBILE_RUNTIME");
  assert.equal(s.network, "devnet");
  assert.equal(s.rpcUrl, DEVNET_RPC);
  assert.equal(s.programId, EXPECTED_PROGRAM);
  assert.notEqual(s.programId, ORIGINAL_PROGRAM);
  assert.equal(s.tokenProgramId, TOKEN_PROGRAM_ID.toBase58());
  assert.equal(s.tokenDecimals, 6);
  assert.equal(s.standingMaxActionBaseUnits, 10_000_000);
  assert.equal(s.standingMaxPeriodBaseUnits, 100_000_000);
  assert.notEqual(s.guardian, s.beneficiary);
  const guardian = requireDeveloperKey("CRESCO_GUARDIAN_KEYPAIR_JSON", s.guardian);
  const beneficiary = requireDeveloperKey("CRESCO_BENEFICIARY_KEYPAIR_JSON", s.beneficiary);
  receipt.publicFamily = {
    guardian: s.guardian,
    beneficiary: s.beneficiary,
    mint: s.mint,
    charter: s.charter,
    mandate: s.mandate,
    assetRule: s.assetRule,
    vault: s.vaultTokenAccount,
    originalBootstrapRun: s.source.githubActionsRun,
  };
  save();

  const connection = new Connection(DEVNET_RPC, "confirmed");
  const [programInfo, rawMandate, rawRule, mintInfo, guardianBalance] = await Promise.all([
    connection.getAccountInfo(pub(EXPECTED_PROGRAM), "confirmed"),
    connection.getAccountInfo(pub(s.mandate), "confirmed"),
    connection.getAccountInfo(pub(s.assetRule), "confirmed"),
    getMint(connection, pub(s.mint), "confirmed"),
    connection.getBalance(guardian.publicKey, "confirmed"),
  ]);
  assert.ok(programInfo?.executable, "DISTINCT_PROGRAM_NOT_EXECUTABLE");
  assert.ok(rawMandate && rawMandate.owner.toBase58() === EXPECTED_PROGRAM);
  assert.ok(rawRule && rawRule.owner.toBase58() === EXPECTED_PROGRAM);
  assert.equal(mintInfo.decimals, 6);
  assert.ok(guardianBalance > 20_000_000, "DEVNET_GUARDIAN_INSUFFICIENT_FEE_SOL");
  assert.equal(rawMandate.data[41], 0, "MANDATE_NOT_ACTIVE");
  assert.ok(rawMandate.data[40] >= 3, "MANDATE_NOT_BOUNDED");
  assert.equal(rawRule.data[73], 1, "ASSET_RULE_NOT_ENABLED");
  assert.equal(Number(rawRule.data.readBigUInt64LE(74)), 10_000_000, "NOT_THE_EXPECTED_TEN_UNIT_RULE");
  assert.equal(Number(rawRule.data.readBigUInt64LE(82)), 100_000_000, "NOT_THE_EXPECTED_PERIOD_RULE");
  const nonce = rawMandate.data.readBigUInt64LE(50);
  receipt.liveNonce = nonce.toString();
  receipt.assertions.programExecutable = true;
  receipt.assertions.signerIdentitiesMatchPublishedFamily = true;
  receipt.assertions.guardianBeneficiaryDistinct = true;
  receipt.assertions.devnetOnly = true;
  const allowanceRequest = randomBytes(32);
  const allowance = findPda([
    Buffer.from("payment-allowance"),
    pub(s.mandate).toBuffer(),
    pub(s.mint).toBuffer(),
    allowanceRequest,
  ], pub(EXPECTED_PROGRAM));
  assert.equal(await connection.getAccountInfo(allowance, "confirmed"), null,
    "ALLOWANCE_REQUEST_ID_COLLISION");
  const balanceBefore = await balances(connection, s);
  assert.ok(BigInt(balanceBefore.vault) >= TOKEN5 + TOKEN12, "VAULT_NOT_FUNDED_FOR_REAL_PAYMENTS");
  receipt.balancesBefore = balanceBefore;
  save();
  // A genuine confirmed 5-unit onchain move against new program 6SoGab...
  await goodTx(connection, "inBounds5", instruction(
    "execute_payment_within_mandate",
    paymentAccounts(s, s.recipientA, s.recipientAAta),
    u64(TOKEN5), u64(nonce),
  ), guardian, beneficiary);
  const after5 = await balances(connection, s);
  assert.equal(BigInt(balanceBefore.vault) - BigInt(after5.vault), TOKEN5);
  assert.equal(BigInt(after5.recipientA) - BigInt(balanceBefore.recipientA), TOKEN5);
  receipt.balancesAfter5 = after5;
  receipt.assertions.inBounds5RealTokenTransfer = true;
  save();

  // This is an actual FAILED ONCHAIN transaction, not a seeded refusal.
  await failedTx(connection, "boundary12", instruction(
    "execute_payment_within_mandate",
    paymentAccounts(s, s.recipientA, s.recipientAAta),
    u64(TOKEN12), u64(nonce),
  ), guardian, beneficiary, /ActionAmountExceeded|MaxActionAmountExceeded|Action.*Exceeded/i);
  assertSameTokens(after5, await balances(connection, s), "BOUNDARY12");
  receipt.assertions.boundary12DidNotMoveTokens = true;
  save();

  // Guardian signs and funds an exact, fresh one-time allowance on chain.
  await goodTx(connection, "guardianGrant12Once", instruction(
    "grant_payment_allowance_once",
    grantAccounts(s, allowance),
    allowanceRequest, u64(nonce), u64(TOKEN12),
    i64(BigInt(Math.floor(Date.now()/1000) + 1800)),
  ), guardian, null);
  const allowanceInfo = await connection.getAccountInfo(allowance, "confirmed");
  assert.equal(allowanceInfo?.owner.toBase58(), EXPECTED_PROGRAM,
    "GRANT_DID_NOT_CREATE_DISTINCT_PROGRAM_ALLOWANCE");
  receipt.paymentAllowance = allowance.toBase58();
  receipt.assertions.guardianGrantPresentOnchain = true;
  save();

  // Same request+amount but attacker-controlled destination must be rejected.
  await failedTx(connection, "mutatedRecipient12", instruction(
    "execute_payment_once",
    exactAccounts(s, allowance, s.recipientB, s.recipientBAta),
    allowanceRequest, u64(nonce), u64(TOKEN12),
  ), guardian, beneficiary, /AllowanceRecipientMismatch|Allowance.*Mismatch|ExactPayment.*Mismatch/i);
  assertSameTokens(after5, await balances(connection, s), "MUTATION");
  receipt.assertions.mutatedRecipientDidNotMoveTokens = true;
  save();

  // Only the Guardian-approved 12-unit action succeeds.
  await goodTx(connection, "exactApproved12", instruction(
    "execute_payment_once",
    exactAccounts(s, allowance, s.recipientA, s.recipientAAta),
    allowanceRequest, u64(nonce), u64(TOKEN12),
  ), guardian, beneficiary);
  const after12 = await balances(connection, s);
  assert.equal(BigInt(after5.vault) - BigInt(after12.vault), TOKEN12);
  assert.equal(BigInt(after12.recipientA) - BigInt(after5.recipientA), TOKEN12);
  receipt.balancesAfterExact12 = after12;
  receipt.assertions.exact12RealTokenTransfer = true;
  save();

  // Consumed allowance must reject the same request forever.
  await failedTx(connection, "exactReplay12", instruction(
    "execute_payment_once",
    exactAccounts(s, allowance, s.recipientA, s.recipientAAta),
    allowanceRequest, u64(nonce), u64(TOKEN12),
  ), guardian, beneficiary, /AllowanceAlreadyUsed/i);
  assertSameTokens(after12, await balances(connection, s), "REPLAY");
  receipt.balancesAfterReplay = await balances(connection, s);
  receipt.assertions.replayDidNotMoveTokens = true;
  // Not a mobile-wallet runtime, even with 6 live signed transactions.
  receipt.evidenceClass = "LIVE_DEVNET_DISTINCT_PROGRAM_SERVER_SIGNERS";
  receipt.result = "PASS_SOURCE_MATCHED_ONCHAIN_HERO_WITHOUT_ANDROID";
  receipt.truthBoundary =
    "Live Solana Devnet on distinct CRESCO Key program using developer-owned CI-only signers. " +
    "Confirms demo SPL-token outcomes, signed Guardian grant, changed-recipient and replay failures. " +
    "Does NOT prove Android/MWA signing, third-party real beneficiaries, mainnet, custody or production use.";
  save();
  console.log("LIVE_DISTINCT_CRESCO_KEY_HERO_PROOF=PASS");
  console.log(JSON.stringify({
    evidenceClass: receipt.evidenceClass,
    actualProgramId: EXPECTED_PROGRAM,
    transactionSignatures: Object.fromEntries(Object.entries(receipt.transactions).map(
      ([k,v]) => [k, v.signature],
    )),
    onchainConsequencesChecked: true,
    physicalAndroidProven: false,
  }, null, 2));
}
run().catch(error => {
  receipt.evidenceClass = "PARTIAL_OR_UNKNOWN_DEVNET_RUN";
  receipt.result = "FAILED_OR_INCOMPLETE";
  receipt.errorName = error?.name ?? "ERROR";
  receipt.errorMessage = String(error?.message ?? error).slice(0, 500);
  save();
  console.error("LIVE_DISTINCT_CRESCO_KEY_HERO_PROOF=NOT_PROVEN", receipt.errorMessage);
  process.exitCode = 1;
});
