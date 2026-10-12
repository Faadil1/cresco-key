import { address } from "@solana/kit";
import { useMobileWallet } from "@wallet-ui/react-native-kit";
import * as Linking from "expo-linking";
import { randomBytes } from "react-native-quick-crypto";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  Text,
  View,
} from "react-native";

import { PaymentScanner } from "./payment/PaymentScanner";
import {
  deriveEnrollmentAccounts,
  parseDistinctGuardianWallet,
  type EnrollmentInspection,
} from "./solana/enrollment";
import {
  checkPaymentReadiness,
  type PaymentReadiness,
  type ReadinessRpc,
} from "./solana/paymentReadiness";
import { MuseumHero, MuseumPlate, MuseumButton, MuseumFact, ProofStrip, museumColors as color } from "./design/MuseumLedgerUI";
import { SkrCharterAtelier } from "./skr/SkrCharterAtelier";
import { KeyPeriodUsage } from "./KeyPeriodUsage";
import { LivingKeySeal } from "./design/LivingKeySeal";
import { KeyPortal } from "./design/KeyPortal";
import {
  inspectStandingKey,
  assessStandingIntent,
  buildWidenStandingKeyInstruction,
  displayTokenUnits,
  type KeyInspection,
  type StandingKeySnapshot,
  type StandingKeyRpc,
} from "./solana/standingKey";
import {
  decimalToBaseUnits,
  parseSolanaPayTransferRequest,
  type SolanaPayTransferIntent,
} from "./payment/solanaPay";
import {
  createBoundaryDeepLink,
  parseBoundaryDeepLink,
  type BoundaryDeepLink,
} from "./relay/deepLink";
import {
  createBoundaryRequest,
  getBoundaryRequest,
  postBoundaryRelayEvent,
  type BoundaryRelayRequest,
} from "./relay/client";
import {
  saveBoundaryCapability,
  saveRecentYoungSession,
  loadRecentYoungSession,
} from "./relay/storage";
import {
  buildExecutePaymentOnceInstruction,
  buildExecutePaymentWithinMandateInstruction,
  buildGrantPaymentAllowanceOnceInstruction,
  derivePaymentAccounts,
  derivePaymentAllowanceAccounts,
  paymentProgramConfigFromEnv,
} from "./solana/programClient";
import {
  classifyProgramSubmissionError,
  waitForTransactionOutcome,
  type TransactionOutcome,
} from "./solana/outcome";

type Mode = "YOUNG" | "GUARDIAN" | null;
type ExactExecutionState = "IDLE" | "ALLOW" | "REFUSE" | "UNKNOWN";
type G1ReceiptScenario =
  | "WALLET_PROOF"
  | "STANDING_PAYMENT"
  | "PRECHECK_BLOCKED"
  | "KEY_SETUP_PREFLIGHT"
  | "BOUNDARY_REQUEST"
  | "GUARDIAN_ALLOW_ONCE"
  | "GUARDIAN_REFUSE"
  | "GUARDIAN_WIDEN_KEY"
  | "EXACT_ALLOWANCE_EXECUTION"
  | "CHANGED_RECIPIENT_MUTATION";

function randomRequestId(): string {
  return randomBytes(32).toString("hex");
}

function demoConfig() {
  const decimals = Number(process.env.EXPO_PUBLIC_DEMO_TOKEN_DECIMALS ?? "6");

  return {
    mandateNonce: process.env.EXPO_PUBLIC_DEMO_MANDATE_NONCE?.trim() ?? "",
    guardianWallet: process.env.EXPO_PUBLIC_DEMO_GUARDIAN_WALLET?.trim() ?? "",
    beneficiaryWallet: process.env.EXPO_PUBLIC_DEMO_BENEFICIARY_WALLET?.trim() ?? "",
    mutatedRecipient:
      process.env.EXPO_PUBLIC_DEMO_MUTATED_RECIPIENT?.trim() ?? "",
    demoSolanaPay: {
      inBounds5:
        process.env.EXPO_PUBLIC_DEMO_SOLANA_PAY_IN_BOUNDS_5?.trim() ?? "",
      boundary12:
        process.env.EXPO_PUBLIC_DEMO_SOLANA_PAY_BOUNDARY_12?.trim() ?? "",
      changedRecipient12:
        process.env.EXPO_PUBLIC_DEMO_SOLANA_PAY_CHANGED_RECIPIENT_12?.trim() ??
        "",
    },
    tokenDecimals: decimals,
  };
}

function missingCapitalConfig(
  config: ReturnType<typeof demoConfig>,
): string[] {
  const missing: string[] = [];
  if (!process.env.EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID?.trim()) {
    missing.push("CRESCO_KEY_PROGRAM_ID");
  }
  if (!process.env.EXPO_PUBLIC_DEMO_TOKEN_PROGRAM_ID?.trim()) {
    missing.push("DEMO_TOKEN_PROGRAM_ID");
  }
  if (!Number.isInteger(config.tokenDecimals) || config.tokenDecimals < 0) {
    missing.push("DEMO_TOKEN_DECIMALS");
  }
  return missing;
}

function missingRelayConfig(config: ReturnType<typeof demoConfig>): string[] {
  const missing = missingCapitalConfig(config);
  if (!process.env.EXPO_PUBLIC_BOUNDARY_RELAY_URL?.trim()) {
    missing.push("BOUNDARY_RELAY_URL");
  }
  return missing;
}

function outcomeLabel(outcome: TransactionOutcome): string {
  if (outcome.state === "ALLOW") {
    return `ALLOW · ${outcome.signature}`;
  }
  if (outcome.state === "REFUSE") {
    return `REFUSE · ${outcome.evidence}${
      outcome.signature ? ` · ${outcome.signature}` : ""
    }`;
  }
  return `UNKNOWN · ${String(outcome.error)}${
    outcome.signature ? ` · ${outcome.signature}` : ""
  }`;
}

function outcomeReceipt(outcome: TransactionOutcome) {
  if (outcome.state === "ALLOW") {
    return {
      state: outcome.state,
      signature: outcome.signature.toString(),
      confirmationStatus: outcome.confirmationStatus,
    };
  }

  if (outcome.state === "REFUSE") {
    return {
      state: outcome.state,
      signature: outcome.signature?.toString() ?? null,
      evidence: outcome.evidence,
    };
  }

  return {
    state: outcome.state,
    signature: outcome.signature?.toString() ?? null,
    error: outcome.error instanceof Error ? outcome.error.message : outcome.error,
  };
}

function receiptValue(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map(receiptValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, receiptValue(entry)]),
    );
  }
  return value;
}

function demoIntentOptions(config: ReturnType<typeof demoConfig>) {
  return [
    {
      label: "Load 5-unit in-bounds demo intent",
      value: config.demoSolanaPay.inBounds5,
    },
    {
      label: "Load 12-unit boundary demo intent",
      value: config.demoSolanaPay.boundary12,
    },
  ].filter((option) => option.value.length > 0);
}

function relayDecisionLabel(request: BoundaryRelayRequest | null): string {
  if (!request) return "Waiting for boundary";
  if (request.status === "PENDING") return "Guardian decision pending";
  if (request.status === "REFUSED") return "Not this time";
  if (request.status === "ALLOWANCE_SUBMITTED") return "Allow once submitted";
  if (request.status === "KEY_CHANGE_REPORTED") return "Standing Key change reported — verify onchain";
  return request.status;
}

function exactUseLabel(state: ExactExecutionState): string {
  if (state === "ALLOW") return "Exact use consumed";
  if (state === "REFUSE") return "Mutation/replay refused";
  if (state === "UNKNOWN") return "Unknown is not success";
  return "Not retried yet";
}

