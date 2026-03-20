/** Countries where NomadSurf has spot coverage (ISO 3166-1 alpha-2). */
export const SUPPORTED_COUNTRIES = [
  { label: "Colombia", code: "CO" },
  { label: "Costa Rica", code: "CR" },
  { label: "Brazil", code: "BR" },
  { label: "Dominican Republic", code: "DO" },
  { label: "Peru", code: "PE" },
] as const;

export type SupportedCountryCode = (typeof SUPPORTED_COUNTRIES)[number]["code"];
