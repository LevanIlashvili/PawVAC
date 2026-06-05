// Timeline tab — pet header, risk chips, reminder banner. (Feed + FAB added in later commits.)
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PETS, nextReminder, eventsFor } from "@/data/mock";
import { Chip } from "@/ui/primitives";
import { EventRow } from "@/ui/EventRow";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Timeline() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = PETS.find((p) => p.id === petId) ?? PETS[0];
  const reminder = nextReminder(pet.id);
  const signalment = [pet.species, pet.breed, pet.ageLabel, pet.weightKg && `${pet.weightKg} kg`].filter(Boolean).join(" · ");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={{ fontSize: 30 }}>{pet.emoji}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={type.title}>{pet.name}</Text>
          <Text style={type.body}>{signalment}</Text>
          {pet.riskFlags.length > 0 && (
            <View style={s.chips}>
              {pet.riskFlags.map((f) => <Chip key={f} label={`⚑ ${f}`} />)}
            </View>
          )}
        </View>
      </View>

      {reminder && (
        <Pressable onPress={() => router.push(`/pet/${pet.id}/reminders`)} style={s.banner}>
          <Text style={s.bannerText}>⏰ Next: {reminder.title} · {reminder.nextLabel}</Text>
        </Pressable>
      )}

      <View style={s.sectionRow}>
        <Text style={type.heading}>Timeline</Text>
        <Text style={s.filter}>filter ▾</Text>
      </View>

      <View style={s.feed}>
        {eventsFor(pet.id).map((e) => (
          <EventRow key={e.id} event={e} onPress={() => router.push(`/event/${e.id}`)} />
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14 },
  avatar: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  banner: { marginHorizontal: 14, marginBottom: 6, backgroundColor: colors.accentTint, borderWidth: 1, borderColor: colors.accentTint2, borderRadius: radius.card, paddingVertical: 11, paddingHorizontal: 13, ...shadowCard },
  bannerText: { color: colors.accent, fontSize: 13, fontWeight: "500" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 },
  filter: { color: colors.accent, fontSize: 13, fontWeight: "500" },
  feed: { paddingHorizontal: 14, gap: 10 },
});
