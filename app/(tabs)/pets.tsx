// Pets tab — the active pet's detail: header card, risk chips, reminder banner, timeline feed.
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useActivePet, useNextReminder, useEventsFor } from "@/store/app";
import { Screen } from "@/ui/Screen";
import { Chip } from "@/ui/primitives";
import { EventRow } from "@/ui/EventRow";
import { EntryFab } from "@/ui/EntryFab";
import { Icon, speciesIcon, ui } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Pets() {
  const pet = useActivePet();
  const reminder = useNextReminder(pet?.id ?? "");
  const events = useEventsFor(pet?.id ?? "");
  if (!pet) return <Screen title="Pets"><View /></Screen>;
  const signalment = [pet.species, pet.breed, pet.ageLabel, pet.weightKg && `${pet.weightKg} kg`].filter(Boolean).join(" · ");

  return (
    <Screen title={pet.name} scroll={false}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={s.header}>
          <View style={s.avatar}><Icon name={speciesIcon[pet.species]} size={30} color={colors.accent} /></View>
          <View style={{ flex: 1 }}>
            <Text style={[type.body, { textTransform: "capitalize" }]}>{signalment}</Text>
            {pet.riskFlags.length > 0 && (
              <View style={s.chips}>
                {pet.riskFlags.map((f) => <Chip key={f} label={f} icon={ui.riskFlag} />)}
              </View>
            )}
          </View>
        </View>

        {reminder && (
          <Pressable onPress={() => router.push("/reminders")} style={s.banner}>
            <Icon name={ui.reminder} size={16} color={colors.accent} />
            <Text style={s.bannerText}>Next: {reminder.title} · {reminder.nextLabel}</Text>
          </Pressable>
        )}

        <Pressable onPress={() => router.push("/pack")} style={s.packLink}>
          <Icon name="file-document" size={16} color={colors.accent} />
          <Text style={s.packText}>Vet Visit Pack</Text>
          <Icon name="chevron-right" size={16} color={colors.muted} />
        </Pressable>

        <View style={s.sectionRow}>
          <Text style={type.heading}>Timeline</Text>
          <View style={s.filter}>
            <Text style={s.filterText}>filter</Text>
            <Icon name="chevron-down" size={14} color={colors.accent} />
          </View>
        </View>

        <View style={s.feed}>
          {events.map((e) => (
            <EventRow key={e.id} event={e} onPress={() => router.push(`/event/${e.id}`)} />
          ))}
        </View>
      </ScrollView>
      <EntryFab petId={pet.id} petName={pet.name} />
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", gap: 12, alignItems: "center", paddingHorizontal: 14, paddingTop: 12 },
  avatar: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 14, marginTop: 10, backgroundColor: colors.accentTint, borderWidth: 1, borderColor: colors.accentTint2, borderRadius: radius.card, paddingVertical: 11, paddingHorizontal: 13, ...shadowCard },
  bannerText: { ...type.bodyMedium, color: colors.accent },
  packLink: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 14, marginTop: 8, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, paddingVertical: 11, paddingHorizontal: 13, ...shadowCard },
  packText: { ...type.bodyMedium, flex: 1 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  filter: { flexDirection: "row", alignItems: "center", gap: 2 },
  filterText: { ...type.bodyMedium, color: colors.accent, fontSize: 13 },
  feed: { paddingHorizontal: 14, gap: 9 },
});
