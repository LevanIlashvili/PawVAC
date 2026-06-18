// Manual Add-Event: kind picker grid → per-kind form. Persists to SQLite via the store.
// With ?correctId=<id> it edits an existing event: prefills and appends a superseding row.
import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { EventKind } from "@/data/types";
import { useApp, useActivePet, useEventById } from "@/store/app";
import { Button, Field } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { KIND_LABEL, MANUAL_KINDS, kindFields } from "@/ui/kindForms";
import { Icon, kindIcon } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

export default function AddEvent() {
  const { correctId } = useLocalSearchParams<{ correctId?: string }>();
  const pet = useActivePet();
  const original = useEventById(correctId ?? "");
  const addEvent = useApp((s) => s.addEvent);
  const correctEvent = useApp((s) => s.correctEvent);
  const correcting = !!original;

  // In correct mode the kind is fixed to the original; its summary prefills the first field.
  const [kind, setKind] = useState<EventKind | null>(original?.kind ?? null);
  const [values, setValues] = useState<Record<string, string>>(
    original ? { [kindFields(original.kind)[0].key]: original.summary } : {}
  );

  const back = () => (kind && !correcting ? setKind(null) : router.back());

  const save = () => {
    if (!kind || !pet) return;
    const parts = kindFields(kind).map((f) => values[f.key]?.trim()).filter(Boolean);
    const summary = parts.length ? parts.join(" · ") : KIND_LABEL[kind];
    if (correcting && original) {
      correctEvent(original.id, { kind, summary });   // appends a superseding row (original kept)
    } else {
      addEvent({ petId: pet.id, kind, summary, dateLabel: "today", source: "manual", confirmed: true });
    }
    router.back();
  };

  return (
    <DetailScreen title={correcting ? `Correct · ${KIND_LABEL[kind!]}` : kind ? KIND_LABEL[kind] : "What happened?"} onBack={back}>
      {!kind ? (
        <View style={s.grid}>
          {MANUAL_KINDS.map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} style={s.cell}>
              <Icon name={kindIcon[k]} size={26} color={colors.accent} />
              <Text style={s.cellLabel}>{KIND_LABEL[k]}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <>
          {kindFields(kind).map((f) => (
            <Field
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              keyboardType={f.numeric ? "numeric" : "default"}
              multiline={f.multiline}
              value={values[f.key] ?? ""}
              onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
            />
          ))}
          <Button title="Save" onPress={save} style={{ marginTop: 6 }} />
        </>
      )}
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "47%", backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, paddingVertical: 16, alignItems: "center", gap: 6, ...shadowCard },
  cellLabel: { ...type.bodyMedium, fontSize: 13 },
});
