import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ProofStrip, museumColors as c } from "./design/MuseumLedgerUI";
import { KeyPortal } from "./design/KeyPortal";
import { JudgeReadOnlyTour } from "./JudgeReadOnlyTour";

type ConnectState = "IDLE" | "CONNECTING" | "REFUSED";

/**
 * Signature launch: all graphics are native, not a seeded Key/account.
 * Two real actions remain immediately visible and independently operable.
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
    <ScrollView contentContainerStyle={s.screen}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="CRESCO Key welcome">
      <View style={s.hero}>
        <View style={s.brandRow}>
          <View style={s.wordmark}>
            <View style={s.monogram}><Text style={s.monogramText}>C</Text></View>
            <View>
              <Text style={s.brandCresco}>C R E S C O</Text>
              <Text style={s.brandKey}>K E Y</Text>
            </View>
          </View>
          <View style={s.devnet}><View style={s.devnetDot}/><Text style={s.devnetText}>DEVNET</Text></View>
        </View>
        <View style={s.artStage}>
          <View style={s.stageGlow} />
          <KeyPortal size={210} />
        </View>
        <View style={s.intro}>
          <Text style={s.eyebrow}>A DIFFERENT KIND OF FREEDOM</Text>
          <Text style={s.headline}>A safer way to{"\n"}grow with money.</Text>
          <Text style={s.lede}>Real limits. Real decisions. More room to become independent.</Text>
        </View>
        <View style={s.actions}>
          <Pressable
            accessibilityRole="button" accessibilityLabel="Connect wallet"
            accessibilityState={{ disabled: state === "CONNECTING" }}
            disabled={state === "CONNECTING"}
            onPress={() => { void handleConnect(); }}
            style={({ pressed }) => [s.primary, pressed && s.pressed, state === "CONNECTING" && s.disabled]}>
            <Text style={s.primaryLabel}>{state === "CONNECTING" ? "Waiting for wallet…" : "Connect wallet"}</Text>
            <Text style={s.primaryArrow}>↗</Text>
          </Pressable>
          <Pressable accessibilityRole="button"
            accessibilityLabel="Explore live Devnet Key — no wallet"
            onPress={() => setShowSample(true)}
            style={({ pressed }) => [s.secondary, pressed && s.pressed]}>
            <Text style={s.secondaryLabel}>Explore live Devnet Key — no wallet</Text>
            <Text style={s.secondaryArrow}>↗</Text>
          </Pressable>
        </View>
        {state === "REFUSED" ? (
          <View style={s.error} accessibilityLiveRegion="polite">
            <Text style={s.errorTitle}>Connection not completed</Text>
            <Text style={s.errorBody}>Nothing was signed or sent. Open your Devnet wallet and try again.</Text>
            {errorDetail ? <Text selectable style={s.errorBody}>{errorDetail}</Text> : null}
          </View>
        ) : null}
      </View>
      <View style={s.explainer}>
        <Text style={s.explainerKicker}>THE KEY, EXPLAINED</Text>
        <Text style={s.explainerTitle}>Your rules stay yours.{"\n"}Exceptions stay one-time.</Text>
        <Text style={s.explainerBody}>Make ordinary purchases within your standing Key. A Guardian can review an exact request when a boundary is reached — without silently changing the rules.</Text>
        <View style={s.ruleRow}>
          <View style={s.ruleBullet}><Text style={s.ruleBulletText}>01</Text></View>
          <View style={s.ruleCopy}><Text style={s.ruleTitle}>Within your Key</Text><Text style={s.ruleDetail}>Independent payments inside onchain limits</Text></View>
        </View>
        <View style={s.ruleRow}>
          <View style={s.ruleBullet}><Text style={s.ruleBulletText}>02</Text></View>
          <View style={s.ruleCopy}><Text style={s.ruleTitle}>Beyond a boundary</Text><Text style={s.ruleDetail}>A precise request, never blanket permission</Text></View>
        </View>
        <View style={s.ruleRow}>
          <View style={s.ruleBullet}><Text style={s.ruleBulletText}>03</Text></View>
          <View style={s.ruleCopy}><Text style={s.ruleTitle}>An explicit decision</Text><Text style={s.ruleDetail}>The actual chain result decides the outcome</Text></View>
        </View>
        <Pressable accessibilityRole="button"
          accessibilityState={{ expanded: showTechnical }}
          onPress={() => setShowTechnical(v => !v)} style={s.disclosure}>
          <Text style={s.disclosureLabel}>Build details and verification</Text>
          <Text style={s.disclosureArrow}>{showTechnical ? "−" : "+"}</Text>
        </Pressable>
        {showTechnical ? (
          <View style={s.details}>
            <ProofStrip />
            <Text style={s.explainerBody}>Devnet research build. This APK is not claimed as physically retested. Guardian Allow Once → payment → replay is not fully verified; no production custody or mainnet payment is offered.</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { backgroundColor: c.ivory, flexGrow: 1, paddingBottom: 35 },
  hero: { backgroundColor: "#15211D", paddingHorizontal: 23, paddingTop: 13, paddingBottom: 22, gap: 9, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden" },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  wordmark: { flexDirection: "row", gap: 11, alignItems: "center" },
  monogram: { height: 35, width: 35, borderColor: "#C6AB7A", borderWidth: 1.5, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  monogramText: { fontFamily: "serif", color: "#E4CCA0", fontSize: 24, lineHeight: 30 },
  brandCresco: { fontSize: 10, color: "#F5E9D5", letterSpacing: 2, fontWeight: "700" },
  brandKey: { fontSize: 10, color: "#CFB68D", letterSpacing: 4, fontWeight: "600", marginTop: 2 },
  devnet: { borderWidth: 1, borderColor: "#4F5B4D", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 99, flexDirection: "row", alignItems: "center", gap: 6 },
  devnetDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: "#E4CCA0" },
  devnetText: { color: "#DBD6C9", fontSize: 9, letterSpacing: 0.9, fontWeight: "700" },
  artStage: { height: 193, alignItems: "center", justifyContent: "center", marginTop: 0 },
  stageGlow: { position: "absolute", width: 290, height: 190, borderRadius: 145, backgroundColor: "#20312A", opacity: 0.8 },
  intro: { gap: 8, paddingBottom: 4 },
  eyebrow: { color: "#CBB78C", fontWeight: "700", fontSize: 9, letterSpacing: 1.7 },
  headline: { color: "#FAF1E2", fontFamily: "serif", letterSpacing: -1.2, fontSize: 36, lineHeight: 39 },
  lede: { color: "#C6CEC4", fontSize: 13, lineHeight: 19, maxWidth: 330 },
  actions: { gap: 10, marginTop: 10 },
  primary: { minHeight: 53, backgroundColor: "#E9D5B2", borderRadius: 99, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  primaryLabel: { fontSize: 15, fontWeight: "800", color: "#17221D", flexShrink: 1 },
  primaryArrow: { color: "#17221D", fontSize: 21 },
  secondary: { minHeight: 49, borderWidth: 1, borderColor: "#56645A", backgroundColor: "#1D2A24", borderRadius: 99, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  secondaryLabel: { color: "#F4EEE1", fontWeight: "700", fontSize: 13, flexShrink: 1 },
  secondaryArrow: { color: "#E0C59A", fontSize: 19 },
  pressed: { opacity: 0.78 }, disabled: { opacity: 0.5 },
  error: { borderRadius: 16, borderWidth: 1, borderColor: "#895951", padding: 13, marginTop: 8, gap: 5 },
  errorTitle: { color: "#FFBEB2", fontWeight: "800", fontSize: 13 },
  errorBody: { color: "#F0D9D6", fontSize: 12, lineHeight: 18 },
  explainer: { gap: 15, paddingTop: 30, paddingHorizontal: 24, paddingBottom: 20 },
  explainerKicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.6, color: c.deepBrass },
  explainerTitle: { fontFamily: "serif", fontSize: 29, lineHeight: 35, color: c.ink, letterSpacing: -1 },
  explainerBody: { fontSize: 14, lineHeight: 21, color: c.secondaryInk },
  ruleRow: { minHeight: 51, flexDirection: "row", gap: 14, alignItems: "flex-start" },
  ruleBullet: { width: 36, height: 36, backgroundColor: c.paper, borderRadius: 18, borderWidth: 1, borderColor: c.border, alignItems: "center", justifyContent: "center" },
  ruleBulletText: { color: c.deepBrass, fontSize: 11, fontWeight: "800" },
  ruleCopy: { flex: 1, gap: 3 },
  ruleTitle: { fontSize: 15, color: c.ink, fontWeight: "800" },
  ruleDetail: { color: c.secondaryInk, fontSize: 12, lineHeight: 17 },
  disclosure: { minHeight: 50, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  disclosureLabel: { fontSize: 13, color: c.secondaryInk, fontWeight: "600" },
  disclosureArrow: { fontSize: 20, color: c.secondaryInk },
  details: { gap: 12 },
});
