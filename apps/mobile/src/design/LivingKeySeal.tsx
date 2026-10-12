import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";
import { museumLedgerTokens as t } from "./museumLedger";

/**
 * CRESCO Living Boundary mark:
 * - the permanent policy ring NEVER changes diameter
 * - a separate marker represents a request/boundary, NOT spend authority
 * - static first: no loops, no animation claiming financial success
 * - decorative only; real status must be conveyed in accessible text nearby.
 */
export type KeySealMood = "standing" | "request" | "boundary" | "unknown";

export function LivingKeySeal({
  size = 44,
  mood = "standing",
}: {
  size?: number;
  mood?: KeySealMood;
}) {
  const [reduceMotion, setReduceMotion] = useState(true);
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(v => { if (mounted) setReduceMotion(v); })
      .catch(() => { if (mounted) setReduceMotion(true); });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    motion.stopAnimation();
    motion.setValue(0);
    if (reduceMotion || (mood !== "request" && mood !== "boundary")) return;
    const sequence = Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 360, useNativeDriver: true }),
    ]);
    sequence.start();
    return () => sequence.stop();
  }, [mood, reduceMotion, motion]);

  const markerColor =
    mood === "boundary" ? t.color.vermilion :
    mood === "unknown" ? t.color.unknown : t.color.brass;
  const ringSize = Math.round(size * 0.65);
  const ringOffset = Math.round(size * 0.14);
  const dotSize = Math.max(7, Math.round(size * 0.14));
  const stemWidth = Math.max(4, Math.round(size * 0.09));
  const stemLength = Math.round(size * 0.25);

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {/* Fixed outer authority ring — unchanged across visual states. */}
      <View style={[
        styles.ring,
        {
          left: ringOffset,
          top: ringOffset,
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: Math.max(2, Math.round(size * 0.055)),
        },
      ]} />
      {/* Central Key keeper. This is part of the identity, not a state badge. */}
      <View style={[
        styles.keeper,
        {
          left: ringOffset + Math.round(ringSize * 0.36),
          top: ringOffset + Math.round(ringSize * 0.36),
          width: Math.round(ringSize * 0.28),
          height: Math.round(ringSize * 0.28),
          borderRadius: 3,
        },
      ]} />
      <View style={[
        styles.stem,
        {
          left: ringOffset + ringSize - stemWidth,
          top: ringOffset + Math.round(ringSize * 0.66),
          width: stemWidth,
          height: stemLength,
        },
      ]} />
      {/* Only this separate dot changes; an exception NEVER widens the ring. */}
      <Animated.View style={[
        styles.marker,
        {
          right: 0,
          top: Math.round(size * 0.28),
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: markerColor,
          opacity: mood === "standing" ? 0.45 : 1,
          transform: [{ scale: motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) }],
        },
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderColor: t.color.deepBrass,
    backgroundColor: "transparent",
  },
  keeper: {
    position: "absolute",
    backgroundColor: t.color.brass,
    transform: [{ rotate: "45deg" }],
  },
  stem: {
    position: "absolute",
    backgroundColor: t.color.deepBrass,
    transform: [{ rotate: "-38deg" }],
    borderRadius: 3,
  },
  marker: {
    position: "absolute",
    borderWidth: 1,
    borderColor: t.color.ivory,
  },
});
