import { address } from "@solana/kit";
import { useMobileWallet } from "@wallet-ui/react-native-kit";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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

// A REAL read-only inspection of the *published developer test family*.
// No wallet, keys, tx signing, artificial balance, custody or financial claim.
export function JudgeReadOnlyTour({ onExit }: { onExit: () => void }) {
  const { client } = useMobileWallet();
  const [state, setState] = useState<KeyInspection | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
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
        exhibit="JUDGE ENTRY / REAL DEVNET"
        title="Inspect the Key. No wallet required."
        subtitle="See the standing limits of the project's already-provisioned developer-controlled Devnet family. Read-only, from actual program accounts — not a simulated payment."
        compact
      />
      <MuseumPlate exhibit="01 / OBSERVE" title="Published demo family">
        <Text style={s.body}>This sample family was provisioned separately using developer-controlled wallets. It does not belong to your wallet or to our Samsung tester. No signing, wallet connection, transfer, or Guardian consent occurs here.</Text>
        <MuseumFact label="CLUSTER" value="Solana Devnet" />
        <MuseumFact label="SAMPLE BENEFICIARY" value={beneficiary || "Not configured"} />
        <MuseumFact label="SAMPLE GUARDIAN" value={guardian || "Not configured"} />
        <MuseumFact label="PROGRAM" value={process.env.EXPO_PUBLIC_CRESCO_KEY_PROGRAM_ID ?? "Not configured"} />
        <MuseumButton label={loading ? "Reading actual Devnet accounts…" : "Read live sample Key from Devnet"} disabled={loading} onPress={queryPublishedKey} />
        {state?.state === "READY" ? (
          <View style={s.evidence}>
            <Text style={s.good}>RPC VERIFIED · Live standing Key account identities and status</Text>
            <MuseumFact label="CHARTER" value={state.key.charter.toString()} />
            <MuseumFact label="MANDATE" value={state.key.mandate.toString()} />
            <MuseumFact label="ASSET RULE" value={state.key.assetRule.toString()} />
            <MuseumFact label="MANDATE NONCE" value={state.key.nonce.toString()} />
            <MuseumFact label="MAX / ACTION" value={decimals !== null ? displayTokenUnits(state.key.maxActionAmount, decimals) : state.key.maxActionAmount.toString() + " base units"} />
            <MuseumFact label="MAX / PERIOD" value={decimals !== null ? displayTokenUnits(state.key.maxPeriodAmount, decimals) : state.key.maxPeriodAmount.toString() + " base units"} />
            <MuseumFact label="USED / PERIOD" value={decimals !== null ? displayTokenUnits(state.key.spentThisPeriod, decimals) : state.key.spentThisPeriod.toString() + " base units"} />
            <Text style={s.note}>These are the sample family's onchain limits, not the connected judge's permissions, spendable vault balance, or proof of a mobile transfer.</Text>
          </View>
        ) : state ? (
          <Text style={s.note} accessibilityLiveRegion="polite">Live query: {state.state} · {state.reason}. No result is fabricated or promoted to a success.</Text>
        ) : (
          <Text style={s.note}>Tap to inspect; no chain verification is claimed before a successful read.</Text>
        )}
        {checkedAt ? <Text style={s.note}>Inspected: {checkedAt}</Text> : null}
      </MuseumPlate>
      <MuseumPlate exhibit="02 / WHY THIS MATTERS" title="An exception is not a new rule">
        <Text style={s.body}>A beneficiary spends independently within a standing Key. When a request exceeds its boundary, the intended Guardian workflow binds an exact one-time approval to the asset, recipient, amount and nonce. Mutated and repeated attempts must not inherit this approval.</Text>
        <Text style={s.note}>The full physical Guardian → allowance → payment → replay flow is NOT verified. This tour does not portray it as complete.</Text>
      </MuseumPlate>
      <MuseumPlate exhibit="03 / WHAT IS VERIFIED" title="Proof before prizes">
        <Text style={s.body}>Physical Samsung + Solflare wallet connection and message-sign response observed. A wallet-to-demo-beneficiary mismatch stopped a payment attempt safely. Cloudflare Boundary Relay deployed and passed public health and Durable Object readiness probes. No physical end-to-end G1 transaction has been proven.</Text>
        <Text style={s.note}>SKR optional Charter Atelier is source/CI work in progress. Holding Devnet SOL is not holding Mainnet SKR.</Text>
        <MuseumButton label="Back to wallet connection" variant="secondary" onPress={onExit} />
      </MuseumPlate>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { padding: 22, paddingBottom: 50, backgroundColor: c.ivory, gap: 15 },
  body: { color: c.ink, fontSize: 14, lineHeight: 21 },
  note: { color: c.secondaryInk, fontSize: 12, lineHeight: 18 },
  good: { color: c.verified, fontSize: 12, fontWeight: "700" },
  evidence: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border },
});
