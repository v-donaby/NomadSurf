import type { SupportedCountryCode } from "./supportedCountries";

/** Preset locations for the city picker (coordinates for distance / forecasts). */
export type PicklistCity = {
  id: string;
  label: string;
  /** Optional region or context shown under the name */
  subtitle?: string;
  latitude: number;
  longitude: number;
};

export const CITIES_BY_COUNTRY: Record<SupportedCountryCode, PicklistCity[]> = {
  CO: [
    { id: "co-cartagena", label: "Cartagena", subtitle: "Caribbean coast", latitude: 10.3914, longitude: -75.4794 },
    { id: "co-santa-marta", label: "Santa Marta", subtitle: "Near Tayrona", latitude: 11.2408, longitude: -74.199 },
    { id: "co-barranquilla", label: "Barranquilla", latitude: 10.9685, longitude: -74.7813 },
    { id: "co-riohacha", label: "Riohacha", latitude: 11.5444, longitude: -72.9072 },
    { id: "co-medellin", label: "Medellín", latitude: 6.2442, longitude: -75.5812 },
    { id: "co-bogota", label: "Bogotá", latitude: 4.711, longitude: -74.0721 },
    { id: "co-bahia-solano", label: "Bahía Solano", subtitle: "Pacific", latitude: 6.227, longitude: -77.401 },
    { id: "co-nuqui", label: "Nuquí", subtitle: "Pacific", latitude: 5.7092, longitude: -77.2708 },
  ],
  CR: [
    { id: "cr-san-jose", label: "San José", latitude: 9.9281, longitude: -84.0907 },
    { id: "cr-jaco", label: "Jacó", latitude: 9.6167, longitude: -84.6297 },
    { id: "cr-tamarindo", label: "Tamarindo", latitude: 10.2993, longitude: -85.8371 },
    { id: "cr-santa-teresa", label: "Santa Teresa", latitude: 9.654, longitude: -85.168 },
    { id: "cr-nosara", label: "Nosara", latitude: 9.976, longitude: -85.653 },
    { id: "cr-dominical", label: "Dominical", latitude: 9.254, longitude: -83.86 },
    { id: "cr-quepos", label: "Quepos", subtitle: "Manuel Antonio", latitude: 9.4302, longitude: -84.1619 },
    { id: "cr-puerto-viejo", label: "Puerto Viejo", subtitle: "Caribbean coast", latitude: 9.654, longitude: -82.7528 },
    { id: "cr-limon", label: "Limón", latitude: 9.9908, longitude: -83.0359 },
  ],
  BR: [
    { id: "br-rio", label: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
    { id: "br-sao-paulo", label: "São Paulo", latitude: -23.5505, longitude: -46.6333 },
    { id: "br-florianopolis", label: "Florianópolis", latitude: -27.5954, longitude: -48.548 },
    { id: "br-salvador", label: "Salvador", latitude: -12.9714, longitude: -38.5014 },
    { id: "br-fortaleza", label: "Fortaleza", latitude: -3.7172, longitude: -38.5433 },
    { id: "br-recife", label: "Recife", latitude: -8.0476, longitude: -34.877 },
    { id: "br-natal", label: "Natal", latitude: -5.7945, longitude: -35.211 },
    { id: "br-jericoacoara", label: "Jericoacoara", latitude: -2.7929, longitude: -40.5144 },
    { id: "br-noronha", label: "Fernando de Noronha", latitude: -3.8543, longitude: -32.4233 },
  ],
  DO: [
    { id: "do-santo-domingo", label: "Santo Domingo", latitude: 18.4719, longitude: -69.8923 },
    { id: "do-puerto-plata", label: "Puerto Plata", latitude: 19.7934, longitude: -70.691 },
    { id: "do-cabarete", label: "Cabarete", latitude: 19.7508, longitude: -70.4083 },
    { id: "do-punta-cana", label: "Punta Cana", latitude: 18.5819, longitude: -68.4044 },
    { id: "do-las-terrenas", label: "Las Terrenas", latitude: 19.321, longitude: -69.539 },
    { id: "do-santiago", label: "Santiago", latitude: 19.4517, longitude: -70.697 },
  ],
  PE: [
    { id: "pe-lima", label: "Lima", latitude: -12.0464, longitude: -77.0428 },
    { id: "pe-trujillo", label: "Trujillo", latitude: -8.1116, longitude: -79.0288 },
    { id: "pe-chiclayo", label: "Chiclayo", latitude: -6.7714, longitude: -79.8409 },
    { id: "pe-huanchaco", label: "Huanchaco", subtitle: "Near Trujillo", latitude: -8.0756, longitude: -79.121 },
    { id: "pe-mancora", label: "Máncora", latitude: -4.1789, longitude: -81.0636 },
    { id: "pe-talara", label: "Talara", latitude: -4.577, longitude: -81.283 },
    { id: "pe-chicama", label: "Chicama", subtitle: "Puerto Malabrigo", latitude: -7.42, longitude: -79.42 },
  ],
};

export function citiesForCountry(code: SupportedCountryCode): PicklistCity[] {
  return CITIES_BY_COUNTRY[code];
}
