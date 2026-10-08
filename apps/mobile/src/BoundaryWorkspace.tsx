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
  Text,
  View,
} from "react-native";

import { PaymentScanner } from "./payment/PaymentScanner";
import { MuseumHero, MuseumPlate, MuseumButton, MuseumFact, ProofStrip, museumColors as color } from "./design/MuseumLedgerUI";
import { SkrCharterAtelier } from "./skr/SkrCharterAtelier";
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
  | "BOUNDARY_REQUEST"
  | "GUARDIAN_ALLOW_ONCE"
  | "GUARDIAN_REFUSE"
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
      mandateNonce: config.mandateNonce,
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

  const attemptStandingPayment = async () => {
    if (!intent || !account) return;

    if (capitalConfigMissing.length > 0) {
      setStatus(
        `Capital path is not configured: ${capitalConfigMissing.join(", ")}`,
      );
      return;
    }

    setBusy(true);
    setStatus("Submitting the standing-Key payment instruction on Devnet.");

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
          expectedNonce: BigInt(config.mandateNonce),
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
      });

      if (outcome.state === "REFUSE") {
        await createBoundaryFromVerifiedRefusal(outcome);
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
      setStatus(`Relay status: ${request.status}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "REFRESH_FAILED");
    } finally {
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
          subtitle="Review exactly what was requested. Your choice does not rewrite the standing Key." compact />
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
        {intent && !relayRequest ? <MuseumButton label="Try payment inside my Key" disabled={busy} onPress={attemptStandingPayment} /> : null}
      </MuseumPlate>
      {standingOutcome !== "IDLE" ? (
        <MuseumPlate exhibit="VERIFIED RUNTIME OUTCOME / LAST ATTEMPT"
          title={standingOutcome === "ALLOW" ? "Allowed by your Key" : standingOutcome === "REFUSE" ? "Boundary upheld" : "Outcome not confirmed"}
          tone={standingOutcome === "REFUSE" ? "boundary" : standingOutcome === "ALLOW" ? "verified" : "pending"}>
          <Text style={styles.body} accessibilityLiveRegion="polite">{status}</Text>
          {standingOutcome === "UNKNOWN" ? <Text style={styles.body}>Unknown is not success or refusal. Check chain state before retrying.</Text> : null}
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
          tone={exactExecutionState === "ALLOW" ? "verified" : exactExecutionState === "REFUSE" ? "boundary" : "pending"}>
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
