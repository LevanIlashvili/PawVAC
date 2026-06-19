// Settings — on-device models, privacy, the offline self-test, and the AI audit log export.
import { Alert, Text, View, StyleSheet } from "react-native";
import * as Sharing from "expo-sharing";
import { useActivePet } from "@/store/app";
import { preScan } from "@/ai/guardian";
import { auditEntries, auditFileUri } from "@/ai/audit";
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

  // Export the structured AI audit log (model loads + inference perf: TTFT, tokens/sec, …).
  const exportAudit = async () => {
    const entries = auditEntries();
    if (entries.length === 0) { Alert.alert("Audit log", "No AI activity recorded yet. Run an Ask first."); return; }
    const inf = entries.filter((e) => e.kind === "inference");
    const summary = inf.slice(-3).map((e) =>
      `• ${e.band ?? "?"} — ${e.promptTokens ?? "?"}→${e.generatedTokens ?? "?"} tok, TTFT ${e.timeToFirstTokenMs ?? "?"}ms, ${e.tokensPerSecond?.toFixed?.(1) ?? "?"} tok/s, ${e.totalMs}ms`
    ).join("\n");
    const uri = auditFileUri();
    try {
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { mimeType: "application/x-ndjson", dialogTitle: "PawVac AI audit log" });
      } else {
        Alert.alert("AI audit log", `${entries.length} entries (${inf.length} inferences)\n\nLatest:\n${summary || "—"}`);
      }
    } catch {
      Alert.alert("AI audit log", `${entries.length} entries (${inf.length} inferences)\n\nLatest:\n${summary || "—"}`);
    }
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

      <Text style={[type.label, s.section]}>Diagnostics</Text>
      <Button title="Export AI audit log" variant="ghost" onPress={exportAudit} />
      <Text style={s.note}>Model loads + per-inference performance (prompt, tokens, TTFT, tokens/sec, device) as JSONL.</Text>
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
