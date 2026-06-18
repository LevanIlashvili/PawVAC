// Event detail — full record of one timeline event: kind, summary, source/provenance,
// confidence, and correct/delete actions. Correcting appends a new event (audit trail).
import { Alert, Text, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { EventSource } from "@/data/types";
import { useApp, useEventById, usePetById } from "@/store/app";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon, kindIcon } from "@/ui/icons";
import { KIND_LABEL } from "@/ui/kindForms";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

const SOURCE_LABEL: Record<EventSource, string> = {
  voice: "Voice (whisper)", ocr: "Document scan (OCR)", photo: "Photo (vision)",
  manual: "Entered manually", agent: "AI assistant",
};
const CONFIDENCE: Partial<Record<EventSource, string>> = { voice: "86%", ocr: "91%", photo: "78%" };

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const event = useEventById(eventId);
  const pet = usePetById(event?.petId ?? "");
  const deleteEvent = useApp((s) => s.deleteEvent);

  if (!event) {
    return (
      <DetailScreen title="Event">
        <Text style={type.body}>This event no longer exists.</Text>
      </DetailScreen>
    );
  }

  const confidence = CONFIDENCE[event.source];

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );

  return (
    <DetailScreen title={KIND_LABEL[event.kind]}>
      <View style={s.titleRow}>
        <View style={s.iconWrap}><Icon name={kindIcon[event.kind]} size={22} color={colors.accent} /></View>
        <View style={{ flex: 1 }}>
          <Text style={type.title}>{KIND_LABEL[event.kind]}</Text>
          <Text style={type.caption}>{pet?.name} · {event.dateLabel}</Text>
        </View>
      </View>

      <Card style={s.card}>
        <Text style={s.summary}>{event.summary}</Text>
      </Card>

      <Card style={[s.card, { marginTop: 12 }]}>
        <Row label="Source" value={SOURCE_LABEL[event.source]} />
        {confidence ? <Row label="Confidence" value={confidence} /> : null}
        <Row label="Status" value={event.confirmed ? "Confirmed" : "Pending confirmation"} />
      </Card>


      <View style={s.actions}>
        <Button title="Correct" variant="ghost" style={{ flex: 1 }} onPress={() => router.push(`/add-event?correctId=${event.id}`)} />
        <Button title="Delete" variant="ghost" style={[{ flex: 1 }, s.delete]}
          onPress={() => Alert.alert("Delete event?", "The original is kept in the record; this appends a deletion.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => { deleteEvent(event.id); router.back(); } },
          ])} />
      </View>
      <Text style={s.note}>Correcting appends a new event — the original is kept for the record.</Text>
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  card: { padding: 14 },
  summary: { ...type.body, color: colors.ink, fontSize: 15, lineHeight: 22 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  detailLabel: { ...type.caption },
  detailValue: { ...type.bodyMedium },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  delete: { borderColor: "#f7c4ca" },
  note: { ...type.caption, textAlign: "center", marginTop: 10 },
});
