import type { SpotForecastResult } from "@nomadsurf/core";

/** City/country the user picked on Home (for copy + map vs surf spot). */
export type ReferenceLocation = {
  label: string;
  subtitle?: string;
  countryLabel: string;
  latitude: number;
  longitude: number;
};

export type RootStackParamList = {
  Home: undefined;
  Result: { best: SpotForecastResult; referenceLocation: ReferenceLocation };
};
