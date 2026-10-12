import { address } from "@solana/kit";
import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  MuseumHero,
  MuseumPlate,
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

  return (
    <ScrollView contentContainerStyle={s.container}>
      <MuseumHero
        exhibit="READ-ONLY / SOLANA DEVNET"
        title="See what a Key allows."
        subtitle="Explore a sample family's real spending limits without connecting a wallet. No payment or approval happens here."
        compact
      />
      <MuseumPlate exhibit="01 / LIVE LIMITS" title="How much freedom does this Key give?">
        <Text style={s.body}>These numbers belong to a separately provisioned developer test family, not to your wallet. They are read from Devnet, never invented by the app.</Text>
        <MuseumButton label={loading ? "Checking real Devnet accounts…" : "Check sample Key limits"} disabled={loading} onPress={queryPublishedKey} />
        {state?.state === "READY" ? (
          <View style={s.evidence}>
            <Text style={s.good} accessibilityLiveRegion="polite">Devnet accounts read successfully</Text>
            <MuseumFact label="MAXIMUM PER PURCHASE" value={decimals !== null ? displayTokenUnits(state.key.maxActionAmount, decimals) + " test token units" : state.key.maxActionAmount.toString() + " base units"} />
            <MuseumFact label="MAXIMUM PER PERIOD" value={decimals !== null ? displayTokenUnits(state.key.maxPeriodAmount, decimals) + " test token units" : state.key.maxPeriodAmount.toString() + " base units"} />
            <MuseumFact label="RECORDED AS SPENT" value={decimals !== null ? displayTokenUnits(state.key.spentThisPeriod, decimals) + " test token units" : state.key.spentThisPeriod.toString() + " base units"} />
            <KeyPeriodUsage spentBaseUnits={state.key.spentThisPeriod} maxPeriodBaseUnits={state.key.maxPeriodAmount} />
            <Text style={s.note}>These are authorization limits, not a spendable balance and not evidence of a mobile payment.</Text>
            <Pressable accessibilityRole="button"
              accessibilityState={{ expanded: showAddresses }}
              onPress={() => setShowAddresses(v => !v)} style={s.detailToggle}>
              <Text style={s.detailText}>Inspect onchain account identifiers</Text>
              <Text style={s.detailText}>{showAddresses ? "−" : "+"}</Text>
            </Pressable>
            {showAddresses ? (
              <View style={s.details}>
                <MuseumFact label="CHARTER" value={state.key.charter.toString()} />
                <MuseumFact label="MANDATE" value={state.key.mandate.toString()} />
                <MuseumFact label="ASSET RULE" value={state.key.assetRule.toString()} />
                <MuseumFact label="MANDATE NONCE" value={state.key.nonce.toString()} />
                <MuseumFact label="GUARDIAN" value={guardian} />
                <MuseumFact label="BENEFICIARY" value={beneficiary} />
              </View>
            ) : null}
          </View>
        ) : state ? (
          <Text style={s.note} accessibilityLiveRegion="polite">We couldn't verify the sample Key right now ({state.state}: {state.reason}). No spending permission was assumed. You can retry.</Text>
        ) : (
          <Text style={s.note}>Tap to inspect; no chain verification is claimed before a successful read.</Text>
        )}
        {checkedAt ? <Text style={s.note}>Inspected: {checkedAt}</Text> : null}
      </MuseumPlate>
      <MuseumPlate exhibit="02 / WHY IT MATTERS" title="One exception is not a new rule">
        <Text style={s.body}>A young person should be free to make ordinary purchases within clear limits. For a purchase outside them, a Guardian should be able to decide on that exact request instead of permanently raising the limit.</Text>
        <Text style={s.note}>The complete mobile Guardian payment and replay sequence is still being validated. This read-only tour does not grant an exception.</Text>
      </MuseumPlate>
      <MuseumButton label="Connect your own wallet" variant="secondary" onPress={onExit} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { padding: 22, paddingBottom: 50, backgroundColor: c.ivory, gap: 15 },
  body: { color: c.ink, fontSize: 14, lineHeight: 21 },
  note: { color: c.secondaryInk, fontSize: 12, lineHeight: 18 },
  good: { color: c.verified, fontSize: 12, fontWeight: "700" },
  evidence: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border },
  detailToggle: { minHeight: 46, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 9, paddingVertical: 12 },
  detailText: { fontSize: 13, fontWeight: "700", color: c.deepBrass },
  details: { gap: 8 },
});
