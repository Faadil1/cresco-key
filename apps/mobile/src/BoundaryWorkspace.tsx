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

type Mode = "YOUNG" | "GUARDIAN" | null;

function randomRequestId(): string {
  return randomBytes(32).toString("hex");
}

function demoConfig() {
  const decimals = Number(process.env.EXPO_PUBLIC_DEMO_TOKEN_DECIMALS ?? "6");

  return {
    mandate: process.env.EXPO_PUBLIC_DEMO_MANDATE?.trim() ?? "",
    mandateNonce: process.env.EXPO_PUBLIC_DEMO_MANDATE_NONCE?.trim() ?? "",
    guardianWallet: process.env.EXPO_PUBLIC_DEMO_GUARDIAN_WALLET?.trim() ?? "",
    tokenDecimals: decimals,
  };
}

function missingConfig(config: ReturnType<typeof demoConfig>): string[] {
  const missing: string[] = [];
  if (!process.env.EXPO_PUBLIC_BOUNDARY_RELAY_URL?.trim()) {
    missing.push("BOUNDARY_RELAY_URL");
  }
  if (!config.mandate) missing.push("DEMO_MANDATE");
  if (!config.mandateNonce) missing.push("DEMO_MANDATE_NONCE");
  if (!config.guardianWallet) missing.push("DEMO_GUARDIAN_WALLET");
  if (!Number.isInteger(config.tokenDecimals) || config.tokenDecimals < 0) {
    missing.push("DEMO_TOKEN_DECIMALS");
  }
  return missing;
}

export function BoundaryWorkspace() {
  const { account } = useMobileWallet();
  const [mode, setMode] = useState<Mode>(null);
  const [scanning, setScanning] = useState(false);
  const [intent, setIntent] = useState<SolanaPayTransferIntent | null>(null);
  const [relayRequest, setRelayRequest] =
    useState<BoundaryRelayRequest | null>(null);
  const [guardianCapability, setGuardianCapability] =
    useState<BoundaryDeepLink | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "No boundary relay action has been attempted.",
  );
  const [busy, setBusy] = useState(false);

  const config = useMemo(() => demoConfig(), []);
  const configMissing = useMemo(() => missingConfig(config), [config]);

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

  const createRelayHarnessRequest = async () => {
    if (!intent || !account) return;

    if (configMissing.length > 0) {
      setStatus(`Missing dev configuration: ${configMissing.join(", ")}`);
      return;
    }

    setBusy(true);
    setStatus(
      "Creating coordination request. This does not claim an onchain boundary refusal.",
    );

    try {
      const requestId = randomRequestId();
      const amountBaseUnits = decimalToBaseUnits(
        intent.amountUi,
        config.tokenDecimals,
      );

      const created = await createBoundaryRequest({
        requestId,
        mandate: config.mandate,
        mandateNonce: config.mandateNonce,
        mint: intent.mint,
        recipient: intent.recipient,
        amountBaseUnits,
        requesterWallet: account.address.toString(),
        guardianWallet: config.guardianWallet,
        expiresAt: Math.floor(Date.now() / 1000) + 10 * 60,
        display: {
          label: intent.label,
          reason:
            "Relay integration harness. Production flow creates this only after a real capital-path REFUSE.",
        },
      });

      await saveBoundaryCapability({
        requestId,
        relayToken: created.relayToken,
      });

      const link = createBoundaryDeepLink(requestId, created.relayToken);
      setRelayRequest(created.request);
      setShareLink(link);
      setStatus(
        "Private relay request created. Still PENDING; the relay cannot grant financial authority.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "BOUNDARY_REQUEST_FAILED",
      );
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

  if (scanning) {
    return (
      <View style={styles.full}>
        <PaymentScanner
          onCancel={() => setScanning(false)}
          onIntent={(nextIntent) => {
            setIntent(nextIntent);
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
            Guardian review is wired to the private relay. The onchain Allow
            Once transaction is deliberately not simulated here. Until the
            program client is connected, this screen cannot approve capital.
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
        Scan the exact action first. CRESCO must know what is being attempted
        before authority can be evaluated.
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

      {intent ? (
        <View style={styles.truthCard}>
          <Text style={styles.truthTitle}>Integration harness only</Text>
          <Text style={styles.body}>
            The next button tests private two-device coordination. It is not the
            CLOCK IN hero boundary yet. The final product may create a request
            only after the onchain standing path actually REFUSES this action.
          </Text>
        </View>
      ) : null}

      {intent ? (
        <Pressable
          disabled={busy}
          style={styles.button}
          onPress={createRelayHarnessRequest}
        >
          <Text style={styles.buttonText}>Create relay test request</Text>
        </Pressable>
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

      {relayRequest ? (
        <Text style={styles.status}>Relay: {relayRequest.status}</Text>
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