export function BoundaryWorkspace() {
  const {
    account,
    chain,
    client,
    sendTransactions,
    signMessages,
  } = useMobileWallet();

  const [mode, setMode] = useState<Mode>(null);
  // Disclosure state is UX only: never used to bypass chain or wallet checks.
  const [showYoungSetup, setShowYoungSetup] = useState(false);
  const [showWidenControls, setShowWidenControls] = useState(false);
  const [showSkr, setShowSkr] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [intent, setIntent] = useState<SolanaPayTransferIntent | null>(null);
  // The configured scenario is a test convenience, never an eligibility rule
  // for an independently provisioned beneficiary's scanned Solana Pay request.
  const [usingConfiguredTestIntent, setUsingConfiguredTestIntent] = useState(false);
  const [verifiedMintInfo, setVerifiedMintInfo] =
    useState<{ mint: string; decimals: number } | null>(null);
  const [relayRequest, setRelayRequest] =
    useState<BoundaryRelayRequest | null>(null);
  const [guardianCapability, setGuardianCapability] =
    useState<BoundaryDeepLink | null>(null);
  const [youngCapability, setYoungCapability] =
    useState<BoundaryDeepLink | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "No capital-path action has been attempted.",
  );
  const [busy, setBusy] = useState(false);
  const [walletProof, setWalletProof] = useState(
    "Wallet connected. Signature proof not attempted on this session.",
  );
  const [latestReceiptJson, setLatestReceiptJson] = useState<string | null>(
    null,
  );
  const [exactExecutionState, setExactExecutionState] =
    useState<ExactExecutionState>("IDLE");
  const [standingOutcome, setStandingOutcome] = useState<ExactExecutionState>("IDLE");
  const [preflightBlocked, setPreflightBlocked] = useState<string | null>(null);
  const [guardianSetupAddress, setGuardianSetupAddress] = useState("");
  const [enrollmentInspection, setEnrollmentInspection] = useState<EnrollmentInspection | null>(null);
  const [paymentReadiness, setPaymentReadiness] = useState<PaymentReadiness | null>(null);
  const [guardianKeyInspection, setGuardianKeyInspection] = useState<KeyInspection | null>(null);
  const [youngKeyInspection, setYoungKeyInspection] = useState<KeyInspection | null>(null);
  const [nextActionLimit, setNextActionLimit] = useState("");
  const [nextPeriodLimit, setNextPeriodLimit] = useState("");
  const [widenAcknowledged, setWidenAcknowledged] = useState(false);

  const config = useMemo(() => demoConfig(), []);
  const youngDisplayDecimals = verifiedMintInfo && verifiedMintInfo.mint === intent?.mint
    ? verifiedMintInfo.decimals : null;
  const guardianDisplayDecimals = verifiedMintInfo && verifiedMintInfo.mint === relayRequest?.mint
    ? verifiedMintInfo.decimals : null;
  const capitalConfigMissing = useMemo(
    () => missingCapitalConfig(config),
    [config],
  );
  const relayConfigMissing = useMemo(
    () => missingRelayConfig(config),
    [config],
  );
  const configuredDemoIntents = useMemo(
    () => demoIntentOptions(config),
    [config],
  );
  // The deployed sample mandate belongs to one beneficiary. A newly created
  // Solflare account must not be sent a transaction for somebody else's charter.
  // This is a public build-config check, not proof of on-chain account existence.
  const demoBeneficiaryBlocker = usingConfiguredTestIntent && (
    !config.beneficiaryWallet
      ? "Configured Devnet beneficiary is missing from this APK. This fixed test scenario cannot run."
      : account?.address.toString() !== config.beneficiaryWallet
        ? "This test scenario belongs to another beneficiary. Scan your own request for your independently provisioned Key."
        : null
  );

  // Read token decimals from the actual mint, not from the demo build.
  // A wrong decimal exponent silently changes the money amount.
  const readLiveMintDecimals = async (mint: string): Promise<number> => {
    const response = await client.rpc.getTokenSupply(address(mint)).send();
    const decimals = response.value.decimals;
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
      throw new Error("TOKEN_MINT_DECIMALS_UNSUPPORTED");
    }
    setVerifiedMintInfo({ mint, decimals });
    return decimals;
  };

  const makeStandingKeyRpc = (): StandingKeyRpc => ({
    getAccountInfo: (key, options) => ({
      send: async () => {
        const response = await client.rpc.getAccountInfo(key, options).send();
        return {
          value: response.value
            ? { owner: response.value.owner, data: response.value.data as readonly [string, string] }
            : null,
        };
      },
    }),
  });

  const rpcForOutcome: Parameters<typeof waitForTransactionOutcome>[0] = {
    getSignatureStatuses: (signatures) =>
      client.rpc.getSignatureStatuses(signatures),
    getTransaction: (signature, options) =>
      client.rpc.getTransaction(signature, options),
  };

  const recordReceipt = (
    scenario: G1ReceiptScenario,
    details: Record<string, unknown>,
  ) => {
    const receipt = {
      schema: "cresco-key.mobile-g1-runtime-receipt.v1",
      capturedAt: new Date().toISOString(),
      scenario,
      truthBoundary:
        "Public runtime receipt only. It does not contain private keys, seed phrases, wallet secrets, or custody material.",
      wallet: {
        address: account?.address?.toString() ?? null,
        chain,
      },
      program: {
        programId:
          process.env.EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID?.trim() ?? null,
        mandateNonce: config.mandateNonce || null,
        mandateNonceSource: "BUILD_CONFIG_NOT_LIVE_AT_RECEIPT_TIME",
        tokenProgramId:
          process.env.EXPO_PUBLIC_DEMO_TOKEN_PROGRAM_ID?.trim() ?? null,
      },
      intent: intent
        ? {
            amountUi: intent.amountUi,
            mint: intent.mint,
            recipient: intent.recipient,
            label: intent.label ?? null,
          }
        : null,
      relay: relayRequest
        ? {
            requestId: relayRequest.requestId,
            status: relayRequest.status,
            mandate: relayRequest.mandate,
            mint: relayRequest.mint,
            recipient: relayRequest.recipient,
            amountBaseUnits: relayRequest.amountBaseUnits,
            requesterWallet: relayRequest.requesterWallet,
            guardianWallet: relayRequest.guardianWallet,
          }
        : null,
      details,
    };

    setLatestReceiptJson(JSON.stringify(receiptValue(receipt), null, 2));
  };

  // Read the actual connected beneficiary's Devnet accounts, never just the
  // historical build-time demo beneficiary. No authority or funds are changed.
  const inspectMyKeySetup = async () => {
    if (!account || busy) return;
    if (chain !== "solana:devnet") {
      setEnrollmentInspection(null);
      setStatus("KEY SETUP BLOCKED · Switch the connected wallet to Solana Devnet.");
      return;
    }
    setBusy(true);
    setEnrollmentInspection(null);
    try {
      const program = paymentProgramConfigFromEnv();
      const derived = await deriveEnrollmentAccounts(program.programId, account.address);
      const [charterState, mandateState, balance] = await Promise.all([
        client.rpc.getAccountInfo(derived.charter, { encoding: "base64" }).send(),
        client.rpc.getAccountInfo(derived.mandate, { encoding: "base64" }).send(),
        client.rpc.getBalance(account.address).send(),
      ]);
      if (
        (charterState.value && charterState.value.owner !== program.programId) ||
        (mandateState.value && mandateState.value.owner !== program.programId)
      ) {
        throw new Error("ACCOUNT_OWNER_MISMATCH_NO_SETUP_AUTHORITY");
      }
      const charterExists = charterState.value !== null;
      const mandateExists = mandateState.value !== null;
      const state: EnrollmentInspection = {
        beneficiary: account.address.toString(),
        charter: derived.charter.toString(),
        mandate: derived.mandate.toString(),
        charterExists,
        mandateExists,
        walletBalanceLamports: balance.value.toString(),
        inspectedAt: new Date().toISOString(),
        status: !charterExists && !mandateExists
          ? "NOT_PROVISIONED"
          : charterExists && mandateExists
            ? "ACCOUNTS_PRESENT_UNVERIFIED"
            : "PARTIAL_SETUP",
      };
      setEnrollmentInspection(state);
      recordReceipt("KEY_SETUP_PREFLIGHT", {
        state: state.status,
        source: "LIVE_SOLANA_DEVNET_RPC",
        beneficiary: state.beneficiary,
        charter: state.charter,
        mandate: state.mandate,
        charterExists,
        mandateExists,
        walletBalanceLamports: state.walletBalanceLamports,
        publicDataOnly: true,
        signedEnrollmentTransaction: false,
      });
      setStatus(state.status === "NOT_PROVISIONED"
        ? "No live Charter or Mandate found for this wallet. Two distinct signers are required to enroll."
        : "Accounts discovered on Devnet. Presence alone does not verify a valid Guardian or spending authority.");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "DEVNET_SETUP_RPC_UNKNOWN";
      setEnrollmentInspection(null);
      recordReceipt("KEY_SETUP_PREFLIGHT", {
        state: "UNKNOWN",
        reason,
        signedEnrollmentTransaction: false,
      });
      setStatus("KEY SETUP UNKNOWN · " + reason);
    } finally {
      setBusy(false);
    }
  };

  const shareEnrollmentRequest = async () => {
    if (!account || !enrollmentInspection || busy ||
      enrollmentInspection.beneficiary !== account.address.toString() ||
      chain !== "solana:devnet") return;
    try {
      const guardian = parseDistinctGuardianWallet(guardianSetupAddress, account.address);
      const request = {
        schema: "cresco-key.public-enrollment-request.v1",
        type: "NONCUSTODIAL_SETUP_REQUEST_NOT_AN_AUTHORIZATION",
        network: "solana:devnet",
        programId: paymentProgramConfigFromEnv().programId.toString(),
        beneficiary: account.address.toString(),
        intendedGuardian: guardian.toString(),
        guardianVerifiedOnchain: false,
        charter: enrollmentInspection.charter,
        mandate: enrollmentInspection.mandate,
        currentAccountStatus: enrollmentInspection.status,
        inspectedAt: enrollmentInspection.inspectedAt,
        signedEnrollmentTransaction: false,
        nextStep: "Guardian and Beneficiary must both independently approve a genuine initialize_charter transaction. Sharing this public request grants no authority.",
      };
      await Share.share({
        title: "CRESCO Key public Devnet enrollment request",
        message: JSON.stringify(request, null, 2),
      });
    } catch (error) {
      setStatus("SETUP REQUEST NOT SHARED · " +
        (error instanceof Error ? error.message : "INVALID_GUARDIAN"));
    }
  };

  const loadGuardianLink = async (url: string) => {
    const capability = parseBoundaryDeepLink(url);
    if (!capability) return;

    setMode("GUARDIAN");
    setGuardianCapability(capability);
    setGuardianKeyInspection(null);
    setWidenAcknowledged(false);
    setBusy(true);
    setStatus("Opening private boundary request.");

    try {
      const request = await getBoundaryRequest(
        capability.requestId,
        capability.relayToken,
      );
      setRelayRequest(request);
      await postBoundaryRelayEvent(
        capability.requestId,
        capability.relayToken,
        { type: "GUARDIAN_OPENED" },
      );
      setStatus(
        "Exact request loaded. Relay state is coordination only; no allowance has been granted.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "REQUEST_OPEN_FAILED");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) void loadGuardianLink(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void loadGuardianLink(url);
    });

    return () => subscription.remove();
  }, []);

  const signWalletProof = async () => {
    if (!account) return;
    setBusy(true);
    try {
      const payload = new TextEncoder().encode(
        `CRESCO Key TRC-01 wallet proof | ${account.address.toString()} | ${chain}`,
      );
      const signature = await signMessages(payload);
      setWalletProof(`SIGNED · ${signature.length} signature bytes`);
      recordReceipt("WALLET_PROOF", {
        state: "SIGNED",
        signatureByteLength: signature.length,
      });
    } catch (error) {
      setWalletProof(
        error instanceof Error
          ? `REFUSED/FAILED · ${error.message}`
          : "UNKNOWN · signing did not complete",
      );
      recordReceipt("WALLET_PROOF", {
        state: "REFUSED",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(false);
    }
  };

  const loadDemoIntent = (raw: string) => {
    try {
      const nextIntent = parseSolanaPayTransferRequest(raw);
      setIntent(nextIntent);
      setUsingConfiguredTestIntent(true);
      setVerifiedMintInfo(null);
      setRelayRequest(null);
      setYoungCapability(null);
      setShareLink(null);
      setExactExecutionState("IDLE");
      setStandingOutcome("IDLE");
      setPreflightBlocked(null);
      setPaymentReadiness(null);
      setYoungKeyInspection(null);
      setStatus(
        "Deterministic Devnet payment intent loaded. No authority decision has been made yet.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "DEMO_INTENT_LOAD_FAILED",
      );
    }
  };

  // Real observed policy boundary can be presented BEFORE MWA submits a
  // transaction doomed to fail wallet simulation. A read-only comparison is
  // NOT an onchain refusal, and must never be recorded as such.
  const createBoundaryForObservedPolicy = async (input: {
    key: StandingKeySnapshot;
    amountBaseUnits: bigint;
    evidence: string;
    source: "READ_ONLY_LIVE_POLICY" | "CONFIRMED_CHAIN_REFUSAL";
    signature?: string | null;
  }) => {
    if (!intent || !account) return;
    if (relayConfigMissing.length > 0) {
      setStatus(
        `Guardian decision cannot be requested: relay unavailable (${relayConfigMissing.join(", ")}). Your Key has not changed.`,
      );
      return;
    }
    const accounts = await derivePaymentAccounts({
      config: paymentProgramConfigFromEnv(),
      beneficiary: address(account.address.toString()),
      mint: address(intent.mint),
      recipient: address(intent.recipient),
    });
    if (accounts.mandate.toString() !== input.key.mandate.toString() ||
        input.key.beneficiary.toString() !== account.address.toString() ||
        input.key.mint.toString() !== intent.mint) {
      throw new Error("BOUNDARY_REQUEST_NOT_BOUND_TO_CURRENT_ONCHAIN_KEY");
    }

    const requestId = randomRequestId();
    const created = await createBoundaryRequest({
      requestId,
      mandate: accounts.mandate,
      mandateNonce: input.key.nonce.toString(),
      mint: intent.mint,
      recipient: intent.recipient,
      amountBaseUnits: input.amountBaseUnits.toString(),
      requesterWallet: account.address.toString(),
      // The actual guardian is recovered from the onchain charter.
      guardianWallet: input.key.guardian.toString(),
      expiresAt: Math.floor(Date.now() / 1000) + 10 * 60,
      display: {
        label: intent.label,
        reason: `${input.source === "READ_ONLY_LIVE_POLICY"
          ? "Live rule comparison (no payment attempted)"
          : "Confirmed program refusal"}: ${input.evidence}${
            input.signature ? ` · tx ${input.signature}` : ""
          }`,
      },
    });
    const capability = { requestId, relayToken: created.relayToken };
    await saveBoundaryCapability(capability);
    await saveRecentYoungSession({
      ...capability,
      beneficiaryWallet: account.address.toString(),
      intentRaw: intent.raw,
    });
    const link = createBoundaryDeepLink(requestId, created.relayToken);
    setYoungCapability(capability);
    setRelayRequest(created.request);
    setShareLink(link);
    setExactExecutionState("IDLE");
    recordReceipt("BOUNDARY_REQUEST", {
      state: "PENDING",
      requestId,
      policyEvidence: input.evidence,
      evidenceClass: input.source,
      signature: input.signature ?? null,
      relayStatus: created.request.status,
      onchainPaymentSubmitted: input.source === "CONFIRMED_CHAIN_REFUSAL",
      authorityChanged: false,
    });
    setStatus(
      input.source === "READ_ONLY_LIVE_POLICY"
        ? "Your live Key limits require a guardian. Private request created without a failed wallet transaction; no funds moved."
        : "A confirmed program refusal was observed. A private guardian request is now pending; no funds moved.",
    );
  };

  // Actual Devnet account inspection, not a generated setup checklist or demo
  // proof. Every payment rechecks before requesting a wallet signature.
  const inspectLivePaymentReadiness = async (requestedAmountBaseUnits?: bigint): Promise<PaymentReadiness> => {
    if (!account || !intent) {
      const result: PaymentReadiness = {
        state: "BLOCKED", reasons: ["WALLET_OR_PAYMENT_INTENT_MISSING"], evidence: [],
      };
      setPaymentReadiness(result);
      return result;
    }
    if (capitalConfigMissing.length > 0) {
      const result: PaymentReadiness = {
        state: "BLOCKED", reasons: capitalConfigMissing.map((name) => `CONFIG_MISSING_${name}`),
        evidence: [],
      };
      setPaymentReadiness(result);
      return result;
    }
    try {
      const readinessRpc: ReadinessRpc = {
        getAccountInfo: (key, options) => ({
          send: async () => {
            const response = await client.rpc.getAccountInfo(key, options).send();
            return {
              value: response.value
                ? { owner: response.value.owner, executable: response.value.executable }
                : null,
            };
          },
        }),
        getBalance: (key) => ({ send: () => client.rpc.getBalance(key).send() }),
        getTokenAccountBalance: (key) => ({
          send: async () => {
            const response = await client.rpc.getTokenAccountBalance(key).send();
            return { value: { amount: response.value.amount } };
          },
        }),
      };
      const amount = requestedAmountBaseUnits ?? BigInt(
        decimalToBaseUnits(intent.amountUi, await readLiveMintDecimals(intent.mint)),
      );
      const result = await checkPaymentReadiness(readinessRpc, {
        chain,
        connectedWallet: account.address.toString(),
        expectedBeneficiary: usingConfiguredTestIntent ? config.beneficiaryWallet : undefined,
        config: paymentProgramConfigFromEnv(),
        mint: intent.mint,
        recipient: intent.recipient,
        requestedAmountBaseUnits: amount,
      });
      setPaymentReadiness(result);
      return result;
    } catch (error) {
      const result: PaymentReadiness = {
        state: "UNKNOWN",
        reason: error instanceof Error ? error.message : "DEVNET_ACCOUNT_READ_FAILED",
        evidence: [],
      };
      setPaymentReadiness(result);
      return result;
    }
  };

  const checkReadinessOnDemand = async () => {
    if (busy || !account || !intent) return;
    setBusy(true);
    setStatus("Inspecting actual Devnet payment accounts and balances. No transaction.");
    try {
      const result = await inspectLivePaymentReadiness();
      setStatus(
        result.state === "READY_FOR_WALLET_ATTEMPT"
          ? "Live Devnet account preflight passed. No payment has been signed or sent."
          : result.state === "BLOCKED"
            ? `PRECHECK BLOCKED · ${result.reasons.join(", ")}`
            : `PRECHECK UNKNOWN · ${result.reason}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const attemptStandingPayment = async () => {
    if (!intent || !account || busy) return;
    if (demoBeneficiaryBlocker) {
      // Local setup mismatch is not a Solana program refusal. Capture it as
      // PRECHECK_BLOCKED without any wallet prompt, transaction or relay event.
      recordReceipt("PRECHECK_BLOCKED", {
        state: "BLOCKED",
        source: "BUILD_CONFIG_BENEFICIARY_MISMATCH",
        reason: demoBeneficiaryBlocker,
        expectedBeneficiary: config.beneficiaryWallet || null,
        connectedWallet: account.address.toString(),
        transactionSubmitted: false,
        financialAuthorityDecision: false,
      });
      setPreflightBlocked(demoBeneficiaryBlocker);
      setStatus("TEST CONFIG BLOCKED · " + demoBeneficiaryBlocker);
      return;
    }
    if (capitalConfigMissing.length > 0) {
      setStatus(`Capital path not configured: ${capitalConfigMissing.join(", ")}`);
      return;
    }

    setBusy(true);
    setPreflightBlocked(null);
    setStatus("Reading actual Devnet Key authority and payment request.");
    try {
      const decimals = await readLiveMintDecimals(intent.mint);
      const amountBaseUnits = BigInt(decimalToBaseUnits(intent.amountUi, decimals));
      const standingKey = await readYoungStandingKey();
      setYoungKeyInspection(standingKey);
      if (standingKey.state !== "READY") {
        setPreflightBlocked(standingKey.reason);
        setStatus(`STANDING KEY ${standingKey.state} · ${standingKey.reason}`);
        return;
      }

      const policy = assessStandingIntent(
        standingKey.key,
        amountBaseUnits,
        BigInt(Math.floor(Date.now() / 1000)),
      );
      if (policy.state === "BLOCKED") {
        setPreflightBlocked(policy.reason);
        setStatus(`KEY POLICY BLOCKED · ${policy.reason}`);
        return;
      }
      if (policy.state === "BOUNDARY") {
        // A parent can receive an exact request without requiring Solflare
        // to sign a transaction the policy would necessarily reject.
        setStatus(`Live policy boundary: ${policy.code}. Preparing exact guardian request; no payment sent.`);
        await createBoundaryForObservedPolicy({
          key: standingKey.key,
          amountBaseUnits,
          evidence: `${policy.code}: request ${amountBaseUnits}, limit ${standingKey.key.maxActionAmount}, spent ${policy.effectiveSpent}, period cap ${standingKey.key.maxPeriodAmount}, nonce ${standingKey.key.nonce}`,
          source: "READ_ONLY_LIVE_POLICY",
        });
        return;
      }

      // Policy preview is only guidance, not final permission. Real program
      // validation and a fresh wallet signature remain load-bearing.
      const readiness = await inspectLivePaymentReadiness(amountBaseUnits);
      if (readiness.state !== "READY_FOR_WALLET_ATTEMPT") {
        const reason = readiness.state === "BLOCKED"
          ? readiness.reasons.join(", ")
          : readiness.reason;
        setPreflightBlocked(reason);
        setStatus(`LIVE ACCOUNT ${readiness.state} · ${reason}`);
        return;
      }

      const instruction = await buildExecutePaymentWithinMandateInstruction({
        config: paymentProgramConfigFromEnv(),
        beneficiary: address(account.address.toString()),
        mint: address(intent.mint),
        recipient: address(intent.recipient),
        amountBaseUnits,
        expectedNonce: standingKey.key.nonce,
      });

      setStatus(`Wallet approval required for real payment under Devnet Key nonce ${standingKey.key.nonce}.`);
      let outcome: TransactionOutcome;
      try {
        const signature = await sendTransactions([instruction]);
        outcome = await waitForTransactionOutcome(rpcForOutcome, signature);
      } catch (submissionError) {
        outcome = classifyProgramSubmissionError(submissionError);
      }

      setStandingOutcome(outcome.state === "REFUSE" && !outcome.signature
        ? "UNKNOWN" : outcome.state);
      recordReceipt("STANDING_PAYMENT", {
        outcome: outcomeReceipt(outcome),
        liveMandateNonceBeforeAttempt: standingKey.key.nonce.toString(),
        amountBaseUnits: amountBaseUnits.toString(),
        decimalsSource: "LIVE_DEVNET_TOKEN_MINT",
      });
      setStatus(outcomeLabel(outcome));
      if (outcome.state === "REFUSE" && outcome.signature) {
        await createBoundaryForObservedPolicy({
          key: standingKey.key,
          amountBaseUnits,
          evidence: outcome.evidence,
          signature: outcome.signature,
          source: "CONFIRMED_CHAIN_REFUSAL",
        });
      }
    } catch (error) {
      setStandingOutcome("UNKNOWN");
      setStatus(error instanceof Error ? error.message : "PAYMENT_ACTION_UNKNOWN");
    } finally {
      setBusy(false);
    }
  };

  const restoreYoungSession = async () => {
    if (!account || busy) return;
    setBusy(true);
    setStatus("Reopening the last private request for this wallet; no transaction.");
    try {
      const stored = await loadRecentYoungSession(account.address.toString());
      if (!stored) {
        setStatus("No previous boundary request belongs to this connected wallet.");
        return;
      }
      const request = await getBoundaryRequest(stored.requestId, stored.relayToken);
      const parsed = parseSolanaPayTransferRequest(stored.intentRaw);
      const decimals = await readLiveMintDecimals(parsed.mint);
      const actualAmount = decimalToBaseUnits(parsed.amountUi, decimals);
      if (request.requesterWallet !== account.address.toString() ||
          request.requestId !== stored.requestId ||
          request.mint !== parsed.mint ||
          request.recipient !== parsed.recipient ||
          request.amountBaseUnits !== actualAmount) {
        setStatus("Saved request and live relay data do not agree. Nothing was restored or signed.");
        return;
      }
      setIntent(parsed);
      setUsingConfiguredTestIntent(false);
      setRelayRequest(request);
      setYoungCapability({ requestId: stored.requestId, relayToken: stored.relayToken });
      setShareLink(createBoundaryDeepLink(stored.requestId, stored.relayToken));
      setExactExecutionState("IDLE");
      setStandingOutcome("IDLE");
      setPaymentReadiness(null);
      setYoungKeyInspection(null);
      setStatus(
        `Request safely restored from private relay: ${request.status}. No new approval or payment has been executed.`,
      );
    } catch (error) {
      setStatus(`Session recovery UNKNOWN · ${error instanceof Error ? error.message : "RELAY_UNAVAILABLE"}`);
    } finally {
      setBusy(false);
    }
  };

  const refreshYoungRequest = async () => {
    if (!youngCapability) return;

    setBusy(true);
    try {
      const request = await getBoundaryRequest(
        youngCapability.requestId,
        youngCapability.relayToken,
      );
      setRelayRequest(request);
      setStatus(`Relay status: ${request.status}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "REFRESH_FAILED");
    } finally {
      setBusy(false);
    }
  };

  const refreshGuardianRequest = async () => {
    if (!guardianCapability) return;

    setBusy(true);
    try {
      const request = await getBoundaryRequest(
        guardianCapability.requestId,
        guardianCapability.relayToken,
      );
      setRelayRequest(request);
      setGuardianKeyInspection(null);
      setWidenAcknowledged(false);
      setStatus(`Relay status: ${request.status}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "REFRESH_FAILED");
    } finally {
      setBusy(false);
    }
  };

  // The young person's Key is dynamic. A guardian Widen increments the live
  // nonce, so a compiled demo nonce must never be used for a subsequent payment.
  const readYoungStandingKey = async (): Promise<KeyInspection> => {
    if (!account || !intent) {
      return { state: "BLOCKED", reason: "WALLET_OR_PAYMENT_INTENT_MISSING" };
    }
    try {
      return await inspectStandingKey(makeStandingKeyRpc(), {
        chain,
        config: paymentProgramConfigFromEnv(),
        beneficiaryWallet: account.address.toString(),
        // Guardian identity is resolved from the real Anchor charter.
        mint: intent.mint,
      });
    } catch (error) {
      return {
        state: "UNKNOWN",
        reason: error instanceof Error ? error.message : "KEY_POLICY_RPC_UNKNOWN",
      };
    }
  };

  const inspectYoungCurrentKey = async () => {
    if (!account || !intent || busy) return;
    setBusy(true);
    try {
      const decimals = await readLiveMintDecimals(intent.mint);
      const result = await readYoungStandingKey();
      setYoungKeyInspection(result);
      setStatus(result.state === "READY"
        ? `Live Key read: action limit ${displayTokenUnits(result.key.maxActionAmount, decimals)}, period limit ${displayTokenUnits(result.key.maxPeriodAmount, decimals)}, nonce ${result.key.nonce}.`
        : `Live Key ${result.state}: ${result.reason}`);
    } finally {
      setBusy(false);
    }
  };

  const resumeAfterReportedKeyChange = async () => {
    if (!account || !intent || !relayRequest || relayRequest.status !== "KEY_CHANGE_REPORTED" || busy) {
      return;
    }
    setBusy(true);
    try {
      const result = await readYoungStandingKey();
      setYoungKeyInspection(result);
      if (result.state !== "READY") {
        setStatus(`Cannot resume: live Key ${result.state} — ${result.reason}`);
        return;
      }
      if (result.key.nonce <= BigInt(relayRequest.mandateNonce)) {
        setStatus("Relay reported a Key change, but the real mandate nonce has NOT advanced. A relay update is not onchain proof.");
        return;
      }
      setRelayRequest(null);
      setYoungCapability(null);
      setShareLink(null);
      setPaymentReadiness(null);
      setStandingOutcome("IDLE");
      setExactExecutionState("IDLE");
      setStatus(`Real standing Key nonce is now ${result.key.nonce}. You may retry this payment intent under the updated Key. No payment has been submitted yet.`);
    } finally {
      setBusy(false);
    }
  };

  // Read the actual standing Key from the CRESCO program. The relay only
  // provides the requested beneficiary/mint and never grants any authority.
  const readGuardianKey = async (requireRequestNonce = true): Promise<KeyInspection> => {
    if (!account || !relayRequest) {
      return { state: "BLOCKED", reason: "GUARDIAN_WALLET_OR_REQUEST_MISSING" };
    }
    if (capitalConfigMissing.length > 0) {
      return { state: "BLOCKED", reason: "CRESCO_PROGRAM_NOT_CONFIGURED" };
    }
    if (relayRequest.guardianWallet !== account.address.toString()) {
      return { state: "BLOCKED", reason: "CONNECTED_WALLET_NOT_REQUEST_GUARDIAN" };
    }
    try {
      const reader = makeStandingKeyRpc();
      const result = await inspectStandingKey(reader, {
        chain,
        config: paymentProgramConfigFromEnv(),
        beneficiaryWallet: relayRequest.requesterWallet,
        guardianWallet: account.address.toString(),
        mint: relayRequest.mint,
      });
      if (result.state === "READY") {
        if (result.key.mandate.toString() !== relayRequest.mandate) {
          return { state: "BLOCKED", reason: "RELAY_MANDATE_NOT_ACTUAL_ONCHAIN_MANDATE" };
        }
        if (requireRequestNonce && result.key.nonce.toString() !== relayRequest.mandateNonce) {
          return { state: "BLOCKED", reason: "REQUEST_STALE_AFTER_STANDING_KEY_CHANGE" };
        }
      }
      return result;
    } catch (error) {
      return {
        state: "UNKNOWN",
        reason: error instanceof Error ? error.message : "GUARDIAN_CHAIN_READ_FAILED",
      };
    }
  };

  const inspectGuardianStandingKey = async () => {
    if (busy || !account || !relayRequest) return;
    setBusy(true);
    setStatus("Reading the guardian's real standing Key from Devnet.");
    try {
      const decimals = await readLiveMintDecimals(relayRequest.mint);
      const result = await readGuardianKey(false);
      setGuardianKeyInspection(result);
      setWidenAcknowledged(false);
      if (result.state === "READY") {
        setNextActionLimit(displayTokenUnits(result.key.maxActionAmount, decimals));
        setNextPeriodLimit(displayTokenUnits(result.key.maxPeriodAmount, decimals));
        setStatus(result.key.nonce.toString() === relayRequest?.mandateNonce
          ? "Onchain Key loaded. No rule has been changed."
          : "Onchain Key read: this boundary request has a stale nonce. Do not re-submit the old request; use current Key authority.");
      } else {
        setStatus(`KEY ${result.state} · ${result.reason}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const widenStandingKey = async () => {
    if (busy || !account || !relayRequest || !guardianCapability ||
        !widenAcknowledged || guardianKeyInspection?.state !== "READY") return;
    if (relayRequest.status !== "PENDING") {
      setStatus("This boundary request is no longer pending.");
      return;
    }
    const original = guardianKeyInspection.key;
    setBusy(true);
    setStatus("Re-checking real Devnet authority and limits before guardian signature.");
    try {
      const decimals = await readLiveMintDecimals(relayRequest.mint);
      const nextAction = BigInt(decimalToBaseUnits(nextActionLimit, decimals));
      const nextPeriod = BigInt(decimalToBaseUnits(nextPeriodLimit, decimals));

      // Never trust a preview that may have become stale while the user decides.
      const fresh = await readGuardianKey();
      setGuardianKeyInspection(fresh);
      if (fresh.state !== "READY") throw new Error(
        fresh.state === "BLOCKED" ? fresh.reason : `UNKNOWN: ${fresh.reason}`);
      if (fresh.key.nonce !== original.nonce ||
          fresh.key.maxActionAmount !== original.maxActionAmount ||
          fresh.key.maxPeriodAmount !== original.maxPeriodAmount ||
          fresh.key.version !== original.version) {
        throw new Error("STANDING_KEY_CHANGED_SINCE_PREVIEW_REFRESH_BEFORE_APPROVAL");
      }

      const instruction = buildWidenStandingKeyInstruction({
        key: fresh.key,
        nextMaxActionAmount: nextAction,
        nextMaxPeriodAmount: nextPeriod,
      });
      setStatus("Guardian approval required: permanent rule change. This is NOT Allow Once.");
      let outcome: TransactionOutcome;
      try {
        const signature = await sendTransactions([instruction]);
        outcome = await waitForTransactionOutcome(rpcForOutcome, signature);
      } catch (sendError) {
        outcome = classifyProgramSubmissionError(sendError);
      }
      if (outcome.state !== "ALLOW") {
        recordReceipt("GUARDIAN_WIDEN_KEY", {
          state: outcome.state === "REFUSE" ? "REFUSED" : "UNKNOWN",
          outcome: outcomeReceipt(outcome),
          beforeNonce: original.nonce.toString(),
          attemptedActionCap: nextAction.toString(),
          attemptedPeriodCap: nextPeriod.toString(),
        });
        setStatus(`Standing change NOT VERIFIED · ${outcomeLabel(outcome)}`);
        return;
      }

      // Transaction confirmation alone is NOT enough: independently inspect
      // the actual authority accounts and verify nonce and BOTH cap changes.
      // Request nonce is now intentionally old, so read the same Key without
      // applying the request-staleness check used for new decisions.
      const reader = makeStandingKeyRpc();
      const verified = await inspectStandingKey(reader, {
        chain, config: paymentProgramConfigFromEnv(),
        beneficiaryWallet: relayRequest.requesterWallet,
        guardianWallet: account.address.toString(),
        mint: relayRequest.mint,
      });
      setGuardianKeyInspection(verified);
      if (verified.state !== "READY" ||
          verified.key.nonce !== original.nonce + 1n ||
          verified.key.version !== original.version + 1n ||
          verified.key.maxActionAmount !== nextAction ||
          verified.key.maxPeriodAmount !== nextPeriod) {
        recordReceipt("GUARDIAN_WIDEN_KEY", {
          state: "UNKNOWN",
          signature: outcome.signature,
          beforeNonce: original.nonce.toString(),
          reason: "POST_TRANSACTION_ONCHAIN_POLICY_NOT_YET_VERIFIED",
        });
        setStatus("Transaction confirmed but current standing Key changes are not independently verified. Read chain before retry; never submit blindly.");
        return;
      }

      // Relay sync is secondary and can fail independently of real onchain
      // authority. Do not turn a chain success into a falsely failed action.
      let relayState: string = "SYNC_NOT_ATTEMPTED";
      try {
        const request = await postBoundaryRelayEvent(
          guardianCapability.requestId, guardianCapability.relayToken,
          { type: "KEY_CHANGE_REPORTED", txSignature: outcome.signature },
        );
        setRelayRequest(request);
        relayState = request.status;
      } catch {
        relayState = "SYNC_UNKNOWN";
      }
      recordReceipt("GUARDIAN_WIDEN_KEY", {
        state: "VERIFIED_ONCHAIN",
        signature: outcome.signature,
        mandate: original.mandate,
        beforeNonce: original.nonce.toString(),
        afterNonce: verified.key.nonce.toString(),
        beforeVersion: original.version.toString(),
        afterVersion: verified.key.version.toString(),
        beforeActionCap: original.maxActionAmount.toString(),
        afterActionCap: verified.key.maxActionAmount.toString(),
        beforePeriodCap: original.maxPeriodAmount.toString(),
        afterPeriodCap: verified.key.maxPeriodAmount.toString(),
        previousPeriodSpent: original.spentThisPeriod.toString(),
        currentPeriodSpent: verified.key.spentThisPeriod.toString(),
        counterResetIsCurrentDeployedProgramBehavior: true,
        relayState,
      });
      setStatus(`Standing Key widened onchain; nonce moved ${original.nonce} → ${verified.key.nonce}. Existing exact request is stale. Relay: ${relayState}. A new payment must read the new limits.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "WIDEN_BLOCKED_OR_UNKNOWN");
    } finally {
      setWidenAcknowledged(false);
      setBusy(false);
    }
  };

  const refuseBoundaryRequest = async () => {
    if (!guardianCapability || !relayRequest) return;

    if (relayRequest.status !== "PENDING") {
      setStatus(`Guardian refusal blocked in relay state ${relayRequest.status}.`);
      return;
    }

    setBusy(true);
    setStatus("Recording guardian refusal. No allowance will be granted.");

    try {
      const request = await postBoundaryRelayEvent(
        guardianCapability.requestId,
        guardianCapability.relayToken,
        { type: "REFUSED" },
      );

      setRelayRequest(request);
      recordReceipt("GUARDIAN_REFUSE", {
        state: "REFUSED",
        relayStatus: request.status,
        requestId: request.requestId,
        boundary:
          "Guardian chose Not this time. No allowance was granted and the standing Key did not move.",
      });
      setStatus(
        "Guardian refused this exact request. No allowance was granted; the standing Key did not move.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "REFUSE_REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  };

  const grantExactAllowanceOnce = async () => {
    if (!guardianCapability || !relayRequest || !account || busy) return;
    if (relayRequest.guardianWallet !== account.address.toString()) {
      setStatus("Connected wallet is not the guardian named in this request. No wallet transaction.");
      return;
    }
    if (relayRequest.expiresAt !== null &&
        Math.floor(Date.now() / 1000) >= relayRequest.expiresAt) {
      setStatus("This exact request is expired. It must be recreated; no approval was submitted.");
      return;
    }

    if (capitalConfigMissing.length > 0) {
      setStatus(
        `Capital path is not configured: ${capitalConfigMissing.join(", ")}`,
      );
      return;
    }

    if (relayRequest.status !== "PENDING") {
      setStatus(`Guardian action blocked in relay state ${relayRequest.status}.`);
      return;
    }

    setBusy(true);
    setStatus(
      "Submitting exact Allow Once on Devnet. The standing Key remains unchanged.",
    );

    try {
      const onchainKey = await readGuardianKey(true);
      if (onchainKey.state !== "READY") {
        setStatus(`Cannot approve this request: Key ${onchainKey.state} — ${onchainKey.reason}`);
        return;
      }
      const programConfig = paymentProgramConfigFromEnv();
      const guardian = address(account.address.toString());
      const beneficiary = address(relayRequest.requesterWallet);
      const mint = address(relayRequest.mint);
      const recipient = address(relayRequest.recipient);
      const derived = await derivePaymentAllowanceAccounts({
        config: programConfig,
        beneficiary,
        mint,
        recipient,
        requestId: relayRequest.requestId,
      });

      if (derived.mandate.toString() !== relayRequest.mandate) {
        throw new Error("RELAY_MANDATE_MISMATCH");
      }

      const instruction = await buildGrantPaymentAllowanceOnceInstruction({
        config: programConfig,
        guardian,
        beneficiary,
        mint,
        recipient,
        requestId: relayRequest.requestId,
        expectedNonce: BigInt(relayRequest.mandateNonce),
        amountBaseUnits: BigInt(relayRequest.amountBaseUnits),
        expiresAtUnixSeconds: BigInt(
          relayRequest.expiresAt ?? Math.floor(Date.now() / 1000) + 600,
        ),
      });

      let outcome: TransactionOutcome;
      try {
        const signature = await sendTransactions([instruction]);
        outcome = await waitForTransactionOutcome(rpcForOutcome, signature);
      } catch (submissionError) {
        outcome = classifyProgramSubmissionError(submissionError);
      }

      if (outcome.state !== "ALLOW") {
        setStatus(outcomeLabel(outcome));
        return;
      }

      const request = await postBoundaryRelayEvent(
        guardianCapability.requestId,
        guardianCapability.relayToken,
        {
          type: "ALLOWANCE_SUBMITTED",
          txSignature: outcome.signature,
        },
      );

      setRelayRequest(request);
      recordReceipt("GUARDIAN_ALLOW_ONCE", {
        outcome: outcomeReceipt(outcome),
        relayStatus: request.status,
      });
      setStatus(
        `Allowance transaction confirmed onchain · ${outcome.signature}. Relay marker recorded; no payment has executed yet.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "ALLOW_ONCE_FAILED");
    } finally {
      setBusy(false);
    }
  };

  const executeExactAllowance = async (recipientOverride?: string) => {
    if (!relayRequest || !account || busy) return;
    if (relayRequest.requesterWallet !== account.address.toString()) {
      setStatus("This exact allowance belongs to a different beneficiary. No transaction attempted.");
      return;
    }

    if (relayRequest.status !== "ALLOWANCE_SUBMITTED") {
      setStatus(
        `Exact execution blocked until guardian allowance is confirmed. Current relay state: ${relayRequest.status}.`,
      );
      return;
    }

    if (capitalConfigMissing.length > 0) {
      setStatus(
        `Capital path is not configured: ${capitalConfigMissing.join(", ")}`,
      );
      return;
    }

    setBusy(true);
    setStatus(
      recipientOverride
        ? "Submitting changed-recipient action. It must not inherit the guardian approval."
        : "Submitting the exact one-time payment.",
    );

    try {
      // Relay says only that a guardian action was reported; verify the
      // beneficiary's actual Key and nonce before asking this wallet to pay.
      const liveKey = await inspectStandingKey(makeStandingKeyRpc(), {
        chain,
        config: paymentProgramConfigFromEnv(),
        beneficiaryWallet: account.address.toString(),
        mint: relayRequest.mint,
      });
      if (liveKey.state !== "READY") {
        setStatus(`Cannot use allowance: live Key ${liveKey.state} — ${liveKey.reason}`);
        return;
      }
      if (liveKey.key.mandate.toString() !== relayRequest.mandate ||
          liveKey.key.nonce.toString() !== relayRequest.mandateNonce) {
        setStatus("Existing approval is stale for this onchain Key. Create a new exact request.");
        return;
      }
      const programConfig = paymentProgramConfigFromEnv();
      const instruction = await buildExecutePaymentOnceInstruction({
        config: programConfig,
        beneficiary: address(account.address.toString()),
        mint: address(relayRequest.mint),
        recipient: address(recipientOverride ?? relayRequest.recipient),
        requestId: relayRequest.requestId,
        expectedNonce: BigInt(relayRequest.mandateNonce),
        amountBaseUnits: BigInt(relayRequest.amountBaseUnits),
      });

      let outcome: TransactionOutcome;
      try {
        const signature = await sendTransactions([instruction]);
        outcome = await waitForTransactionOutcome(rpcForOutcome, signature);
      } catch (submissionError) {
        outcome = classifyProgramSubmissionError(submissionError);
      }

      setExactExecutionState(outcome.state);
      recordReceipt(
        recipientOverride
          ? "CHANGED_RECIPIENT_MUTATION"
          : "EXACT_ALLOWANCE_EXECUTION",
        {
          outcome: outcomeReceipt(outcome),
          recipientOverride: recipientOverride ?? null,
        },
      );
      setStatus(outcomeLabel(outcome));
    } catch (error) {
      setExactExecutionState("UNKNOWN");
      setStatus(error instanceof Error ? error.message : "EXACT_EXECUTION_FAILED");
    } finally {
      setBusy(false);
    }
  };

  if (scanning) {
    return (
      <View style={styles.full}>
        <PaymentScanner
          onCancel={() => setScanning(false)}
          onIntent={(nextIntent) => {
            setIntent(nextIntent);
            setUsingConfiguredTestIntent(false);
            setVerifiedMintInfo(null);
            setPaymentReadiness(null);
            setYoungKeyInspection(null);
            setRelayRequest(null);
            setYoungCapability(null);
            setShareLink(null);
            setExactExecutionState("IDLE");
            setStandingOutcome("IDLE");
            setScanning(false);
            setStatus(
              "Payment request parsed. No authority decision has been made yet.",
            );
          }}
        />
      </View>
    );
  }

  if (!mode) {
    return (
      <ScrollView contentContainerStyle={styles.section}>
        <View style={styles.roleHero}>
          <View style={styles.roleHeroText}>
            <Text style={styles.roleHeroKicker}>YOUR KEY · YOUR CHOICE</Text>
            <Text style={styles.roleHeroTitle}>One family.{"\n"}Two perspectives.</Text>
            <Text style={styles.roleHeroBody}>Choose how you'll use Cresco Key. Each person connects with their own wallet.</Text>
          </View>
          <KeyPortal size={126} />
        </View>
        <Pressable accessibilityRole="button"
          accessibilityLabel="Continue as young person"
          onPress={() => setMode("YOUNG")}
          style={[styles.roleCard, styles.roleCardPrimary]}>
          <View style={styles.roleHeader}>
            <Text style={styles.roleOnDarkEyebrow}>MY MONEY · MY KEY</Text>
            <KeyPortal size={68} />
          </View>
          <Text style={styles.roleOnDarkTitle}>Young person  ↗</Text>
          <Text style={styles.roleOnDarkBody}>Check your rules, scan a real payment, and request help only when necessary.</Text>
        </Pressable>
        <Pressable accessibilityRole="button"
          accessibilityLabel="Continue as guardian"
          onPress={() => setMode("GUARDIAN")}
          style={styles.roleCard}>
          <View style={styles.roleHeader}>
            <Text style={styles.roleEyebrow}>A THOUGHTFUL DECISION</Text>
            <KeyPortal size={68} light />
          </View>
          <Text style={styles.roleTitle}>Guardian  ↗</Text>
          <Text style={styles.roleDescription}>Review exact terms, decline or authorize a single request.</Text>
        </Pressable>
        <Text style={styles.status}>DEVNET TEST APP · A connected wallet alone does not create a family Key.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showTechnical }}
          onPress={() => setShowTechnical(v => !v)}
          style={styles.disclosure}>
          <Text style={styles.disclosureTitle}>Wallet proof and technical evidence</Text>
          <Text style={styles.disclosureTitle}>{showTechnical ? "−" : "+"}</Text>
        </Pressable>
        {showTechnical ? (
          <>
            <MuseumPlate exhibit="LOCAL WALLET" title="Inspect your session">
              <Text style={styles.body}>{walletProof}</Text>
              <MuseumButton label="Sign TRC-01 proof message" disabled={busy}
                variant="secondary" onPress={signWalletProof} />
            </MuseumPlate>
            <ProofStrip />
            <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />
          </>
        ) : null}
      </ScrollView>
    );
  }

  if (mode === "GUARDIAN") {
    return (
      <ScrollView contentContainerStyle={styles.section}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to role selection"
          onPress={() => setMode(null)} style={styles.backAction}>
          <Text style={styles.backText}>← All roles</Text>
        </Pressable>
        <View style={styles.guardianHero}>
          <View style={styles.guardianHeroCopy}>
            <Text style={styles.roleHeroKicker}>GUARDIAN · EXACT DECISION</Text>
            <Text style={styles.guardianHeroTitle}>Your call.{"\n"}Their freedom.</Text>
            <Text style={styles.guardianHeroSubtitle}>See exactly what's being requested. A one-time decision never changes the permanent Key.</Text>
          </View>
          <KeyPortal size={104} mood={relayRequest?.status === "REFUSED" ? "boundary" : relayRequest?.status === "PENDING" ? "request" : "standing"} />
        </View>
        {relayRequest ? (
          <MuseumPlate exhibit="AN EXACT REQUEST" title={relayRequest.display?.label ?? "Guardian review"}
            tone={relayRequest.status === "REFUSED" ? "boundary" : "pending"}>
            <View style={styles.exactChoiceHeader}>
            <LivingKeySeal size={38} mood={relayRequest.status === "REFUSED" ? "boundary" : relayRequest.status === "PENDING" ? "request" : relayRequest.status === "EXPIRED" ? "unknown" : "standing"} />
            <Text style={styles.roleDescription}>One exact request · standing limits stay unchanged</Text>
          </View>
          <View style={styles.exactAmountBlock}>
            <Text style={styles.roleEyebrow}>EXACT AMOUNT / TOKEN BASE UNITS</Text>
            <Text style={styles.exactAmount} selectable>{relayRequest.amountBaseUnits}</Text>
            <Text style={styles.exactAmountNote}>This figure is in token base units until the mint decimals are independently verified.</Text>
          </View>
          <MuseumFact label="RECIPIENT" value={relayRequest.recipient} />
          <MuseumFact label="TOKEN MINT" value={relayRequest.mint} />
          <MuseumFact label="COORDINATION STATUS — NOT A PAYMENT" value={relayRequest.status} />
          <MuseumFact label="MANDATE NONCE" value={relayRequest.mandateNonce} />
          <Text style={styles.body}>If allowed, this approval covers only the exact terms above, once. No payment has executed.</Text>
          </MuseumPlate>
        ) : (
          <MuseumPlate exhibit="NO REQUEST LOADED" title="Nothing to review yet">
            <Text style={styles.body}>Open a private boundary link from the young person's device to load a real request.</Text>
          </MuseumPlate>
        )}
        {guardianCapability ? (
          <MuseumButton label="Refresh request" variant="secondary" disabled={busy} onPress={refreshGuardianRequest} />
        ) : null}
        {guardianCapability && relayRequest?.status === "PENDING" ? (
          <>
            <MuseumButton label="Allow this exact payment once" disabled={busy} onPress={grantExactAllowanceOnce} />
            <MuseumButton label="Not this time" variant="boundary" disabled={busy} onPress={refuseBoundaryRequest} />
            <Pressable accessibilityRole="button"
              accessibilityState={{ expanded: showWidenControls }}
              accessibilityLabel="Change ongoing limits, separate from Allow Once"
              onPress={() => setShowWidenControls(v => !v)} style={styles.disclosure}>
              <Text style={styles.disclosureTitle}>Change ongoing limits (different action)</Text>
              <Text style={styles.disclosureTitle}>{showWidenControls ? "−" : "+"}</Text>
            </Pressable>
            {showWidenControls ? (
            <MuseumPlate exhibit="SEPARATE / PERMANENT AUTHORITY" title="Change the standing Key" tone="neutral">
              <Text style={styles.body}>This is NOT Allow Once. Widen changes the permanent amount limits of the actual onchain asset rule. It advances the mandate nonce and invalidates pending exact authorizations tied to the old version.</Text>
              <MuseumButton label="Read current standing Key from Devnet" variant="secondary"
                disabled={busy} onPress={inspectGuardianStandingKey} />
              {guardianKeyInspection?.state === "READY" && guardianDisplayDecimals !== null ? (
                <View style={styles.scenarios}>
                  <MuseumFact label="LIVE ACTION LIMIT / TOKEN UNITS" value={displayTokenUnits(guardianKeyInspection.key.maxActionAmount, guardianDisplayDecimals!)} />
                  <MuseumFact label="LIVE PERIOD LIMIT / TOKEN UNITS" value={displayTokenUnits(guardianKeyInspection.key.maxPeriodAmount, guardianDisplayDecimals!)} />
                  <MuseumFact label="SPENT IN CURRENT PERIOD / TOKEN UNITS" value={displayTokenUnits(guardianKeyInspection.key.spentThisPeriod, guardianDisplayDecimals!)} />
                  <KeyPeriodUsage spentBaseUnits={guardianKeyInspection.key.spentThisPeriod} maxPeriodBaseUnits={guardianKeyInspection.key.maxPeriodAmount} />
                  <MuseumFact label="MANDATE NONCE" value={guardianKeyInspection.key.nonce.toString()} />
                  <Text style={styles.scenarioLabel}>NEW PER-ACTION LIMIT / TOKEN UNITS</Text>
                  <TextInput
                    accessibilityLabel="New standing Key per-action limit in token units"
                    style={styles.limitInput}
                    keyboardType="decimal-pad"
                    value={nextActionLimit}
                    onChangeText={(value) => { setNextActionLimit(value); setWidenAcknowledged(false); }}
                    autoCorrect={false}
                    placeholder="Enter a higher amount"
                    placeholderTextColor={color.unknown}
                  />
                  <Text style={styles.scenarioLabel}>NEW PER-PERIOD LIMIT / TOKEN UNITS</Text>
                  <TextInput
                    accessibilityLabel="New standing Key per-period limit in token units"
                    style={styles.limitInput}
                    keyboardType="decimal-pad"
                    value={nextPeriodLimit}
                    onChangeText={(value) => { setNextPeriodLimit(value); setWidenAcknowledged(false); }}
                    autoCorrect={false}
                    placeholder="Must be at least the action limit"
                    placeholderTextColor={color.unknown}
                  />
                  <Text style={styles.body}>IMPORTANT: the deployed CRESCO program resets the period counter and starts a new period whenever a guardian updates its asset rule. That can make more spending immediately available. Review both limits and current spending before signing.</Text>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: widenAcknowledged }}
                    accessibilityLabel="I understand permanent limits change, the current spend counter resets, and this is not Allow Once"
                    onPress={() => setWidenAcknowledged((current) => !current)}
                    style={styles.acknowledgement}>
                    <Text style={styles.body}>{widenAcknowledged ? "☑" : "☐"} I understand: the new limits are permanent until another change, and the onchain spending-period counter restarts. My wallet must approve this distinct action.</Text>
                  </Pressable>
                  {guardianKeyInspection.key.nonce.toString() !== relayRequest.mandateNonce ? (
                    <Text style={styles.status}>This request uses an older nonce. The current Key can be inspected, but the old request cannot authorize a new change.</Text>
                  ) : null}
                  <MuseumButton label="Request guardian wallet signature to WIDEN KEY"
                    disabled={busy || !widenAcknowledged ||
                      guardianKeyInspection.key.nonce.toString() !== relayRequest.mandateNonce}
                    onPress={widenStandingKey} />
                </View>
              ) : guardianKeyInspection ? (
                <Text style={styles.status} accessibilityLiveRegion="polite">
                  {guardianKeyInspection.state}: {guardianKeyInspection.state === "READY"
                    ? "Mint decimals unavailable" : guardianKeyInspection.reason}. No authority has changed.
                </Text>
              ) : null}
            </MuseumPlate>
            ) : null}
          </>
        ) : null}
        <MuseumPlate exhibit="AUTHORITY / IMPORTANT">
          <Text style={styles.body}>The relay coordinates the request. Only the CRESCO Solana program can grant a one-time allowance. A confirmed allowance is not a completed payment.</Text>
          <Text style={styles.status} accessibilityLiveRegion="polite">{status}</Text>
        </MuseumPlate>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showSkr }}
          onPress={() => setShowSkr(v => !v)} style={styles.disclosure}>
          <Text style={styles.disclosureTitle}>Optional Solana Mobile / SKR tools</Text>
          <Text style={styles.disclosureTitle}>{showSkr ? "−" : "+"}</Text>
        </Pressable>
        {showSkr ? <SkrCharterAtelier walletAddress={account?.address?.toString() ?? ""} liveKey={guardianKeyInspection?.state === "READY" ? guardianKeyInspection.key : null} /> : null}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showTechnical }}
          onPress={() => setShowTechnical(v => !v)} style={styles.disclosure}>
          <Text style={styles.disclosureTitle}>Transaction receipts / technical evidence</Text>
          <Text style={styles.disclosureTitle}>{showTechnical ? "−" : "+"}</Text>
        </Pressable>
        {showTechnical ? <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} /> : null}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.section}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to role selection"
        onPress={() => setMode(null)} style={styles.backAction}>
        <Text style={styles.backText}>← All roles</Text>
      </Pressable>
      {!relayRequest ? (
        <MuseumButton label="Resume my previous private request" disabled={busy}
          variant="secondary" onPress={restoreYoungSession} />
      ) : null}
      <MuseumHero
        exhibit={standingOutcome === "REFUSE" ? "YOUR BOUNDARY" : standingOutcome === "ALLOW" ? "KEY PERMITTED THE ACTION" : "YOUR STANDING KEY"}
        title={standingOutcome === "REFUSE" ? "A Guardian is needed." : standingOutcome === "ALLOW" ? "Within your Key." : "Spend on your terms."}
        subtitle={standingOutcome === "REFUSE"
          ? "This attempt was refused. A narrow guardian request may be created without changing your standing rules."
          : standingOutcome === "ALLOW" ? "Your standing Key permitted this exact action on Devnet." : "Act independently inside your rules. Start by scanning an exact payment intent."}
        tone={standingOutcome === "REFUSE" ? "boundary" : "neutral"}
        compact
      />
      <View style={styles.youngKeyBanner}>
        <View style={styles.youngKeyText}>
          <Text style={styles.youngKeyKicker}>STANDING KEY · DEVNET</Text>
          <Text style={styles.youngKeyTitle}>The rules don't move.</Text>
          <Text style={styles.youngKeyCaption}>A payment or exception must be verified separately.</Text>
        </View>
        <KeyPortal size={112} light mood={standingOutcome === "REFUSE" ? "boundary" : standingOutcome === "UNKNOWN" ? "unknown" : "standing"} />
      </View>
      <MuseumPlate exhibit="YOUR PAYMENT" title={intent ? "Ready to review" : "Make a payment"}
        tone={standingOutcome === "REFUSE" ? "boundary" : standingOutcome === "ALLOW" ? "verified" : "neutral"}>
        {intent ? (
          <>
            <View style={styles.purchaseAmountRow}>
              <View style={styles.purchaseAmountCopy}>
                <Text style={styles.roleEyebrow}>REQUESTED TOKEN AMOUNT</Text>
                <Text style={styles.purchaseAmount} selectable>{intent.amountUi}</Text>
              </View>
              <LivingKeySeal size={46} mood={standingOutcome === "REFUSE" ? "boundary" : standingOutcome === "UNKNOWN" ? "unknown" : "standing"} />
            </View>
            <MuseumFact label="TOKEN MINT" value={intent.mint} />
            <MuseumFact label="RECIPIENT" value={intent.recipient} />
            {intent.label ? <MuseumFact label="REQUEST LABEL" value={intent.label} /> : null}
          </>
        ) : (
          <Text style={styles.body}>No spending rule or merchant is invented here. Scan an actual Solana Pay request, or choose a configured Devnet test intent.</Text>
        )}
        <MuseumButton label="Scan Solana Pay QR" onPress={() => setScanning(true)} />
        {configuredDemoIntents.length > 0 ? (
          <View style={styles.scenarios}>
            <Text style={styles.scenarioLabel}>CONFIGURED DEVNET TEST INTENTS / NOT TRANSACTIONS</Text>
            {configuredDemoIntents.map((option) => (
              <MuseumButton key={option.label} label={option.label} onPress={() => loadDemoIntent(option.value)} disabled={busy} variant="secondary" />
            ))}
          </View>
        ) : null}
        {intent && !relayRequest && demoBeneficiaryBlocker ? (
          <MuseumPlate exhibit="G1 / DEVNET PROVISIONING REQUIRED" title="This Key is not yet provisioned" tone="blocked">
            <Text style={styles.body}>{demoBeneficiaryBlocker}</Text>
            <MuseumFact label="CONNECTED WALLET" value={account?.address.toString() ?? "Not connected"} />
            <MuseumFact label="CONFIGURED BENEFICIARY" value={config.beneficiaryWallet || "Missing in APK"} />
            <Text style={styles.body}>No transaction has been submitted. This is a setup blocker, not a spending-limit refusal.</Text>
            <MuseumButton label="Record setup blocker (no transaction)" variant="secondary" onPress={attemptStandingPayment} />
          </MuseumPlate>
        ) : null}
        {intent && !relayRequest && !demoBeneficiaryBlocker ? (
          <View style={styles.scenarios}>
            <MuseumButton label="View my live standing Key limits" disabled={busy}
              variant="secondary" onPress={inspectYoungCurrentKey} />
            {youngKeyInspection?.state === "READY" && youngDisplayDecimals !== null ? (
              <MuseumPlate exhibit="LIVE DEVNET KEY" title="Your actual limits" tone="neutral">
                <View style={styles.liveRuleTop}>
                  <View style={styles.liveRuleAmount}>
                    <Text style={styles.roleEyebrow}>MAXIMUM PER PAYMENT · TEST TOKEN UNITS</Text>
                    <Text style={styles.liveRuleValue} selectable>{displayTokenUnits(youngKeyInspection.key.maxActionAmount, youngDisplayDecimals!)}</Text>
                    <Text style={styles.roleEyebrow}>PER PERIOD</Text>
                    <Text style={styles.liveRulePeriod} selectable>{displayTokenUnits(youngKeyInspection.key.maxPeriodAmount, youngDisplayDecimals!)}</Text>
                  </View>
                  <KeyPortal size={86} light />
                </View>
                <KeyPeriodUsage spentBaseUnits={youngKeyInspection.key.spentThisPeriod} maxPeriodBaseUnits={youngKeyInspection.key.maxPeriodAmount} />
                <MuseumFact label="MANDATE NONCE" value={youngKeyInspection.key.nonce.toString()} />
                <MuseumFact label="AUTHORITY STAGE" value={youngKeyInspection.key.mandateStage.toString()} />
                <Text style={styles.body}>These limits are read from the CRESCO program. A payment still needs its own wallet approval and onchain enforcement.</Text>
              </MuseumPlate>
            ) : youngKeyInspection ? (
              <Text style={styles.status}>Unable to verify live Key: {youngKeyInspection.state === "READY"
                ? "Mint decimals unavailable" : youngKeyInspection.reason}</Text>
            ) : null}
            <MuseumButton label="Check live Devnet payment readiness" disabled={busy}
              variant="secondary" onPress={checkReadinessOnDemand} />
            {paymentReadiness ? (
              <MuseumPlate
                exhibit="LIVE DEVNET / ACCOUNT INSPECTION"
                title={paymentReadiness.state === "READY_FOR_WALLET_ATTEMPT"
                  ? "Accounts appear ready for a wallet attempt"
                  : paymentReadiness.state === "BLOCKED"
                    ? "Payment cannot proceed yet"
                    : "Account status is unknown"}
                tone={paymentReadiness.state === "BLOCKED" ? "blocked" : paymentReadiness.state === "UNKNOWN" ? "unknown" : "neutral"}>
                <Text style={styles.body}>
                  {paymentReadiness.state === "BLOCKED"
                    ? paymentReadiness.reasons.join(" · ")
                    : paymentReadiness.state === "UNKNOWN"
                      ? paymentReadiness.reason
                      : paymentReadiness.caveat}
                </Text>
                <Text style={styles.body}>
                  {paymentReadiness.evidence.join("\n") || "No verified account details."}
                </Text>
              </MuseumPlate>
            ) : null}
            <MuseumButton label="Try payment inside my Key" disabled={busy}
              onPress={attemptStandingPayment} />
          </View>
        ) : null}
      </MuseumPlate>
      <Pressable accessibilityRole="button"
        accessibilityState={{ expanded: showYoungSetup }}
        onPress={() => setShowYoungSetup(v => !v)}
        style={styles.disclosure}>
        <Text style={styles.disclosureTitle}>Check wallet setup before paying</Text>
        <Text style={styles.disclosureTitle}>{showYoungSetup ? "−" : "+"}</Text>
      </Pressable>
      {showYoungSetup ? (
      <MuseumPlate exhibit="DEVNET / YOUR WALLET" title="Does this wallet have its own Key?">
        <Text style={styles.body}>Inspect the connected Solflare wallet on Devnet. A build-time demo Key cannot authorize another person's wallet.</Text>
        <MuseumButton label="Check my actual Devnet Charter and balance"
          disabled={busy || !account} variant="secondary" onPress={inspectMyKeySetup} />
        {enrollmentInspection && account?.address.toString() === enrollmentInspection.beneficiary ? (
          <View style={styles.scenarios}>
            <MuseumFact label="ONCHAIN SETUP" value={enrollmentInspection.status} />
            <MuseumFact label="BENEFICIARY" value={enrollmentInspection.beneficiary} />
            <MuseumFact label="CHARTER PDA" value={enrollmentInspection.charter} />
            <MuseumFact label="MANDATE PDA" value={enrollmentInspection.mandate} />
            <MuseumFact label="DEVNET SOL / LAMPORTS" value={enrollmentInspection.walletBalanceLamports} />
            <Text style={styles.body}>This is a read-only account check. Even when both accounts exist, Guardian identity and financial rules still require independent verification. No Key has been created by this screen.</Text>
            <Text style={styles.scenarioLabel}>INTENDED GUARDIAN PUBLIC ADDRESS</Text>
            <TextInput
              accessibilityLabel="Guardian Solana public wallet address"
              style={styles.limitInput}
              value={guardianSetupAddress}
              onChangeText={setGuardianSetupAddress}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Paste distinct Guardian public key"
              placeholderTextColor={color.unknown}
            />
            <MuseumButton label="Share public Key setup request (no transaction)"
              disabled={busy || !guardianSetupAddress.trim()}
              variant="secondary" onPress={shareEnrollmentRequest} />
            <Text style={styles.body}>Creating a new Charter requires a single valid Solana transaction signed by both the Guardian and this beneficiary. Sharing a request is not consent, wallet signing, a completed Charter, or a payment.</Text>
          </View>
        ) : null}
      </MuseumPlate>
      ) : null}
      {preflightBlocked ? <MuseumPlate exhibit="OPERATOR / CONFIGURATION BLOCKED" title="Preflight stopped safely" tone="blocked">
        <Text style={styles.body}>{preflightBlocked}</Text>
      </MuseumPlate> : null}
      {standingOutcome !== "IDLE" ? (
        <MuseumPlate exhibit="VERIFIED RUNTIME OUTCOME / LAST ATTEMPT"
          title={standingOutcome === "ALLOW" ? "Allowed by your Key" : standingOutcome === "REFUSE" ? "Boundary upheld" : "Outcome not confirmed"}
          tone={standingOutcome === "REFUSE" ? "boundary" : standingOutcome === "ALLOW" ? "verified" : "unknown"}>
          <Text style={styles.body} accessibilityLiveRegion="polite">{status}</Text>
          {standingOutcome === "UNKNOWN" ? <Text style={styles.body}>Unknown is not success or refusal. Check chain state before retrying.</Text> : null}
        </MuseumPlate>
      ) : null}
      {relayRequest?.status === "KEY_CHANGE_REPORTED" ? (
        <MuseumPlate exhibit="KEY UPDATE / RE-VERIFY" title="Guardian reported a new standing Key" tone="pending">
          <Text style={styles.body}>This coordination report is not authority. Read the actual Devnet Key nonce and limits before treating them as changed. A newly widened Key may permit payments without a per-payment approval.</Text>
          <MuseumButton label="Verify updated Key and resume payment" disabled={busy}
            onPress={resumeAfterReportedKeyChange} />
        </MuseumPlate>
      ) : null}
      {relayRequest ? (
        <MuseumPlate exhibit="ONE EXACT EXCEPTION" title="The boundary did not move."
          tone={relayRequest.status === "REFUSED" ? "boundary" : "pending"}>
          <MuseumFact label="RELAY COORDINATION STATUS" value={relayRequest.status} />
          <Text style={styles.body}>A relay response alone never moves capital or grants new standing authority.</Text>
          {shareLink ? <MuseumButton label="Share to guardian device" onPress={() => {
            void Share.share({ message: shareLink, title: "CRESCO Key boundary request" });
          }} /> : null}
          {youngCapability ? <MuseumButton label="Refresh guardian decision" variant="secondary" disabled={busy} onPress={refreshYoungRequest} /> : null}
          {relayRequest.status === "ALLOWANCE_SUBMITTED" && config.mutatedRecipient ? (
            <MuseumButton label="Try changed recipient — must refuse" variant="secondary" disabled={busy} onPress={() => executeExactAllowance(config.mutatedRecipient)} />
          ) : null}
          {relayRequest.status === "ALLOWANCE_SUBMITTED" ? (
            <MuseumButton label={exactExecutionState === "ALLOW" ? "Replay exact payment — must refuse" : "Retry exact approved payment"} disabled={busy} onPress={() => executeExactAllowance()} />
          ) : null}
        </MuseumPlate>
      ) : null}
      {exactExecutionState !== "IDLE" ? (
        <MuseumPlate exhibit="EXACT REQUEST OUTCOME"
          title={exactExecutionState === "ALLOW" ? "This approval was used once." : exactExecutionState === "REFUSE" ? "The Key refused this attempt." : "Confirmation unavailable"}
          tone={exactExecutionState === "ALLOW" ? "verified" : exactExecutionState === "REFUSE" ? "boundary" : "unknown"}>
          <Text style={styles.body}>{status}</Text>
        </MuseumPlate>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showSkr }}
        onPress={() => setShowSkr(v => !v)} style={styles.disclosure}>
        <Text style={styles.disclosureTitle}>Optional Solana Mobile / SKR tools</Text>
        <Text style={styles.disclosureTitle}>{showSkr ? "−" : "+"}</Text>
      </Pressable>
      {showSkr ? <SkrCharterAtelier walletAddress={account?.address?.toString() ?? ""} liveKey={youngKeyInspection?.state === "READY" ? youngKeyInspection.key : null} /> : null}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showTechnical }}
        onPress={() => setShowTechnical(v => !v)} style={styles.disclosure}>
        <Text style={styles.disclosureTitle}>Receipts and operator details</Text>
        <Text style={styles.disclosureTitle}>{showTechnical ? "−" : "+"}</Text>
      </Pressable>
      {showTechnical ? (
        <>
          <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />
          <ProofStrip />
          <MuseumPlate exhibit="CURRENT RUNTIME STATUS">
            <Text style={styles.status} accessibilityLiveRegion="polite">{status}</Text>
          </MuseumPlate>
        </>
      ) : null}
    </ScrollView>
  );
}

