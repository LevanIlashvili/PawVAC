// Ask tab — two modes: triage ("should I worry?") and understand-a-diagnosis.
// UI phase: the toggle + input + sample prompts. Result cards land in the next commit.
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PETS } from "@/data/mock";
import { Button, Pill } from "@/ui/primitives";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

type Mode = "triage" | "diagnosis";

export default function Ask() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = PETS.find((p) => p.id === petId) ?? PETS[0];
  const [mode, setMode] = useState<Mode>("triage");
  const [q, setQ] = useState("");

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={[type.title, { marginBottom: 10 }]}>Ask about {pet.name}</Text>

      <View style={s.segRow}>
        <Pill label="Should I worry?" active={mode === "triage"} onPress={() => setMode("triage")} />
        <Pill label="Understand a diagnosis" active={mode === "diagnosis"} onPress={() => setMode("diagnosis")} />
      </View>

      <View style={s.askbar}>
        <TextInput
          style={s.input}
          placeholder={mode === "triage" ? "e.g. he's limping and off his food" : "e.g. vet said arthritis, gabapentin"}
          placeholderTextColor={colors.muted}
          value={q}
          onChangeText={setQ}
          multiline
        />
        <Text style={s.mic}>🎤</Text>
      </View>

      <Button title="Ask" onPress={() => { /* result card in next commit */ }} style={{ marginTop: 6 }} />

      <Text style={s.hint}>
        {mode === "triage"
          ? "Tip: a poison or emergency (e.g. “he ate chocolate”) shows an instant URGENT card — no model wait."
          : "Paste what your vet said. PawVac explains it, lists questions to ask, and cross-checks your pet's record. It never overturns your vet."}
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  segRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  askbar: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 12, ...shadowCard },
  input: { flex: 1, color: colors.ink, fontSize: 14, minHeight: 22 },
  mic: { fontSize: 18, color: colors.muted },
  hint: { color: colors.muted, fontSize: 12, marginTop: 12, lineHeight: 18 },
});
