/**
 * CRESCO Key — Museum Ledger visual foundation.
 * Design tokens only: no payment, relay, wallet or evidence semantics.
 * Consumer-facing status MUST come from observed runtime state.
 */
export const museumLedgerTokens = {
  color: {
    ivory: "#F7F4ED",
    paper: "#FFFCF7",
    ink: "#19251F",
    secondaryInk: "#626A60",
    brass: "#D5B885",
    deepBrass: "#72613F",
    border: "#E5DFD3",
    vermilion: "#A13F39",
    vermilionWash: "#F9EDEA",
    verified: "#276548",
    verifiedWash: "#E9F4EA",
    unknown: "#65726B",
    unknownWash: "#EEEAE2",
    white: "#FFFCF7",
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
    card: 22,
    button: 17,
    pill: 99,
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
