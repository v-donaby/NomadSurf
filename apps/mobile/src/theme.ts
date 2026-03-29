import { Platform } from "react-native";

/** Shared palette — deep base, teal accent, warm CTA */
export const colors = {
  bg: "#060a0e",
  bgScreen: "#080d12",
  surface: "rgba(255,255,255,0.055)",
  surfaceHover: "rgba(255,255,255,0.09)",
  surfaceStrong: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.08)",
  borderFocus: "rgba(45,212,191,0.45)",
  text: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  textSubtle: "#64748b",
  accent: "#2dd4bf",
  accentSoft: "rgba(45,212,191,0.16)",
  accentTextOn: "#042f2e",
  kicker: "#5eead4",
  cta: "#fbbf24",
  ctaText: "#0c0a09",
  overlay: "rgba(0,0,0,0.65)",
  mapBorder: "rgba(255,255,255,0.12)",
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 9999,
};

export const shadowCard =
  Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
    },
    default: { elevation: 8 },
  }) ?? {};

export const shadowCta =
  Platform.select({
    ios: {
      shadowColor: "#fbbf24",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
    },
    default: { elevation: 6 },
  }) ?? {};
