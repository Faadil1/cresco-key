#!/usr/bin/env node
"use strict";
/**
 * Resume an ALREADY GRANTED, unused exact allowance on the distinct Cresco Key
 * Devnet program. Never initializes/replaces a Key, mints, tops up or grants
 * another allowance. Explicit Devnet-only consent and exact signer public-key
 * verification are mandatory. Stops on unexpected/mismatched program errors.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { web3 } = require("@coral-xyz/anchor");
const { TOKEN_PROGRAM_ID, getAccount } = require("@solana/spl-token");
const {
  Connection, Keypair, PublicKey, Transaction, TransactionInstruction,
  sendAndConfirmTransaction,
} = web3;
const state = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../../evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json"), "utf8"));
const ALLOWANCE = "2x4NZztgoauD5sTbPL7noSv8QQiTNwW6sHanTaQMKzRm";
const EXPECTED_PROGRAM = "6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP";
const rpc = "https://api.devnet.solana.com";
const fpath = path.resolve(__dirname, "../../evidence/devnet-distinct-program/resumed-exact-allowance-receipt.json");
const receipt = {
  schema: "cresco-key.distinct-devnet-exact-allowance-resume.v1",
  originalRun: 38183110494,
  originalGrantSignature: "ToNJEvw1ajnatQMP5va8PtYQnXTS4tQSa51uTZVQW5qFbmUeLy5R74ErMvSDgpnCeWSkm4P1sYLbncNMLKQ6CUd",
  programId: EXPECTED_PROGRAM,
  allowance: ALLOWANCE,
  evidenceClass: "PENDING",
  physicalAndroidProven: false,
  liveMwaProven: false,
  transfers: {},
  assertions: {},
  transactions: {},
  inspectedAt: new Date().toISOString(),
};
const pk = x => new PublicKey(x);
function save() {
  fs.mkdirSync(path.dirname(fpath), { recursive: true });
  fs.writeFileSync(fpath, JSON.stringify(receipt, null, 2) + "\n");
}
function signer(keyName, pub) {
  const value = JSON.parse(process.env[keyName] || "null");
  if (!Array.isArray(value) || value.length !== 64) throw Error("MISSING_SIGNER_" + keyName);
  const key = Keypair.fromSecretKey(Uint8Array.from(value));
  if (key.publicKey.toBase58() !== pub) throw Error("SIGNER_IDENTITY_MISMATCH_" + keyName);
  return key;
}
function u64(v) {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(v));
  return b;
}
function ix(name, accounts, ...params) {
  return new TransactionInstruction({
    programId: pk(EXPECTED_PROGRAM),
    keys: accounts.map(([key, sign = false, writable = false]) => ({
      pubkey: pk(key), isSigner: sign, isWritable: writable,
    })),
    data: Buffer.concat([
      createHash("sha256").update("global:" + name).digest().subarray(0, 8),
      ...params,
    ]),
  });
}
async function getTx(c, signature) {
  for(let i = 0; i < 16; i++) {
    const tx = await c.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if(tx?.meta) return tx;
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  throw Error("TX_NOT_CONFIRMABLE_" + signature);
}
async function takeSnapshot(c) {
  const [v, a, b] = await Promise.all([
    getAccount(c, pk(state.vaultTokenAccount), "confirmed"),
    getAccount(c, pk(state.recipientAAta), "confirmed"),
    getAccount(c, pk(state.recipientBAta), "confirmed"),
  ]);
  for (const x of [v,a,b]) {
    assert.equal(x.mint.toBase58(), state.mint);
  }
  return { vault:v.amount.toString(), recipientA:a.amount.toString(), recipientB:b.amount.toString() };
}
function decodeAllowance(info) {
  assert.ok(info && info.owner.equals(pk(EXPECTED_PROGRAM)), "WRONG_OWNER_OR_MISSING_ALLOWANCE");
  const b = info.data;
  const discriminator = createHash("sha256").update("account:PaymentAllowanceReceipt").digest().subarray(0,8);
  assert.ok(b.length >= 234 && b.subarray(0,8).equals(discriminator), "ALLOWANCE_ACCOUNT_LAYOUT_INVALID");
  const key = i => new PublicKey(b.subarray(i,i+32)).toBase58();
  return {
    mandate:key(8), guardian:key(40), beneficiary:key(72),
    mint:key(104), recipient:key(136),
    amount:b.readBigUInt64LE(168).toString(),
    requestId:b.subarray(176,208).toString("hex"),
    nonce:b.readBigUInt64LE(208).toString(),
    expiresAt:b.readBigInt64LE(216).toString(),
    usedRaw:b[224],
    usedAt:b.readBigInt64LE(225).toString(),
  };
}
async function sendRefusal(c,label,programIx,guardian,beneficiary,expected) {
  const tx = new Transaction().add(programIx);
  const last = await c.getLatestBlockhash("confirmed");
  tx.recentBlockhash = last.blockhash;
  tx.feePayer = guardian.publicKey;
  tx.sign(guardian,beneficiary);
  const signature = await c.sendRawTransaction(tx.serialize(), {
    skipPreflight:true, maxRetries: 3,
  });
  const confirmed = await getTx(c,signature);
  const logs = (confirmed.meta.logMessages || []).filter(x=>/Program log:|Program failed:/.test(x));
  const actualError = logs.find(x=>/Error Code:/.test(x)) || null;
  const expectedError = logs.some(v=>expected.test(v));
  receipt.transactions[label] = {
    signature,
    slot:confirmed.slot,
    txFailed: confirmed.meta.err !== null,
    expectedError,
    actualError,
    logs,
    explorer:"https://explorer.solana.com/tx/"+signature+"?cluster=devnet",
  };
  save();
  assert.ok(confirmed.meta.err, label+"_SHOULD_NOT_SUCCEED");
  if(!expectedError) throw Error(label+"_UNEXPECTED_ONCHAIN_ERROR");
}
async function sendSuccess(c,label,programIx,guardian,beneficiary) {
  const signature = await sendAndConfirmTransaction(
    c, new Transaction().add(programIx), [guardian,beneficiary],
    { commitment:"confirmed", preflightCommitment:"confirmed" },
  );
  const tx = await getTx(c,signature);
  assert.equal(tx.meta.err,null,label+"_UNEXPECTED_TRANSACTION_ERROR");
  receipt.transactions[label] = {
    signature,slot:tx.slot,confirmed:true,
    explorer:"https://explorer.solana.com/tx/"+signature+"?cluster=devnet",
  };
  save();
}
(async () => {
  if(process.env.CRESCO_RESUME_DEVNET_OPT_IN !== "I_AUTHORIZE_EXACT_EXISTING_DEVNET_ALLOWANCE")
    throw Error("EXPLICIT_TRANSACTION_OPT_IN_REQUIRED");
  assert.equal(state.programId,EXPECTED_PROGRAM);
  assert.equal(state.network,"devnet");
  const guardian=signer("CRESCO_GUARDIAN_KEYPAIR_JSON",state.guardian);
  const beneficiary=signer("CRESCO_BENEFICIARY_KEYPAIR_JSON",state.beneficiary);
  const c=new Connection(rpc,"confirmed");
  const account=await c.getAccountInfo(pk(ALLOWANCE),"confirmed");
  const a=decodeAllowance(account);
  receipt.preflight=a;
  save();
  assert.equal(a.mandate,state.mandate);
  assert.equal(a.guardian,state.guardian);
  assert.equal(a.beneficiary,state.beneficiary);
  assert.equal(a.mint,state.mint);
  assert.equal(a.recipient,state.recipientA);
  assert.equal(a.amount,"12000000");
  assert.equal(a.nonce,state.mandateNonce.toString());
  assert.equal(a.usedRaw,0,"ALLOWANCE_ALREADY_USED_STOP");
  assert.equal(a.usedAt,"0");
  assert.ok(BigInt(a.expiresAt)>BigInt(Math.floor(Date.now()/1000)+60),"ALLOWANCE_EXPIRED_OR_EXPIRES_TOO_SOON");
  const requestId=Buffer.from(a.requestId,"hex");
  const calculated=PublicKey.findProgramAddressSync([
    Buffer.from("payment-allowance"),pk(state.mandate).toBuffer(),
    pk(state.mint).toBuffer(),requestId,
  ],pk(EXPECTED_PROGRAM))[0].toBase58();
  assert.equal(calculated,ALLOWANCE,"ALLOWANCE_PDA_DERIVATION_MISMATCH");
  receipt.assertions.previouslyGrantedUnusedAndUnexpired=true;
  const before=await takeSnapshot(c);
  receipt.transfers.before=before;
  save();

  const base = [
    [state.charter],
    [state.mandate,false,true],
    [state.assetRule,false,true],
    [ALLOWANCE,false,true],
    [state.vaultTokenAccount,false,true],
    [state.mint],
    [state.beneficiary,true,true],
  ];
  const tail = (recipient,ata) => [[ata,false,true],[recipient],[TOKEN_PROGRAM_ID.toBase58()]];
  const data=[requestId,u64(a.nonce),u64(12000000n)];
  await sendRefusal(c,"mutatedRecipient12",ix(
    "execute_payment_once",[...base,...tail(state.recipientB,state.recipientBAta)],...data,
  ),guardian,beneficiary,/PaymentAllowanceRecipientMismatch|AllowanceActionMismatch/i);

  const afterRefusal=await takeSnapshot(c);
  receipt.transfers.afterMutation=afterRefusal;
  assert.deepEqual(afterRefusal,before,"MUTATION_MOVED_FUNDS");
  assert.equal(decodeAllowance(await c.getAccountInfo(pk(ALLOWANCE),"confirmed")).usedRaw,0,
    "MUTATION_CONSUMED_ALLOWANCE");
  receipt.assertions.realMutationRefusedWithoutFundsOrPermission=true;
  save();

  await sendSuccess(c,"exactApproved12",ix(
    "execute_payment_once",[...base,...tail(state.recipientA,state.recipientAAta)],...data,
  ),guardian,beneficiary);
  const afterExact=await takeSnapshot(c);
  receipt.transfers.afterExact=afterExact;
  assert.equal(BigInt(before.vault)-BigInt(afterExact.vault),12000000n);
  assert.equal(BigInt(afterExact.recipientA)-BigInt(before.recipientA),12000000n);
  assert.equal(decodeAllowance(await c.getAccountInfo(pk(ALLOWANCE),"confirmed")).usedRaw,1);
  receipt.assertions.realExactExecutionAndUsedState=true;
  save();

  await sendRefusal(c,"exactReplay12",ix(
    "execute_payment_once",[...base,...tail(state.recipientA,state.recipientAAta)],...data,
  ),guardian,beneficiary,/AllowanceAlreadyUsed/i);
  const afterReplay=await takeSnapshot(c);
  assert.deepEqual(afterReplay,afterExact,"REPLAY_MOVED_FUNDS");
  receipt.assertions.replayFailedWithoutTokenMovement=true;
  receipt.evidenceClass="LIVE_DEVNET_DISTINCT_PROGRAM_SERVER_SIGNERS";
  receipt.result="PASS_RESUMED_EXACT_ALLOWANCE";
  save();
  console.log("RESUMED_EXACT_ALLOWANCE_DEVNET_PROOF=PASS");
})().catch(error=>{
  receipt.result="BLOCKED_OR_PARTIAL";
  receipt.evidenceClass="PARTIAL_OR_UNKNOWN_DEVNET";
  receipt.errorMessage=String(error?.message||error).slice(0,500);
  save();
  console.error("RESUMED_EXACT_ALLOWANCE_DEVNET_PROOF=NOT_PROVEN",receipt.errorMessage);
  process.exitCode=1;
});
