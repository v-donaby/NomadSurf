import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SkillLevel } from "@nomadsurf/core";
import { searchCityInCountry } from "../api/geocode";
import {
  SUPPORTED_COUNTRIES,
  type SupportedCountryCode,
} from "../constants/supportedCountries";
import { computeRecommendation } from "../logic/recommendation";
import type { RootStackParamList } from "../navigation/types";
import { loadAllSpots } from "../spots/loadSpots";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const SKILLS: { key: SkillLevel; label: string; hint: string }[] = [
  { key: "beginner", label: "Beginner", hint: "Smaller, gentler conditions" },
  { key: "intermediate", label: "Intermediate", hint: "Moderate swell" },
  { key: "advanced", label: "Advanced", hint: "Larger, more powerful swell" },
];

export function HomeScreen({ navigation }: Props) {
  const spots = useMemo(() => loadAllSpots(), []);
  const [skill, setSkill] = useState<SkillLevel>("intermediate");
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("CO");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [coordsLabel, setCoordsLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const countryLabel = useMemo(
    () => SUPPORTED_COUNTRIES.find((c) => c.code === countryCode)?.label ?? "",
    [countryCode]
  );

  const lookupLocation = useCallback(async () => {
    const cityTrim = city.trim();
    if (cityTrim.length < 2) {
      Alert.alert("Enter a city", "Type at least 2 characters for the city name.");
      return;
    }
    setBusy(true);
    try {
      const hit = await searchCityInCountry(cityTrim, countryCode);
      if (!hit) {
        Alert.alert(
          "Not found",
          `No match for “${cityTrim}” in ${countryLabel}. Try another spelling or a larger nearby city.`
        );
        return;
      }
      setCoords({ lat: hit.latitude, lon: hit.longitude });
      const region = hit.admin1 ? `${hit.name}, ${hit.admin1}` : hit.name;
      setCoordsLabel(`${region} · ${hit.country ?? countryLabel}`);
    } catch (e) {
      Alert.alert("Lookup failed", String(e));
    } finally {
      setBusy(false);
    }
  }, [city, countryCode, countryLabel]);

  const findSurf = useCallback(async () => {
    if (!coords) {
      Alert.alert(
        "Set your location",
        "Choose country and city, then tap Look up location."
      );
      return;
    }
    setBusy(true);
    try {
      const out = await computeRecommendation({
        userLat: coords.lat,
        userLon: coords.lon,
        skill,
        allSpots: spots,
      });
      if (!out) {
        Alert.alert(
          "No recommendation",
          "No spots in range or forecasts unavailable. Try a coastal city in Colombia, Costa Rica, Brazil, Dominican Republic, or Peru."
        );
        return;
      }
      navigation.navigate("Result", { best: out.best });
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setBusy(false);
    }
  }, [coords, navigation, skill, spots]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>NomadSurf</Text>
        <Text style={styles.sub}>
          Pick your country and city — we match you to the best break in our
          regional list and today’s best time (local to the spot).
        </Text>
      </View>

      <Text style={styles.section}>Skill level</Text>
      <View style={styles.skillRow}>
        {SKILLS.map((s) => {
          const on = skill === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setSkill(s.key)}
              style={[styles.skillChip, on && styles.skillChipOn]}
            >
              <Text style={[styles.skillLabel, on && styles.skillLabelOn]}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {SKILLS.find((x) => x.key === skill)?.hint}
      </Text>

      <Text style={styles.section}>Your location</Text>
      <Text style={styles.fieldLabel}>Country</Text>
      <View style={styles.countryRow}>
        {SUPPORTED_COUNTRIES.map((c) => {
          const on = countryCode === c.code;
          return (
            <Pressable
              key={c.code}
              onPress={() => {
                setCountryCode(c.code);
                setCoords(null);
                setCoordsLabel(null);
              }}
              style={[styles.countryChip, on && styles.countryChipOn]}
            >
              <Text
                style={[styles.countryChipLabel, on && styles.countryChipLabelOn]}
                numberOfLines={1}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.fieldLabel, styles.cityLabel]}>City</Text>
      <TextInput
        style={styles.cityInput}
        placeholder="e.g. Cartagena, San José, Rio de Janeiro"
        placeholderTextColor="#6b7a85"
        value={city}
        onChangeText={(t) => {
          setCity(t);
          setCoords(null);
          setCoordsLabel(null);
        }}
        autoCapitalize="words"
        editable={!busy}
        onSubmitEditing={lookupLocation}
        returnKeyType="search"
      />

      <Pressable
        style={[styles.lookupBtn, busy && styles.btnDisabled]}
        onPress={lookupLocation}
        disabled={busy}
      >
        <Text style={styles.lookupBtnText}>Look up location</Text>
      </Pressable>

      {coords ? (
        <Text style={styles.coords}>
          Using: {coordsLabel}
          {"\n"}
          {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
        </Text>
      ) : (
        <Text style={styles.coordsMuted}>
          Choose country, enter city, then look up.
        </Text>
      )}

      <Pressable
        style={[styles.cta, busy && styles.btnDisabled]}
        onPress={findSurf}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#0a1628" />
        ) : (
          <Text style={styles.ctaText}>Find best surf today</Text>
        )}
      </Pressable>

      <View style={styles.spacer} />

      <Text style={styles.footer}>
        Location: Open-Meteo geocoding (city in selected country). Forecasts:
        Open-Meteo marine + weather. Verify locally before paddling out.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0c1a24", paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#e8f4ff",
    letterSpacing: 0.5,
  },
  sub: { marginTop: 8, color: "#9db3c4", fontSize: 15, lineHeight: 22 },
  section: {
    color: "#7dd3fc",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  fieldLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
  },
  cityLabel: { marginTop: 16 },
  skillRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#132633",
    borderWidth: 1,
    borderColor: "#1f3a4d",
  },
  skillChipOn: {
    backgroundColor: "#38bdf8",
    borderColor: "#7dd3fc",
  },
  skillLabel: { color: "#cbd5e1", fontWeight: "600" },
  skillLabelOn: { color: "#0c1a24" },
  hint: { marginTop: 10, color: "#7a8f9f", fontSize: 14 },
  countryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  countryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#132633",
    borderWidth: 1,
    borderColor: "#1f3a4d",
    maxWidth: "48%",
    flexGrow: 1,
  },
  countryChipOn: {
    backgroundColor: "#164e63",
    borderColor: "#38bdf8",
  },
  countryChipLabel: { color: "#cbd5e1", fontSize: 13, fontWeight: "600" },
  countryChipLabelOn: { color: "#e0f2fe" },
  cityInput: {
    backgroundColor: "#132633",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#e8f4ff",
    borderWidth: 1,
    borderColor: "#1f3a4d",
    fontSize: 16,
  },
  lookupBtn: {
    marginTop: 12,
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  lookupBtnText: { color: "#e2e8f0", fontWeight: "700", fontSize: 16 },
  coords: { marginTop: 14, color: "#bae6fd", fontSize: 14, lineHeight: 20 },
  coordsMuted: { marginTop: 14, color: "#5c6f7e", fontSize: 14 },
  cta: {
    marginTop: 28,
    backgroundColor: "#fbbf24",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  ctaText: { color: "#0c1a24", fontWeight: "800", fontSize: 17 },
  btnDisabled: { opacity: 0.55 },
  spacer: { flex: 1, minHeight: 20 },
  footer: {
    marginBottom: 12,
    color: "#5c6f7e",
    fontSize: 11,
    lineHeight: 16,
  },
});
