import type { GeoJsonFeatureCollection, SurfSpot } from "@nomadsurf/core";
import { parseSpotsFromGeoJson } from "@nomadsurf/core";

// GeoJSON FeatureCollection bundled from repo root (see scripts/generate-spots.mjs)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const raw = require("../../../../data/spots.json") as GeoJsonFeatureCollection;

let cached: SurfSpot[] | null = null;

export function loadAllSpots(): SurfSpot[] {
  if (!cached) {
    cached = parseSpotsFromGeoJson(raw);
  }
  return cached;
}
