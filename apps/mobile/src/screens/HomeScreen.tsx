import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SkillLevel } from "@nomadsurf/core";
import {
  citiesForCountry,
  type PicklistCity,
} from "../constants/citiesByCountry";
import {
  SUPPORTED_COUNTRIES,
  type SupportedCountryCode,
} from "../constants/supportedCountries";
import { computeRecommendation } from "../logic/recommendation";
import type { RootStackParamList } from "../navigation/types";
import { loadAllSpots } from "../spots/loadSpots";
import { colors, radii, shadowCard, shadowCta } from "../theme";

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
  const [selectedCity, setSelectedCity] = useState<PicklistCity | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [coordsLabel, setCoordsLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  const countryLabel = useMemo(
    () => SUPPORTED_COUNTRIES.find((c) => c.code === countryCode)?.label ?? "",
    [countryCode]
  );

  const cityOptions = useMemo(
    () => citiesForCountry(countryCode),
    [countryCode]
  );

  const applyPicklistCity = useCallback(
    (city: PicklistCity) => {
      setSelectedCity(city);
      setCoords({ lat: city.latitude, lon: city.longitude });
      setCoordsLabel(`${city.label} · ${countryLabel}`);
    },
    [countryLabel]
  );

  const findSurf = useCallback(async () => {
    if (!coords) {
      Alert.alert(
        "Set your location",
        "Choose a country and a city from the lists."
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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleAccent} />
            <Text style={styles.title}>NomadSurf</Text>
          </View>
          <Text style={styles.sub}>
            Pick your country and city from the lists — we match you to the best
            break in our regional list and today’s best time (local to the spot).
          </Text>
        </View>

        <Text style={styles.section}>Skill level</Text>
        <View style={styles.skillShell}>
          <View style={styles.skillRow}>
            {SKILLS.map((s) => {
              const on = skill === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setSkill(s.key)}
                  style={({ pressed }) => [
                    styles.skillChip,
                    on && styles.skillChipOn,
                    pressed && !on && styles.skillChipPressed,
                  ]}
                >
                  <Text style={[styles.skillLabel, on && styles.skillLabelOn]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Text style={styles.hint}>
          {SKILLS.find((x) => x.key === skill)?.hint}
        </Text>

        <Text style={styles.section}>Your location</Text>
        <Text style={styles.fieldLabel}>Country</Text>
        <Pressable
          style={styles.countrySelect}
          onPress={() => setCountryPickerOpen(true)}
          disabled={busy}
        >
          <Text style={styles.countrySelectText} numberOfLines={1}>
            {countryLabel || "Select country"}
          </Text>
          <Text style={styles.countrySelectChevron}>▼</Text>
        </Pressable>

        <Modal
          visible={countryPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCountryPickerOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setCountryPickerOpen(false)}
              accessibilityLabel="Dismiss country picker"
            />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Country</Text>
              {SUPPORTED_COUNTRIES.map((c) => {
                const selected = countryCode === c.code;
                return (
                  <Pressable
                    key={c.code}
                    style={[styles.modalRow, selected && styles.modalRowSelected]}
                    onPress={() => {
                      setCountryCode(c.code);
                      setSelectedCity(null);
                      setCoords(null);
                      setCoordsLabel(null);
                      setCountryPickerOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalRowLabel,
                        selected && styles.modalRowLabelSelected,
                      ]}
                    >
                      {c.label}
                    </Text>
                    {selected ? (
                      <Text style={styles.modalRowCheck}>✓</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Modal>

        <Text style={[styles.fieldLabel, styles.cityLabel]}>City</Text>
        <Pressable
          style={styles.countrySelect}
          onPress={() => setCityPickerOpen(true)}
          disabled={busy}
        >
          <Text
            style={[
              styles.countrySelectText,
              !selectedCity && styles.countrySelectPlaceholder,
            ]}
            numberOfLines={1}
          >
            {selectedCity?.label ?? "Select city"}
          </Text>
          <Text style={styles.countrySelectChevron}>▼</Text>
        </Pressable>

        <Modal
          visible={cityPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCityPickerOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setCityPickerOpen(false)}
              accessibilityLabel="Dismiss city picker"
            />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>City · {countryLabel}</Text>
              <ScrollView
                style={styles.cityModalScroll}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {cityOptions.map((c) => {
                  const selected = selectedCity?.id === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      style={[
                        styles.modalRow,
                        selected && styles.modalRowSelected,
                      ]}
                      onPress={() => {
                        applyPicklistCity(c);
                        setCityPickerOpen(false);
                      }}
                    >
                      <View style={styles.modalCityTextBlock}>
                        <Text
                          style={[
                            styles.modalRowLabel,
                            selected && styles.modalRowLabelSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {c.label}
                        </Text>
                        {c.subtitle ? (
                          <Text style={styles.modalCitySub} numberOfLines={1}>
                            {c.subtitle}
                          </Text>
                        ) : null}
                      </View>
                      {selected ? (
                        <Text style={styles.modalRowCheck}>✓</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {coords ? (
          <Text style={styles.coords}>
            Using: {coordsLabel}
            {"\n"}
            {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.coordsMuted}>
            Choose a country and city from the lists.
          </Text>
        )}

        <Pressable
          style={[styles.cta, busy && styles.btnDisabled]}
          onPress={findSurf}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.ctaText} />
          ) : (
            <Text style={styles.ctaText}>Find best surf today</Text>
          )}
        </Pressable>

        <Text style={styles.footer}>
          City coordinates are preset for each place. Forecasts: Open-Meteo
          marine + weather. Verify locally before paddling out.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgScreen },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 28,
  },
  header: { marginBottom: 26 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  titleAccent: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.8,
  },
  sub: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  section: {
    color: colors.kicker,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 12,
    marginTop: 4,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  cityLabel: { marginTop: 18 },
  skillShell: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
    ...shadowCard,
  },
  skillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: radii.md,
    backgroundColor: "transparent",
  },
  skillChipPressed: { backgroundColor: colors.surfaceHover },
  skillChipOn: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  skillLabel: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  skillLabelOn: { color: colors.accentTextOn },
  hint: { marginTop: 12, color: colors.textSubtle, fontSize: 14, lineHeight: 20 },
  countrySelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countrySelectText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
    fontWeight: "500",
  },
  countrySelectPlaceholder: {
    color: colors.textSubtle,
    fontWeight: "400",
  },
  countrySelectChevron: {
    color: colors.accent,
    fontSize: 11,
    opacity: 0.9,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    backgroundColor: "#0f1419",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    maxHeight: "72%",
    width: "100%",
    alignSelf: "center",
    ...shadowCard,
  },
  modalTitle: {
    color: colors.kicker,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  modalRowSelected: { backgroundColor: colors.accentSoft },
  modalRowLabel: { color: colors.textSecondary, fontSize: 16, fontWeight: "600" },
  modalRowLabelSelected: { color: colors.text },
  modalRowCheck: { color: colors.accent, fontSize: 18, fontWeight: "700" },
  cityModalScroll: { maxHeight: 420 },
  modalCityTextBlock: { flex: 1, marginRight: 10, minWidth: 0 },
  modalCitySub: {
    marginTop: 3,
    color: colors.textSubtle,
    fontSize: 13,
    fontWeight: "500",
  },
  coords: {
    marginTop: 16,
    color: colors.kicker,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  coordsMuted: { marginTop: 16, color: colors.textSubtle, fontSize: 14 },
  cta: {
    marginTop: 30,
    backgroundColor: colors.cta,
    paddingVertical: 17,
    borderRadius: radii.lg,
    alignItems: "center",
    ...shadowCta,
  },
  ctaText: { color: colors.ctaText, fontWeight: "800", fontSize: 17, letterSpacing: -0.2 },
  btnDisabled: { opacity: 0.5 },
  footer: {
    marginTop: 32,
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 17,
  },
});
