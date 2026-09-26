import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type WalletProofState =
  | "IDLE"
  | "CONNECTING"
  | "CONNECTED"
  | "SIGNING"
  | "SIGNED"
  | "REFUSED"
  | "UNKNOWN";

export function WalletGate() {
  const { account, chain, connect, disconnect, signMessage } = useMobileWallet();
  const [proofState, setProofState] = useState<WalletProofState>("IDLE");
  const [detail, setDetail] = useState("No wallet proof attempted yet.");

  const handleConnect = async () => {
    try {
      setProofState("CONNECTING");
      setDetail("Waiting for the wallet approval surface.");
      await connect();
      setProofState("CONNECTED");
      setDetail("Wallet session established through Mobile Wallet Adapter.");
    } catch (error) {
      setProofState("REFUSED");
      setDetail(error instanceof Error ? error.message : "Wallet connection was not completed.");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } finally {
      setProofState("IDLE");
      setDetail("Wallet disconnected.");
    }
  };

  const handleSignProof = async () => {
    if (!account) return;

    try {
      setProofState("SIGNING");
      const payload = new TextEncoder().encode(
        `CRESCO Key TRC-01 wallet proof | ${account.address.toString()} | ${chain}`,
      );
      const signature = await signMessage(payload);
      setProofState("SIGNED");
      setDetail(`Message signed. Signature bytes: ${signature.length}.`);
    } catch (error) {
      setProofState("REFUSED");
      setDetail(error instanceof Error ? error.message : "Message signing was not completed.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>CRESCO KEY · TRC-01</Text>
      <Text style={styles.title}>Act freely inside your Key.</Text>
      <Text style={styles.body}>
        This screen is intentionally small: first prove that the Android app can
        establish a real local wallet session and obtain an explicit signature.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Network</Text>
        <Text style={styles.value}>{chain}</Text>

        <Text style={styles.label}>Wallet</Text>
        <Text style={styles.value} numberOfLines={1}>
          {account?.address?.toString() ?? "Not connected"}
        </Text>

        <Text style={styles.label}>Proof state</Text>
        <Text style={styles.value}>{proofState}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={proofState === "CONNECTING"}
        onPress={account ? handleDisconnect : handleConnect}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {account ? "Disconnect wallet" : "Connect wallet"}
        </Text>
      </Pressable>

      {account ? (
        <Pressable
          accessibilityRole="button"
          disabled={proofState === "SIGNING"}
          onPress={handleSignProof}
          style={styles.secondaryButton}
        >
          <Text style={styles.buttonText}>Sign TRC-01 proof message</Text>
        </Pressable>
      ) : null}

      <Text style={styles.truth}>
        Devnet scaffold. A wallet cancellation remains a non-success state. No
        production custody, brokerage, or mainnet claim.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "700",
  },
  body: {
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 520,
  },
  card: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 18,
    gap: 6,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.6,
  },
  value: {
    fontSize: 15,
  },
  detail: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.7,
  },
  button: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  truth: {
    marginTop: "auto",
    paddingBottom: 24,
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.65,
  },
});
