import { MobileWalletProvider, createSolanaDevnet } from "@wallet-ui/react-native-kit";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";

import { WalletGate } from "./src/WalletGate";

const rpcUrl =
  process.env.EXPO_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

const identityUri =
  process.env.EXPO_PUBLIC_APP_IDENTITY_URI ??
  "https://REPLACE_WITH_VERIFIED_APP_DOMAIN";

const cluster = createSolanaDevnet({ url: rpcUrl });

export default function App() {
  return (
    <MobileWalletProvider
      cluster={cluster}
      identity={{
        name: "CRESCO Key",
        uri: identityUri,
        icon: "favicon.png",
      }}
    >
      <SafeAreaView style={styles.root}>
        <StatusBar style="auto" />
        <WalletGate />
      </SafeAreaView>
    </MobileWalletProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
