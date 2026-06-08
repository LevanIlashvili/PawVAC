// Scan a document — camera/library → OCR + vision → parse into structured events (confirm gate).
import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button, Card, Pill } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon } from "@/ui/icons";
import { colors, radius } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Scan() {
  const [source, setSource] = useState<"camera" | "library">("camera");
  const [captured, setCaptured] = useState(false);

  return (
    <DetailScreen title="Scan a document">
      <View style={s.segRow}>
        <Pill label="Camera" active={source === "camera"} onPress={() => setSource("camera")} />
        <Pill label="Library" active={source === "library"} onPress={() => setSource("library")} />
      </View>

      <Pressable onPress={() => setCaptured(true)} style={s.preview}>
        {captured ? (
          <View style={s.docMock}>
            <Text style={s.docTitle}>Happy Paws Veterinary Clinic</Text>
            <Text style={s.docLine}>Discharge Summary</Text>
            <Text style={s.docLine}>Clindamycin 150 mg…</Text>
            <Text style={s.docLine}>Osteomyelitis, rear-left…</Text>
          </View>
        ) : (
          <>
            <Icon name="camera" size={32} color={colors.muted} />
            <Text style={s.placeholder}>Tap to {source === "camera" ? "take a photo" : "choose an image"}</Text>
          </>
        )}
      </Pressable>

      {captured ? (
        <>
          <Card style={s.reading}>
            <Icon name="text-recognition" size={18} color={colors.accent} />
            <Text style={s.readingText}>Reading with OCR + vision…</Text>
          </Card>
          <Button title="Parse into events" onPress={() => router.replace("/confirm?source=ocr")} style={{ marginTop: 14 }} />
        </>
      ) : null}
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  segRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  preview: { height: 200, borderRadius: radius.card, backgroundColor: colors.accentTint, borderWidth: 1, borderColor: colors.accentTint2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8, padding: 14 },
  placeholder: { ...type.caption },
  docMock: { alignItems: "center", gap: 4 },
  docTitle: { ...type.bodyMedium, color: colors.dim },
  docLine: { ...type.caption },
  reading: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginTop: 16 },
  readingText: { ...type.bodyMedium, color: colors.accent },
});
