// Voice log — record on the mic → on-device Whisper transcript → confirm gate.
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from "expo-audio";
import { transcribeAudio } from "@/ai/perception";
import { Button, Card } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon, ui } from "@/ui/icons";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Voice() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null); setTranscript("");
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) { setError("Microphone permission is needed to record."); return; }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
  };

  const stop = async () => {
    setRecording(false);
    setBusy(true);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("No audio captured.");
      setTranscript(await transcribeAudio(uri));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DetailScreen title="Voice log">
      <Text style={type.body}>Hold to talk — release to transcribe. Everything stays on this device.</Text>

      <Pressable
        onPressIn={start}
        onPressOut={stop}
        style={[s.mic, recording && s.micActive]}
      >
        <Icon name={ui.mic} size={44} color={recording ? colors.onAccent : colors.accent} />
      </Pressable>
      <Text style={s.hint}>{recording ? "Listening…" : busy ? "Transcribing…" : "Hold the mic"}</Text>

      {busy && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
      {error ? <Text style={s.error}>{error}</Text> : null}

      {transcript ? (
        <>
          <Card style={s.transcript}>
            <Text style={type.label}>Transcript</Text>
            <Text style={s.transcriptText}>{transcript}</Text>
          </Card>
          <Button title="Parse into events" onPress={() => router.replace(`/confirm?source=voice&text=${encodeURIComponent(transcript)}`)} style={{ marginTop: 14 }} />
        </>
      ) : null}
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  mic: { alignSelf: "center", width: 118, height: 118, borderRadius: 59, backgroundColor: colors.accentTint, borderWidth: 2, borderColor: colors.accent, alignItems: "center", justifyContent: "center", marginTop: 28 },
  micActive: { backgroundColor: colors.accent },
  hint: { ...type.caption, textAlign: "center", marginTop: 10 },
  error: { ...type.caption, color: colors.bandUrgent, textAlign: "center", marginTop: 10 },
  transcript: { padding: 14, marginTop: 22 },
  transcriptText: { ...type.body, color: colors.ink, fontSize: 15, lineHeight: 22, marginTop: 6 },
});
