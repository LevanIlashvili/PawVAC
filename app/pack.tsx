// Vet Visit Pack — preview of the shareable summary + export/share. Reached from a pet's screen.
import { Alert, Text, View, StyleSheet } from "react-native";
import { useActivePet } from "@/store/app";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { colors } from "@/ui/theme";
import { type, FONT } from "@/ui/type";

export default function Pack() {
  const pet = useActivePet();
  const signalment = [pet.species, pet.breed, pet.ageLabel, pet.weightKg && `${pet.weightKg} kg`].filter(Boolean).join(" · ");

  const Line = ({ label, value }: { label: string; value: string }) => (
    <Text style={s.line}><Text style={s.lineLabel}>{label}: </Text>{value}</Text>
  );

  return (
    <DetailScreen title={`Vet Visit Pack · ${pet.name}`}>
      <Card style={s.preview}>
        <Text style={s.petName}>{pet.name} — {signalment}</Text>
        <Line label="Active problems" value="rear-left limb (osteomyelitis hx)" />
        <Line label="Current meds" value='Clindamycin (transcribed "150 mg" BID)' />
        <Line label="Recent symptoms" value="limping + off food (today)" />
        <Line label="Last labs" value="CBC WBC 14.2 (Mar '24)" />
        <Line label="Open questions" value="rule out bloat; same limb?" />
      </Card>

      <Text style={[type.label, { marginTop: 14 }]}>Range</Text>
      <View style={s.range}><Text style={{ color: colors.ink, fontFamily: FONT.regular }}>last 90 days ▾</Text></View>

      <View style={s.actions}>
        <Button title="Export PDF" style={{ flex: 1 }} onPress={() => Alert.alert("Export PDF", "Generates the pack as a PDF on-device. Wires up in Phase 2.")} />
        <Button title="Share" variant="ghost" style={{ flex: 1 }} onPress={() => Alert.alert("Share", "Opens the native share sheet. Wires up in Phase 2.")} />
      </View>
      <Text style={s.note}>Generated on-device · nothing leaves the phone</Text>
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  preview: { padding: 14 },
  petName: { color: colors.ink, fontFamily: FONT.semibold, fontSize: 14, marginBottom: 8 },
  line: { color: colors.ink, fontSize: 12.5, lineHeight: 22, fontFamily: FONT.regular },
  lineLabel: { fontFamily: FONT.semibold },
  range: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 11, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  note: { color: colors.muted, fontSize: 11.5, textAlign: "center", marginTop: 10, fontFamily: FONT.regular },
});
