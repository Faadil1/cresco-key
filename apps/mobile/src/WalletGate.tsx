import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MuseumHero, MuseumButton, ProofStrip, museumColors as c } from "./design/MuseumLedgerUI";
import { JudgeReadOnlyTour } from "./JudgeReadOnlyTour";
import { LivingKeySeal } from "./design/LivingKeySeal";

type ConnectState = "IDLE" | "CONNECTING" | "REFUSED";

/**
 * Consumer entry. The first choice is a real wallet connection; the alternate
 * is a read-only sample account inspection, NEVER a staged payment or consent.
 * Keep technical evidence out of the primary purchase path.
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
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="CRESCO Key welcome"
    >
      <View style={styles.brandRow}>
        <View style={styles.brandIdentity}>
          <LivingKeySeal size={38} />
          <Text style={styles.wordmark}>CRESCO <Text style={styles.italic}>Key</Text></Text>
        </View>
        <View style={styles.networkPill}><View style={styles.networkDot} /><Text style={styles.networkText}>SOLANA DEVNET</Text></View>
      </View>

      <MuseumHero
        compact
        exhibit="YOUR MONEY. YOUR NEXT STEP."
        title="More freedom. Clear limits."
        subtitle="Everyday purchases within your Key. Ask your Guardian only when a purchase crosses your limit."
      />

      <View style={styles.primaryAction}>
        <Text style={styles.actionEyebrow}>GET STARTED</Text>
        <Text style={styles.actionTitle}>Connect your wallet</Text>
        <Text style={styles.body}>Your wallet stays yours. CRESCO checks the rules on Solana before an action can go through.</Text>
        <MuseumButton
          label={state === "CONNECTING" ? "Waiting for wallet…" : "Connect wallet"}
          disabled={state === "CONNECTING"}
          onPress={() => { void handleConnect(); }}
        />
        {state === "REFUSED" ? (
          <View style={styles.errorPanel} accessibilityLiveRegion="polite">
            <Text style={styles.errorTitle}>Connection not completed</Text>
            <Text style={styles.body}>Nothing was signed or sent. Open your Devnet wallet and try again.</Text>
            {errorDetail ? <Text style={styles.errorDetail} selectable>{errorDetail}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.sampleAction}>
        <View style={styles.sampleIcon}><Text style={styles.sampleIconText}>↗</Text></View>
        <View style={styles.sampleCopy}>
          <Text style={styles.sampleTitle}>Just looking around?</Text>
          <Text style={styles.body}>Explore a real sample Key on Devnet without connecting or paying.</Text>
        </View>
        <MuseumButton
          label="Explore live Devnet Key — no wallet"
          variant="secondary"
          onPress={() => setShowSample(true)}
        />
      </View>

      <View style={styles.steps}>
        <Text style={styles.actionEyebrow}>HOW CRESCO WORKS</Text>
        <View style={styles.step}><Text style={styles.stepNumber}>01</Text><View style={styles.stepText}><Text style={styles.stepTitle}>Spend within your Key</Text><Text style={styles.body}>Your standing limits make room for everyday independence.</Text></View></View>
        <View style={styles.step}><Text style={styles.stepNumber}>02</Text><View style={styles.stepText}><Text style={styles.stepTitle}>Reach a boundary</Text><Text style={styles.body}>A higher or different payment needs a specific decision.</Text></View></View>
        <View style={styles.step}><Text style={styles.stepNumber}>03</Text><View style={styles.stepText}><Text style={styles.stepTitle}>One exception, not a new limit</Text><Text style={styles.body}>A Guardian may approve one exact action. That is different from permanently changing your Key.</Text></View></View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showTechnical }}
        onPress={() => setShowTechnical(v => !v)}
        style={styles.technicalToggle}
      >
        <Text style={styles.technicalTitle}>Build status and verification</Text>
        <Text style={styles.technicalTitle}>{showTechnical ? "−" : "+"}</Text>
      </Pressable>
      {showTechnical ? (
        <View style={styles.technicalDetails}>
          <ProofStrip />
          <Text style={styles.disclaimer}>
            Devnet research build. Wallet connection and a previous physical Android
            message-signing test were observed, but this exact APK has not been
            physically retested. The full Guardian Allow Once → payment → replay path
            is not verified. No mainnet custody or production payment is offered.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 48, backgroundColor: c.ivory, gap: 16, flexGrow: 1 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  brandIdentity: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  wordmark: { color: c.ink, fontFamily: "serif", fontSize: 26, letterSpacing: 0.8, flexShrink: 1 },
  italic: { fontStyle: "italic" },
  networkPill: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: c.border, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 7 },
  networkDot: { height: 6, width: 6, borderRadius: 3, backgroundColor: c.verified },
  networkText: { color: c.deepBrass, fontWeight: "700", fontSize: 9, letterSpacing: 0.6 },
  primaryAction: { padding: 16, backgroundColor: c.paper, borderWidth: 1, borderColor: c.border, borderRadius: 16, gap: 10 },
  actionEyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.7, color: c.deepBrass },
  actionTitle: { fontSize: 24, fontFamily: "serif", color: c.ink, lineHeight: 28 },
  body: { fontSize: 14, lineHeight: 20, color: c.secondaryInk },
  errorPanel: { backgroundColor: c.vermilionWash, borderRadius: 10, padding: 12, gap: 6 },
  errorTitle: { fontSize: 15, fontWeight: "700", color: c.vermilion },
  errorDetail: { color: c.secondaryInk, fontSize: 12, lineHeight: 17 },
  sampleAction: { gap: 10, paddingVertical: 8 },
  sampleIcon: { display: "none" },
  sampleIconText: { color: c.deepBrass, fontSize: 18 },
  sampleCopy: { gap: 4 },
  sampleTitle: { fontSize: 18, fontWeight: "700", color: c.ink },
  steps: { gap: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 13 },
  stepNumber: { minWidth: 27, fontWeight: "700", fontSize: 13, color: c.deepBrass },
  stepText: { flex: 1, gap: 3 },
  stepTitle: { fontSize: 15, color: c.ink, fontWeight: "700" },
  technicalToggle: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, paddingVertical: 15, flexDirection: "row", justifyContent: "space-between" },
  technicalTitle: { color: c.deepBrass, fontWeight: "700", fontSize: 13 },
  technicalDetails: { gap: 12 },
  disclaimer: { color: c.secondaryInk, fontSize: 12, lineHeight: 18 },
});