function JudgePathCard() {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.eyebrow}>JUDGE PATH</Text>
      <Text style={styles.heroTitle}>The exception moves. The boundary does not.</Text>
      <Text style={styles.body}>
        CRESCO Key is not another wallet screen. It is a mobile trust loop:
        independence inside a standing Key, explicit guardian choice at the
        boundary, and receipts when the product refuses replay or mutation.
      </Text>
      <View style={styles.tagRow}>
        <Text style={styles.tag}>Mobile-first</Text>
        <Text style={styles.tag}>Devnet</Text>
        <Text style={styles.tag}>No silent widening</Text>
      </View>
    </View>
  );
}

function CoreLoopCard({
  intentLoaded,
  relayDecision,
  exactUse,
  receiptReady,
}: {
  intentLoaded: boolean;
  relayDecision: string;
  exactUse: string;
  receiptReady: boolean;
}) {
  return (
    <View style={styles.loopCard}>
      <Text style={styles.truthTitle}>Live core loop checklist</Text>
      <View style={styles.stepRail}>
        <StepPill active={intentLoaded} label="1. Intent" value={intentLoaded ? "Loaded" : "Scan or load demo"} />
        <StepPill active={relayDecision !== "Waiting for boundary"} label="2. Boundary" value={relayDecision} />
        <StepPill active={exactUse !== "Not retried yet"} label="3. Retry" value={exactUse} />
        <StepPill active={receiptReady} label="4. Receipt" value={receiptReady ? "Shareable JSON" : "Not captured yet"} />
      </View>
    </View>
  );
}

