import { address } from "@solana/kit";
import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  MuseumButton,
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
    <ScrollView contentContainerStyle={s.container} accessibilityLabel="Read-only Devnet Key explorer">
      <View style={s.topbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to welcome" onPress={onExit} style={s.back}>
          <Text style={s.backText}>←  Back</Text>
        </Pressable>
        <Text style={s.network}>DEVNET  /  READ ONLY</Text>
      </View>

      <View style={s.hero}>
        <Text style={s.kicker}>A KEY IN THE REAL WORLD</Text>
        <Text style={s.headline}>See the rules.{"\n"}In real time.</Text>
        <Text style={s.body}>Inspect an actual developer test family's spending boundaries on Solana Devnet. No wallet, signature or payment required.</Text>
      </View>

      <View style={s.liveCard}>
        <View style={s.liveTop}>
          <Text style={s.cardKicker}>STANDING KEY</Text>
          <Text style={s.source}>ONCHAIN RULES</Text>
        </View>
        {state?.state === "READY" ? (
          <View style={s.liveContent} accessibilityLiveRegion="polite">
            <Text style={s.resultLabel}>Maximum per payment</Text>
            <Text style={s.heroNumber} selectable adjustsFontSizeToFit numberOfLines={1}>{units(state.key.maxActionAmount)}</Text>
            <View style={s.divider} />
            <View style={s.limitRow}>
              <View style={s.limitCopy}>
                <Text style={s.resultLabel}>Limit for this period</Text>
                <Text style={s.limitValue} selectable>{units(state.key.maxPeriodAmount)}</Text>
              </View>
            </View>
            <KeyPeriodUsage spentBaseUnits={state.key.spentThisPeriod} maxPeriodBaseUnits={state.key.maxPeriodAmount} />
            <Text style={s.finePrint}>Actual rule counters, not an available balance or evidence of a phone payment.</Text>
          </View>
        ) : state ? (
          <View style={s.liveContent} accessibilityLiveRegion="polite">
            <Text style={s.unavailableTitle}>The Key could not be verified.</Text>
            <Text style={s.muted} selectable>{state.state}: {state.reason}</Text>
            <Text style={s.finePrint}>No spending permission was assumed. You can retry a read-only lookup.</Text>
          </View>
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>{loading ? "Reading the current Key…" : "Your live Key snapshot"}</Text>
            <Text style={s.muted}>The real limits appear here after a successful Devnet read. We never display sample numbers as a payment balance.</Text>
          </View>
        )}
        <MuseumButton
          label={loading ? "Reading Devnet…" : state?.state === "READY" ? "Refresh live limits" : "Read live Key limits"}
          disabled={loading} onPress={queryPublishedKey}
        />
        {checkedAt ? <Text style={s.timestamp}>Last inspected: {checkedAt}</Text> : null}
      </View>

      <View style={s.principle}>
        <View style={s.principleHead}>
          <Text style={s.principleTitle}>A request is not a new limit.</Text>
          <View style={s.ruleMark} />
        </View>
        <Text style={s.muted}>When a payment crosses a rule, a Guardian can decide on that exact request. The standing Key itself remains unchanged.</Text>
        <Text style={s.finePrint}>The complete Guardian approval and payment sequence is still being verified. This screen does not grant any authority.</Text>
      </View>

      {state?.state === "READY" ? (
        <View style={s.technical}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showAddresses }}
            accessibilityLabel="Inspect complete Devnet account identifiers"
            onPress={() => setShowAddresses(v => !v)} style={s.toggle}>
            <Text style={s.toggleText}>Onchain account details</Text>
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
      <MuseumButton label="Back to connect wallet" variant="secondary" onPress={onExit} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 22, paddingTop: 13, paddingBottom: 50, backgroundColor: c.ivory, gap: 21, flexGrow: 1 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  back: { minHeight: 44, justifyContent: "center", paddingRight: 12 },
  backText: { fontSize: 15, fontWeight: "700", color: c.ink },
  network: { fontSize: 10, letterSpacing: 1, fontWeight: "700", color: c.secondaryInk },
  hero: { paddingTop: 12, gap: 12 },
  kicker: { color: c.deepBrass, fontWeight: "800", fontSize: 10, letterSpacing: 1.5 },
  headline: { fontSize: 37, fontFamily: "serif", color: c.ink, lineHeight: 44, letterSpacing: -1.3 },
  body: { color: c.secondaryInk, fontSize: 15, lineHeight: 23 },
  muted: { color: c.secondaryInk, fontSize: 13, lineHeight: 20 },
  liveCard: { padding: 18, gap: 17, borderRadius: 22, backgroundColor: c.paper, borderWidth: 1, borderColor: c.border },
  liveTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  cardKicker: { color: c.deepBrass, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  source: { color: c.secondaryInk, fontSize: 9, fontWeight: "700", letterSpacing: 0.7 },
  liveContent: { gap: 10 },
  resultLabel: { fontSize: 12, color: c.secondaryInk, fontWeight: "600" },
  heroNumber: { fontSize: 26, fontWeight: "700", letterSpacing: -0.7, color: c.ink },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 4 },
  limitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  limitCopy: { gap: 5, flex: 1 },
  limitValue: { fontSize: 18, fontWeight: "700", color: c.ink },
  finePrint: { fontSize: 11, lineHeight: 17, color: c.secondaryInk },
  empty: { minHeight: 114, justifyContent: "center", gap: 9 },
  emptyTitle: { color: c.ink, fontFamily: "serif", fontSize: 24, lineHeight: 30 },
  unavailableTitle: { color: c.vermilion, fontSize: 16, fontWeight: "700" },
  timestamp: { fontSize: 10, color: c.secondaryInk },
  principle: { paddingTop: 5, gap: 10 },
  principleHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  principleTitle: { fontSize: 22, lineHeight: 28, color: c.ink, fontFamily: "serif", flexShrink: 1 },
  ruleMark: { width: 24, height: 3, borderRadius: 3, backgroundColor: c.brass },
  technical: { borderTopWidth: 1, borderColor: c.border, gap: 13 },
  toggle: { minHeight: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  toggleText: { fontSize: 13, fontWeight: "700", color: c.ink },
  identifiers: { gap: 11, paddingBottom: 14 },
});
