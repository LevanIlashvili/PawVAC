// Voice log — hold-to-talk capture → transcript → parse into structured events (confirm gate).
import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon, ui } from "@/ui/icons";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

const SAMPLE = "Toby's limping on the back left again this morning and he didn't touch his breakfast.";

export default function Voice() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  return (
    <DetailScreen title="Voice log">
      <Text style={type.body}>Hold to talk — release to transcribe. Everything stays on this device.</Text>

      <Pressable
        onPressIn={() => setRecording(true)}
        onPressOut={() => { setRecording(false); setTranscript(SAMPLE); }}
        style={[s.mic, recording && s.micActive]}
      >
        <Icon name={ui.mic} size={44} color={recording ? colors.onAccent : colors.accent} />
      </Pressable>
      <Text style={s.hint}>{recording ? "Listening…" : "Hold the mic"}</Text>

      {transcript ? (
        <>
          <Card style={s.transcript}>
            <Text style={type.label}>Transcript</Text>
            <Text style={s.transcriptText}>{transcript}</Text>
          </Card>
          <Button title="Parse into events" onPress={() => router.replace("/confirm?source=voice")} style={{ marginTop: 14 }} />
        </>
      ) : null}
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  mic: { alignSelf: "center", width: 118, height: 118, borderRadius: 59, backgroundColor: colors.accentTint, borderWidth: 2, borderColor: colors.accent, alignItems: "center", justifyContent: "center", marginTop: 28 },
  micActive: { backgroundColor: colors.accent },
  hint: { ...type.caption, textAlign: "center", marginTop: 10 },
  transcript: { padding: 14, marginTop: 22 },
  transcriptText: { ...type.body, color: colors.ink, fontSize: 15, lineHeight: 22, marginTop: 6 },
});
