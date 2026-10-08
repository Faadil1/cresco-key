import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { museumLedgerTokens as t } from "./museumLedger";

type Tone = "neutral" | "boundary" | "verified" | "pending";

export function KeyArtifact({ small = false }: { small?: boolean }) {
  const size = small ? 70 : 132;
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={[styles.artifact, { width: size + 30, height: size + 28 }]}>
      <View style={[styles.keyRingOuter, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.keyRingInner, { width: size - 19, height: size - 19, borderRadius: size / 2 }]}>
          <Text style={[styles.keyStar, { fontSize: small ? 31 : 60 }]}>✳</Text>
          <Text style={styles.keyMicro}>C K</Text>
        </View>
      </View>
      <View style={styles.artifactFoot} />
      <View style={styles.artifactTooth} />
    </View>
  );
}

export function MuseumHero({
  exhibit,
  title,
  subtitle,
  compact = false,
  tone = "neutral",
  showKey = false,
}: {
  exhibit: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
  tone?: Tone;
  showKey?: boolean;
}) {
  return (
    <View style={[styles.hero, compact && styles.heroCompact, tone === "boundary" && styles.boundaryHero]}>
      <View style={styles.heroTop}>
        <Text style={styles.overline}>{exhibit}</Text>
        <View style={styles.starDot} />
      </View>
      <View style={styles.heroContent}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
        {showKey ? <KeyArtifact small={compact} /> : null}
      </View>
    </View>
  );
}

export function MuseumPlate({
  exhibit,
  title,
  children,
  tone = "neutral",
}: {
  exhibit: string;
  title?: string;
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <View style={[styles.plate, tone === "boundary" && styles.plateBoundary, tone === "verified" && styles.plateVerified]}>
      <View style={styles.plateHeader}>
        <Text style={styles.overline}>{exhibit}</Text>
        <View style={[styles.seal, tone === "boundary" && styles.sealBoundary, tone === "verified" && styles.sealVerified]}>
          <Text style={[styles.sealText, tone === "boundary" && styles.sealTextBoundary, tone === "verified" && styles.sealTextVerified]}>
            {tone === "boundary" ? "REFUSED" : tone === "verified" ? "VERIFIED" : tone === "pending" ? "PENDING" : "CRESCO"}
          </Text>
        </View>
      </View>
      {title ? <Text style={styles.plateTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function MuseumButton({
  label,
  onPress,
  disabled = false,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "boundary";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        variant === "boundary" && styles.buttonBoundary,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.buttonTextSecondary]}>{label}</Text>
      <Text style={[styles.buttonArrow, variant === "secondary" && styles.buttonTextSecondary]}>→</Text>
    </Pressable>
  );
}

export function MuseumFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} selectable numberOfLines={3}>{value}</Text>
    </View>
  );
}

export function ProofStrip() {
  return (
    <View style={styles.proof}>
      <Text style={styles.overline}>VERIFICATION / TRUTHFUL SCOPE</Text>
      <View style={styles.proofItems}>
        <View style={styles.proofItem}>
          <Text style={styles.greenTick}>✓</Text>
          <Text style={styles.proofTitle}>LOCAL</Text>
          <Text style={styles.proofSmall}>Emulator checks</Text>
        </View>
        <View style={styles.proofItem}>
          <Text style={styles.greenTick}>✓</Text>
          <Text style={styles.proofTitle}>DEVNET</Text>
          <Text style={styles.proofSmall}>Program deployed</Text>
        </View>
        <View style={styles.proofItem}>
          <Text style={styles.pendingTick}>◷</Text>
          <Text style={styles.proofTitle}>G1</Text>
          <Text style={styles.proofSmall}>Mobile run pending</Text>
        </View>
      </View>
    </View>
  );
}

export const museumColors = t.color;

