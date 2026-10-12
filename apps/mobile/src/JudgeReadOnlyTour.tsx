import { address } from "@solana/kit";
import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  MuseumFact,
  museumColors as c,
} from "./design/MuseumLedgerUI";
import {
  inspectStandingKey,
  displayTokenUnits,
  type KeyInspection,
  type StandingKeyRpc,
} from "./solana/standingKey";
import { paymentProgramConfigFromEnv } from "./solana/programClient";
import { parseSolanaPayTransferRequest } from "./payment/solanaPay";
import { KeyPeriodUsage } from "./KeyPeriodUsage";
import { KeyPortal } from "./design/KeyPortal";

// A REAL read-only inspection of the *published developer test family*.
// No wallet, keys, tx signing, artificial balance, custody or financial claim.
export function JudgeReadOnlyTour({ onExit }: { onExit: () => void }) {
  const { client } = useMobileWallet();
  const [state, setState] = useState<KeyInspection | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const beneficiary = process.env.EXPO_PUBLIC_DEMO_BENEFICIARY_WALLET?.trim() ?? "";
  const guardian = process.env.EXPO_PUBLIC_DEMO_GUARDIAN_WALLET?.trim() ?? "";
  const mint = process.env.EXPO_PUBLIC_DEMO_SOLANA_PAY_IN_BOUNDS_5?.trim() ?? "";
  // Mint comes from the committed, public demo Solana Pay URL; no recipient
  // in that URL is used as an authority or to submit a payment.
  const queryPublishedKey = async () => {
    if (loading) return;
    setLoading(true);
    setState(null);
    setDecimals(null);
    setCheckedAt(null);
    try {
      if (!mint) throw new Error("PUBLISHED_DEMO_PAYMENT_INTENT_MISSING");
      const rawMint = parseSolanaPayTransferRequest(mint).mint;
      if (!beneficiary || !guardian) throw new Error("PUBLIC_DEMO_FAMILY_NOT_CONFIGURED");
      const config = paymentProgramConfigFromEnv();
      const rpc: StandingKeyRpc = {
        getAccountInfo: (key, options) => ({
          send: async () => {
            const response = await client.rpc.getAccountInfo(key, options).send();
            return {
              value: response.value
                ? { owner: response.value.owner, data: response.value.data as readonly [string, string] }
                : null,
            };
          },
        }),
      };
      const result = await inspectStandingKey(rpc, {
        chain: "solana:devnet",
        config,
        beneficiaryWallet: beneficiary,
        guardianWallet: guardian,
        mint: rawMint,
      });
      setState(result);
      if (result.state === "READY") {
        const supply = await client.rpc.getTokenSupply(address(rawMint)).send();
        const nextDecimals = supply.value.decimals;
        if (Number.isInteger(nextDecimals) && nextDecimals >= 0 && nextDecimals <= 18) {
          setDecimals(nextDecimals);
        }
      }
      setCheckedAt(new Date().toISOString());
    } catch (error) {
      setState({
        state: "UNKNOWN",
        reason: error instanceof Error ? error.message : "READ_ONLY_CHAIN_QUERY_FAILED",
      });
      setCheckedAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  const units = (value: bigint): string =>
    decimals === null ? value.toString() + " base units" : displayTokenUnits(value, decimals) + " test token units";

  return (
    <ScrollView contentContainerStyle={s.screen}
      accessibilityLabel="Read-only Devnet Key explorer">
      <View style={s.darkHeader}>
        <View style={s.topline}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to welcome" onPress={onExit} style={s.back}>
            <Text style={s.backText}>←  Back</Text>
          </Pressable>
          <Text style={s.topright}>DEVNET / READ ONLY</Text>
        </View>
        <View style={s.portalRow}>
          <View style={s.titleArea}>
            <Text style={s.eyebrow}>EXPLORE THE KEY</Text>
            <Text style={s.heroTitle}>See what{"\n"}freedom looks like.</Text>
            <Text style={s.heroCopy}>Real onchain limits. No connected wallet or signature.</Text>
          </View>
          <KeyPortal size={148} mood="standing" />
        </View>
      </View>

      <View style={s.body}>
        <View style={s.keyCard}>
          <View style={s.keyCardTop}>
            <View><Text style={s.overline}>STANDING KEY / LIVE READ</Text>
              <Text style={s.keyTitle}>Your Key, clearly.</Text></View>
            <View style={s.rpcLabel}><Text style={s.rpcText}>{state?.state === "READY" ? "READ COMPLETE" : loading ? "READING" : "NOT VERIFIED"}</Text></View>
          </View>

          {state?.state === "READY" ? (
            <View style={s.realLimits} accessibilityLiveRegion="polite">
              <Text style={s.fieldLabel}>MAXIMUM PER PAYMENT</Text>
              <Text style={s.largeAmount} selectable>{units(state.key.maxActionAmount)}</Text>
              <View style={s.divider}/>
              <Text style={s.fieldLabel}>LIMIT PER PERIOD</Text>
              <Text style={s.mediumAmount} selectable>{units(state.key.maxPeriodAmount)}</Text>
              <KeyPeriodUsage spentBaseUnits={state.key.spentThisPeriod} maxPeriodBaseUnits={state.key.maxPeriodAmount} />
              <Text style={s.truth}>Read from the configured developer family's actual Devnet rule accounts. Not a token balance or payment receipt.</Text>
            </View>
          ) : state ? (
            <View style={s.emptyArea} accessibilityLiveRegion="polite">
              <Text style={s.emptyTitle}>We can't verify this Key yet.</Text>
              <Text style={s.muted} selectable>{state.state}: {state.reason}</Text>
              <Text style={s.truth}>UNKNOWN is not an approval. No limits have been invented.</Text>
            </View>
          ) : (
            <View style={s.emptyArea}>
              <Text style={s.emptyTitle}>{loading ? "Reading current limits…" : "Ready to inspect the real Key"}</Text>
              <Text style={s.muted}>Read the standing rules of a configured test family directly from Solana Devnet.</Text>
            </View>
          )}

          <Pressable accessibilityRole="button"
            accessibilityLabel={loading ? "Reading Devnet" : "Read live Key limits"}
            accessibilityState={{ disabled: loading }} disabled={loading}
            onPress={queryPublishedKey} style={({ pressed }) => [s.readButton, pressed && s.pressed, loading && s.disabled]}>
            <Text style={s.readButtonText}>{loading ? "Reading Devnet…" : state?.state === "READY" ? "Refresh live Key" : "Read live Key limits"}</Text>
            <Text style={s.readArrow}>↗</Text>
          </Pressable>
          {checkedAt ? <Text style={s.timestamp}>Last inspected: {checkedAt}</Text> : null}
        </View>

        <View style={s.principle}>
          <Text style={s.principleEyebrow}>WHY IT MATTERS</Text>
          <Text style={s.principleTitle}>One exception.{"\n"}Never a new rule.</Text>
          <Text style={s.muted}>A Guardian can make a precise decision on a payment that reaches a boundary. The standing Key does not expand.</Text>
          <Text style={s.truth}>This read-only experience cannot sign, authorize or send payments. Guardian Allow Once is not yet fully verified.</Text>
        </View>

        {state?.state === "READY" ? (
          <View style={s.technical}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: showAddresses }}
              accessibilityLabel="Inspect complete Devnet account identifiers"
              onPress={() => setShowAddresses(v => !v)} style={s.toggle}>
              <Text style={s.toggleText}>Technical account identifiers</Text>
              <Text style={s.toggleText}>{showAddresses ? "−" : "+"}</Text>
            </Pressable>
            {showAddresses ? (
              <View style={s.identifiers}>
                <MuseumFact label="CHARTER" value={state.key.charter.toString()} />
                <MuseumFact label="MANDATE" value={state.key.mandate.toString()} />
                <MuseumFact label="ASSET RULE" value={state.key.assetRule.toString()} />
                <MuseumFact label="MANDATE NONCE" value={state.key.nonce.toString()} />
                <MuseumFact label="GUARDIAN" value={guardian} />
                <MuseumFact label="BENEFICIARY" value={beneficiary} />
              </View>
            ) : null}
          </View>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Back to connect wallet" onPress={onExit}
          style={({ pressed }) => [s.returnButton, pressed && s.pressed]}>
          <Text style={s.returnText}>Back to connect wallet</Text><Text style={s.returnText}>↗</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { backgroundColor: c.ivory, paddingBottom: 25, flexGrow: 1 },
  darkHeader: { backgroundColor: "#15211D", paddingHorizontal: 21, paddingTop: 12, paddingBottom: 17, borderBottomLeftRadius: 27, borderBottomRightRadius: 27 },
  topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  back: { minHeight: 45, justifyContent: "center", paddingRight: 14 },
  backText: { fontSize: 14, color: "#EEE4D5", fontWeight: "800" },
  topright: { color: "#D1BA92", fontSize: 9, letterSpacing: 1, fontWeight: "700" },
  portalRow: { flexDirection: "row", alignItems: "center", minHeight: 173 },
  titleArea: { flex: 1, gap: 8 },
  eyebrow: { color: "#D6BC8B", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  heroTitle: { color: "#FCF5E7", fontFamily: "serif", fontSize: 27, lineHeight: 32, letterSpacing: -0.7 },
  heroCopy: { color: "#CBD1C7", fontSize: 12, lineHeight: 18 },
  body: { padding: 19, gap: 22 },
  keyCard: { backgroundColor: c.paper, borderWidth: 1, borderColor: c.border, padding: 21, borderRadius: 23, gap: 19 },
  keyCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  overline: { color: c.deepBrass, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  keyTitle: { fontFamily: "serif", color: c.ink, fontSize: 27, marginTop: 8 },
  rpcLabel: { backgroundColor: "#EBECE6", borderRadius: 99, paddingVertical: 7, paddingHorizontal: 8, maxWidth: 99 },
  rpcText: { color: c.secondaryInk, fontSize: 9, fontWeight: "700", textAlign: "center" },
  realLimits: { gap: 10 },
  fieldLabel: { color: c.secondaryInk, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  largeAmount: { color: c.ink, fontSize: 29, fontWeight: "800", lineHeight: 37 },
  mediumAmount: { color: c.ink, fontSize: 19, fontWeight: "800" },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 6 },
  truth: { fontSize: 11, lineHeight: 17, color: c.secondaryInk },
  emptyArea: { minHeight: 105, gap: 10, justifyContent: "center" },
  emptyTitle: { color: c.ink, fontSize: 17, fontWeight: "700" },
  muted: { color: c.secondaryInk, fontSize: 13, lineHeight: 20 },
  readButton: { minHeight: 54, backgroundColor: c.ink, borderRadius: 16, paddingHorizontal: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  readButtonText: { color: c.white, fontSize: 15, fontWeight: "800" },
  readArrow: { color: c.white, fontSize: 20 },
  pressed: { opacity: 0.8 }, disabled: { opacity: 0.44 },
  timestamp: { color: c.secondaryInk, fontSize: 11 },
  principle: { gap: 13, paddingHorizontal: 5 },
  principleEyebrow: { color: c.deepBrass, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  principleTitle: { fontSize: 32, lineHeight: 38, fontFamily: "serif", color: c.ink, letterSpacing: -0.7 },
  technical: { gap: 10, borderTopWidth: 1, borderColor: c.border },
  toggle: { minHeight: 54, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  toggleText: { color: c.ink, fontSize: 13, fontWeight: "700" },
  identifiers: { gap: 12 },
  returnButton: { backgroundColor: c.paper, minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  returnText: { fontSize: 14, fontWeight: "700", color: c.ink },
});
