import { MobileWalletProvider, createSolanaDevnet } from "@wallet-ui/react-native-kit";
import { StatusBar } from "expo-status-bar";
import { Platform, SafeAreaView, StatusBar as NativeStatusBar, StyleSheet } from "react-native";

import { MobileExperience } from "./src/MobileExperience";
import { museumLedgerTokens as theme } from "./src/design/museumLedger";

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
        <StatusBar style="dark" backgroundColor={theme.color.ivory} />
        <MobileExperience />
      </SafeAreaView>
    </MobileWalletProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Android edge-to-edge status-bar icons otherwise collide with the wordmark.
    // React Native SafeAreaView handles iOS but not Android top insets.
    paddingTop: Platform.OS === "android" ? (NativeStatusBar.currentHeight ?? 28) : 0,
  },
});
