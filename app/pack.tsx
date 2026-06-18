// Vet Visit Pack — a shareable summary built from the active pet's real record, exportable
// as a PDF via the native share sheet (expo-print + expo-sharing), generated on-device.
import { Alert, Text, View, StyleSheet } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useActivePet, useEventsFor, useRemindersFor } from "@/store/app";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { colors } from "@/ui/theme";
import { type, FONT } from "@/ui/type";

export default function Pack() {
  const pet = useActivePet();
  const events = useEventsFor(pet?.id ?? "");
  const reminders = useRemindersFor(pet?.id ?? "");
  if (!pet) return <DetailScreen title="Vet Visit Pack"><Text style={type.body}>No pet selected.</Text></DetailScreen>;

  const signalment = [pet.species, pet.breed, pet.ageLabel, pet.weightKg && `${pet.weightKg} kg`].filter(Boolean).join(" · ");
  const recent = events.slice(0, 8);
  const meds = reminders.filter((r) => /clind|mg|pill|dose|daily|day/i.test(`${r.title} ${r.schedule}`));

  const Line = ({ label, value }: { label: string; value: string }) => (
    <Text style={s.line}><Text style={s.lineLabel}>{label}: </Text>{value}</Text>
  );

  const html = () => `
    <html><head><meta name="viewport" content="width=device-width"/>
    <style>body{font-family:-apple-system,Roboto,sans-serif;padding:24px;color:#0B0B0B}
    h1{color:#E8853F;font-size:20px;margin:0 0 2px} .sig{color:#5C5C5C;margin:0 0 16px}
    h2{font-size:13px;color:#5C5C5C;margin:16px 0 4px;text-transform:uppercase}
    li{margin:2px 0;font-size:13px} .foot{color:#8F8F8F;font-size:11px;margin-top:24px}</style></head>
    <body><h1>${pet.name}</h1><p class="sig">${signalment}</p>
    <h2>Recent events</h2><ul>${recent.map((e) => `<li>${e.dateLabel} — ${e.kind}: ${e.summary}</li>`).join("") || "<li>none</li>"}</ul>
    <h2>Current reminders / meds</h2><ul>${meds.map((r) => `<li>${r.title} · ${r.schedule} (next: ${r.nextLabel})</li>`).join("") || "<li>none</li>"}</ul>
    <p class="foot">Generated on-device by PawVac · nothing left this phone.</p></body></html>`;

  const exportPdf = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: html() });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `${pet.name} — Vet Visit Pack` });
      else Alert.alert("Saved", `PDF generated at ${uri}`);
    } catch (e) {
      Alert.alert("Export failed", e instanceof Error ? e.message : "Could not generate the PDF.");
    }
  };

  return (
    <DetailScreen title={`Vet Visit Pack · ${pet.name}`}>
      <Card style={s.preview}>
        <Text style={s.petName}>{pet.name} — {signalment}</Text>
        <Text style={s.section}>Recent events</Text>
        {recent.length ? recent.map((e) => <Line key={e.id} label={e.dateLabel} value={`${e.kind}: ${e.summary}`} />) : <Text style={s.muted}>none yet</Text>}
        <Text style={s.section}>Reminders / meds</Text>
        {meds.length ? meds.map((r) => <Line key={r.id} label={r.title} value={`${r.schedule} · next ${r.nextLabel}`} />) : <Text style={s.muted}>none</Text>}
      </Card>

      <View style={s.actions}>
        <Button title="Export / Share PDF" style={{ flex: 1 }} onPress={exportPdf} />
      </View>
      <Text style={s.note}>Generated on-device · nothing leaves the phone unless you share it</Text>
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  preview: { padding: 14 },
  petName: { color: colors.ink, fontFamily: FONT.semibold, fontSize: 14, marginBottom: 4 },
  section: { ...type.label, marginTop: 12, marginBottom: 4 },
  line: { color: colors.ink, fontSize: 12.5, lineHeight: 22, fontFamily: FONT.regular },
  lineLabel: { fontFamily: FONT.semibold },
  muted: { ...type.caption },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  note: { color: colors.muted, fontSize: 11.5, textAlign: "center", marginTop: 10, fontFamily: FONT.regular },
});
