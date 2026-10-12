import { StyleSheet, Text, View } from "react-native";

/**
 * The CRESCO signature is a fixed architectural boundary, not a wallet,
 * approval, progress meter or payment receipt.
 *
 * Only the detached dot can change color for a *source-backed* request state.
 * No animated halo, no fake balance, no external image dependency.
 */
export type PortalMood = "standing" | "request" | "boundary" | "unknown";

export function KeyPortal({
  size = 206,
  mood = "standing",
  light = false,
}: {
  size?: number;
  mood?: PortalMood;
  light?: boolean;
}) {
  const diameter = Math.round(size * 0.71);
  const thickness = Math.max(10, Math.round(size * 0.09));
  const left = Math.round((size - diameter) / 2);
  const top = Math.round(size * 0.105);
  const dot = Math.max(10, Math.round(size * 0.075));
  const halo = Math.round(size * 0.96);
  const markerColor = mood === "boundary" ? "#F2A49B" :
    mood === "unknown" ? "#9FA8A1" : "#E1C38F";

  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, alignSelf: "center", flexShrink: 0 }}>
      <View style={[styles.halo, {
        left: (size - halo) / 2, top: 0,
        width: halo, height: halo, borderRadius: halo / 2,
        backgroundColor: light ? "#EDE8DA" : "#29362F",
      }]} />
      <View style={[styles.orbit, {
        left: Math.round(size * 0.08), top: Math.round(size * 0.04),
        width: Math.round(size * 0.84), height: Math.round(size * 0.84),
        borderRadius: Math.round(size * 0.42),
        borderColor: light ? "#D8C8A8" : "#716750",
      }]} />
      <View style={[styles.shadowRing, {
        left: left + 3, top: top + 8, width: diameter, height: diameter,
        borderRadius: diameter / 2, borderWidth: thickness + 4,
        borderColor: light ? "#D1C4A7" : "#463D2D",
      }]} />
      <View style={[styles.authorityRing, {
        left, top, width: diameter, height: diameter,
        borderRadius: diameter / 2, borderWidth: thickness,
        borderColor: light ? "#A58E66" : "#E3CAA0",
      }]} />
      <View style={[styles.highlight, {
        left: left + thickness / 2, top: top + thickness / 2,
        width: diameter - thickness, height: diameter - thickness,
        borderRadius: (diameter - thickness) / 2,
        borderWidth: Math.max(1, Math.round(size * 0.008)),
        borderColor: light ? "#F8F5EF" : "#FFF1D3",
      }]} />
      <View style={[styles.core, {
        left: size / 2 - Math.max(8, size * 0.045),
        top: top + diameter / 2 - Math.max(8, size * 0.045),
        width: Math.max(16, size * 0.09), height: Math.max(16, size * 0.09),
        borderRadius: 5,
        backgroundColor: light ? "#9D8661" : "#E3CAA0",
      }]} />
      <View style={[styles.marker, {
        left: Math.round(size * 0.79), top: Math.round(size * 0.40),
        width: dot, height: dot, borderRadius: dot / 2,
        backgroundColor: markerColor, borderColor: light ? "#F5F2EB" : "#18231E",
      }]} />
      <View style={[styles.horizon, {
        left: Math.round(size * 0.19), width: Math.round(size * 0.62),
        top: Math.round(size * 0.89),
        backgroundColor: light ? "#D7CEBD" : "#736D5B",
      }]} />
      <Text style={[styles.micro, { top: Math.round(size * 0.91), color: light ? "#91846B" : "#AFA083" }]}>C R E S C O</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: "absolute", opacity: 0.64 },
  orbit: { position: "absolute", borderWidth: 1, opacity: 0.5 },
  shadowRing: { position: "absolute", opacity: 0.55 },
  authorityRing: { position: "absolute" },
  highlight: { position: "absolute", opacity: 0.72 },
  core: { position: "absolute", transform: [{ rotate: "45deg" }] },
  marker: { position: "absolute", borderWidth: 2 },
  horizon: { position: "absolute", height: 1, opacity: 0.75 },
  micro: { position: "absolute", alignSelf: "center", fontSize: 8, letterSpacing: 2.3, fontWeight: "600" },
});
