import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function WalletGate() {
  const { account, chain, connect, disconnect } = useMobileWallet();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>CRESCO KEY</Text>
      <Text style={styles.title}>Act freely inside your Key.</Text>
      <Text style={styles.body}>
        The mobile vertical slice starts by proving a real local wallet session.
        Authority semantics come next.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Network</Text>
        <Text style={styles.value}>{chain}</Text>

        <Text style={styles.label}>Wallet</Text>
        <Text style={styles.value} numberOfLines={1}>
          {account?.address?.toString() ?? "Not connected"}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => (account ? disconnect() : connect())}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {account ? "Disconnect wallet" : "Connect wallet"}
        </Text>
      </Pressable>

      <Text style={styles.truth}>
        Devnet scaffold. No production custody, brokerage, or mainnet claim.
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
  button: {
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
