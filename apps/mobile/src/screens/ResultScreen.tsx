import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SpotForecastResult } from "@nomadsurf/core";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

function formatClock(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16) || iso;
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function peakHour(best: SpotForecastResult["bestWindow"]): {
  swellFt: string;
  period: string;
} {
  const peak = best.hours.find((h) => h.time === best.peakTime) ?? best.hours[0];
  const m = peak?.swellHeightM ?? peak?.waveHeightM;
  const ft = m != null ? (m * 3.28084).toFixed(1) : "—";
  const p = peak?.swellPeriodS != null ? peak.swellPeriodS.toFixed(0) : "—";
  return { swellFt: ft, period: p };
}

export function ResultScreen({ navigation, route }: Props) {
  const { best } = route.params;
  const { swellFt, period } = peakHour(best.bestWindow);
  const region = {
    latitude: best.spot.latitude,
    longitude: best.spot.longitude,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>Best spot today</Text>
        <Text style={styles.spotName}>{best.spot.name}</Text>
        {best.spot.region ? (
          <Text style={styles.region}>{best.spot.region}</Text>
        ) : null}
        <Text style={styles.meta}>
          ~{best.distanceKm.toFixed(0)} km away · Times are local to the break
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Best window</Text>
          <Text style={styles.window}>
            {formatClock(best.bestWindow.startTime)} –{" "}
            {formatClock(best.bestWindow.endTime)}
          </Text>
          <Text style={styles.rationale}>
            Peak around {formatClock(best.bestWindow.peakTime)} · ~{swellFt} ft
            swell (sig.) · {period}s period
          </Text>
        </View>

        <View style={styles.mapWrap}>
          <MapView style={styles.map} initialRegion={region}>
            <Marker
              coordinate={{
                latitude: best.spot.latitude,
                longitude: best.spot.longitude,
              }}
              title={best.spot.name}
            />
          </MapView>
        </View>

        {best.runnerUps && best.runnerUps.length > 0 ? (
          <View style={styles.runners}>
            <Text style={styles.runnersTitle}>Also strong today</Text>
            {best.runnerUps.map((r) => (
              <View key={r.spot.id} style={styles.runnerRow}>
                <Text style={styles.runnerName}>{r.spot.name}</Text>
                <Text style={styles.runnerWin}>
                  {formatClock(r.bestWindow.startTime)} –{" "}
                  {formatClock(r.bestWindow.endTime)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text
          style={styles.back}
          onPress={() => navigation.navigate("Home")}
        >
          ← Change location or skill
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0c1a24" },
  scroll: { padding: 20, paddingBottom: 40 },
  kicker: {
    color: "#7dd3fc",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  spotName: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "800",
    color: "#f8fafc",
  },
  region: { marginTop: 4, color: "#94a3b8", fontSize: 16 },
  meta: { marginTop: 10, color: "#7dd3fc", fontSize: 14 },
  card: {
    marginTop: 22,
    backgroundColor: "#132633",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f3a4d",
  },
  cardTitle: {
    color: "#bae6fd",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  window: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: "800",
    color: "#fef3c7",
  },
  rationale: { marginTop: 10, color: "#cbd5e1", fontSize: 15, lineHeight: 22 },
  mapWrap: {
    marginTop: 20,
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1f3a4d",
  },
  map: { flex: 1 },
  runners: { marginTop: 24 },
  runnersTitle: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  runnerRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f3a4d",
  },
  runnerName: { color: "#f1f5f9", fontSize: 16, fontWeight: "600" },
  runnerWin: { color: "#94a3b8", fontSize: 14, marginTop: 4 },
  back: {
    marginTop: 28,
    color: "#38bdf8",
    fontSize: 16,
    fontWeight: "600",
  },
});
