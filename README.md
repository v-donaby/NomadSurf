# NomadSurf

Mobile MVP: choose **country** and **city**, plus your **skill level**, to get the **best nearby surf spot** and a **best time window today** (local time at the break). The spot list covers **Colombia, Costa Rica, Brazil, Dominican Republic, and Peru** only. City lookup uses [Open-Meteo geocoding](https://open-meteo.com/en/docs/geocoding-api); forecasts use marine + weather from [Open-Meteo](https://open-meteo.com/) — always verify conditions locally.

## Structure

| Path | Purpose |
|------|---------|
| [`apps/mobile`](apps/mobile) | Expo (React Native) app |
| [`packages/core`](packages/core) | Shared logic: Haversine, spot parsing, swell scoring |
| [`data/spots.json`](data/spots.json) | GeoJSON `FeatureCollection` seed (regenerate below) |
| [`scripts/generate-spots.mjs`](scripts/generate-spots.mjs) | Rebuilds `data/spots.json` |

## Setup

```bash
npm install          # installs workspaces; builds @nomadsurf/core (prepare)
```

## Run the app

From the repo root:

```bash
npm run start
```

Or from `apps/mobile`:

```bash
npm start            # runs `tsc` in packages/core first (prestart)
```

Then open the project in **Expo Go** or press `i` / `a` for iOS Simulator / Android emulator.

## Regenerate spot seed

```bash
node scripts/generate-spots.mjs
```

## Attribution

Marine and weather data: **Open-Meteo** and underlying models — see [Open-Meteo licence](https://open-meteo.com/en/license). You must retain attribution for non-commercial use per their terms.
