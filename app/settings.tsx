// Settings — on-device models, privacy, and the offline self-test. No account, nothing leaves the phone.
import { Alert, Text, View, StyleSheet } from "react-native";
import { useActivePet } from "@/store/app";
import { preScan } from "@/ai/guardian";
import { listEvents } from "@/db/repo";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon } from "@/ui/icons";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

const MODELS = [
  { name: "MedGemma-4B", detail: "clinician · 2.6 GB" },
  { name: "Whisper", detail: "voice → text" },
  { name: "EmbeddingGemma", detail: "memory / search" },
  { name: "OCR + Vision", detail: "document scan" },
];

export default function Settings() {
  const pet = useActivePet();

  // Real, no-network self-test: the local DB read + the deterministic safety floor both
  // execute fully offline. (The model path also runs offline once downloaded; this proves
  // the two pieces that never need the network.)
  const runSelfTest = () => {
    const checks: string[] = [];
    try {
      const n = pet ? listEvents(pet.id).length : 0;
      checks.push(`✓ Local record readable (${n} events)`);
    } catch { checks.push("✗ Local record read failed"); }
    if (pet) {
      const trip = preScan("ate chocolate", { ...pet, species: "dog" });
      checks.push(trip.trip && trip.band === "vet_urgent" ? "✓ Safety floor fires offline (toxin → URGENT)" : "✗ Safety floor did not fire");
    }
    Alert.alert("Offline self-test", `${checks.join("\n")}\n\nAll on-device — no network used.`);
  };

  return (
    <DetailScreen title="Settings">
      <Text style={[type.label, s.section]}>On-device models</Text>
      <Card style={s.card}>
        {MODELS.map((m, i) => (
          <View key={m.name} style={[s.modelRow, i > 0 && s.divider]}>
            <Icon name="cube-outline" size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={type.bodyMedium}>{m.name}</Text>
              <Text style={type.caption}>{m.detail}</Text>
            </View>
            <Icon name="check-circle" size={16} color={colors.bandHome} />
          </View>
        ))}
      </Card>

      <Text style={[type.label, s.section]}>Privacy</Text>
      <Card style={s.privacyCard}>
        <View style={s.privacyRow}>
          <Icon name="shield-check" size={18} color={colors.bandHome} />
          <Text style={s.privacyText}>Nothing leaves this phone. No account. No cloud.</Text>
        </View>
      </Card>
      <Button title="Run offline self-test" variant="ghost" style={{ marginTop: 12 }} onPress={runSelfTest} />
      <Text style={s.note}>Checks the local record + deterministic safety floor run with no network.</Text>
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 8, marginBottom: 8 },
  card: { padding: 4 },
  modelRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.line },
  privacyCard: { padding: 14 },
  privacyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  privacyText: { ...type.bodyMedium, flex: 1 },
  note: { ...type.caption, marginTop: 10, lineHeight: 18 },
});
