import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Curated breaks in Colombia, Costa Rica, Brazil, Dominican Republic, Peru. */
/** @type {{ name: string; lat: number; lon: number; region: string }[]} */
const SEED = [
  // Colombia
  { name: "Pradomar", lat: 11.004, lon: -74.862, region: "Colombia" },
  { name: "La Boquilla (Cartagena)", lat: 10.478, lon: -75.52, region: "Colombia" },
  { name: "Tayrona / Cañaveral", lat: 11.317, lon: -74.085, region: "Colombia" },
  { name: "Costeño Beach", lat: 11.087, lon: -73.716, region: "Colombia" },
  { name: "Palomino", lat: 11.248, lon: -73.319, region: "Colombia" },
  { name: "Guachalito (Nuquí)", lat: 5.693, lon: -77.267, region: "Colombia" },
  { name: "Bahía Solano", lat: 6.227, lon: -77.403, region: "Colombia" },
  { name: "El Valle (Chocó)", lat: 5.007, lon: -76.985, region: "Colombia" },
  { name: "Buritaca", lat: 11.189, lon: -73.856, region: "Colombia" },
  { name: "Playa Mendihuaca", lat: 11.305, lon: -73.948, region: "Colombia" },
  // Costa Rica
  { name: "Tamarindo", lat: 10.299, lon: -85.839, region: "Costa Rica" },
  { name: "Pavones", lat: 8.395, lon: -83.146, region: "Costa Rica" },
  { name: "Jacó", lat: 9.616, lon: -84.629, region: "Costa Rica" },
  { name: "Playa Hermosa (Jacó)", lat: 9.597, lon: -84.634, region: "Costa Rica" },
  { name: "Dominical", lat: 9.254, lon: -83.86, region: "Costa Rica" },
  { name: "Santa Teresa", lat: 9.654, lon: -85.168, region: "Costa Rica" },
  { name: "Nosara", lat: 9.976, lon: -85.653, region: "Costa Rica" },
  { name: "Salsa Brava (Puerto Viejo)", lat: 9.661, lon: -82.752, region: "Costa Rica" },
  { name: "Witches Rock", lat: 10.729, lon: -85.786, region: "Costa Rica" },
  { name: "Samara", lat: 9.881, lon: -85.528, region: "Costa Rica" },
  // Brazil
  { name: "Arpoador", lat: -22.989, lon: -43.192, region: "Brazil" },
  { name: "Praia Mole", lat: -27.6, lon: -48.433, region: "Brazil" },
  { name: "Itaúna (Saquarema)", lat: -22.928, lon: -42.497, region: "Brazil" },
  { name: "Joaquina", lat: -27.634, lon: -48.445, region: "Brazil" },
  { name: "Guarda do Embaú", lat: -27.907, lon: -48.615, region: "Brazil" },
  { name: "Jericoacoara", lat: -2.793, lon: -40.514, region: "Brazil" },
  { name: "Cacimba do Padre (Noronha)", lat: -3.854, lon: -32.445, region: "Brazil" },
  { name: "Boa Viagem", lat: -8.09, lon: -34.871, region: "Brazil" },
  { name: "Castelhanos (Ilhabela)", lat: -23.813, lon: -45.271, region: "Brazil" },
  { name: "Pipa (Amor)", lat: -6.231, lon: -35.055, region: "Brazil" },
  // Dominican Republic
  { name: "Cabarete", lat: 19.749, lon: -70.408, region: "Dominican Republic" },
  { name: "Encuentro", lat: 19.764, lon: -70.46, region: "Dominican Republic" },
  { name: "Macao", lat: 18.612, lon: -68.342, region: "Dominican Republic" },
  { name: "Playa Bonita (Las Terrenas)", lat: 19.563, lon: -69.902, region: "Dominican Republic" },
  { name: "Puerto Plata (General)", lat: 19.795, lon: -70.694, region: "Dominican Republic" },
  { name: "Bahoruco", lat: 18.25, lon: -71.067, region: "Dominican Republic" },
  // Peru
  { name: "Chicama", lat: -7.42, lon: -79.42, region: "Peru" },
  { name: "Máncora", lat: -4.108, lon: -81.048, region: "Peru" },
  { name: "Punta Rocas", lat: -11.919, lon: -77.182, region: "Peru" },
  { name: "Cabo Blanco", lat: -4.25, lon: -81.239, region: "Peru" },
  { name: "Huanchaco", lat: -8.081, lon: -79.121, region: "Peru" },
  { name: "Lobitos", lat: -4.451, lon: -81.277, region: "Peru" },
  { name: "Peñascal", lat: -5.922, lon: -81.078, region: "Peru" },
  { name: "Cerro Azul", lat: -13.028, lon: -76.485, region: "Peru" },
];

const features = [];
let id = 0;
for (const s of SEED) {
  features.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: [s.lon, s.lat] },
    properties: {
      id: `surf-${id++}`,
      name: s.name,
      region: s.region,
    },
  });
}

const fc = { type: "FeatureCollection", features };
const outDir = join(root, "data");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "spots.json");
writeFileSync(outPath, JSON.stringify(fc, null, 0), "utf8");
console.log(`Wrote ${features.length} spots to ${outPath}`);
