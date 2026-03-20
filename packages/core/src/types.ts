export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface SurfSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface SpotWithDistance extends SurfSpot {
  distanceKm: number;
}

export interface HourlyMarinePoint {
  time: string;
  waveHeightM: number | null;
  swellHeightM: number | null;
  swellPeriodS: number | null;
}

export interface HourlyWindPoint {
  time: string;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
}

export interface ScoredHour {
  time: string;
  score: number;
  swellHeightM: number | null;
  swellPeriodS: number | null;
  waveHeightM: number | null;
  windSpeedKmh: number | null;
}

export interface BestWindow {
  startTime: string;
  endTime: string;
  peakTime: string;
  peakScore: number;
  hours: ScoredHour[];
}

export interface SpotForecastResult {
  spot: SurfSpot;
  distanceKm: number;
  bestWindow: BestWindow;
  runnerUps?: SpotForecastResult[];
}

export interface SkillBand {
  /** Ideal total wave height (m) — score peaks near center of [min, max] */
  idealMinM: number;
  idealMaxM: number;
  /** Hard cap: hours above this get strongly penalized */
  hardMaxM: number;
  /** Preferred swell period range (s) */
  periodIdealMinS: number;
  /** Preferred swell period range (s) */
  periodIdealMaxS: number;
}
