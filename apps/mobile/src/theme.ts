import { Platform } from "react-native";

/** Coastal glass — deep navy base, soft glass surfaces, sky-to-sand accents */
export const colors = {
  bg: "#071525",
  bgScreen: "#0a192f",
  bgElevated: "#0f2137",
  surface: "rgba(148, 163, 184, 0.1)",
  surfaceHover: "rgba(148, 163, 184, 0.16)",
  surfaceStrong: "rgba(148, 163, 184, 0.14)",
  surfaceInner: "rgba(7, 21, 37, 0.55)",
  statInset: "rgba(2, 12, 27, 0.55)",
  border: "rgba(255, 255, 255, 0.12)",
  borderGlass: "rgba(255, 255, 255, 0.18)",
  borderFocus: "rgba(125, 211, 252, 0.45)",
  text: "#ffffff",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  textSubtle: "#64748b",
  accent: "#7dd3fc",
  accentSoft: "rgba(125, 211, 252, 0.14)",
  accentTextOn: "#0a192f",
  kicker: "#94a3b8",
  badgeSurf: "rgba(74, 222, 128, 0.22)",
  badgeSurfText: "#bbf7d0",
  chipOn: "rgba(125, 211, 252, 0.2)",
  chipOnBorder: "rgba(125, 211, 252, 0.35)",
  cta: "#7dd3fc",
  ctaText: "#0a192f",
  overlay: "rgba(2, 12, 27, 0.72)",
  mapBorder: "rgba(255, 255, 255, 0.14)",
};

/** Horizontal gradient: sky blue → warm sand (progress bars, primary CTA) */
export const gradientCoastal = ["#38bdf8", "#fcd9bd"] as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 32,
  full: 9999,
};

export const shadowCard =
  Platform.select({
    ios: {
      shadowColor: "#020617",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
    },
    default: { elevation: 6 },
  }) ?? {};

export const shadowCta =
  Platform.select({
    ios: {
      shadowColor: "#38bdf8",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    default: { elevation: 5 },
  }) ?? {};
