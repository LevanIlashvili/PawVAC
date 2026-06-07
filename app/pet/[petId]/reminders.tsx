// Reminders tab — active reminders for the pet, with snooze/done actions.
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PETS, remindersFor } from "@/data/mock";
import { Button, Card } from "@/ui/primitives";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Reminders() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = PETS.find((p) => p.id === petId) ?? PETS[0];
  const reminders = remindersFor(pet.id);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={[type.title, { marginBottom: 4 }]}>{pet.name} · Reminders</Text>
      <Text style={[type.label, { marginBottom: 12 }]}>Active</Text>

      {reminders.map((r) => (
        <Card key={r.id} style={s.card}>
          <View style={s.row}>
            <Text style={s.icon}>💊</Text>
            <Text style={s.title}>{r.title} · {r.schedule}</Text>
            {r.remainingLabel && <Text style={s.meta}>{r.remainingLabel}</Text>}
          </View>
          <Text style={s.next}>next: {r.nextLabel}</Text>
          <View style={s.actions}>
            <Button title="snooze" variant="ghost" style={{ paddingVertical: 8, paddingHorizontal: 14, flexGrow: 0 }} />
            <Button title="done" style={{ paddingVertical: 8, paddingHorizontal: 14, flexGrow: 0 }} />
          </View>
        </Card>
      ))}

      <Button title="+ New reminder" style={{ marginTop: 14 }} />
      <Text style={s.note}>Fires offline · survives reboot · once per dose</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: { padding: 14, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { fontSize: 18 },
  title: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "500" },
  meta: { color: colors.muted, fontSize: 12 },
  next: { color: colors.dim, fontSize: 12, marginTop: 6 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  note: { color: colors.muted, fontSize: 11.5, textAlign: "center", marginTop: 10 },
});
