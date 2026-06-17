// Scan a document — camera/library capture → on-device OCR → confirm gate.
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { scanDocument } from "@/ai/perception";
import { Button, Card, Pill } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon } from "@/ui/icons";
import { colors, radius } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Scan() {
  const [source, setSource] = useState<"camera" | "library">("camera");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const capture = async () => {
    setError(null); setText("");
    const opts: ImagePicker.ImagePickerOptions = { quality: 0.8, allowsEditing: false };
    let res: ImagePicker.ImagePickerResult;
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { setError("Camera permission is needed."); return; }
      res = await ImagePicker.launchCameraAsync(opts);
    } else {
      res = await ImagePicker.launchImageLibraryAsync({ ...opts, mediaTypes: ["images"] });
    }
    if (res.canceled || !res.assets?.[0]?.uri) return;
    const uri = res.assets[0].uri;
    setImageUri(uri);
    setBusy(true);
    try {
      setText(await scanDocument(uri));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the document.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DetailScreen title="Scan a document">
      <View style={s.segRow}>
        <Pill label="Camera" active={source === "camera"} onPress={() => setSource("camera")} />
        <Pill label="Library" active={source === "library"} onPress={() => setSource("library")} />
      </View>

      <Pressable onPress={capture} style={s.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.img} resizeMode="cover" />
        ) : (
          <>
            <Icon name="camera" size={32} color={colors.muted} />
            <Text style={s.placeholder}>Tap to {source === "camera" ? "take a photo" : "choose an image"}</Text>
          </>
        )}
      </Pressable>

      {busy && (
        <Card style={s.reading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={s.readingText}>Reading with OCR…</Text>
        </Card>
      )}
      {error ? <Text style={s.error}>{error}</Text> : null}

      {text ? (
        <>
          <Card style={s.result}>
            <Text style={type.label}>Extracted text</Text>
            <Text style={s.resultText}>{text}</Text>
          </Card>
          <Button title="Parse into events" onPress={() => router.replace(`/confirm?source=ocr&text=${encodeURIComponent(text)}`)} style={{ marginTop: 14 }} />
        </>
      ) : null}
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  segRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  preview: { height: 200, borderRadius: radius.card, backgroundColor: colors.accentTint, borderWidth: 1, borderColor: colors.accentTint2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, overflow: "hidden" },
  img: { width: "100%", height: "100%", borderRadius: radius.card },
  placeholder: { ...type.caption },
  reading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginTop: 16 },
  readingText: { ...type.bodyMedium, color: colors.accent },
  error: { ...type.caption, color: colors.bandUrgent, marginTop: 12 },
  result: { padding: 14, marginTop: 16 },
  resultText: { ...type.body, color: colors.ink, fontSize: 13.5, lineHeight: 20, marginTop: 6 },
});
