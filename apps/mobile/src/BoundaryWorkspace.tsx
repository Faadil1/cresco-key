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
      recordReceipt("STANDING_PAYMENT", {
        outcome: outcomeReceipt(outcome),
      });

      if (outcome.state === "REFUSE") {
        await createBoundaryFromVerifiedRefusal(outcome);
      }
    } catch (error) {
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>P0 mobile workspace</Text>
        <Text style={styles.body}>
          Choose the human role on this device. Each role still uses its own
          local wallet session.
        </Text>
        <View style={styles.truthCard}>
          <Text style={styles.truthTitle}>Local wallet proof</Text>
          <Text style={styles.body}>{walletProof}</Text>
          <Pressable
            disabled={busy}
            style={styles.button}
            onPress={signWalletProof}
          >
            <Text style={styles.buttonText}>Sign TRC-01 proof message</Text>
          </Pressable>
        </View>
        <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />
        <Pressable style={styles.button} onPress={() => setMode("YOUNG")}>
          <Text style={styles.buttonText}>Young person flow</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => setMode("GUARDIAN")}>
          <Text style={styles.buttonText}>Guardian flow</Text>
        </Pressable>
      </View>
    );
  }

  if (mode === "GUARDIAN") {
    return (
      <ScrollView contentContainerStyle={styles.section}>
        <Text style={styles.eyebrow}>GUARDIAN DEVICE</Text>
        <Text style={styles.sectionTitle}>Review the exact request</Text>

        {relayRequest ? (
          <View style={styles.card}>
            <Row label="Status" value={relayRequest.status} />
            <Row label="Amount (base units)" value={relayRequest.amountBaseUnits} />
            <Row label="Mint" value={relayRequest.mint} />
            <Row label="Recipient" value={relayRequest.recipient} />
            <Row label="Mandate nonce" value={relayRequest.mandateNonce} />
            {relayRequest.display?.label ? (
              <Row label="Display label" value={relayRequest.display.label} />
            ) : null}
          </View>
        ) : (
          <Text style={styles.body}>
            Open a `crescokey://boundary` link from the young-person device to
            load a private request.
          </Text>
        )}

        <View style={styles.truthCard}>
          <Text style={styles.truthTitle}>Authority boundary</Text>
          <Text style={styles.body}>
            The relay can coordinate this request, but only the Solana program
            can create the exact one-time allowance. Confirmation of the grant
            still does not execute the payment.
          </Text>
        </View>

        {guardianCapability ? (
          <Pressable
            disabled={busy}
            style={styles.button}
            onPress={refreshGuardianRequest}
          >
            <Text style={styles.buttonText}>Refresh request</Text>
          </Pressable>
        ) : null}

        {guardianCapability && relayRequest?.status === "PENDING" ? (
          <Pressable
            disabled={busy}
            style={styles.button}
            onPress={refuseBoundaryRequest}
          >
            <Text style={styles.buttonText}>Not this time</Text>
          </Pressable>
        ) : null}

        {guardianCapability && relayRequest?.status === "PENDING" ? (
          <Pressable
            disabled={busy}
            style={styles.button}
            onPress={grantExactAllowanceOnce}
          >
            <Text style={styles.buttonText}>Allow this exact payment once</Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.textButton} onPress={() => setMode(null)}>
          <Text>Change role</Text>
        </Pressable>
        <Text style={styles.status}>{status}</Text>
        <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.section}>
      <Text style={styles.eyebrow}>YOUNG PERSON DEVICE</Text>
      <Text style={styles.sectionTitle}>Start with the payment intent</Text>
      <Text style={styles.body}>
        Scan the exact action first. CRESCO sends that action through the
        standing Key before a guardian request is even possible.
      </Text>

      <Pressable style={styles.button} onPress={() => setScanning(true)}>
        <Text style={styles.buttonText}>Scan Solana Pay QR</Text>
      </Pressable>

      {configuredDemoIntents.length > 0 ? (
        <View style={styles.truthCard}>
          <Text style={styles.truthTitle}>Deterministic Devnet intents</Text>
          <Text style={styles.body}>
            These public G1 helpers load the same Solana Pay actions emitted by
            the distinct Devnet bootstrap receipt. They do not approve,
            execute, or simulate authority.
          </Text>
          {configuredDemoIntents.map((option) => (
            <Pressable
              key={option.label}
              disabled={busy}
              style={styles.button}
              onPress={() => loadDemoIntent(option.value)}
            >
              <Text style={styles.buttonText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {intent ? (
        <View style={styles.card}>
          <Row label="Amount" value={intent.amountUi} />
          <Row label="Mint" value={intent.mint} />
          <Row label="Recipient" value={intent.recipient} />
          {intent.label ? <Row label="Label" value={intent.label} /> : null}
        </View>
      ) : null}

      {intent && !relayRequest ? (
        <Pressable
          disabled={busy}
          style={styles.button}
          onPress={attemptStandingPayment}
        >
          <Text style={styles.buttonText}>Try payment inside my Key</Text>
        </Pressable>
      ) : null}

      {relayRequest ? (
        <View style={styles.truthCard}>
          <Text style={styles.truthTitle}>Boundary request</Text>
          <Text style={styles.body}>
            Relay: {relayRequest.status}. This coordination state cannot move
            capital or widen the standing Key.
          </Text>
        </View>
      ) : null}

      <LatestReceiptCard receiptJson={latestReceiptJson} busy={busy} />

      {shareLink ? (
        <Pressable
          style={styles.button}
          onPress={() =>
            Share.share({
              message: shareLink,
              title: "CRESCO Key boundary request",
            })
          }
        >
          <Text style={styles.buttonText}>Share to guardian device</Text>
        </Pressable>
      ) : null}

      {youngCapability ? (
        <Pressable
          disabled={busy}
          style={styles.button}
          onPress={refreshYoungRequest}
        >
          <Text style={styles.buttonText}>Refresh guardian decision</Text>
        </Pressable>
      ) : null}

      {relayRequest?.status === "ALLOWANCE_SUBMITTED" &&
      config.mutatedRecipient ? (
        <Pressable
          disabled={busy}
          style={styles.button}
          onPress={() => executeExactAllowance(config.mutatedRecipient)}
        >
          <Text style={styles.buttonText}>
            Try changed recipient — must refuse
          </Text>
        </Pressable>
      ) : null}

      {relayRequest?.status === "ALLOWANCE_SUBMITTED" ? (
        <Pressable
          disabled={busy}
          style={styles.button}
          onPress={() => executeExactAllowance()}
        >
          <Text style={styles.buttonText}>
            {exactExecutionState === "ALLOW"
              ? "Replay exact payment — must refuse"
              : "Retry exact approved payment"}
          </Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.textButton} onPress={() => setMode(null)}>
        <Text>Change role</Text>
      </Pressable>
      <Text style={styles.status}>{status}</Text>
    </ScrollView>
  );
}

function LatestReceiptCard({
  receiptJson,
  busy,
}: {
  receiptJson: string | null;
  busy: boolean;
}) {
  if (!receiptJson) return null;

  return (
    <View style={styles.receiptCard}>
      <Text style={styles.truthTitle}>Latest public runtime receipt</Text>
      <Text style={styles.receiptText} numberOfLines={8}>
        {receiptJson}
      </Text>
      <Pressable
        disabled={busy}
        style={styles.button}
        onPress={() =>
          Share.share({
            message: receiptJson,
            title: "CRESCO Key public runtime receipt",
          })
        }
      >
        <Text style={styles.buttonText}>Share latest receipt JSON</Text>
      </Pressable>
    </View>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 14,
  },
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
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
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
    opacity: 0.7,
  },
});
