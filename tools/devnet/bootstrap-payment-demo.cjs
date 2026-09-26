const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHash } = require("node:crypto");

const anchor = require("@coral-xyz/anchor");
const spl = require("@solana/spl-token");

const {
  Keypair,
  Connection,
  PublicKey,
  SystemProgram,
} = anchor.web3;

const {
  TOKEN_PROGRAM_ID,
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} = spl;

const ORIGINAL_CRESCO_PROGRAM =
  "ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk";

const TARGET_STAGE = 3;
const TOKEN_DECIMALS = 6;
const MAX_ACTION = 10_000_000;
const MAX_PERIOD = 100_000_000;
const PERIOD_SECONDS = 30 * 24 * 60 * 60;
const TARGET_VAULT_BALANCE = 100_000_000;

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function expandHome(value) {
  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return path.join(os.homedir(), value.slice(2));
  }
  return path.resolve(value);
}

function loadKeypair(filePath) {
  const resolved = expandHome(filePath);
  const bytes = JSON.parse(fs.readFileSync(resolved, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

function hash32(value) {
  return Array.from(createHash("sha256").update(value).digest());
}

function nonceBytes(value) {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(BigInt(value));
  return out;
}

function statePath() {
  const configured = process.env.CRESCO_KEY_DEMO_STATE?.trim();
  return configured
    ? expandHome(configured)
    : path.join(os.homedir(), ".config", "solana", "cresco-key-demo-state.json");
}

function readState() {
  const file = statePath();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeState(value) {
  const file = statePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", {
    mode: 0o600,
  });
  return file;
}

async function main() {
  const guardian = loadKeypair(requireEnv("CRESCO_GUARDIAN_KEYPAIR"));
  const beneficiary = loadKeypair(requireEnv("CRESCO_BENEFICIARY_KEYPAIR"));

  if (guardian.publicKey.equals(beneficiary.publicKey)) {
    throw new Error(
      "GUARDIAN_AND_BENEFICIARY_MUST_BE_DISTINCT_FOR_TWO_DEVICE_PROOF",
    );
  }

  const rpcUrl =
    process.env.SOLANA_RPC_URL?.trim() || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");
  const wallet = new anchor.Wallet(guardian);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  anchor.setProvider(provider);
  const program = anchor.workspace.Keys;

  if (program.programId.toBase58() === ORIGINAL_CRESCO_PROGRAM) {
    throw new Error(
      "SAFETY_STOP_ORIGINAL_CRESCO_PROGRAM_ID_STILL_ACTIVE. Run the distinct program provisioning step first.",
    );
  }

  const expectedProgramId =
    process.env.CRESCO_KEY_EXPECTED_PROGRAM_ID?.trim();
  if (
    expectedProgramId &&
    program.programId.toBase58() !== expectedProgramId
  ) {
    throw new Error(
      `PROGRAM_ID_MISMATCH expected=${expectedProgramId} actual=${program.programId.toBase58()}`,
    );
  }

  const [charter] = PublicKey.findProgramAddressSync(
    [Buffer.from("charter"), beneficiary.publicKey.toBuffer()],
    program.programId,
  );
  const [mandate] = PublicKey.findProgramAddressSync(
    [Buffer.from("mandate"), charter.toBuffer()],
    program.programId,
  );

  let charterState = await program.account.charter.fetchNullable(charter);
  if (!charterState) {
    const tx = await program.methods
      .initializeCharter(
        hash32("CRESCO-KEY-CLOCK-IN-DEVNET-DEMO"),
        new anchor.BN(100_000_000),
        new anchor.BN(100_000_000),
      )
      .accountsStrict({
        charter,
        guardian: guardian.publicKey,
        beneficiary: beneficiary.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([beneficiary])
      .rpc();
    console.log(`CRESCO_KEY_DEMO initialize_charter_tx=${tx}`);
    charterState = await program.account.charter.fetch(charter);
  }

  if (
    !charterState.guardian.equals(guardian.publicKey) ||
    !charterState.beneficiary.equals(beneficiary.publicKey)
  ) {
    throw new Error("CRESCO_KEY_CHARTER_ROLE_MISMATCH");
  }

  let mandateState = await program.account.mandate.fetchNullable(mandate);
  if (!mandateState) {
    const tx = await program.methods
      .initializeMandate()
      .accountsStrict({
        charter,
        mandate,
        guardian: guardian.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`CRESCO_KEY_DEMO initialize_mandate_tx=${tx}`);
    mandateState = await program.account.mandate.fetch(mandate);
  }

  if (mandateState.status === 2) {
    throw new Error("CRESCO_KEY_MANDATE_REVOKED");
  }

  if (mandateState.status === 1) {
    const tx = await program.methods
      .setMandateStatus(new anchor.BN(mandateState.nonce.toString()), 0)
      .accountsStrict({
        charter,
        mandate,
        guardian: guardian.publicKey,
      })
      .rpc();
    console.log(`CRESCO_KEY_DEMO resume_mandate_tx=${tx}`);
    mandateState = await program.account.mandate.fetch(mandate);
  }

  if (mandateState.stage < TARGET_STAGE) {
    const nonce = BigInt(mandateState.nonce.toString());
    const [reviewReceipt] = PublicKey.findProgramAddressSync(
      [Buffer.from("review"), mandate.toBuffer(), nonceBytes(nonce)],
      program.programId,
    );

    const existingReview =
      await program.account.reviewReceipt.fetchNullable(reviewReceipt);

    if (!existingReview) {
      const tx = await program.methods
        .recordReview(hash32("CLOCK-IN-P0-BOUNDARY-PAYMENT"), true)
        .accountsStrict({
          charter,
          mandate,
          reviewReceipt,
          guardian: guardian.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log(`CRESCO_KEY_DEMO record_review_tx=${tx}`);
    }

    const tx = await program.methods
      .transitionMandate(
        TARGET_STAGE,
        new anchor.BN(nonce.toString()),
      )
      .accountsStrict({
        charter,
        mandate,
        reviewReceipt,
        guardian: guardian.publicKey,
      })
      .rpc();
    console.log(`CRESCO_KEY_DEMO transition_bounded_tx=${tx}`);
    mandateState = await program.account.mandate.fetch(mandate);
  }

  let state = readState();
  if (
    state &&
    (state.programId !== program.programId.toBase58() ||
      state.beneficiary !== beneficiary.publicKey.toBase58() ||
      state.guardian !== guardian.publicKey.toBase58())
  ) {
    console.log(
      "CRESCO_KEY_DEMO existing state belongs to a different program/role pair; creating fresh public demo state.",
    );
    state = null;
  }

  let mint;
  let recipientA;
  let recipientB;

  if (state?.mint && state?.recipientA && state?.recipientB) {
    mint = new PublicKey(state.mint);
    recipientA = new PublicKey(state.recipientA);
    recipientB = new PublicKey(state.recipientB);
  } else {
    mint = await createMint(
      connection,
      guardian,
      guardian.publicKey,
      null,
      TOKEN_DECIMALS,
    );
    recipientA = Keypair.generate().publicKey;
    recipientB = Keypair.generate().publicKey;
    console.log(`CRESCO_KEY_DEMO created_demo_mint=${mint.toBase58()}`);
  }

  const [assetRule] = PublicKey.findProgramAddressSync(
    [Buffer.from("asset-rule"), mandate.toBuffer(), mint.toBuffer()],
    program.programId,
  );
  const [vaultTokenAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), mandate.toBuffer(), mint.toBuffer()],
    program.programId,
  );

  let rule = await program.account.assetRule.fetchNullable(assetRule);

  if (!rule) {
    const tx = await program.methods
      .initializeAssetRule(
        new anchor.BN(mandateState.nonce.toString()),
        1,
        new anchor.BN(MAX_ACTION),
        new anchor.BN(MAX_PERIOD),
        new anchor.BN(PERIOD_SECONDS),
        new anchor.BN(0),
        0,
      )
      .accountsStrict({
        charter,
        mandate,
        assetRule,
        vaultTokenAccount,
        mint,
        guardian: guardian.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`CRESCO_KEY_DEMO initialize_asset_rule_tx=${tx}`);
    mandateState = await program.account.mandate.fetch(mandate);
    rule = await program.account.assetRule.fetch(assetRule);
  } else {
    const needsUpdate =
      !rule.enabled ||
      Number(rule.actionMask) !== 1 ||
      rule.maxActionAmount.toNumber() !== MAX_ACTION ||
      rule.maxPeriodAmount.toNumber() !== MAX_PERIOD ||
      rule.periodSeconds.toNumber() !== PERIOD_SECONDS;

    if (needsUpdate) {
      const tx = await program.methods
        .updateAssetRule(
          new anchor.BN(mandateState.nonce.toString()),
          true,
          1,
          new anchor.BN(MAX_ACTION),
          new anchor.BN(MAX_PERIOD),
          new anchor.BN(PERIOD_SECONDS),
          new anchor.BN(0),
          0,
        )
        .accountsStrict({
          charter,
          mandate,
          assetRule,
          guardian: guardian.publicKey,
        })
        .rpc();
      console.log(`CRESCO_KEY_DEMO update_asset_rule_tx=${tx}`);
      mandateState = await program.account.mandate.fetch(mandate);
      rule = await program.account.assetRule.fetch(assetRule);
    }
  }

  const recipientAAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    guardian,
    mint,
    recipientA,
  );
  const recipientBAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    guardian,
    mint,
    recipientB,
  );

  let vault = await getAccount(connection, vaultTokenAccount);
  if (Number(vault.amount) < TARGET_VAULT_BALANCE) {
    const topUp = TARGET_VAULT_BALANCE - Number(vault.amount);
    const signature = await mintTo(
      connection,
      guardian,
      mint,
      vaultTokenAccount,
      guardian,
      topUp,
    );
    console.log(
      `CRESCO_KEY_DEMO vault_top_up_tx=${signature} amount=${topUp}`,
    );
    vault = await getAccount(connection, vaultTokenAccount);
  }

  mandateState = await program.account.mandate.fetch(mandate);

  const amount5 = "5";
  const amount12 = "12";
  const common = `spl-token=${encodeURIComponent(mint.toBase58())}&label=${encodeURIComponent("CRESCO Key Demo")}`;

  const receipt = {
    schema: "cresco-key/devnet-payment-demo/v1",
    status: "READY_FOR_MOBILE_RUNTIME",
    network: "devnet",
    rpcUrl,
    programId: program.programId.toBase58(),
    tokenProgramId: TOKEN_PROGRAM_ID.toBase58(),
    guardian: guardian.publicKey.toBase58(),
    beneficiary: beneficiary.publicKey.toBase58(),
    charter: charter.toBase58(),
    mandate: mandate.toBase58(),
    mandateVersion: mandateState.version.toNumber(),
    mandateNonce: mandateState.nonce.toNumber(),
    mint: mint.toBase58(),
    tokenDecimals: TOKEN_DECIMALS,
    assetRule: assetRule.toBase58(),
    vaultTokenAccount: vaultTokenAccount.toBase58(),
    vaultBalanceBaseUnits: Number(vault.amount),
    standingMaxActionBaseUnits: MAX_ACTION,
    standingMaxPeriodBaseUnits: MAX_PERIOD,
    recipientA: recipientA.toBase58(),
    recipientAAta: recipientAAccount.address.toBase58(),
    recipientB: recipientB.toBase58(),
    recipientBAta: recipientBAccount.address.toBase58(),
    solanaPay: {
      inBounds5: `solana:${recipientA.toBase58()}?amount=${amount5}&${common}`,
      boundary12: `solana:${recipientA.toBase58()}?amount=${amount12}&${common}`,
      changedRecipient12: `solana:${recipientB.toBase58()}?amount=${amount12}&${common}`,
    },
    mobileEnv: {
      EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID: program.programId.toBase58(),
      EXPO_PUBLIC_DEMO_TOKEN_PROGRAM_ID: TOKEN_PROGRAM_ID.toBase58(),
      EXPO_PUBLIC_DEMO_TOKEN_DECIMALS: String(TOKEN_DECIMALS),
      EXPO_PUBLIC_DEMO_MANDATE_NONCE: String(
        mandateState.nonce.toNumber(),
      ),
      EXPO_PUBLIC_DEMO_GUARDIAN_WALLET:
        guardian.publicKey.toBase58(),
      EXPO_PUBLIC_DEMO_MUTATED_RECIPIENT: recipientB.toBase58(),
    },
    truthBoundary: {
      demoToken: true,
      realStablecoin: false,
      realFiatSettlement: false,
      realMinorFinancialAccount: false,
      guardianAndBeneficiaryDistinct: true,
    },
    generatedAt: new Date().toISOString(),
  };

  const file = writeState(receipt);
  console.log(JSON.stringify(receipt, null, 2));
  console.log(`CRESCO_KEY_DEMO_STATE=${file}`);
  console.log("CRESCO_KEY_DEMO=READY_FOR_MOBILE_RUNTIME");
}

main().catch((error) => {
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
