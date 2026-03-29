import { Platform } from "react-native";

/**
 * Coastal glass — matches NomadSurf web reference:
 * deep ocean blues, cyan highlights, warm sand, frosted cards.
 */
export const colors = {
  bg: "#07131d",
  bgScreen: "#07131d",
  bgElevated: "#102534",
  surface: "rgba(255, 255, 255, 0.1)",
  surfaceHover: "rgba(255, 255, 255, 0.14)",
  surfaceStrong: "rgba(255, 255, 255, 0.1)",
  surfaceInner: "rgba(2, 6, 23, 0.3)",
  statInset: "rgba(0, 0, 0, 0.1)",
  border: "rgba(255, 255, 255, 0.1)",
  borderGlass: "rgba(255, 255, 255, 0.1)",
  borderFocus: "rgba(165, 243, 252, 0.45)",
  text: "#ffffff",
  textSecondary: "#e2e8f0",
  textMuted: "#94a3b8",
  textSlate300: "#cbd5e1",
  textSubtle: "#64748b",
  cyanBrand: "rgba(165, 243, 252, 0.7)",
  cyanKicker: "rgba(207, 250, 254, 0.7)",
  cyanSoft: "rgba(207, 250, 254, 0.95)",
  accent: "#a5f3fc",
  accentSoft: "rgba(165, 243, 252, 0.12)",
  accentTextOn: "#07131d",
  kicker: "rgba(207, 250, 254, 0.7)",
  badgeSurf: "rgba(110, 231, 183, 0.2)",
  badgeSurfMuted: "rgba(209, 250, 229, 0.8)",
  badgeSurfText: "rgba(209, 250, 229, 1)",
  badgeSurfLabel: "rgba(209, 250, 229, 0.8)",
  cta: "#a5f3fc",
  ctaText: "#07131d",
  overlay: "rgba(2, 12, 27, 0.75)",
  mapBorder: "rgba(255, 255, 255, 0.1)",
};

/** Simulates reference radial (lighter at top): #234b63 → #102534 → #07131d */
export const gradientScreen = ["#234b63", "#102534", "#07131d"] as const;

/** Featured “Today’s pick” card wash: cyan / transparent / warm */
export const gradientCardWash = [
  "rgba(103, 232, 249, 0.12)",
  "rgba(255, 255, 255, 0.02)",
  "rgba(253, 186, 116, 0.12)",
] as const;

/** Best-window bar: cyan-300 → sky-300 → orange-200 */
export const gradientWindowBar = ["#67e8f9", "#7dd3fc", "#fdba74"] as const;

/** Primary CTA / emphasis strip */
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
      shadowOpacity: 0.4,
      shadowRadius: 24,
    },
    default: { elevation: 8 },
  }) ?? {};

export const shadowCta =
  Platform.select({
    ios: {
      shadowColor: "#67e8f9",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 16,
    },
    default: { elevation: 5 },
  }) ?? {};
