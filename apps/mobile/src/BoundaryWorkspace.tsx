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
  checkPaymentReadiness,
  type PaymentReadiness,
  type ReadinessRpc,
} from "./solana/paymentReadiness";
import { MuseumHero, MuseumPlate, MuseumButton, MuseumFact, ProofStrip, museumColors as color } from "./design/MuseumLedgerUI";
import { SkrCharterAtelier } from "./skr/SkrCharterAtelier";
import {
  inspectStandingKey,
  buildWidenStandingKeyInstruction,
  displayTokenUnits,
  type KeyInspection,
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
import { saveBoundaryCapability } from "./relay/storage";
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
  if (!config.mandateNonce) missing.push("DEMO_MANDATE_NONCE");
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
  if (!config.guardianWallet) missing.push("DEMO_GUARDIAN_WALLET");
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
  const [scanning, setScanning] = useState(false);
  const [intent, setIntent] = useState<SolanaPayTransferIntent | null>(null);
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
  const [paymentReadiness, setPaymentReadiness] = useState<PaymentReadiness | null>(null);
  const [guardianKeyInspection, setGuardianKeyInspection] = useState<KeyInspection | null>(null);
  const [youngKeyInspection, setYoungKeyInspection] = useState<KeyInspection | null>(null);
  const [nextActionLimit, setNextActionLimit] = useState("");
  const [nextPeriodLimit, setNextPeriodLimit] = useState("");
  const [widenAcknowledged, setWidenAcknowledged] = useState(false);

  const config = useMemo(() => demoConfig(), []);
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
  const demoBeneficiaryBlocker = !config.beneficiaryWallet
    ? "Configured Devnet beneficiary is missing from this APK. Payment not attempted."
    : account?.address.toString() !== config.beneficiaryWallet
      ? "This wallet is not the beneficiary of the configured Devnet charter. Provision a new charter and mandate with authorized signatures before payment."
      : null;

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

  const createBoundaryFromVerifiedRefusal = async (
    refusal: Extract<TransactionOutcome, { state: "REFUSE" }>,
    liveMandateNonce: bigint,
  ) => {
    if (!intent || !account) return;

    if (relayConfigMissing.length > 0) {
      setStatus(
        `REFUSE verified, but relay is not configured: ${relayConfigMissing.join(
          ", ",
        )}`,
      );
      return;
    }

    const programConfig = paymentProgramConfigFromEnv();
    const beneficiary = address(account.address.toString());
    const mint = address(intent.mint);
    const recipient = address(intent.recipient);
    const accounts = await derivePaymentAccounts({
      config: programConfig,
      beneficiary,
      mint,
      recipient,
    });

    const requestId = randomRequestId();
    const amountBaseUnits = decimalToBaseUnits(
      intent.amountUi,
      config.tokenDecimals,
    );

    const created = await createBoundaryRequest({
      requestId,
      mandate: accounts.mandate,
      mandateNonce: liveMandateNonce.toString(),
      mint: intent.mint,
      recipient: intent.recipient,
      amountBaseUnits,
      requesterWallet: account.address.toString(),
      guardianWallet: config.guardianWallet,
      expiresAt: Math.floor(Date.now() / 1000) + 10 * 60,
      display: {
        label: intent.label,
        reason: `Standing Key refused: ${refusal.evidence}${
          refusal.signature ? ` · tx ${refusal.signature}` : ""
        }`,
      },
    });

    const capability = {
      requestId,
      relayToken: created.relayToken,
    };

    await saveBoundaryCapability(capability);

    const link = createBoundaryDeepLink(requestId, created.relayToken);
    setYoungCapability(capability);
    setRelayRequest(created.request);
    setShareLink(link);
    setExactExecutionState("IDLE");
    recordReceipt("BOUNDARY_REQUEST", {
      state: "PENDING",
      requestId,
      refusal: outcomeReceipt(refusal),
      relayStatus: created.request.status,
    });
    setStatus(
      "REFUSE is verified. A private PENDING request now carries the exact action to the guardian; the standing Key has not moved.",
    );
  };

  // Actual Devnet account inspection, not a generated setup checklist or demo
  // proof. Every payment rechecks before requesting a wallet signature.
  const inspectLivePaymentReadiness = async (): Promise<PaymentReadiness> => {
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
      const result = await checkPaymentReadiness(readinessRpc, {
        chain,
        connectedWallet: account.address.toString(),
        expectedBeneficiary: config.beneficiaryWallet,
        config: paymentProgramConfigFromEnv(),
        mint: intent.mint,
        recipient: intent.recipient,
        requestedAmountBaseUnits: BigInt(
          decimalToBaseUnits(intent.amountUi, config.tokenDecimals),
        ),
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
    if (!intent || !account) return;

    if (demoBeneficiaryBlocker) {
      // Configuration mismatch is not an on-chain REFUSE and not a submission.
      setPreflightBlocked(demoBeneficiaryBlocker);
      setStatus("PRECHECK BLOCKED · " + demoBeneficiaryBlocker);
      recordReceipt("PRECHECK_BLOCKED", {
        state: "BLOCKED",
        reason: "DEMO_BENEFICIARY_NOT_PROVISIONED_FOR_CONNECTED_WALLET",
        configuredBeneficiary: config.beneficiaryWallet || null,
        connectedWallet: account.address.toString(),
        transactionSubmitted: false,
        signature: null,
        proofScope: "PUBLIC_BUILD_CONFIGURATION_ONLY",
      });
      return;
    }

    if (capitalConfigMissing.length > 0) {
      setStatus(
        `Capital path is not configured: ${capitalConfigMissing.join(", ")}`,
      );
      return;
    }

    setBusy(true);
    setStatus("Checking live Devnet account readiness before wallet approval.");

    const readiness = await inspectLivePaymentReadiness();
    if (readiness.state !== "READY_FOR_WALLET_ATTEMPT") {
      setPreflightBlocked(
        readiness.state === "BLOCKED" ? readiness.reasons.join(", ") : readiness.reason,
      );
      setStatus(
        readiness.state === "BLOCKED"
          ? `PRECHECK BLOCKED · ${readiness.reasons.join(", ")}`
          : `PRECHECK UNKNOWN · ${readiness.reason}`,
      );
      setBusy(false);
      return;
    }
    // A real Key may have changed after the initial APK was built.
    const standingKey = await readYoungStandingKey();
    if (standingKey.state !== "READY") {
      const reason = standingKey.reason;
      setPreflightBlocked(reason);
      setStatus(`STANDING KEY ${standingKey.state} · ${reason}`);
      setBusy(false);
      return;
    }
    const liveMandateNonce = standingKey.key.nonce;
    setPreflightBlocked(null);
    setStatus(`Live Key nonce ${liveMandateNonce} and accounts checked; requesting the actual payment via wallet.`);

    try {
      const programConfig = paymentProgramConfigFromEnv();
      const instruction =
        await buildExecutePaymentWithinMandateInstruction({
          config: programConfig,
          beneficiary: address(account.address.toString()),
          mint: address(intent.mint),
          recipient: address(intent.recipient),
          amountBaseUnits: BigInt(
            decimalToBaseUnits(intent.amountUi, config.tokenDecimals),
          ),
          expectedNonce: liveMandateNonce,
        });

      let outcome: TransactionOutcome;
      try {
        const signature = await sendTransactions([instruction]);
        outcome = await waitForTransactionOutcome(rpcForOutcome, signature);
      } catch (submissionError) {
        outcome = classifyProgramSubmissionError(submissionError);
      }

      setStatus(outcomeLabel(outcome));
      setStandingOutcome(outcome.state);
      recordReceipt("STANDING_PAYMENT", {
        outcome: outcomeReceipt(outcome),
        verifiedBeforeSubmissionMandateNonce: liveMandateNonce.toString(),
      });

      if (outcome.state === "REFUSE") {
        await createBoundaryFromVerifiedRefusal(outcome, liveMandateNonce);
      }
    } catch (error) {
      setStandingOutcome("UNKNOWN");
      setStatus(error instanceof Error ? error.message : "PAYMENT_ATTEMPT_FAILED");
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
    if (!config.guardianWallet) {
      return { state: "BLOCKED", reason: "EXPECTED_GUARDIAN_NOT_CONFIGURED" };
    }
    try {
      return await inspectStandingKey(makeStandingKeyRpc(), {
        chain,
        config: paymentProgramConfigFromEnv(),
        beneficiaryWallet: account.address.toString(),
        guardianWallet: config.guardianWallet,
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
      const result = await readYoungStandingKey();
      setYoungKeyInspection(result);
      setStatus(result.state === "READY"
        ? `Live Key read: action limit ${displayTokenUnits(result.key.maxActionAmount, config.tokenDecimals)}, period limit ${displayTokenUnits(result.key.maxPeriodAmount, config.tokenDecimals)}, nonce ${result.key.nonce}.`
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
      const result = await readGuardianKey(false);
      setGuardianKeyInspection(result);
      setWidenAcknowledged(false);
      if (result.state === "READY") {
        setNextActionLimit(displayTokenUnits(result.key.maxActionAmount, config.tokenDecimals));
        setNextPeriodLimit(displayTokenUnits(result.key.maxPeriodAmount, config.tokenDecimals));
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
      const nextAction = BigInt(decimalToBaseUnits(nextActionLimit, config.tokenDecimals));
      const nextPeriod = BigInt(decimalToBaseUnits(nextPeriodLimit, config.tokenDecimals));

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
    if (!guardianCapability || !relayRequest || !account) return;

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
    if (!relayRequest || !account) return;

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
        <Text style={styles.eyebrow}>CHOOSE YOUR ROLE</Text>
        <MuseumHero
          exhibit="CATALOGUE 001 / THE FAMILY KEY"
          title="Freedom with Boundaries."
          subtitle="The next generation deserves room to act. The standing Key sets the limits; a guardian appears only when needed."
          showKey
        />
        <MuseumPlate exhibit="EXHIBIT A / YOUR KEY" title="Choose your role">
          <Text style={styles.body}>Each person signs with their own wallet. No shared custody or silent approval.</Text>
          <MuseumButton label="Young person flow" onPress={() => setMode("YOUNG")} />
          <MuseumButton label="Guardian flow" variant="secondary" onPress={() => setMode("GUARDIAN")} />
        </MuseumPlate>
        <ProofStrip />
        <MuseumPlate exhibit="VERIFICATION / LOCAL WALLET" title="Inspect your session">
          <Text style={styles.body}>{walletProof}</Text>
          <MuseumButton label="Sign TRC-01 proof message" disabled={busy} variant="secondary" onPress={signWalletProof} />
        </MuseumPlate>
        <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />
      </ScrollView>
    );
  }

  if (mode === "GUARDIAN") {
    return (
      <ScrollView contentContainerStyle={styles.section}>
        <MuseumHero exhibit="EXHIBIT C / THE DECISION" title="One action. Your call."
          subtitle="Choose consciously: refuse, allow exactly once, or change the standing Key. Only the last choice changes ongoing authority." compact />
        {relayRequest ? (
          <MuseumPlate exhibit="REQUEST / EXACT BOUNDARY" title={relayRequest.display?.label ?? "Guardian review"}
            tone={relayRequest.status === "REFUSED" ? "boundary" : "pending"}>
            <MuseumFact label="STATUS" value={relayRequest.status} />
            <MuseumFact label="AMOUNT / TOKEN BASE UNITS" value={relayRequest.amountBaseUnits} />
            <MuseumFact label="TOKEN MINT" value={relayRequest.mint} />
            <MuseumFact label="RECIPIENT" value={relayRequest.recipient} />
            <MuseumFact label="MANDATE NONCE" value={relayRequest.mandateNonce} />
            <Text style={styles.body}>Approval would cover only these exact terms once. It is not payment execution.</Text>
          </MuseumPlate>
        ) : (
          <MuseumPlate exhibit="REQUEST / NONE YET" title="Awaiting a boundary">
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
            <MuseumPlate exhibit="THIRD CHOICE / PERMANENT AUTHORITY" title="Widen the standing Key" tone="neutral">
              <Text style={styles.body}>This is NOT Allow Once. Widen changes the permanent amount limits of the actual onchain asset rule. It advances the mandate nonce and invalidates pending exact authorizations tied to the old version.</Text>
              <MuseumButton label="Read current standing Key from Devnet" variant="secondary"
                disabled={busy} onPress={inspectGuardianStandingKey} />
              {guardianKeyInspection?.state === "READY" ? (
                <View style={styles.scenarios}>
                  <MuseumFact label="LIVE ACTION LIMIT / TOKEN UNITS" value={displayTokenUnits(guardianKeyInspection.key.maxActionAmount, config.tokenDecimals)} />
                  <MuseumFact label="LIVE PERIOD LIMIT / TOKEN UNITS" value={displayTokenUnits(guardianKeyInspection.key.maxPeriodAmount, config.tokenDecimals)} />
                  <MuseumFact label="SPENT IN CURRENT PERIOD / TOKEN UNITS" value={displayTokenUnits(guardianKeyInspection.key.spentThisPeriod, config.tokenDecimals)} />
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
                  {guardianKeyInspection.state}: {guardianKeyInspection.reason}. No authority has changed.
                </Text>
              ) : null}
            </MuseumPlate>
          </>
        ) : null}
        <MuseumPlate exhibit="AUTHORITY / IMPORTANT">
          <Text style={styles.body}>The relay coordinates the request. Only the CRESCO Solana program can grant a one-time allowance. A confirmed allowance is not a completed payment.</Text>
          <Text style={styles.status} accessibilityLiveRegion="polite">{status}</Text>
        </MuseumPlate>
        <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />
        <SkrCharterAtelier walletAddress={account?.address?.toString() ?? ""} />
        <MuseumButton label="Change role" variant="secondary" onPress={() => setMode(null)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.section}>
      <MuseumHero
        exhibit={standingOutcome === "REFUSE" ? "EXHIBIT B / BOUNDARY REACHED" : standingOutcome === "ALLOW" ? "EXHIBIT E / WITHIN THE KEY" : "EXHIBIT A / YOUR KEY"}
        title={standingOutcome === "REFUSE" ? "This action needs a guardian." : standingOutcome === "ALLOW" ? "Within your Key." : "Freedom with Boundaries."}
        subtitle={standingOutcome === "REFUSE"
          ? "This attempt was refused. A narrow guardian request may be created without changing your standing rules."
          : standingOutcome === "ALLOW" ? "Your standing Key permitted this exact action on Devnet." : "Act independently inside your rules. Start by scanning an exact payment intent."}
        tone={standingOutcome === "REFUSE" ? "boundary" : "neutral"}
        compact={Boolean(intent)}
        showKey={!intent}
      />
      <MuseumPlate exhibit="EXHIBIT A / PAYMENT INTENT" title={intent ? "Your requested action" : "Start with an action"}
        tone={standingOutcome === "REFUSE" ? "boundary" : standingOutcome === "ALLOW" ? "verified" : "neutral"}>
        {intent ? (
          <>
            <MuseumFact label="AMOUNT" value={intent.amountUi} />
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
            {youngKeyInspection?.state === "READY" ? (
              <MuseumPlate exhibit="YOUR REAL KEY / DEVNET" title="Standing authority right now" tone="neutral">
                <MuseumFact label="PER-ACTION LIMIT" value={displayTokenUnits(youngKeyInspection.key.maxActionAmount, config.tokenDecimals)} />
                <MuseumFact label="PER-PERIOD LIMIT" value={displayTokenUnits(youngKeyInspection.key.maxPeriodAmount, config.tokenDecimals)} />
                <MuseumFact label="MANDATE NONCE" value={youngKeyInspection.key.nonce.toString()} />
                <Text style={styles.body}>These limits are read from the CRESCO program. A payment still needs its own wallet approval and onchain enforcement.</Text>
              </MuseumPlate>
            ) : youngKeyInspection ? (
              <Text style={styles.status}>Unable to verify live Key: {youngKeyInspection.reason}</Text>
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
                tone={paymentReadiness.state === "READY_FOR_WALLET_ATTEMPT"
                  ? "verified" : "blocked"}>
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
        <MuseumPlate exhibit="EXHIBIT B / EXACT EXCEPTION" title="The boundary did not move."
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
        <MuseumPlate exhibit="EXHIBIT E / ONE-TIME OUTCOME"
          title={exactExecutionState === "ALLOW" ? "This approval was used once." : exactExecutionState === "REFUSE" ? "The Key refused this attempt." : "Confirmation unavailable"}
          tone={exactExecutionState === "ALLOW" ? "verified" : exactExecutionState === "REFUSE" ? "boundary" : "unknown"}>
          <Text style={styles.body}>{status}</Text>
        </MuseumPlate>
      ) : null}
      <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />
      <ProofStrip />
      <MuseumPlate exhibit="OPERATOR DETAIL / CURRENT STATUS">
        <Text style={styles.status} accessibilityLiveRegion="polite">{status}</Text>
      </MuseumPlate>
      <MuseumButton label="Change role" variant="secondary" onPress={() => setMode(null)} />
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
    paddingVertical: 16,
    paddingBottom: 48,
    gap: 15,
    backgroundColor: color.ivory,
    flexGrow: 1,
  },
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
