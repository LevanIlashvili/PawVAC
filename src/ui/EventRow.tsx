// One timeline row: kind icon, summary, date, provenance badge + confirmed state.
import { Pressable, Text, View, StyleSheet } from "react-native";
import { TimelineEvent, EventSource } from "@/data/types";
import { colors, radius, shadowSoft } from "./theme";
import { Icon, kindIcon } from "./icons";
import { type } from "./type";

const SOURCE: Record<EventSource, { icon: Parameters<typeof Icon>[0]["name"]; label: string }> = {
  voice: { icon: "microphone", label: "voice" },
  ocr: { icon: "camera", label: "scan" },
  photo: { icon: "image", label: "photo" },
  manual: { icon: "pencil", label: "manual" },
  agent: { icon: "robot", label: "ai" },
};

export function EventRow({ event, onPress }: { event: TimelineEvent; onPress?: () => void }) {
  const src = SOURCE[event.source];
  return (
    <Pressable onPress={onPress} style={s.row}>
      <View style={s.r1}>
        <View style={s.iconWrap}><Icon name={kindIcon[event.kind]} size={18} color={colors.accent} /></View>
        <Text style={s.summary} numberOfLines={2}>{event.summary}</Text>
        <Text style={s.date}>{event.dateLabel}</Text>
      </View>
      <View style={s.r2}>
        <Icon name={src.icon} size={12} color={colors.muted} />
        <Text style={s.badge}>{src.label}</Text>
        <Icon name={event.confirmed ? "check-circle" : "clock-outline"} size={12} color={event.confirmed ? colors.bandHome : colors.muted} />
        <Text style={s.badge}>{event.confirmed ? "confirmed" : "pending"}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.product, paddingVertical: 12, paddingHorizontal: 14, ...shadowSoft },
  r1: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  summary: { flex: 1, ...type.bodyMedium },
  date: { ...type.caption },
  r2: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  badge: { ...type.caption, marginRight: 6 },
});
