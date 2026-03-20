import type {
  BestWindow,
  HourlyMarinePoint,
  HourlyWindPoint,
  ScoredHour,
  SkillBand,
  SkillLevel,
  SpotForecastResult,
  SpotWithDistance,
  SurfSpot,
} from "./types";

export function skillBand(level: SkillLevel): SkillBand {
  switch (level) {
    case "beginner":
      return {
        idealMinM: 0.3,
        idealMaxM: 1.0,
        hardMaxM: 1.4,
        periodIdealMinS: 6,
        periodIdealMaxS: 11,
      };
    case "intermediate":
      return {
        idealMinM: 0.6,
        idealMaxM: 1.8,
        hardMaxM: 2.6,
        periodIdealMinS: 8,
        periodIdealMaxS: 14,
      };
    case "advanced":
      return {
        idealMinM: 1.0,
        idealMaxM: 3.0,
        hardMaxM: 4.5,
        periodIdealMinS: 9,
        periodIdealMaxS: 18,
      };
  }
}

/** Height used for scoring: prefer swell, fall back to total wave height */
function effectiveHeightM(m: HourlyMarinePoint): number | null {
  if (m.swellHeightM != null && m.swellHeightM > 0.05) return m.swellHeightM;
  if (m.waveHeightM != null && m.waveHeightM > 0) return m.waveHeightM;
  return null;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Map height to 0..1 score vs skill band */
function heightScoreMeters(h: number, band: SkillBand): number {
  if (h > band.hardMaxM) {
    const over = h - band.hardMaxM;
    return clamp01(0.35 - over * 1.2);
  }
  const center = (band.idealMinM + band.idealMaxM) / 2;
  const halfWidth = Math.max(0.15, (band.idealMaxM - band.idealMinM) / 2);
  const dist = Math.abs(h - center);
  return clamp01(1 - dist / (halfWidth * 2.2));
}

function periodScore(periodS: number | null, band: SkillBand): number {
  if (periodS == null || !Number.isFinite(periodS)) return 0.55;
  if (periodS < 4) return 0.2;
  if (periodS < band.periodIdealMinS) {
    return clamp01(0.35 + (periodS - 4) / (band.periodIdealMinS - 4) * 0.45);
  }
  if (periodS <= band.periodIdealMaxS) return 1;
  const over = periodS - band.periodIdealMaxS;
  return clamp01(1 - over / 12);
}

/** Light wind is better; direction ignored in MVP (optional refinement) */
function windScore(windKmh: number | null): number {
  if (windKmh == null || !Number.isFinite(windKmh)) return 0.65;
  if (windKmh <= 15) return 1;
  if (windKmh <= 30) return clamp01(1 - (windKmh - 15) / 40);
  return clamp01(0.45 - (windKmh - 30) / 80);
}

export function scoreHour(
  marine: HourlyMarinePoint,
  wind: HourlyWindPoint | undefined,
  band: SkillBand
): ScoredHour {
  const h = effectiveHeightM(marine);
  const hPart = h == null ? 0.4 : heightScoreMeters(h, band);
  const pPart = periodScore(marine.swellPeriodS, band);
  const wPart = wind ? windScore(wind.windSpeedKmh) : 0.65;
  const score = 0.5 * hPart + 0.35 * pPart + 0.15 * wPart;
  return {
    time: marine.time,
    score,
    swellHeightM: marine.swellHeightM,
    swellPeriodS: marine.swellPeriodS,
    waveHeightM: marine.waveHeightM,
    windSpeedKmh: wind?.windSpeedKmh ?? null,
  };
}

function alignWindToMarine(
  marine: HourlyMarinePoint[],
  wind: HourlyWindPoint[]
): Map<string, HourlyWindPoint> {
  const map = new Map<string, HourlyWindPoint>();
  for (const w of wind) map.set(w.time, w);
  return map;
}

export function scoreDay(
  marine: HourlyMarinePoint[],
  wind: HourlyWindPoint[],
  band: SkillBand
): ScoredHour[] {
  const wmap = alignWindToMarine(marine, wind);
  return marine.map((m) => scoreHour(m, wmap.get(m.time), band));
}

/** Expand ±1h around peak index for display window */
export function bestWindowFromHours(hours: ScoredHour[]): BestWindow {
  if (hours.length === 0) {
    return {
      startTime: "",
      endTime: "",
      peakTime: "",
      peakScore: 0,
      hours: [],
    };
  }
  let peakIdx = 0;
  for (let i = 1; i < hours.length; i++) {
    if (hours[i].score > hours[peakIdx].score) peakIdx = i;
  }
  const startIdx = Math.max(0, peakIdx - 1);
  const endIdx = Math.min(hours.length - 1, peakIdx + 1);
  return {
    startTime: hours[startIdx].time,
    endTime: hours[endIdx].time,
    peakTime: hours[peakIdx].time,
    peakScore: hours[peakIdx].score,
    hours,
  };
}

export function pickBestSpot(
  results: SpotForecastResult[]
): SpotForecastResult | null {
  if (results.length === 0) return null;
  return results.reduce((a, b) =>
    a.bestWindow.peakScore >= b.bestWindow.peakScore ? a : b
  );
}

export function attachRunnerUps(
  results: SpotForecastResult[],
  best: SpotForecastResult,
  count: number
): SpotForecastResult {
  const others = results
    .filter((r) => r.spot.id !== best.spot.id)
    .sort((a, b) => b.bestWindow.peakScore - a.bestWindow.peakScore)
    .slice(0, count);
  return { ...best, runnerUps: others };
}

export function spotResult(
  spot: SpotWithDistance,
  hours: ScoredHour[]
): SpotForecastResult {
  return {
    spot: {
      id: spot.id,
      name: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude,
      region: spot.region,
    },
    distanceKm: spot.distanceKm,
    bestWindow: bestWindowFromHours(hours),
  };
}
