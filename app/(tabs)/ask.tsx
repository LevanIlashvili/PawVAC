// Ask tab — two modes: triage ("should I worry?") and understand-a-diagnosis. Acts on the active pet.
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useActivePet } from "@/store/app";
import { Screen } from "@/ui/Screen";
import { Button, Pill } from "@/ui/primitives";
import { BandCard, RedFlag } from "@/ui/BandCard";
import { Icon, ui } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type, FONT } from "@/ui/type";

type Mode = "triage" | "diagnosis";

export default function Ask() {
  const pet = useActivePet();
  const [mode, setMode] = useState<Mode>("triage");
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState(false);

  return (
    <Screen title={`Ask about ${pet.name}`}>
      <View style={{ padding: 16 }}>
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
          <Pressable hitSlop={8} onPress={() => router.push("/voice")}><Icon name={ui.mic} size={20} color={colors.accent} /></Pressable>
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
              <Button title="Log this" variant="ghost" style={{ flex: 1 }} onPress={() => Alert.alert("Logged", "Added this triage to the timeline.")} />
              <Button title="Vet Pack" onPress={() => router.push("/pack")} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        <Text style={s.hint}>
          {mode === "triage"
            ? "Tip: a poison or emergency (e.g. “he ate chocolate”) shows an instant URGENT card — no model wait."
            : "Paste what your vet said. PawVac explains it, lists questions to ask, and cross-checks your pet's record. It never overturns your vet."}
        </Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  segRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  askbar: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 12, ...shadowCard },
  input: { flex: 1, color: colors.ink, fontSize: 14, minHeight: 22, fontFamily: FONT.regular },
  hint: { color: colors.muted, fontSize: 12, marginTop: 12, lineHeight: 18, fontFamily: FONT.regular },
  cardBody: { color: colors.ink, fontSize: 13.5, lineHeight: 19, fontFamily: FONT.regular },
  cardLabel: { color: colors.ink, fontSize: 13.5, fontFamily: FONT.semibold, marginTop: 2 },
  bullet: { color: colors.dim, fontSize: 13, marginTop: 3, fontFamily: FONT.regular },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },
});