const styles = StyleSheet.create({
  hero: { paddingTop: 23, paddingBottom: 21, gap: 14, borderBottomWidth: 1, borderBottomColor: t.color.border },
  heroCompact: { paddingTop: 10, paddingBottom: 12, gap: 8 },
  boundaryHero: { borderBottomColor: t.color.vermilion },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroCopy: { flex: 1, minWidth: 0 },
  overline: { fontSize: 10, lineHeight: 15, letterSpacing: 1.85, color: t.color.deepBrass, fontWeight: "700" },
  starDot: { height: 8, width: 8, backgroundColor: t.color.brass, transform: [{ rotate: "45deg" }] },
  heroTitle: { fontFamily: "serif", fontSize: 39, lineHeight: 44, color: t.color.ink, letterSpacing: -1 },
  heroTitleCompact: { fontSize: 30, lineHeight: 35 },
  heroSubtitle: { color: t.color.secondaryInk, fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 340 },
  artifact: { justifyContent: "flex-start", alignItems: "center", marginLeft: 5 },
  keyRingOuter: { borderWidth: 5, borderColor: t.color.deepBrass, backgroundColor: t.color.brass, alignItems: "center", justifyContent: "center", elevation: 4 },
  keyRingInner: { borderWidth: 1, borderColor: "#F7E7C6", justifyContent: "center", alignItems: "center", backgroundColor: "#B9955B" },
  keyStar: { color: t.color.ink, lineHeight: 69, textAlign: "center" },
  keyMicro: { fontSize: 8, letterSpacing: 2.3, color: t.color.ink, marginTop: -13 },
  artifactFoot: { height: 15, width: 17, backgroundColor: t.color.brass, borderLeftWidth: 2, borderRightWidth: 2, borderColor: t.color.deepBrass },
  artifactTooth: { height: 8, width: 32, backgroundColor: t.color.brass, borderWidth: 2, borderColor: t.color.deepBrass, marginLeft: 15 },
  plate: { padding: 18, borderWidth: 1, borderColor: t.color.border, borderRadius: 13, backgroundColor: t.color.paper, gap: 12 },
  plateBoundary: { borderColor: t.color.vermilion, backgroundColor: "#FCF6F2" },
  plateVerified: { borderColor: t.color.verified },
  plateHeader: { flexDirection: "row", gap: 8, justifyContent: "space-between", alignItems: "center" },
  plateTitle: { fontFamily: "serif", fontSize: 27, lineHeight: 32, color: t.color.ink },
  seal: { borderWidth: 1, borderColor: t.color.brass, paddingHorizontal: 8, paddingVertical: 4 },
  sealBoundary: { borderColor: t.color.vermilion },
  sealVerified: { borderColor: t.color.verified },
  sealText: { fontSize: 9, color: t.color.deepBrass, fontWeight: "700", letterSpacing: 1 },
  sealTextBoundary: { color: t.color.vermilion },
  sealTextVerified: { color: t.color.verified },
  button: { minHeight: 54, backgroundColor: t.color.brass, borderRadius: 12, paddingHorizontal: 19, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderWidth: 1, borderColor: t.color.deepBrass },
  buttonSecondary: { backgroundColor: "transparent", borderColor: t.color.brass },
  buttonBoundary: { backgroundColor: t.color.vermilion, borderColor: t.color.vermilion },
  buttonDisabled: { opacity: 0.44 },
  buttonText: { fontFamily: "serif", fontSize: 19, lineHeight: 24, color: t.color.ink, flexShrink: 1 },
  buttonTextSecondary: { color: t.color.ink },
  buttonArrow: { fontSize: 23, color: t.color.ink },
  fact: { borderTopWidth: 1, borderColor: t.color.border, paddingTop: 8, gap: 3 },
  factLabel: { color: t.color.deepBrass, fontWeight: "700", letterSpacing: 1.3, fontSize: 10 },
  factValue: { color: t.color.ink, fontSize: 15, lineHeight: 21 },
  proof: { borderWidth: 1, borderColor: t.color.border, borderRadius: 14, padding: 14, gap: 12, backgroundColor: t.color.paper },
  proofItems: { flexDirection: "row", justifyContent: "space-between" },
  proofItem: { flex: 1, alignItems: "center", gap: 3, paddingHorizontal: 4 },
  proofTitle: { fontSize: 12, fontWeight: "700", color: t.color.ink, letterSpacing: 1 },
  proofSmall: { fontSize: 10, color: t.color.secondaryInk, textAlign: "center" },
  greenTick: { fontSize: 18, color: t.color.verified },
  pendingTick: { fontSize: 18, color: t.color.deepBrass },
});
