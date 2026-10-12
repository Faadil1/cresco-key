import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MuseumButton, ProofStrip, museumColors as c } from "./design/MuseumLedgerUI";
import { JudgeReadOnlyTour } from "./JudgeReadOnlyTour";
import { LivingKeySeal } from "./design/LivingKeySeal";

type ConnectState = "IDLE" | "CONNECTING" | "REFUSED";

/**
 * CRESCO Atelier / consumer entry.
 * No invented limits, balances, completed payments or account ownership.
 * Both wallet and read-only actions retain their original behaviour.
 */
export function WalletGate() {
  const { connect } = useMobileWallet();
  const [state, setState] = useState<ConnectState>("IDLE");
  const [errorDetail, setErrorDetail] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  const handleConnect = async () => {
    if (state === "CONNECTING") return;
    setState("CONNECTING");
    setErrorDetail("");
    try {
      await connect();
      setState("IDLE");
    } catch (error) {
      setState("REFUSED");
      setErrorDetail(error instanceof Error ? error.message : "The wallet did not finish connecting.");
    }
  };

  if (showSample) return <JudgeReadOnlyTour onExit={() => setShowSample(false)} />;

  return (
    <ScrollView contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="CRESCO Key welcome">
      <View style={s.brandRow}>
        <View style={s.brand}>
          <LivingKeySeal size={32} />
          <Text style={s.wordmark}>CRESCO <Text style={s.wordmarkItalic}>Key</Text></Text>
        </View>
        <View style={s.network}>
          <View style={s.networkDot} />
          <Text style={s.networkLabel}>DEVNET</Text>
        </View>
      </View>

      <View style={s.hero}>
        <Text style={s.kicker}>INDEPENDENCE, WITH INTENTION</Text>
        <Text style={s.headline}>Money freedom.{"\n"}With boundaries.</Text>
        <Text style={s.lede}>Everyday payments within a standing Key. A Guardian decides only when an exact request goes beyond it.</Text>
      </View>

      <View style={s.keyPreview} accessible={true}
        accessibilityLabel="A standing Key defines ongoing limits. An exception applies to a separate exact request, never changes the Key.">
        <View style={s.previewIcon}><LivingKeySeal size={62} mood="standing" /></View>
        <View style={s.previewContent}>
          <Text style={s.previewOverline}>THE KEY</Text>
          <Text style={s.previewTitle}>The limit stays.{"\n"}The request is separate.</Text>
          <Text style={s.previewBody}>One clear rule, with room for a one-time decision.</Text>
        </View>
      </View>

      <View style={s.actions}>
        <MuseumButton
          label={state === "CONNECTING" ? "Waiting for wallet…" : "Connect wallet"}
          disabled={state === "CONNECTING"}
          onPress={() => { void handleConnect(); }}
        />
        <MuseumButton
          label="Explore live Devnet Key — no wallet"
          variant="secondary"
          onPress={() => setShowSample(true)}
        />
        <Text style={s.actionHint}>Your wallet remains yours. Explore mode is read-only and never asks you to sign.</Text>
        {state === "REFUSED" ? (
          <View style={s.error} accessibilityLiveRegion="polite">
            <Text style={s.errorTitle}>Connection not completed</Text>
            <Text style={s.muted}>Nothing was signed or sent. Open your Devnet wallet and try again.</Text>
            {errorDetail ? <Text selectable style={s.errorDetail}>{errorDetail}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={s.how}>
        <Text style={s.sectionLabel}>HOW IT WORKS</Text>
        <View style={s.step}>
          <Text style={s.stepIndex}>01</Text>
          <View style={s.stepCopy}><Text style={s.stepTitle}>Pay within your Key</Text><Text style={s.muted}>Ordinary purchases follow your ongoing limit.</Text></View>
        </View>
        <View style={s.step}>
          <Text style={s.stepIndex}>02</Text>
          <View style={s.stepCopy}><Text style={s.stepTitle}>Ask for one exception</Text><Text style={s.muted}>A Guardian reviews the exact amount and recipient.</Text></View>
        </View>
        <View style={s.step}>
          <Text style={s.stepIndex}>03</Text>
          <View style={s.stepCopy}><Text style={s.stepTitle}>Keep the same rules</Text><Text style={s.muted}>A one-time approval is never a permanent increase.</Text></View>
        </View>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Show build details and verification"
        accessibilityState={{ expanded: showTechnical }}
        onPress={() => setShowTechnical(v => !v)} style={s.disclosure}>
        <Text style={s.disclosureLabel}>Build details & verification</Text>
        <Text style={s.disclosureIcon}>{showTechnical ? "−" : "+"}</Text>
      </Pressable>
      {showTechnical ? (
        <View style={s.tech}>
          <ProofStrip />
          <Text style={s.muted}>Devnet research build. A previous physical Android message-signing test was observed, but this exact APK has not been physically retested. The full Guardian Allow Once → payment → replay path is not verified. No mainnet custody or production payment is offered.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { backgroundColor: c.ivory, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 48, gap: 22, flexGrow: 1 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  wordmark: { color: c.ink, fontFamily: "serif", fontSize: 23, lineHeight: 30, letterSpacing: -0.7 },
  wordmarkItalic: { fontStyle: "italic" },
  network: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 99, backgroundColor: c.paper, borderWidth: 1, borderColor: c.border, paddingVertical: 7, paddingHorizontal: 11 },
  networkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.secondaryInk },
  networkLabel: { color: c.secondaryInk, fontSize: 10, fontWeight: "700", letterSpacing: 0.7 },
  hero: { gap: 11, paddingTop: 26 },
  kicker: { fontSize: 10, letterSpacing: 1.4, fontWeight: "800", color: c.deepBrass },
  headline: { fontFamily: "serif", fontSize: 38, lineHeight: 45, letterSpacing: -1.6, color: c.ink },
  lede: { fontSize: 15, lineHeight: 23, color: c.secondaryInk, maxWidth: 350 },
  keyPreview: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 21, padding: 17, backgroundColor: "#E8EFE9", minHeight: 116 },
  previewIcon: { height: 70, width: 70, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: "#F7FAF6" },
  previewContent: { flex: 1, gap: 5 },
  previewOverline: { fontSize: 10, fontWeight: "800", color: c.deepBrass, letterSpacing: 1.2 },
  previewTitle: { fontSize: 17, lineHeight: 22, fontWeight: "700", color: c.ink },
  previewBody: { color: c.secondaryInk, fontSize: 12, lineHeight: 17 },
  actions: { gap: 10 },
  actionHint: { fontSize: 12, lineHeight: 18, color: c.secondaryInk, textAlign: "center", paddingHorizontal: 5 },
  error: { backgroundColor: c.vermilionWash, borderRadius: 14, padding: 15, gap: 5 },
  errorTitle: { color: c.vermilion, fontWeight: "700", fontSize: 14 },
  errorDetail: { color: c.secondaryInk, fontSize: 12 },
  muted: { color: c.secondaryInk, fontSize: 13, lineHeight: 20 },
  how: { borderTopWidth: 1, borderColor: c.border, paddingTop: 20, gap: 17 },
  sectionLabel: { color: c.deepBrass, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  step: { flexDirection: "row", gap: 15, alignItems: "flex-start" },
  stepIndex: { color: c.deepBrass, fontSize: 12, fontWeight: "700", minWidth: 22 },
  stepCopy: { flex: 1, gap: 2 },
  stepTitle: { color: c.ink, fontWeight: "700", fontSize: 15 },
  disclosure: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52 },
  disclosureLabel: { color: c.secondaryInk, fontWeight: "600", fontSize: 13 },
  disclosureIcon: { color: c.secondaryInk, fontSize: 20 },
  tech: { gap: 12 },
});
