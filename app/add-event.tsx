// Manual Add-Event: kind picker grid → per-kind form. UI phase: collects, navigates back.
import { useState } from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { EventKind } from "@/data/types";
import { Button, Field } from "@/ui/primitives";
import { KIND_META, MANUAL_KINDS, kindFields } from "@/ui/kindForms";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

export default function AddEvent() {
  const [kind, setKind] = useState<EventKind | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const back = () => (kind ? setKind(null) : router.back());

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 14 }}>
      <Pressable onPress={back} hitSlop={8} style={{ marginBottom: 8 }}>
        <Text style={{ color: colors.accent, fontSize: 14 }}>‹ back</Text>
      </Pressable>

      {!kind ? (
        <>
          <Text style={[type.heading, { marginBottom: 12, marginLeft: 2 }]}>What happened?</Text>
          <View style={s.grid}>
            {MANUAL_KINDS.map((k) => (
              <Pressable key={k} onPress={() => setKind(k)} style={s.cell}>
                <Text style={{ fontSize: 24 }}>{KIND_META[k].icon}</Text>
                <Text style={s.cellLabel}>{KIND_META[k].label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={[type.heading, { marginBottom: 10 }]}>{KIND_META[kind].icon} {KIND_META[kind].label}</Text>
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
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "47%", backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, paddingVertical: 16, alignItems: "center", ...shadowCard },
  cellLabel: { color: colors.ink, marginTop: 5, fontSize: 13 },
});
