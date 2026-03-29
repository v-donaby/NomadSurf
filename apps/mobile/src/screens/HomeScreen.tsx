import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  colors,
  gradientCoastal,
  radii,
  shadowCard,
  shadowCta,
} from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const SKILLS: { key: SkillLevel; label: string; hint: string }[] = [
  { key: "beginner", label: "Beginner", hint: "Smaller, gentler conditions" },
  { key: "intermediate", label: "Intermediate", hint: "Moderate swell" },
  { key: "advanced", label: "Advanced", hint: "Larger, more powerful swell" },
];

const EXPLORE_PILLS = ["Travel", "Lifestyle", "Forecast", "Premium"] as const;

export function HomeScreen({ navigation }: Props) {
  const spots = useMemo(() => loadAllSpots(), []);
  const [skill, setSkill] = useState<SkillLevel>("intermediate");
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("CO");
  const [selectedCity, setSelectedCity] = useState<PicklistCity | null>(null);
  const [busy, setBusy] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [explorePill, setExplorePill] =
    useState<(typeof EXPLORE_PILLS)[number]>("Travel");

  const countryLabel = useMemo(
    () => SUPPORTED_COUNTRIES.find((c) => c.code === countryCode)?.label ?? "",
    [countryCode]
  );

  const cityOptions = useMemo(
    () => citiesForCountry(countryCode),
    [countryCode]
  );

  /** Always use the row from the current country list so coords match the open dropdown. */
  const resolvedPicklistCity = useMemo(() => {
    if (!selectedCity) return null;
    return cityOptions.find((c) => c.id === selectedCity.id) ?? null;
  }, [selectedCity, cityOptions]);

  useEffect(() => {
    if (
      selectedCity != null &&
      !cityOptions.some((c) => c.id === selectedCity.id)
    ) {
      setSelectedCity(null);
    }
  }, [selectedCity, cityOptions]);

  const applyPicklistCity = useCallback((city: PicklistCity) => {
    setSelectedCity(city);
  }, []);

  const findSurf = useCallback(async () => {
    if (!resolvedPicklistCity) {
      Alert.alert(
        "Set your location",
        "Choose a country and a city from the lists."
      );
      return;
    }
    setBusy(true);
    try {
      const out = await computeRecommendation({
        userLat: resolvedPicklistCity.latitude,
        userLon: resolvedPicklistCity.longitude,
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
      navigation.navigate("Result", {
        best: out.best,
        referenceLocation: {
          label: resolvedPicklistCity.label,
          subtitle: resolvedPicklistCity.subtitle,
          countryLabel: countryLabel,
          latitude: resolvedPicklistCity.latitude,
          longitude: resolvedPicklistCity.longitude,
        },
      });
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setBusy(false);
    }
  }, [countryLabel, navigation, resolvedPicklistCity, skill, spots]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.topBar}>
            <Text style={styles.brand}>NOMADSURF</Text>
            <Pressable
              style={({ pressed }) => [
                styles.waveBtn,
                pressed && styles.waveBtnPressed,
              ]}
              accessibilityLabel="Wave"
            >
              <Text style={styles.waveBtnIcon} accessible={false}>
                ∿
              </Text>
            </Pressable>
          </View>
          <View style={styles.pillRow}>
            {EXPLORE_PILLS.map((p) => {
              const on = explorePill === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setExplorePill(p)}
                  style={({ pressed }) => [
                    styles.explorePill,
                    on && styles.explorePillOn,
                    pressed && !on && styles.explorePillPressed,
                  ]}
                >
                  <Text
                    style={[styles.explorePillText, on && styles.explorePillTextOn]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.heroTitle}>Find your next wave</Text>
          <Text style={styles.sub}>
            Pick your country and city — we match you to the best break in our
            list and today’s best window (local to the spot).
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
              !resolvedPicklistCity && styles.countrySelectPlaceholder,
            ]}
            numberOfLines={1}
          >
            {resolvedPicklistCity?.label ?? "Select city"}
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
                  const selected = resolvedPicklistCity?.id === c.id;
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

        <Pressable
          style={[styles.ctaWrap, busy && styles.btnDisabled]}
          onPress={findSurf}
          disabled={busy}
        >
          <LinearGradient
            colors={[...gradientCoastal]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ctaGradient}
          >
            {busy ? (
              <ActivityIndicator color={colors.ctaText} />
            ) : (
              <Text style={styles.ctaText}>Find best surf today</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={styles.footer}>
          Forecasts: Open-Meteo marine + weather. Verify locally before paddling
          out.
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
  header: { marginBottom: 28 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 3.2,
  },
  waveBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadowCard,
  },
  waveBtnPressed: { opacity: 0.85 },
  waveBtnIcon: {
    fontSize: 22,
    color: colors.accent,
    fontWeight: "300",
    marginTop: 2,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  explorePill: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  explorePillPressed: { backgroundColor: colors.surfaceHover },
  explorePillOn: {
    backgroundColor: colors.chipOn,
    borderColor: colors.chipOnBorder,
  },
  explorePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  explorePillTextOn: { color: colors.text },
  heroTitle: {
    marginTop: 28,
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.9,
    lineHeight: 38,
  },
  sub: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
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
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    padding: 6,
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
    backgroundColor: colors.badgeSurf,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.35)",
  },
  skillLabel: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  skillLabelOn: { color: colors.badgeSurfText, fontWeight: "700" },
  hint: { marginTop: 12, color: colors.textSubtle, fontSize: 14, lineHeight: 20 },
  countrySelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.borderGlass,
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
    color: colors.textMuted,
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
    backgroundColor: colors.bgElevated,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.borderGlass,
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
  ctaWrap: {
    marginTop: 30,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadowCta,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  ctaText: {
    color: colors.ctaText,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: -0.2,
  },
  btnDisabled: { opacity: 0.5 },
  footer: {
    marginTop: 32,
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 17,
  },
});
