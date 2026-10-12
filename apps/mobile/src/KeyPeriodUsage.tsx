import { StyleSheet, Text, View } from "react-native";
import { museumColors as c } from "./design/MuseumLedgerUI";

/**
 * Only reflect numeric period spending read from the actual Key account.
 * This is an authorization-rule utilization graphic, NOT wallet balance,
 * earned trust, or verified token movement.
 */
export function KeyPeriodUsage({
  spentBaseUnits,
  maxPeriodBaseUnits,
}: {
  spentBaseUnits: bigint;
  maxPeriodBaseUnits: bigint;
}) {
  const hasLimit = maxPeriodBaseUnits > 0n;
  const rawPercent = hasLimit ? (spentBaseUnits * 100n) / maxPeriodBaseUnits : 0n;
  const percent = Number(rawPercent > 100n ? 100n : rawPercent < 0n ? 0n : rawPercent);

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.label}>Recorded use of period limit</Text>
        <Text style={styles.number}>{hasLimit ? percent + "%" : "Unknown"}</Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Recorded spending as a percentage of the Key period limit"
        accessibilityValue={hasLimit ? { min: 0, max: 100, now: percent } : { text: "Period limit unavailable" }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${percent}%` as `${number}%` }]} />
      </View>
      <Text style={styles.caption}>
        Based on actual Key rule counters. This does not show token balance
        or prove that a payment came from this device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingTop: 8 },
  labels: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  label: { fontSize: 12, fontWeight: "700", color: c.secondaryInk, flexShrink: 1 },
  number: { fontSize: 17, fontWeight: "700", color: c.deepBrass },
  track: { height: 9, backgroundColor: c.border, borderRadius: 5, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: c.verified, borderRadius: 5 },
  caption: { fontSize: 11, lineHeight: 17, color: c.secondaryInk },
});
