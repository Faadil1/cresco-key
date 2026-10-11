import { useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { MuseumButton, MuseumFact, MuseumPlate, museumColors as c } from "../design/MuseumLedgerUI";

// Official SKR mint on Solana mainnet, verified against solanamobile.com/skr.
// This is a voluntary READ-ONLY cross-cluster check; the CRESCO payment program remains Devnet.
const SKR_MINT = "SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3";
const MAINNET_RPC = "https://api.mainnet-beta.solana.com";

type BalanceState = "IDLE" | "LOADING" | "HAS_SKR" | "NO_SKR" | "UNKNOWN";
type PracticeTopic = "independence" | "exception" | "review";

const TOPICS: Record<PracticeTopic, { title: string; prompt: string }> = {
  independence: {
    title: "Give room, not unlimited permission",
    prompt: "Which everyday purchase should someone in your family be able to make independently, and what should the exact limit be?",
  },
  exception: {
    title: "One exception is not a new rule",
    prompt: "When a request crosses the limit, what information should a guardian review before allowing this exact action once?",
  },
  review: {
    title: "Trust improves with reflection",
    prompt: "After a purchase, what can your family learn from the decision without turning trust into surveillance?",
  },
};

export function SkrCharterAtelier({ walletAddress }: { walletAddress: string }) {
  const [state, setState] = useState<BalanceState>("IDLE");
  const [balance, setBalance] = useState<string | null>(null);
  const [topic, setTopic] = useState<PracticeTopic>("independence");
  const [message, setMessage] = useState("Optional Seeker ecosystem access. Never spending authority.");

  useEffect(() => {
    setState("IDLE");
    setBalance(null);
    setMessage("Optional Seeker ecosystem access. Never spending authority.");
  }, [walletAddress]);

  const checkSkr = async () => {
    setState("LOADING");
    setMessage("Checking public mainnet token accounts. Nothing is signed or transferred.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(MAINNET_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [walletAddress, { mint: SKR_MINT }, { encoding: "jsonParsed", commitment: "confirmed" }],
        }),
      });
      if (!response.ok) throw new Error("RPC_UNAVAILABLE");
      const body = (await response.json()) as {
        result?: { value?: Array<{ account?: { data?: { parsed?: { info?: { tokenAmount?: { amount?: string } } } } } }> };
        error?: { message?: string };
      };
      if (body.error || !body.result || !Array.isArray(body.result.value)) throw new Error("INVALID_RPC_RESPONSE");
      const total = body.result.value.reduce((sum, item) => {
        const raw = item.account?.data?.parsed?.info?.tokenAmount?.amount;
        if (typeof raw !== "string" || !/^\d+$/.test(raw)) throw new Error("INVALID_TOKEN_ACCOUNT");
        return sum + BigInt(raw);
      }, 0n);
      // Only token presence is checked. No token amount is displayed or treated as spending authority.
      setBalance(total.toString());
      setState(total > 0n ? "HAS_SKR" : "NO_SKR");
      setMessage(total > 0n
        ? "SKR detected on mainnet. Family Charter Atelier is available."
        : "No SKR found for this public wallet on mainnet. CRESCO spending permissions are unchanged.");
    } catch (error) {
      setState("UNKNOWN");
      setBalance(null);
      setMessage(error instanceof Error && error.name === "AbortError"
        ? "Mainnet check timed out. No access decision was made."
        : "Could not verify SKR on mainnet. This does not affect your Key.");
    } finally {
      clearTimeout(timeout);
    }
  };

  return (
    <MuseumPlate exhibit="OPTIONAL / SOLANA MOBILE" title="The Charter Atelier">
      <Text style={s.paragraph}>
        SKR is an ecosystem participation key for optional family discussion prompts, never for moving money or widening CRESCO rules.
      </Text>
      <MuseumFact label="SKR / NETWORK" value="Solana mainnet · read-only public account check" />
      {state === "IDLE" || state === "UNKNOWN" || state === "NO_SKR" ? (
        <MuseumButton label={state === "IDLE" ? "Check SKR participation" : "Check again"} onPress={checkSkr} variant="secondary" />
      ) : null}
      {state === "LOADING" ? <Text style={s.paragraph}>Checking public SKR token accounts…</Text> : null}
      <Text style={s.message} accessibilityLiveRegion="polite">{message}</Text>
      {state === "HAS_SKR" ? (
        <View style={s.prompts}>
          <Text style={s.kicker}>ACCESS / VERIFIED ACCOUNT TOKEN PRESENCE</Text>
          <View style={s.topicRow}>
            {(Object.keys(TOPICS) as PracticeTopic[]).map((key) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: topic === key }}
                key={key}
                onPress={() => setTopic(key)}
                style={[s.topic, topic === key && s.topicSelected]}
              >
                <Text style={s.topicText}>{key === "independence" ? "01" : key === "exception" ? "02" : "03"}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.promptTitle}>{TOPICS[topic].title}</Text>
          <Text style={s.paragraph}>{TOPICS[topic].prompt}</Text>
          <MuseumButton
            label="Share family discussion prompt"
            onPress={() => { void Share.share({ message: `CRESCO Key — Family Charter Atelier\n\n${TOPICS[topic].title}\n${TOPICS[topic].prompt}\n\nThis discussion is not a payment authorization.` }); }}
            variant="secondary"
          />
          <Text style={s.message}>Read-only SKR access; no claims, transfers, staking or reward payments.</Text>
        </View>
      ) : null}
      {state === "NO_SKR" ? <Text style={s.message}>The core Key, guardian decisions and receipts remain free and fully independent of SKR ownership.</Text> : null}
      <Text style={s.footnote}>Optional bonus-prize candidate; eligibility and real-device use are not yet proven. SKR presence is not an identity or parental-consent check.</Text>
    </MuseumPlate>
  );
}

const s = StyleSheet.create({
  paragraph: { color: c.ink, fontSize: 14, lineHeight: 21 },
  message: { fontSize: 12, lineHeight: 18, color: c.secondaryInk },
  footnote: { fontSize: 11, lineHeight: 16, color: c.secondaryInk },
  kicker: { color: c.deepBrass, fontSize: 10, fontWeight: "700", letterSpacing: 1.4 },
  prompts: { gap: 12, paddingTop: 12, borderTopWidth: 1, borderColor: c.border },
  topicRow: { flexDirection: "row", gap: 9 },
  topic: { borderWidth: 1, borderColor: c.border, minHeight: 44, minWidth: 55, justifyContent: "center", alignItems: "center" },
  topicSelected: { borderColor: c.deepBrass, backgroundColor: "#E8D9BC" },
  topicText: { color: c.ink, fontWeight: "700" },
  promptTitle: { fontFamily: "serif", color: c.ink, fontSize: 22, lineHeight: 27 },
});
