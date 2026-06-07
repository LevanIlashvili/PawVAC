// Vet Visit Pack tab — preview of the shareable summary + export/share.
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PETS } from "@/data/mock";
import { Button, Card } from "@/ui/primitives";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Pack() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = PETS.find((p) => p.id === petId) ?? PETS[0];
  const signalment = [pet.species, pet.breed, pet.ageLabel, pet.weightKg && `${pet.weightKg} kg`].filter(Boolean).join(" · ");

  const Line = ({ label, value }: { label: string; value: string }) => (
    <Text style={s.line}><Text style={s.lineLabel}>{label}: </Text>{value}</Text>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={[type.title, { marginBottom: 10 }]}>Vet Visit Pack · {pet.name}</Text>

      <Card style={s.preview}>
        <Text style={s.petName}>{pet.name} — {signalment}</Text>
        <Line label="Active problems" value="rear-left limb (osteomyelitis hx)" />
        <Line label="Current meds" value='Clindamycin (transcribed "150 mg" BID)' />
        <Line label="Recent symptoms" value="limping + off food (today)" />
        <Line label="Last labs" value="CBC WBC 14.2 (Mar '24)" />
        <Line label="Open questions" value="rule out bloat; same limb?" />
      </Card>

      <Text style={[type.label, { marginTop: 14 }]}>Range</Text>
      <View style={s.range}><Text style={{ color: colors.ink }}>last 90 days ▾</Text></View>

      <View style={s.actions}>
        <Button title="Export PDF" style={{ flex: 1 }} />
        <Button title="Share" variant="ghost" style={{ flex: 1 }} />
      </View>
      <Text style={s.note}>Generated on-device · nothing leaves the phone</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  preview: { padding: 14 },
  petName: { color: colors.ink, fontWeight: "600", fontSize: 14, marginBottom: 8 },
  line: { color: colors.ink, fontSize: 12.5, lineHeight: 22 },
  lineLabel: { fontWeight: "600" },
  range: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 11, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  note: { color: colors.muted, fontSize: 11.5, textAlign: "center", marginTop: 10 },
});
