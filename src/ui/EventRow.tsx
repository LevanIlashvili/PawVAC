// One timeline row: kind icon, summary, date, provenance badge + confirmed state.
import { Pressable, Text, View, StyleSheet } from "react-native";
import { TimelineEvent, EventKind, EventSource } from "@/data/types";
import { colors, radius, shadowSoft } from "./theme";

const KIND_ICON: Record<EventKind, string> = {
  weight: "⚖️", meal: "🍽️", symptom: "🩹", medication: "💊", vaccine: "💉",
  vet_visit: "🏥", lab_result: "🧪", note: "📝", document: "📄", triage: "❓",
};

const SOURCE_LABEL: Record<EventSource, string> = {
  voice: "🎤 voice", ocr: "📷 scan", photo: "📷 photo", manual: "✍️ manual", agent: "🤖 ai",
};

export function EventRow({ event, onPress }: { event: TimelineEvent; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.row}>
      <View style={s.r1}>
        <Text style={s.icon}>{KIND_ICON[event.kind]}</Text>
        <Text style={s.summary} numberOfLines={2}>{event.summary}</Text>
        <Text style={s.date}>{event.dateLabel}</Text>
      </View>
      <View style={s.r2}>
        <Text style={s.badge}>{SOURCE_LABEL[event.source]}</Text>
        <Text style={s.badge}>{event.confirmed ? "✓ confirmed" : "⏳ pending"}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.product, paddingVertical: 12, paddingHorizontal: 14, ...shadowSoft },
  r1: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { fontSize: 18 },
  summary: { flex: 1, fontSize: 14, color: colors.ink },
  date: { fontSize: 12, color: colors.muted },
  r2: { flexDirection: "row", gap: 10, marginTop: 4 },
  badge: { fontSize: 11, color: colors.muted },
});
