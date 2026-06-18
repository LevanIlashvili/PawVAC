// Ask tab — two modes: triage ("should I worry?") and understand-a-diagnosis. Acts on the active pet.
// Runs the on-device clinician (RAG → MedGemma → Guardian) and renders the banded result.
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useApp, useActivePet, useEventsFor } from "@/store/app";
import { runTriage, TriageResult } from "@/ai/clinician";
import { Screen } from "@/ui/Screen";
import { Button, Pill } from "@/ui/primitives";
import { BandCard, RedFlag } from "@/ui/BandCard";
import { Icon, ui } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type, FONT } from "@/ui/type";

type Mode = "triage" | "diagnosis";

export default function Ask() {
  const pet = useActivePet();
  const events = useEventsFor(pet?.id ?? "");
  const addEvent = useApp((s) => s.addEvent);
  const [mode, setMode] = useState<Mode>("triage");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!pet) return <Screen title="Ask"><View /></Screen>;

  const ask = async () => {
    if (!q.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      setResult(await runTriage(pet, events, q.trim(), mode));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong running on-device.");
    } finally {
      setLoading(false);
    }
  };

  const logResult = () => {
    if (!result) return;
    addEvent({ petId: pet.id, kind: "triage", summary: `${q.trim()} — ${result.band.replace("_", " ")}`, dateLabel: "today", source: "agent", confirmed: true });
    router.push("/pets");
  };

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

        <Button title={loading ? "Thinking…" : "Ask"} onPress={ask} style={{ marginTop: 6 }} />

        {loading && (
          <View style={s.loading}>
            <ActivityIndicator color={colors.accent} />
            <Text style={s.loadingText}>Reading {pet.name}'s record on-device…</Text>
          </View>
        )}

        {error && <Text style={s.error}>{error}</Text>}

        {result && (
          <View style={{ marginTop: 16 }}>
            <BandCard band={result.band}>
              {result.rationale ? <Text style={s.cardBody}>{result.rationale}</Text> : null}
              {result.redFlagBoxes.map((rf) => <RedFlag key={rf}>{rf}</RedFlag>)}
              {result.askYourVet.length > 0 && (
                <>
                  <Text style={s.cardLabel}>Ask your vet:</Text>
                  {result.askYourVet.map((a) => <Text key={a} style={s.bullet}>• {a}</Text>)}
                </>
              )}
              {result.instant ? <Text style={s.instant}>Shown instantly — deterministic safety match, no model needed.</Text> : null}
            </BandCard>
            <View style={s.cardActions}>
              <Button title="Log this" variant="ghost" style={{ flex: 1 }} onPress={logResult} />
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
  loading: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  loadingText: { ...type.caption },
  error: { ...type.caption, color: colors.bandUrgent, marginTop: 12 },
  instant: { ...type.caption, marginTop: 8 },
});
