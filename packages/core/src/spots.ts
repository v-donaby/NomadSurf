import { haversineKm } from "./geo";
import type {
  GeoJsonFeatureCollection,
  SpotWithDistance,
  SurfSpot,
} from "./types";

function asString(v: unknown, fallback: string): string {
  if (typeof v === "string" && v.length > 0) return v;
  return fallback;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function parseSpotsFromGeoJson(collection: GeoJsonFeatureCollection): SurfSpot[] {
  const out: SurfSpot[] = [];
  let autoId = 0;
  for (const f of collection.features) {
    if (f.geometry?.type !== "Point") continue;
    const [lon, lat] = f.geometry.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const p = f.properties ?? {};
    const id = asString(p.id, "") || `spot-${autoId++}`;
    const name = asString(p.name, "Unnamed break");
    out.push({
      id: String(id),
      name,
      latitude: lat,
      longitude: lon,
      region: typeof p.region === "string" ? p.region : undefined,
    });
  }
  return out;
}

export function nearestSpots(
  userLat: number,
  userLon: number,
  spots: SurfSpot[],
  options: { maxCount: number; maxRadiusKm?: number }
): SpotWithDistance[] {
  const withDist: SpotWithDistance[] = spots.map((s) => ({
    ...s,
    distanceKm: haversineKm(userLat, userLon, s.latitude, s.longitude),
  }));
  withDist.sort((a, b) => a.distanceKm - b.distanceKm);
  let filtered = withDist;
  if (options.maxRadiusKm != null) {
    filtered = withDist.filter((s) => s.distanceKm <= options.maxRadiusKm!);
  }
  return filtered.slice(0, options.maxCount);
}
