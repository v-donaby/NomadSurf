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
  gradientCardWash,
  gradientCoastal,
  gradientScreen,
  gradientWindowBar,
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

const TODAY_STATS: [string, string][] = [
  ["Wave", "3–5 ft"],
  ["Wind", "Offshore"],
  ["Water", "79°F"],
];

export function HomeScreen({ navigation }: Props) {
  const spots = useMemo(() => loadAllSpots(), []);
  const [skill, setSkill] = useState<SkillLevel>("intermediate");
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("CO");
  const [selectedCity, setSelectedCity] = useState<PicklistCity | null>(null);
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
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.gradientHost}>
        <LinearGradient
          colors={[...gradientScreen]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.brand}>NomadSurf</Text>
              <Text style={styles.heroTitle}>Find your next wave</Text>
              <Text style={styles.sub}>
                A surf travel companion with a calm, premium, coastal feel.
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.waveBtn,
                pressed && styles.waveBtnPressed,
              ]}
              accessibilityLabel="Wave"
            >
              <Text style={styles.waveEmoji} accessible={false}>
                🌊
              </Text>
            </Pressable>
          </View>

          <View style={styles.pickCard}>
            <LinearGradient
              colors={[...gradientCardWash]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.pickCardBody}>
              <View style={styles.pickTopRow}>
                <View style={styles.pickTitleBlock}>
                  <Text style={styles.pickKicker}>{"Today's pick"}</Text>
                  <Text style={styles.pickSpot}>Encuentro</Text>
                  <Text style={styles.pickSubline}>
                    Cabarete, Dominican Republic
                  </Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreLabel}>Surf score</Text>
                  <Text style={styles.scoreValue}>92</Text>
                </View>
              </View>
              <View style={styles.statGrid}>
                {TODAY_STATS.map(([label, value]) => (
                  <View key={label} style={styles.statCell}>
                    <Text style={styles.statCellLabel}>{label}</Text>
                    <Text style={styles.statCellValue}>{value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.windowPanel}>
                <View style={styles.windowRow}>
                  <Text style={styles.windowRowMuted}>Best window</Text>
                  <Text style={styles.windowRowAccent}>7:15 AM – 9:00 AM</Text>
                </View>
                <View style={styles.windowTrack}>
                  <LinearGradient
                    colors={[...gradientWindowBar]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.windowFill}
                  />
                </View>
                <Text style={styles.windowBlurb}>
                  Clean morning conditions with light offshore wind and mid tide.
                  Great match for intermediate travelers.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.tripCard}>
            <Text style={styles.section}>Plan your session</Text>
            <Text style={styles.tripLead}>
              {`Pick your country and city — we match you to the best break and today's best window (local to the spot).`}
            </Text>

            <Text style={[styles.section, styles.sectionInCard]}>Skill level</Text>
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

            <Text style={[styles.section, styles.sectionInCard]}>Your location</Text>
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
          </View>
        </ScrollView>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  gradientHost: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  headerCopy: { flex: 1, minWidth: 0, paddingRight: 8 },
  brand: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.cyanBrand,
    textTransform: "uppercase",
    letterSpacing: 3.4,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  sub: {
    marginTop: 8,
    maxWidth: 280,
    color: colors.textSlate300,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
  waveBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadowCard,
  },
  waveBtnPressed: { opacity: 0.88 },
  waveEmoji: { fontSize: 22 },
  pickCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: 24,
    ...shadowCard,
  },
  pickCardBody: {
    padding: 20,
    zIndex: 1,
  },
  pickTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  pickTitleBlock: { flex: 1, minWidth: 0 },
  pickKicker: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.cyanKicker,
    textTransform: "uppercase",
    letterSpacing: 2.6,
  },
  pickSpot: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.4,
  },
  pickSubline: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSlate300,
    fontWeight: "400",
  },
  scoreBadge: {
    borderRadius: radii.md,
    backgroundColor: colors.badgeSurf,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-end",
  },
  scoreLabel: {
    fontSize: 11,
    color: colors.badgeSurfLabel,
    fontWeight: "500",
  },
  scoreValue: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "600",
    color: colors.badgeSurfText,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  statCell: {
    flex: 1,
    minWidth: "28%",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: colors.statInset,
    padding: 12,
  },
  statCellLabel: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: "500",
  },
  statCellValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  windowPanel: {
    marginTop: 20,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceInner,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  windowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  windowRowMuted: {
    fontSize: 14,
    color: colors.textSlate300,
    fontWeight: "400",
  },
  windowRowAccent: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.cyanSoft,
  },
  windowTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  windowFill: {
    width: "66%",
    height: "100%",
    borderRadius: radii.full,
  },
  windowBlurb: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSlate300,
    fontWeight: "400",
  },
  tripCard: {
    marginTop: 0,
    marginBottom: 24,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    ...shadowCard,
  },
  tripLead: {
    marginTop: 4,
    marginBottom: 8,
    color: colors.textSlate300,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionInCard: { marginTop: 18 },
  section: {
    color: colors.cyanKicker,
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
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 6,
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
    borderColor: "rgba(110, 231, 183, 0.35)",
  },
  skillLabel: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  skillLabelOn: { color: colors.badgeSurfText, fontWeight: "700" },
  hint: {
    marginTop: 12,
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
  countrySelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
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
    color: colors.cyanKicker,
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
    marginTop: 24,
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
});
