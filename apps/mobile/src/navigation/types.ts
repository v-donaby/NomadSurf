import type { SpotForecastResult } from "@nomadsurf/core";

export type RootStackParamList = {
  Home: undefined;
  Result: { best: SpotForecastResult };
};
