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

  const rpcForOutcome: Parameters<typeof waitForTransactionOutcome>[0] =
    client.rpc;

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
    } catch (error) {
      setWalletProof(
        error instanceof Error
          ? `REFUSED/FAILED · ${error.message}`
          : "UNKNOWN · signing did not complete",
      );
    } finally {
      setBusy(false);
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
            onPress={grantExactAllowanceOnce}
          >
            <Text style={styles.buttonText}>Allow this exact payment once</Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.textButton} onPress={() => setMode(null)}>
          <Text>Change role</Text>
        </Pressable>
        <Text style={styles.status}>{status}</Text>
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
