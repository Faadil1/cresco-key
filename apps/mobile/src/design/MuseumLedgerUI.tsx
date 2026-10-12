import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { museumLedgerTokens as t } from "./museumLedger";

type Tone = "neutral" | "boundary" | "verified" | "pending" | "unknown" | "blocked";

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
      {showKey ? (
        <View style={[styles.artifactStage, compact && styles.artifactStageCompact]}>
          <View style={styles.artifactCaption}>
            <Text style={styles.artifactIndex}>FIG. 01</Text>
            <Text style={styles.artifactNote}>A KEY FOR MORE FREEDOM</Text>
          </View>
          <KeyArtifact small={compact} />
        </View>
      ) : null}
      <View style={styles.heroContent}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
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
    <View style={[styles.plate, tone === "boundary" && styles.plateBoundary, tone === "verified" && styles.plateVerified, (tone === "unknown" || tone === "blocked") && styles.plateUnknown]}>
      <View style={styles.plateHeader}>
        <Text style={styles.overline}>{exhibit}</Text>
        {tone !== "neutral" ? <View style={[styles.seal, tone === "boundary" && styles.sealBoundary, tone === "verified" && styles.sealVerified, (tone === "unknown" || tone === "blocked") && styles.sealUnknown]}>
          <Text style={[styles.sealText, tone === "boundary" && styles.sealTextBoundary, tone === "verified" && styles.sealTextVerified, (tone === "unknown" || tone === "blocked") && styles.sealTextUnknown]}>
            {tone === "boundary" ? "BOUNDARY" : tone === "verified" ? "VERIFIED" : tone === "pending" ? "PENDING" : tone === "unknown" ? "UNKNOWN" : tone === "blocked" ? "BLOCKED" : ""}
          </Text>
        </View> : null}
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
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        variant === "boundary" && styles.buttonBoundary,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.buttonTextSecondary, variant === "boundary" && styles.buttonTextBoundary]}>{label}</Text>
      <Text style={[styles.buttonArrow, variant === "secondary" && styles.buttonTextSecondary, variant === "boundary" && styles.buttonTextBoundary]}>↗</Text>
    </Pressable>
  );
}

export function MuseumFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} selectable>{value}</Text>
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
  hero: { paddingTop: 16, paddingBottom: 20, gap: 12 },
  heroCompact: { paddingTop: 8, paddingBottom: 12, gap: 7 },
  boundaryHero: { borderLeftWidth: 3, borderLeftColor: t.color.vermilion, paddingLeft: 13 },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroContent: { flexDirection: "column" },
  artifactStage: { minHeight: 126, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  artifactStageCompact: { minHeight: 76 },
  artifactCaption: { maxWidth: 110, gap: 5 },
  artifactIndex: { color: t.color.deepBrass, fontSize: 12, fontWeight: "700" },
  artifactNote: { color: t.color.secondaryInk, fontSize: 10, letterSpacing: 0.8, lineHeight: 15 },
  heroCopy: { flex: 1, minWidth: 0 },
  overline: { fontSize: 10, lineHeight: 15, letterSpacing: 1.5, color: t.color.deepBrass, fontWeight: "700" },
  starDot: { width: 5, height: 5, backgroundColor: t.color.brass, borderRadius: 3 },
  heroTitle: { fontFamily: "serif", fontSize: 36, lineHeight: 43, letterSpacing: -1.25, color: t.color.ink },
  heroTitleCompact: { fontSize: 32, lineHeight: 39 },
  heroSubtitle: { color: t.color.secondaryInk, fontSize: 15, lineHeight: 23, marginTop: 7, maxWidth: 350 },
  artifact: { justifyContent: "flex-start", alignItems: "center" },
  keyRingOuter: { borderWidth: 3, borderColor: t.color.deepBrass, backgroundColor: t.color.paper, alignItems: "center", justifyContent: "center" },
  keyRingInner: { borderWidth: 1, borderColor: t.color.border, justifyContent: "center", alignItems: "center", backgroundColor: t.color.paper },
  keyStar: { color: t.color.deepBrass, textAlign: "center" },
  keyMicro: { fontSize: 8, letterSpacing: 2, color: t.color.deepBrass, marginTop: -9 },
  artifactFoot: { height: 15, width: 14, backgroundColor: t.color.brass },
  artifactTooth: { height: 7, width: 27, backgroundColor: t.color.brass, marginLeft: 12 },
  plate: { paddingHorizontal: 19, paddingVertical: 20, borderWidth: 1, borderColor: t.color.border, borderRadius: 22, backgroundColor: t.color.paper, gap: 12 },
  plateBoundary: { borderColor: "#EBC9C5", backgroundColor: "#FFF8F7" },
  plateUnknown: { borderColor: t.color.border, backgroundColor: t.color.unknownWash },
  plateVerified: { borderColor: "#B9D6C1" },
  plateHeader: { flexDirection: "row", gap: 8, justifyContent: "space-between", alignItems: "center" },
  plateTitle: { fontFamily: "serif", fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: t.color.ink },
  seal: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: t.color.unknownWash },
  sealBoundary: { backgroundColor: t.color.vermilionWash },
  sealUnknown: { backgroundColor: t.color.unknownWash },
  sealVerified: { backgroundColor: t.color.verifiedWash },
  sealText: { fontSize: 9, color: t.color.deepBrass, fontWeight: "800", letterSpacing: 0.7 },
  sealTextBoundary: { color: t.color.vermilion },
  sealTextVerified: { color: t.color.verified },
  sealTextUnknown: { color: t.color.unknown },
  button: { minHeight: 56, backgroundColor: t.color.ink, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  buttonSecondary: { backgroundColor: t.color.paper, borderWidth: 1, borderColor: t.color.border },
  buttonBoundary: { backgroundColor: t.color.vermilionWash, borderWidth: 1, borderColor: "#EBC9C5" },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.995 }] },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 15, fontWeight: "700", lineHeight: 22, color: t.color.white, flexShrink: 1 },
  buttonTextSecondary: { color: t.color.ink },
  buttonTextBoundary: { color: t.color.vermilion },
  buttonArrow: { fontSize: 20, color: t.color.white },
  fact: { borderTopWidth: 1, borderColor: t.color.border, paddingTop: 11, gap: 5 },
  factLabel: { color: t.color.secondaryInk, fontWeight: "700", letterSpacing: 0.7, fontSize: 10 },
  factValue: { color: t.color.ink, fontSize: 15, lineHeight: 23 },
  proof: { borderWidth: 1, borderColor: t.color.border, borderRadius: 16, padding: 14, gap: 12, backgroundColor: t.color.paper },
  proofItems: { flexDirection: "row", justifyContent: "space-between" },
  proofItem: { flex: 1, alignItems: "center", gap: 3, paddingHorizontal: 4 },
  proofTitle: { fontSize: 12, fontWeight: "700", color: t.color.ink },
  proofSmall: { fontSize: 10, color: t.color.secondaryInk, textAlign: "center" },
  greenTick: { fontSize: 18, color: t.color.verified },
  pendingTick: { fontSize: 18, color: t.color.unknown },
});
