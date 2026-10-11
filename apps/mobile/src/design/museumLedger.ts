/**
 * CRESCO Key — Museum Ledger visual foundation.
 * Design tokens only: no payment, relay, wallet or evidence semantics.
 * Consumer-facing status MUST come from observed runtime state.
 */
export const museumLedgerTokens = {
  color: {
    ivory: "#F5F0E6",
    paper: "#FBF8F1",
    ink: "#181813",
    secondaryInk: "#5B5750",
    brass: "#B28B49",
    deepBrass: "#80632F",
    border: "#D4C8B4",
    vermilion: "#AD422C",
    vermilionWash: "#F7E5DF",
    verified: "#42664D",
    verifiedWash: "#E7F0E8",
    unknown: "#6C675E",
    unknownWash: "#E9E5DC",
    white: "#FFFFFF",
  },
  space: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    small: 8,
    card: 14,
    button: 12,
    pill: 24,
  },
  type: {
    eyebrow: { fontSize: 11, lineHeight: 16, letterSpacing: 2.1 },
    micro: { fontSize: 12, lineHeight: 17 },
    body: { fontSize: 15, lineHeight: 23 },
    action: { fontSize: 16, lineHeight: 22 },
    headline: { fontSize: 35, lineHeight: 39 },
    feature: { fontSize: 26, lineHeight: 31 },
  },
  minimumTouchTarget: 44,
  motion: {
    stateTransitionMs: 220,
    reducedMotionTransitionMs: 0,
  },
} as const;

export type MuseumLedgerTokens = typeof museumLedgerTokens;
