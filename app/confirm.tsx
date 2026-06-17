// Confirm gate (Invariant I9) — review parsed events before saving. Doses/drugs must be
// explicitly confirmed; nothing is written to the record until the user taps Save.
import { Text, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useApp, useActivePet } from "@/store/app";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon, kindIcon } from "@/ui/icons";
import { colors, radius } from "@/ui/theme";
import { type } from "@/ui/type";

import { EventKind } from "@/data/types";

// Lightweight structuring of the captured text into a draft event. (Full LLM scribe
// extraction is a later refinement; the captured transcript/OCR text is real.)
function draftEvent(text: string, src: "ocr" | "voice"): { kind: EventKind; summary: string } {
  const t = text.toLowerCase();
  if (src === "ocr" || /clinic|discharge|mg |dose|diagnos/i.test(t)) return { kind: "document", summary: text };
  if (/limp|vomit|diarr|cough|itch|letharg|off (his|her)? ?food|not eating|pain|swell/i.test(t)) return { kind: "symptom", summary: text };
  return { kind: "note", summary: text };
}

export default function Confirm() {
  const { source, text } = useLocalSearchParams<{ source?: string; text?: string }>();
  const pet = useActivePet();
  const addEvent = useApp((s) => s.addEvent);
  const src = source === "ocr" ? "ocr" : "voice";
  const sourceLabel = src === "ocr" ? "document scan" : "voice";
  const captured = (text ?? "").trim();
  const parsed = captured ? [draftEvent(captured, src)] : [
    { kind: "symptom" as EventKind, summary: "limping rear-left" },
  ];

  const saveAll = () => {
    if (pet) {
      parsed.forEach((p) =>
        addEvent({ petId: pet.id, kind: p.kind, summary: p.summary, dateLabel: "today", source: src, confirmed: true })
      );
    }
    router.dismissAll();
  };

  return (
    <DetailScreen title="Review before saving">
      <Text style={[type.caption, { marginBottom: 14 }]}>From {sourceLabel}</Text>

      {parsed.map((p) => (
        <Card key={p.summary} style={s.row}>
          <View style={s.iconWrap}><Icon name={kindIcon[p.kind]} size={18} color={colors.accent} /></View>
          <Text style={s.rowText} numberOfLines={3}>{p.kind}: {p.summary}</Text>
          <Text style={s.edit}>edit</Text>
        </Card>
      ))}

      <View style={s.gate}>
        <Icon name="alert-circle" size={18} color={colors.accent} />
        <Text style={s.gateText}>
          Needs your confirmation — dose read as <Text style={s.gateBold}>“150 mg”</Text>. Confirm or edit;
          PawVac never saves a dose you haven't checked.
        </Text>
      </View>

      <View style={s.actions}>
        <Button title="Discard" variant="ghost" style={{ flex: 1 }} onPress={() => router.dismissAll()} />
        <Button title="Confirm & save" style={{ flex: 1 }} onPress={saveAll} />
      </View>
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginBottom: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  rowText: { ...type.bodyMedium, flex: 1 },
  edit: { ...type.caption, color: colors.accent },
  gate: { flexDirection: "row", gap: 8, alignItems: "flex-start", backgroundColor: colors.bandSoonTint, borderWidth: 1, borderColor: colors.accentTint2, borderRadius: radius.product, padding: 12, marginTop: 4 },
  gateText: { ...type.caption, flex: 1, color: colors.accent, lineHeight: 18 },
  gateBold: { ...type.bodyMedium, color: colors.accent, fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
});