function StepPill({
  active,
  label,
  value,
}: {
  active: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.stepPill, active ? styles.stepPillActive : null]}>
      <Text style={styles.stepLabel}>{label}</Text>
      <Text style={styles.stepValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function LatestReceiptCard({
  receiptJson,
  busy,
}: {
  receiptJson: string | null;
  busy: boolean;
}) {
  return (
    <MuseumPlate exhibit="EXHIBIT D / THE LEDGER" title="Every decision leaves a record.">
      {receiptJson ? (
        <>
          <Text style={styles.receiptText} numberOfLines={8}>{receiptJson}</Text>
          <MuseumButton label="Share latest receipt JSON" disabled={busy} onPress={() => {
            void Share.share({ message: receiptJson, title: "CRESCO Key public runtime receipt" });
          }} />
        </>
      ) : <Text style={styles.body}>No runtime receipt captured on this session yet. CRESCO does not invent transaction history.</Text>}
    </MuseumPlate>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  section: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 48,
    gap: 17,
    backgroundColor: color.ivory,
    flexGrow: 1,
  },
  backAction: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", paddingHorizontal: 2 },
  backText: { color: color.ink, fontWeight: "700", fontSize: 15 },
  roleCard: { borderWidth: 1, borderColor: color.border, backgroundColor: color.paper, borderRadius: 23, padding: 19, gap: 8, minHeight: 154 },
  roleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  exactChoiceHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  purchaseAmountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  purchaseAmountCopy: { flex: 1, gap: 4 },
  purchaseAmount: { color: color.ink, fontSize: 38, fontWeight: "700", lineHeight: 45 },
  exactAmountBlock: { gap: 6, paddingVertical: 8 },
  exactAmount: { color: color.ink, fontSize: 31, fontWeight: "700", lineHeight: 38 },
  roleCardPrimary: { borderColor: "#233B2E", backgroundColor: "#17271F" },
  roleEyebrow: { color: color.deepBrass, fontSize: 10, fontWeight: "700", letterSpacing: 1.5 },
  roleHero: { backgroundColor: "#17251F", borderRadius: 24, minHeight: 193, paddingLeft: 20, paddingVertical: 17, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  roleHeroText: { flex: 1, gap: 9 },
  roleHeroKicker: { color: "#D7BD8E", fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  roleHeroTitle: { color: "#FCF4E7", fontSize: 28, fontFamily: "serif", lineHeight: 33, letterSpacing: -1 },
  roleHeroBody: { color: "#D1D8CF", fontSize: 12, lineHeight: 17 },
  roleOnDarkEyebrow: { color: "#D8BD89", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  roleOnDarkTitle: { color: "#FAF3E5", fontSize: 27, fontFamily: "serif", lineHeight: 33 },
  roleOnDarkBody: { color: "#D2D9D0", fontSize: 13, lineHeight: 20 },
  guardianHero: { backgroundColor: "#17251F", borderRadius: 22, minHeight: 165, flexDirection: "row", alignItems: "center", paddingLeft: 19, paddingVertical: 16, overflow: "hidden" },
  guardianHeroCopy: { flex: 1, gap: 8 },
  guardianHeroTitle: { color: "#FCF4E7", fontSize: 28, lineHeight: 32, fontFamily: "serif" },
  guardianHeroSubtitle: { color: "#CFD7CC", fontSize: 12, lineHeight: 18 },
  exactAmountNote: { color: color.secondaryInk, fontSize: 11, lineHeight: 17 },
  youngKeyBanner: { borderRadius: 22, backgroundColor: "#E9E8DB", minHeight: 134, flexDirection: "row", alignItems: "center", paddingLeft: 19, overflow: "hidden" },
  youngKeyText: { flex: 1, gap: 7 },
  youngKeyKicker: { color: color.deepBrass, letterSpacing: 1.3, fontSize: 10, fontWeight: "800" },
  youngKeyTitle: { color: color.ink, fontSize: 23, lineHeight: 28, fontFamily: "serif" },
  youngKeyCaption: { color: color.secondaryInk, fontSize: 12, lineHeight: 17 },
  liveRuleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  liveRuleAmount: { flex: 1, gap: 8 },
  liveRuleValue: { color: color.ink, fontSize: 30, lineHeight: 35, fontWeight: "800" },
  liveRulePeriod: { color: color.ink, fontSize: 18, fontWeight: "800" },
  roleTitle: { color: color.ink, fontSize: 27, fontFamily: "serif", lineHeight: 34, letterSpacing: -0.8 },
  roleDescription: { color: color.secondaryInk, fontSize: 14, lineHeight: 21 },
  disclosure: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: color.border, paddingVertical: 13, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  disclosureTitle: { color: color.secondaryInk, fontWeight: "700", fontSize: 13, flexShrink: 1 },
  scenarios: { gap: 10, borderTopWidth: 1, borderTopColor: color.border, paddingTop: 12 },
  limitInput: {
    minHeight: 48, borderColor: color.border, borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, color: color.ink, backgroundColor: color.paper,
    fontSize: 17,
  },
  acknowledgement: { minHeight: 48, paddingVertical: 12, justifyContent: "center" },
  scenarioLabel: { color: color.deepBrass, fontSize: 10, fontWeight: "700", letterSpacing: 1.1 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    opacity: 0.65,
  },
  sectionTitle: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "700",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: color.ink,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    backgroundColor: "#f7f2e8",
  },
  heroTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "800",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "700",
  },
  loopCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    backgroundColor: "#fbfaf7",
  },
  stepRail: {
    gap: 8,
  },
  stepPill: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    opacity: 0.62,
  },
  stepPillActive: {
    opacity: 1,
    backgroundColor: "#eef7ef",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  stepValue: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
  },
  truthCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  receiptCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  receiptText: {
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.7,
  },
  truthTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  row: { gap: 3 },
  rowLabel: {
    fontSize: 11,
    fontWeight: "700",
    opacity: 0.6,
    textTransform: "uppercase",
  },
  rowValue: { fontSize: 14, lineHeight: 19 },
  button: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonText: { fontWeight: "700" },
  textButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    fontSize: 12,
    lineHeight: 18,
    color: color.secondaryInk,
  },
});
