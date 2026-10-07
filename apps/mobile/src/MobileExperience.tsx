import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BoundaryWorkspace } from "./BoundaryWorkspace";
import { WalletGate } from "./WalletGate";

export function MobileExperience() {
  const { account } = useMobileWallet();

  if (!account) {
    return <WalletGate />;
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.header}>
        <Text style={styles.eyebrow}>CRESCO KEY · DEVNET P0</Text>
        <Text style={styles.title}>Spend inside the Key. Ask only at the boundary.</Text>
        <Text style={styles.wallet} numberOfLines={1}>
          {account.address.toString()}
        </Text>
      </ScrollView>
      <BoundaryWorkspace />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 4,
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
    opacity: 0.65,
  },
  title: { fontSize: 28, lineHeight: 33, fontWeight: "700" },
  wallet: { fontSize: 12, opacity: 0.6 },
});
