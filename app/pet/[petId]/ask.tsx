// Ask tab — two modes: triage ("should I worry?") and understand-a-diagnosis.
// UI phase: the toggle + input + sample prompts. Result cards land in the next commit.
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PETS } from "@/data/mock";
import { Button, Pill } from "@/ui/primitives";
import { BandCard, RedFlag } from "@/ui/BandCard";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

type Mode = "triage" | "diagnosis";

export default function Ask() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = PETS.find((p) => p.id === petId) ?? PETS[0];
  const [mode, setMode] = useState<Mode>("triage");
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState(false);

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

      <Button title="Ask" onPress={() => setAsked(true)} style={{ marginTop: 6 }} />

      {asked && (
        <View style={{ marginTop: 16 }}>
          <BandCard band="vet_soon">
            <Text style={s.cardBody}>
              Ties to the rear-left osteomyelitis (Mar 2024) and today's limp + off food.
            </Text>
            <RedFlag>
              Rule out bloat (GDV). A deep-chested dog going off food can mask early bloat — swollen/hard
              belly or unproductive retching = emergency, go now.
            </RedFlag>
            <Text style={s.cardLabel}>Ask your vet:</Text>
            <Text style={s.bullet}>• Same limb as the osteomyelitis?</Text>
            <Text style={s.bullet}>• Any abdominal distension or retching?</Text>
            <Text style={s.bullet}>• Fever?</Text>
          </BandCard>
          <View style={s.cardActions}>
            <Button title="Log this" variant="ghost" style={{ flex: 1 }} />
            <Button title="Vet Pack" style={{ flex: 1 }} />
          </View>
        </View>
      )}

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
  cardBody: { color: colors.ink, fontSize: 13.5, lineHeight: 19 },
  cardLabel: { color: colors.ink, fontSize: 13.5, fontWeight: "600", marginTop: 2 },
  bullet: { color: colors.dim, fontSize: 13, marginTop: 3 },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },
});

