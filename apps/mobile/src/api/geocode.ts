export interface GeocodeHit {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
}

/**
 * Resolve a city (or town) within a given country using Open-Meteo geocoding.
 * @see https://open-meteo.com/en/docs/geocoding-api
 */
export async function searchCityInCountry(
  city: string,
  countryCode: string
): Promise<GeocodeHit | null> {
  const q = city.trim();
  if (q.length < 2) return null;
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("countryCode", countryCode.toUpperCase());
  url.searchParams.set("count", "10");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = (await res.json()) as {
    results?: {
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      country_code?: string;
      admin1?: string;
    }[];
  };
  const first = data.results?.[0];
  if (!first) return null;
  return {
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    country: first.country,
    countryCode: first.country_code,
    admin1: first.admin1,
  };
}
