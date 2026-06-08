// Manual Add-Event: kind picker grid → per-kind form. UI phase: collects, navigates back.
import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { EventKind } from "@/data/types";
import { Button, Field } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { KIND_LABEL, MANUAL_KINDS, kindFields } from "@/ui/kindForms";
import { Icon, kindIcon } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

export default function AddEvent() {
  const [kind, setKind] = useState<EventKind | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const back = () => (kind ? setKind(null) : router.back());

  return (
    <DetailScreen title={kind ? KIND_LABEL[kind] : "What happened?"} onBack={back}>
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
          <Button title="Save" onPress={() => router.replace("/")} style={{ marginTop: 6 }} />
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
