import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SpotForecastResult } from "@nomadsurf/core";
import type { RootStackParamList } from "../navigation/types";
import { colors, gradientWindowBar, radii, shadowCard } from "../theme";

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

function mapRegionForReferenceAndSpot(
  ref: { latitude: number; longitude: number },
  spot: { latitude: number; longitude: number }
) {
  const latMin = Math.min(ref.latitude, spot.latitude);
  const latMax = Math.max(ref.latitude, spot.latitude);
  const lonMin = Math.min(ref.longitude, spot.longitude);
  const lonMax = Math.max(ref.longitude, spot.longitude);
  const midLat = (latMin + latMax) / 2;
  const midLon = (lonMin + lonMax) / 2;
  const latSpan = Math.max(latMax - latMin, 1e-5);
  const lonSpan = Math.max(lonMax - lonMin, 1e-5);
  return {
    latitude: midLat,
    longitude: midLon,
    latitudeDelta: Math.max(latSpan * 1.55, 0.09),
    longitudeDelta: Math.max(lonSpan * 1.55, 0.09),
  };
}

export function ResultScreen({ navigation, route }: Props) {
  const { best, referenceLocation } = route.params;
  const { swellFt, period } = peakHour(best.bestWindow);
  const region = mapRegionForReferenceAndSpot(referenceLocation, best.spot);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>Best spot today</Text>
          <Text style={styles.refLine}>
            From {referenceLocation.label}
            {referenceLocation.subtitle
              ? ` · ${referenceLocation.subtitle}`
              : ""}
            , {referenceLocation.countryLabel}
          </Text>
          <Text style={styles.spotName}>{best.spot.name}</Text>
          {best.spot.region ? (
            <Text style={styles.region}>{best.spot.region}</Text>
          ) : null}
          <Text style={styles.meta}>
            ~{best.distanceKm.toFixed(0)} km from your pick to this break ·
            Local times at the break
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Best window</Text>
          <Text style={styles.window}>
            {formatClock(best.bestWindow.startTime)} –{" "}
            {formatClock(best.bestWindow.endTime)}
          </Text>
          <View style={styles.windowBarTrack}>
            <LinearGradient
              colors={[...gradientWindowBar]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.windowBarFill}
            />
          </View>
          <View style={styles.cardInner}>
            <View style={styles.statRow}>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>Peak</Text>
                <Text style={styles.statValue}>
                  {formatClock(best.bestWindow.peakTime)}
                </Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>Swell</Text>
                <Text style={styles.statValue}>~{swellFt} ft</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>Period</Text>
                <Text style={styles.statValue}>{period}s</Text>
              </View>
            </View>
            <Text style={styles.rationale}>
              Significant swell height · verify conditions before you paddle out.
            </Text>
          </View>
        </View>

        <View style={styles.mapWrap}>
          <MapView style={styles.map} initialRegion={region}>
            <Marker
              coordinate={{
                latitude: referenceLocation.latitude,
                longitude: referenceLocation.longitude,
              }}
              title={`Your pick: ${referenceLocation.label}`}
              description={referenceLocation.countryLabel}
              pinColor="blue"
            />
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

        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.back}>Change location or skill</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgScreen },
  scroll: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 40 },
  hero: {
    marginBottom: 8,
  },
  kicker: {
    color: colors.kicker,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  spotName: {
    marginTop: 14,
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.6,
  },
  region: { marginTop: 6, color: colors.textMuted, fontSize: 16, fontWeight: "500" },
  refLine: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  meta: { marginTop: 10, color: colors.textMuted, fontSize: 14, fontWeight: "500" },
  card: {
    marginTop: 20,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xxl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    ...shadowCard,
  },
  cardTitle: {
    color: colors.kicker,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  window: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  windowBarTrack: {
    marginTop: 16,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceInner,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  windowBarFill: {
    flex: 1,
    borderRadius: radii.full,
  },
  cardInner: {
    marginTop: 18,
    backgroundColor: colors.surfaceInner,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  statPill: {
    flex: 1,
    minWidth: "28%",
    backgroundColor: colors.statInset,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  rationale: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  mapWrap: {
    marginTop: 22,
    height: 228,
    borderRadius: radii.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.mapBorder,
    ...shadowCard,
  },
  map: { flex: 1 },
  runners: { marginTop: 26 },
  runnersTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  runnerRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  runnerName: { color: colors.text, fontSize: 16, fontWeight: "600" },
  runnerWin: { color: colors.textMuted, fontSize: 14, marginTop: 4, fontWeight: "500" },
  backBtn: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingRight: 12,
    gap: 2,
  },
  backBtnPressed: { opacity: 0.65 },
  backChevron: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
    marginRight: 2,
  },
  back: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "600",
  },
});
