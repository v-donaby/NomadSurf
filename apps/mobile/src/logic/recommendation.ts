import type {
  SkillLevel,
  SpotForecastResult,
  SpotWithDistance,
  SurfSpot,
} from "@nomadsurf/core";
import {
  attachRunnerUps,
  nearestSpots,
  pickBestSpot,
  scoreDay,
  skillBand,
  spotResult,
} from "@nomadsurf/core";
import { fetchMarineHourly, fetchWindHourly } from "../api/openMeteo";

const NEAREST_COUNT = 20;
const INITIAL_RADIUS_KM = 800;
const WIDENED_RADIUS_KM = 2500;
const FETCH_CONCURRENCY = 5;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function runWorker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    runWorker()
  );
  await Promise.all(runners);
  return results;
}

async function forecastForSpot(
  spot: SpotWithDistance,
  skill: SkillLevel
): Promise<SpotForecastResult | null> {
  try {
    const [marine, wind] = await Promise.all([
      fetchMarineHourly(spot.latitude, spot.longitude),
      fetchWindHourly(spot.latitude, spot.longitude),
    ]);
    if (marine.length === 0) return null;
    const band = skillBand(skill);
    const hours = scoreDay(marine, wind, band);
    return spotResult(spot, hours);
  } catch {
    return null;
  }
}

export interface RecommendationInput {
  userLat: number;
  userLon: number;
  skill: SkillLevel;
  allSpots: SurfSpot[];
}

export interface RecommendationOutput {
  best: SpotForecastResult;
  /** All scored spots that returned data (for debugging / future UI) */
  evaluated: SpotForecastResult[];
}

export async function computeRecommendation(
  input: RecommendationInput
): Promise<RecommendationOutput | null> {
  const { userLat, userLon, skill, allSpots } = input;

  let candidates = nearestSpots(userLat, userLon, allSpots, {
    maxCount: NEAREST_COUNT,
    maxRadiusKm: INITIAL_RADIUS_KM,
  });
  if (candidates.length === 0) {
    candidates = nearestSpots(userLat, userLon, allSpots, {
      maxCount: NEAREST_COUNT,
      maxRadiusKm: WIDENED_RADIUS_KM,
    });
  }
  if (candidates.length === 0) {
    return null;
  }

  const partial = await mapPool(candidates, FETCH_CONCURRENCY, (spot) =>
    forecastForSpot(spot, skill)
  );
  const evaluated = partial.filter((x): x is SpotForecastResult => x != null);
  if (evaluated.length === 0) {
    return null;
  }
  const bestBase = pickBestSpot(evaluated);
  if (!bestBase) return null;
  const best = attachRunnerUps(evaluated, bestBase, 2);
  return { best, evaluated };
}
