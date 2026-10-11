import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MuseumHero, MuseumPlate, MuseumButton, ProofStrip, museumColors as color } from "./design/MuseumLedgerUI";

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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.brandRow}>
        <Text style={styles.wordmark}>CRESCO <Text style={styles.italic}>Key</Text></Text>
        <Text style={styles.edition}>SOLANA / DEVNET</Text>
      </View>
      <MuseumHero
        exhibit="AN INSTRUMENT FOR GROWING INDEPENDENCE"
        title="Freedom with Boundaries."
        subtitle="Your money, within rules that grow with you. Ask only when you reach a real boundary."
        showKey
      />
      <MuseumButton
        disabled={proofState === "CONNECTING"}
        onPress={account ? handleDisconnect : handleConnect}
        label={account ? "Disconnect wallet" : "Connect wallet"}
      />
      {proofState === "REFUSED" ? <Text style={styles.quickStatus} accessibilityLiveRegion="polite">REFUSED · Wallet approval was not completed.</Text> : null}
      <MuseumPlate exhibit="EXHIBIT 00 / YOUR WALLET" title={account ? "Wallet connected" : "Connect your Key"}>
        <Text style={styles.explanation}>
          Your wallet approves protected actions. CRESCO never handles your secret key or widens your spending rules on its own.
        </Text>
        <View style={styles.walletDetails}>
          <Text style={styles.detailLabel}>NETWORK</Text><Text style={styles.detailValue}>{chain}</Text>
          <Text style={styles.detailLabel}>WALLET</Text><Text style={styles.detailValue} numberOfLines={1}>{account?.address?.toString() ?? "Not connected"}</Text>
          <Text style={styles.detailLabel}>SESSION</Text><Text style={styles.detailValue}>{proofState}</Text>
          <Text style={styles.explanation}>{detail}</Text>
        </View>
        {account ? <MuseumButton
          disabled={proofState === "SIGNING"}
          onPress={handleSignProof}
          label="Sign TRC-01 proof message"
          variant="secondary"
        /> : null}
      </MuseumPlate>
      <ProofStrip />
      <Text style={styles.truth}>A Devnet build with genuine program-deployment evidence. Mobile G1 and physical-device transaction proof remain pending. No mainnet custody, brokerage or production payment claim.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 52, backgroundColor: color.ivory, gap: 18, flexGrow: 1 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 5 },
  wordmark: { color: color.ink, fontFamily: "serif", fontSize: 25, letterSpacing: 1.1 },
  italic: { fontStyle: "italic" },
  edition: { color: color.deepBrass, fontSize: 9, fontWeight: "700", letterSpacing: 1.1 },
  explanation: { color: color.secondaryInk, fontSize: 13, lineHeight: 19 },
  walletDetails: { gap: 5, borderTopWidth: 1, borderTopColor: color.border, paddingTop: 10 },
  detailLabel: { color: color.deepBrass, fontSize: 10, fontWeight: "700", letterSpacing: 1.4 },
  detailValue: { color: color.ink, fontSize: 13, lineHeight: 18 },
  truth: { color: color.secondaryInk, fontSize: 11, lineHeight: 17, marginTop: 4 },
  quickStatus: { color: color.vermilion, fontWeight: "700", fontSize: 12, lineHeight: 18 },
});
