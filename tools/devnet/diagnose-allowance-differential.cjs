#!/usr/bin/env node
"use strict";
/**
 * Read-only Solana Devnet forensic comparison for an already signed, PUBLIC
 * Guardian allowance. Uses unsigned transaction SIMULATION ONLY. It does
 * not prove signer consent, make a transaction, charge fees, or grant funds.
 */
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const assert = require("node:assert/strict");
const { web3 } = require("@coral-xyz/anchor");

const { PublicKey, Transaction, TransactionInstruction, Connection } = web3;
const rpcUrl = "https://api.devnet.solana.com";
const program = "6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP";
const allowanceAddress = "GAcUQLMch7dfMGVFAz9YhgiKZwHbvmbHMpbSFjQN4v5r";
const state = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../../evidence/devnet-distinct-program/cresco-key-demo-state-37182728261.json"), "utf8"));
const output = path.resolve(__dirname,
  "../../evidence/devnet-distinct-program/allowance-differential-simulation.json");
const pk = x => new PublicKey(x);
const result = {
  schema: "cresco-key.devnet-allowance-differential-forensics.v1",
  kind: "READ_ONLY_UNVERIFIED_SIGNATURE_SIMULATION",
  programId: program,
  allowanceAddress,
  originalGuardianGrantRun: 38195868820,
  failedResumeRun: 38196235500,
  noSignedTransactions: true,
  noBroadcast: true,
  noPrivateKeys: true,
  sampleWalletNotProofOfThirdPartyConsent: true,
  createdAt: new Date().toISOString(),
};
function store() {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
}
function u64(v) {
  const b=Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(v));
  return b;
}
function accountFields(info) {
  assert.ok(info?.owner.equals(pk(program)), "ACCOUNT_OWNER_UNEXPECTED");
  const b=info.data;
  const disc=createHash("sha256").update("account:PaymentAllowanceReceipt").digest().subarray(0,8);
  assert.ok(b.length >=234 && b.subarray(0,8).equals(disc),"INVALID_ANCHOR_ALLOWANCE_LAYOUT");
  const key=i=>new PublicKey(b.subarray(i,i+32)).toBase58();
  return {
    dataLength:b.length,
    rawDataSha256:createHash("sha256").update(b).digest("hex"),
    mandate:key(8), guardian:key(40), beneficiary:key(72), mint:key(104),
    recipient:key(136), amountBaseUnits:b.readBigUInt64LE(168).toString(),
    requestIdHex:b.subarray(176,208).toString("hex"),
    nonce:b.readBigUInt64LE(208).toString(),
    expiresAt:b.readBigInt64LE(216).toString(),
    usedByte:b[224], usedAt:b.readBigInt64LE(225).toString(),
    bump:b[233],
  };
}
async function rpc(method,params){
  const resp=await fetch(rpcUrl,{
    method:"POST", headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params}),
    signal:AbortSignal.timeout(18000),
  });
  if(!resp.ok)throw Error("PUBLIC_RPC_HTTP_"+resp.status);
  const parsed=await resp.json();
  if(parsed.error)throw Error("PUBLIC_RPC_"+JSON.stringify(parsed.error).slice(0,250));
  if(!parsed.result)throw Error("PUBLIC_RPC_EMPTY_"+method);
  return parsed.result;
}
function instruction(recipient, ata, id, nonce) {
  const accounts=[
    [state.charter,false,false],
    [state.mandate,false,true],
    [state.assetRule,false,true],
    [allowanceAddress,false,true],
    [state.vaultTokenAccount,false,true],
    [state.mint,false,false],
    [state.beneficiary,true,true],
    [ata,false,true],
    [recipient,false,false],
    [state.tokenProgramId,false,false],
  ];
  return new TransactionInstruction({
    programId:pk(program),
    keys:accounts.map(([k,isSigner,isWritable])=>({
      pubkey:pk(k),isSigner,isWritable,
    })),
    data:Buffer.concat([
      createHash("sha256").update("global:execute_payment_once").digest().subarray(0,8),
      id,u64(nonce),u64(12000000n),
    ]),
  });
}
async function simulate(label, recipient, ata, id, nonce, guardian) {
  const tx=new Transaction().add(instruction(recipient,ata,id,nonce));
  tx.feePayer=pk(guardian);
  tx.recentBlockhash=(await rpc("getLatestBlockhash",[{commitment:"confirmed"}])).value.blockhash;
  // Zero signatures are only used for read-only simulation. Never broadcast.
  const payload=tx.serialize({requireAllSignatures:false,verifySignatures:false}).toString("base64");
  const sim=await rpc("simulateTransaction",[payload,{
    encoding:"base64",commitment:"confirmed",sigVerify:false,
    accounts:{encoding:"base64",addresses:[allowanceAddress]},
  }]);
  const v=sim.value;
  if(!v)throw Error("EMPTY_SIMULATION_"+label);
  const logs=(v.logs||[]).filter(x=>
    /Program log:|Program failed:/.test(x)).slice(-30);
  const returnedAccount=v.accounts?.[0]??null;
  let postData=null;
  if(returnedAccount?.data?.[1]==="base64"){
    postData=accountFields({
      owner:pk(returnedAccount.owner),
      data:Buffer.from(returnedAccount.data[0],"base64"),
    });
  }
  result.simulations=result.simulations||{};
  result.simulations[label]={
    rpcSlot:sim.context?.slot??null,
    error:v.err??null,
    computeUnits:v.unitsConsumed??null,
    logs,
    simulatedPostAccount:postData,
    actualOnchainSignature:null,
  };
  store();
}
(async()=>{
  assert.equal(state.programId,program);
  assert.equal(state.network,"devnet");
  const c=new Connection(rpcUrl,"confirmed");
  const start=await c.getAccountInfoAndContext(pk(allowanceAddress),"confirmed");
  const a=accountFields(start.value);
  result.before={rpcSlot:start.context.slot,...a};
  store();
  assert.equal(a.mandate,state.mandate);
  assert.equal(a.guardian,state.guardian);
  assert.equal(a.beneficiary,state.beneficiary);
  assert.equal(a.mint,state.mint);
  assert.equal(a.recipient,state.recipientA);
  assert.equal(a.amountBaseUnits,"12000000");
  assert.equal(a.nonce,state.mandateNonce.toString());
  assert.equal(a.usedByte,0,"CANNOT_DIAGNOSE_ALREADY_USED");
  const id=Buffer.from(a.requestIdHex,"hex");
  const expected=PublicKey.findProgramAddressSync([
    Buffer.from("payment-allowance"),
    pk(state.mandate).toBuffer(),
    pk(state.mint).toBuffer(),id,
  ],pk(program))[0].toBase58();
  assert.equal(expected,allowanceAddress,"MISMATCHED_PUBLIC_ALLOWANCE_ADDRESS");
  await simulate("correctRecipient",state.recipientA,state.recipientAAta,id,a.nonce,a.guardian);
  await simulate("mutatedRecipient",state.recipientB,state.recipientBAta,id,a.nonce,a.guardian);
  const end=await c.getAccountInfoAndContext(pk(allowanceAddress),"confirmed");
  result.after={rpcSlot:end.context.slot,...accountFields(end.value)};
  assert.equal(result.before.rawDataSha256,result.after.rawDataSha256,
    "FORENSIC_SIMULATION_MUST_NOT_CHANGE_LIVE_ACCOUNT");
  result.stateUnchanged=true;
  result.evidenceClass="LIVE_DEVNET_PUBLIC_ACCOUNT_READ_AND_RPC_SIMULATION";
  result.result="DIAGNOSTIC_COMPLETE_NOT_PAYMENT_PROOF";
  store();
  console.log(JSON.stringify({
    result:result.result,
    onchainFlag:a.usedByte,
    simErrors:Object.fromEntries(Object.entries(result.simulations).map(
      ([name,x])=>[name,{error:x.error,logs:x.logs}],
    )),
    stateUnchanged:result.stateUnchanged,
  },null,2));
})().catch(error=>{
  result.result="DIAGNOSTIC_INCOMPLETE";
  result.error=String(error?.message??error).slice(0,400);
  store();
  console.error("READ_ONLY_DIFFERENTIAL_BLOCKED",result.error);
  process.exitCode=1;
});
