import type { HourlyMarinePoint, HourlyWindPoint } from "@nomadsurf/core";

interface MarineJson {
  hourly?: {
    time: string[];
    wave_height?: (number | null)[];
    swell_wave_height?: (number | null)[];
    swell_wave_period?: (number | null)[];
  };
  error?: boolean;
  reason?: string;
}

interface ForecastJson {
  hourly?: {
    time: string[];
    wind_speed_10m?: (number | null)[];
    wind_direction_10m?: (number | null)[];
  };
  error?: boolean;
  reason?: string;
}

export async function fetchMarineHourly(
  latitude: number,
  longitude: number
): Promise<HourlyMarinePoint[]> {
  const url = new URL("https://marine-api.open-meteo.com/v1/marine");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "hourly",
    "wave_height,swell_wave_height,swell_wave_period"
  );
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("cell_selection", "sea");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Marine API HTTP ${res.status}`);
  const data = (await res.json()) as MarineJson;
  if (data.error) {
    throw new Error(data.reason ?? "Marine API error");
  }
  const h = data.hourly;
  if (!h?.time?.length) return [];
  const n = h.time.length;
  const out: HourlyMarinePoint[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      time: h.time[i],
      waveHeightM: h.wave_height?.[i] ?? null,
      swellHeightM: h.swell_wave_height?.[i] ?? null,
      swellPeriodS: h.swell_wave_period?.[i] ?? null,
    });
  }
  return out;
}

export async function fetchWindHourly(
  latitude: number,
  longitude: number
): Promise<HourlyWindPoint[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("hourly", "wind_speed_10m,wind_direction_10m");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Forecast API HTTP ${res.status}`);
  const data = (await res.json()) as ForecastJson;
  if (data.error) {
    throw new Error(data.reason ?? "Forecast API error");
  }
  const h = data.hourly;
  if (!h?.time?.length) return [];
  const n = h.time.length;
  const out: HourlyWindPoint[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      time: h.time[i],
      windSpeedKmh: h.wind_speed_10m?.[i] ?? null,
      windDirectionDeg: h.wind_direction_10m?.[i] ?? null,
    });
  }
  return out;
}
