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

### Expo Go version mismatch

The app targets **Expo SDK 54**, which matches the **Expo Go** build from the [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent). If you see a message that the project is incompatible with Expo Go:

1. **Update Expo Go** on your phone to the latest version.
2. From the repo root, run `npm install` so dependencies match (this monorepo pins `react` / `react-native` / `expo-status-bar` for SDK 54).

If you intentionally use **SDK 55+** later, you need a **new enough** Expo Go (or a [development build](https://docs.expo.dev/develop/development-builds/introduction/)) that supports that SDK.

## Regenerate spot seed

```bash
node scripts/generate-spots.mjs
```

## Attribution

Marine and weather data: **Open-Meteo** and underlying models — see [Open-Meteo licence](https://open-meteo.com/en/license). You must retain attribution for non-commercial use per their terms.
