import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { BoundaryWorkspace } from "./BoundaryWorkspace";
import { WalletGate } from "./WalletGate";
import { museumColors as c } from "./design/MuseumLedgerUI";

export function MobileExperience() {
  const { account } = useMobileWallet();

  if (!account) return <WalletGate />;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.masthead}>
        <View>
          <Text style={styles.brand}>CRESCO <Text style={styles.brandItalic}>Key</Text></Text>
          <Text style={styles.byline}>FAMILY MONEY, PROGRAMMABLE</Text>
        </View>
        <View style={styles.network}>
          <View style={styles.networkDot} />
          <Text style={styles.networkLabel}>DEVNET</Text>
        </View>
      </View>
      <BoundaryWorkspace />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.ivory },
  masthead: {
    paddingHorizontal: 23,
    paddingTop: 13,
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: c.ink, fontFamily: "serif", fontSize: 25, lineHeight: 31, letterSpacing: 1.3 },
  brandItalic: { fontStyle: "italic", fontSize: 23 },
  byline: { fontSize: 8, fontWeight: "700", letterSpacing: 2, color: c.deepBrass },
  network: { flexDirection: "row", alignItems: "center", gap: 5 },
  networkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.verified },
  networkLabel: { color: c.secondaryInk, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
});
