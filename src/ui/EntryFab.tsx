// Floating + button on the Timeline → bottom-sheet chooser: Voice / Scan / Add manually.
import { useState } from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors, radius, shadowCard } from "./theme";
import { Icon, ui } from "./icons";
import { type } from "./type";

const OPTIONS = [
  { icon: ui.voice, label: "Voice log", href: "/voice" },
  { icon: ui.scan, label: "Scan a document", href: "/scan" },
  { icon: ui.add, label: "Add manually", href: "/add-event" },
] as const;

export function EntryFab({ petId, petName }: { petId: string; petName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={s.fab}>
        <Icon name={ui.plus} size={28} color={colors.onAccent} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.scrim} onPress={() => setOpen(false)} />
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>Add to {petName}'s record</Text>
          {OPTIONS.map((o) => (
            <Pressable key={o.label} onPress={() => { setOpen(false); router.push(`${o.href}?petId=${petId}`); }} style={s.opt}>
              <Icon name={o.icon} size={20} color={colors.accent} />
              <Text style={s.optText}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  fab: { position: "absolute", right: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", shadowColor: colors.accent, shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: { backgroundColor: colors.panel, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, ...shadowCard },
  sheetTitle: { ...type.label, marginBottom: 8 },
  opt: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14, marginBottom: 10, ...shadowCard },
  optText: { ...type.bodyMedium, fontSize: 15 },
});
