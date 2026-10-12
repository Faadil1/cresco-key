#!/usr/bin/env node
"use strict";
/**
 * Verify the BPF bytecode CURRENTLY executing for Cresco Key on public Solana
 * Devnet. Only public getAccountInfo reads; no key, signature, transaction,
 * upgrade or mutation. Compare SHA-256 to the exact original deployment build.
 */
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { PublicKey } = require("@solana/web3.js");
const RPC_URL = "https://api.devnet.solana.com";
const PROGRAM = "6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP";
const EXPECTED_PROGRAMDATA = "GP75FLXAApEU5WBDMLzPHeMiX6PgAzx2evuR9VJgw9u9";
const EXPECTED_DEPLOY_SLOT = "507272982";
const DEPLOY_BUILD_BINARY_SHA256 = "7f45c16253e886160f9c9242edb46ab45c868e2d36767192b8d76e9db605a77c";
const OUTPUT = path.resolve(__dirname,"../../evidence/devnet-distinct-program/runtime-binary-fingerprint.json");
const LOADER = "BPFLoaderUpgradeab1e11111111111111111111111";
const info = {
  schema:"cresco-key.devnet-executable-fingerprint.v1",
  evidenceClass:"LIVE_DEVNET_PUBLIC_RPC_READ_ONLY",
  observedProgramId:PROGRAM,
  expectedProgramdata:EXPECTED_PROGRAMDATA,
  priorDeployRun:37182728261,
  priorSourceCommit:"0db1f52ff35961fdd1191cff61f8324fe470f504",
  priorBuildHash:DEPLOY_BUILD_BINARY_SHA256,
  lastDeploySlotFromReceipt:EXPECTED_DEPLOY_SLOT,
  noPrivateKeys:true,
  noTransactions:true,
  noProgramUpgrades:true,
  checkedAt:new Date().toISOString(),
};
function save(){fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});fs.writeFileSync(OUTPUT,JSON.stringify(info,null,2)+"\n");}
async function rpc(method, params){
  const response=await fetch(RPC_URL,{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params}),
    signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error("DEVNET_RPC_HTTP_"+response.status);
  const data=await response.json();
  if(data.error)throw Error("DEVNET_RPC_ERROR_"+JSON.stringify(data.error).slice(0,250));
  return data.result;
}
function parseAccount(info){
  if(!info?.value)throw Error("PROGRAM_ACCOUNT_MISSING");
  const v=info.value;
  if(v.owner!==LOADER)throw Error("PROGRAM_LOADER_OWNER_MISMATCH");
  if(v.data?.[1]!=="base64")throw Error("ACCOUNT_NOT_BASE64");
  return Buffer.from(v.data[0],"base64");
}
(async()=>{
  const p=await rpc("getAccountInfo",[PROGRAM,{encoding:"base64",commitment:"confirmed"}]);
  const b=parseAccount(p);
  if(b.length!==36||b.readUInt32LE(0)!==2)throw Error("INVALID_UPGRADEABLE_PROGRAM_ACCOUNT");
  const derived=new PublicKey(b.subarray(4,36)).toBase58();
  info.actualProgramdata=derived;
  if(derived!==EXPECTED_PROGRAMDATA)throw Error("PROGRAMDATA_ADDRESS_CHANGED");
  const r=await rpc("getAccountInfo",[derived,{encoding:"base64",commitment:"confirmed"}]);
  const v=r?.value;
  if(!v||v.owner!==LOADER||v.data?.[1]!=="base64")throw Error("INVALID_PROGRAMDATA_ACCOUNT");
  const d=Buffer.from(v.data[0],"base64");
  if(d.length<45||d.readUInt32LE(0)!==3)throw Error("INVALID_UPGRADEABLE_PROGRAMDATA_HEADER");
  const slot=d.readBigUInt64LE(4).toString();
  const authorityOption=d[12];
  if(authorityOption!==1&&authorityOption!==0)throw Error("INVALID_UPGRADE_AUTHORITY_OPTION");
  const rawAuthority=authorityOption===1?new PublicKey(d.subarray(13,45)).toBase58():null;
  const bytes=d.subarray(45);
  const full= createHash("sha256").update(bytes).digest("hex");
  // The loader account may have trailing zero-padded allocation bytes. Distinguish
  // entire allocation hash from possible trimmed content. Never silently claim
  // identity on matching only one heuristic.
  let lastNonZero=bytes.length-1;
  while(lastNonZero>=0&&bytes[lastNonZero]===0)lastNonZero--;
  const trimSha=createHash("sha256").update(bytes.subarray(0,lastNonZero+1)).digest("hex");
  info.programData={
    slot,
    matchesHistoricalDeploySlot:slot===EXPECTED_DEPLOY_SLOT,
    currentAuthority:rawAuthority,
    accountLengthBytes:d.length,
    bpfBytesIncludingAllocation:bytes.length,
    bpfSha256FullAllocation:full,
    bpfSha256TrimmedZeroPadding:trimSha,
    trailingZeroBytes:bytes.length-lastNonZero-1,
    startsWithELF: bytes.subarray(0,4).equals(Buffer.from([0x7f,0x45,0x4c,0x46])),
  };
  info.binaryMatchesHistoricalBuildHash={
    full:full===DEPLOY_BUILD_BINARY_SHA256,
    trimmed:trimSha===DEPLOY_BUILD_BINARY_SHA256,
  };
  info.result=slot!==EXPECTED_DEPLOY_SLOT?
    "UPGRADED_SINCE_HISTORICAL_RECEIPT":
    (info.binaryMatchesHistoricalBuildHash.full||info.binaryMatchesHistoricalBuildHash.trimmed)?
      "DEPLOYED_BINARY_HASH_MATCHES_HISTORICAL_BUILD":
      "SLOT_MATCHES_BUT_BINARY_HASH_DIFFERS_OR_PADDING_UNDETERMINED";
  save();
  console.log(JSON.stringify(info,null,2));
  if(!info.programData.startsWithELF)throw Error("CURRENT_PROGRAMDATA_NOT_ELF");
})().catch(error=>{
 info.error=String(error?.message||error).slice(0,400);
 info.result="UNKNOWN_OR_INVALID_READ";
 save();
 console.error("CRESCO_PROGRAM_FINGERPRINT=NOT_VERIFIED",info.error);
 process.exitCode=1;
});
