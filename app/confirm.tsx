// Confirm gate (Invariant I9) — review the captured text before saving. Nothing is written
// until the user taps Save; doses are flagged from the ACTUAL captured text, never fabricated.
import { useState } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useApp, useActivePet } from "@/store/app";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon, kindIcon } from "@/ui/icons";
import { EventKind } from "@/data/types";
import { hasDose } from "@/ai/guardian";
import { colors, radius } from "@/ui/theme";
import { type, FONT } from "@/ui/type";

// Lightweight structuring of captured text into a draft kind (the LLM scribe is a later refinement).
function draftKind(text: string, src: "ocr" | "voice"): EventKind {
  const t = text.toLowerCase();
  if (src === "ocr" || /clinic|discharge|\bmg\b|dose|diagnos/i.test(t)) return "document";
  if (/limp|vomit|diarr|cough|itch|letharg|off (his|her)? ?food|not eating|pain|swell/i.test(t)) return "symptom";
  return "note";
}

const doseMatch = (s: string) => s.match(/\b\d+(\.\d+)?\s?(mg|ml|mcg|g|tablet|pill|cc)\b/i)?.[0];

export default function Confirm() {
  const { source, text } = useLocalSearchParams<{ source?: string; text?: string }>();
  const pet = useActivePet();
  const addEvent = useApp((s) => s.addEvent);
  const src = source === "ocr" ? "ocr" : "voice";
  const sourceLabel = src === "ocr" ? "document scan" : "voice";
  const captured = (text ?? "").trim();

  const [summary, setSummary] = useState(captured);
  const kind = captured ? draftKind(captured, src) : "note";
  const dose = doseMatch(summary);

  const saveAll = () => {
    if (!pet || !summary.trim()) return;
    addEvent({ petId: pet.id, kind, summary: summary.trim(), dateLabel: "today", source: src, confirmed: true });
    router.dismissAll();
  };

  // Nothing captured → honest empty state, no fabricated event, Save disabled.
  if (!captured) {
    return (
      <DetailScreen title="Review before saving">
        <Card style={s.empty}>
          <Icon name="alert-circle-outline" size={22} color={colors.muted} />
          <Text style={s.emptyText}>Nothing was captured from the {sourceLabel}. Go back and try again.</Text>
        </Card>
        <Button title="Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: 14 }} />
      </DetailScreen>
    );
  }

  return (
    <DetailScreen title="Review before saving">
      <Text style={[type.caption, { marginBottom: 14 }]}>From {sourceLabel}</Text>

      <Card style={s.row}>
        <View style={s.iconWrap}><Icon name={kindIcon[kind]} size={18} color={colors.accent} /></View>
        <View style={{ flex: 1 }}>
          <Text style={type.label}>{kind}</Text>
          <TextInput style={s.editInput} value={summary} onChangeText={setSummary} multiline />
        </View>
      </Card>

      {dose ? (
        <View style={s.gate}>
          <Icon name="alert-circle" size={18} color={colors.accent} />
          <Text style={s.gateText}>
            Needs your confirmation — a dose was read as <Text style={s.gateBold}>“{dose}”</Text>. Check it's
            correct (edit above); PawVac never saves a dose you haven't checked.
          </Text>
        </View>
      ) : null}

      <View style={s.actions}>
        <Button title="Discard" variant="ghost" style={{ flex: 1 }} onPress={() => router.dismissAll()} />
        <Button title="Confirm & save" style={{ flex: 1 }} onPress={saveAll} />
      </View>
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, marginBottom: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  editInput: { ...type.bodyMedium, color: colors.ink, fontFamily: FONT.regular, paddingVertical: 2, marginTop: 2 },
  gate: { flexDirection: "row", gap: 8, alignItems: "flex-start", backgroundColor: colors.bandSoonTint, borderWidth: 1, borderColor: colors.accentTint2, borderRadius: radius.product, padding: 12, marginTop: 4 },
  gateText: { ...type.caption, flex: 1, color: colors.accent, lineHeight: 18 },
  gateBold: { ...type.bodyMedium, color: colors.accent, fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  empty: { alignItems: "center", gap: 10, padding: 20 },
  emptyText: { ...type.body, textAlign: "center" },
});
