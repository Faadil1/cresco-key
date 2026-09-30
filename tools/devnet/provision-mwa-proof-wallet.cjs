const fs = require("node:fs");
const path = require("node:path");
const anchor = require("@coral-xyz/anchor");

const { Connection, Keypair, LAMPORTS_PER_SOL } = anchor.web3;

const rpcUrl =
  process.env.SOLANA_RPC_URL?.trim() || "https://api.devnet.solana.com";
const localPropertiesPath = process.argv[2];
const receiptPath = process.argv[3];

if (!localPropertiesPath || !receiptPath) {
  throw new Error(
    "usage: node provision-mwa-proof-wallet.cjs <mock-wallet-local.properties> <public-receipt.json>",
  );
}

const connection = new Connection(rpcUrl, "confirmed");
const keypair = Keypair.generate();
const seed = Buffer.from(keypair.secretKey.slice(0, 32)).toString("base64");
const targetLamports = Math.floor(0.01 * LAMPORTS_PER_SOL);

async function fund() {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const signature = await connection.requestAirdrop(
        keypair.publicKey,
        targetLamports,
      );
      await connection.confirmTransaction(signature, "confirmed");
      const balance = await connection.getBalance(keypair.publicKey, "confirmed");
      if (balance <= 0) {
        throw new Error("AIRDROP_CONFIRMED_BUT_BALANCE_ZERO");
      }
      return { signature, balance, attempt };
    } catch (error) {
      lastError = error;
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
      }
    }
  }
  throw new Error(
    `DEVNET_AIRDROP_FAILED_AFTER_RETRIES: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

async function main() {
  const funding = await fund();

  fs.mkdirSync(path.dirname(localPropertiesPath), { recursive: true });
  fs.writeFileSync(
    localPropertiesPath,
    `sdk.dir=${process.env.ANDROID_HOME}\nprivateKey=${seed}\nwalletName=CRESCO Devnet Proof Wallet\n`,
    { mode: 0o600 },
  );

  const receipt = {
    schema: "cresco-key/devnet-proof-wallet/v1",
    network: "devnet",
    rpcUrl,
    walletAddress: keypair.publicKey.toBase58(),
    funding: {
      airdropSignature: funding.signature,
      balanceLamports: funding.balance,
      attempt: funding.attempt,
    },
    ephemeralDevnetOnly: true,
    privateKeyPersisted: false,
    generatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
  process.stdout.write(
    `DEVNET_PROOF_WALLET_READY address=${receipt.walletAddress} balanceLamports=${receipt.funding.balance}\n`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
