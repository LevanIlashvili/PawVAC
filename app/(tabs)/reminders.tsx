// Reminders tab — active reminders for the active pet, with snooze/done actions
// and a New Reminder bottom sheet.
import { useState } from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { useApp, useActivePet, useRemindersFor } from "@/store/app";
import { Screen } from "@/ui/Screen";
import { Button, Card, Field } from "@/ui/primitives";
import { Icon, ui } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

const SCHEDULES = ["Once a day", "Twice a day", "Weekly", "Monthly", "Annual"];

export default function Reminders() {
  const pet = useActivePet();
  const reminders = useRemindersFor(pet?.id ?? "");
  const snooze = useApp((s) => s.snoozeReminder);
  const markDone = useApp((s) => s.setReminderDone);
  const [sheetOpen, setSheetOpen] = useState(false);
  if (!pet) return <Screen title="Reminders"><View /></Screen>;

  return (
    <Screen title={`${pet.name} · Reminders`}>
      <View style={{ padding: 16 }}>
        <Text style={[type.label, { marginBottom: 12 }]}>Active</Text>

        {reminders.map((r) => {
          const isMed = /clind|mg|tablet|pill|dose|daily|day/i.test(`${r.title} ${r.schedule}`);
          const done = !!r.done;
          return (
            <Card key={r.id} style={[s.card, done && s.cardDone]}>
              <View style={s.row}>
                <View style={s.iconWrap}><Icon name={done ? "check-circle" : isMed ? "pill" : ui.vaccineDue} size={18} color={done ? colors.bandHome : colors.accent} /></View>
                <Text style={[s.title, done && s.titleDone]}>{r.title} · {r.schedule}</Text>
                {r.remainingLabel && <Text style={s.meta}>{r.remainingLabel}</Text>}
              </View>
              <Text style={s.next}>next: {r.nextLabel}</Text>
              <View style={s.actions}>
                <Button
                  title="snooze"
                  variant="ghost"
                  style={{ paddingVertical: 8, paddingHorizontal: 14, flexGrow: 0 }}
                  onPress={() => snooze(r.id, "tomorrow")}
                />
                <Button
                  title={done ? "done ✓" : "done"}
                  style={{ paddingVertical: 8, paddingHorizontal: 14, flexGrow: 0 }}
                  onPress={() => markDone(r.id, !done)}
                />
              </View>
            </Card>
          );
        })}

        <Button title="+ New reminder" style={{ marginTop: 14 }} onPress={() => setSheetOpen(true)} />
        <Text style={s.note}>Fires offline · survives reboot · once per dose</Text>
      </View>

      <NewReminderSheet open={sheetOpen} petId={pet.id} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}

function NewReminderSheet({ open, petId, onClose }: { open: boolean; petId: string; onClose: () => void }) {
  const addReminder = useApp((s) => s.addReminder);
  const [title, setTitle] = useState("");
  const [schedule, setSchedule] = useState(SCHEDULES[1]);
  const [time, setTime] = useState("");

  const save = () => {
    addReminder({
      petId,
      title: title || "Reminder",
      schedule,
      nextLabel: time ? `today ${time}` : "scheduled",
    });
    setTitle(""); setTime("");
    onClose();
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={[type.title, { marginBottom: 14 }]}>New reminder</Text>

        <Field label="What for?" placeholder="e.g. Clindamycin, Rabies booster" value={title} onChangeText={setTitle} />

        <Text style={s.label}>Schedule</Text>
        <View style={s.scheduleRow}>
          {SCHEDULES.map((sc) => {
            const on = schedule === sc;
            return (
              <Pressable key={sc} onPress={() => setSchedule(sc)} style={[s.schedChip, on ? s.schedOn : s.schedOff]}>
                <Text style={[s.schedText, { color: on ? colors.accent : colors.dim }]}>{sc}</Text>
              </Pressable>
            );
          })}
        </View>

        <Field label="Time (optional)" placeholder="e.g. 8:00 pm" value={time} onChangeText={setTime} />

        <View style={s.sheetActions}>
          <Button title="Cancel" variant="ghost" style={{ flex: 1 }} onPress={onClose} />
          <Button title="Set reminder" style={{ flex: 1 }} onPress={save} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, marginBottom: 10 },
  cardDone: { opacity: 0.6 },
  titleDone: { textDecorationLine: "line-through" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, ...type.bodyMedium },
  meta: { ...type.caption },
  next: { ...type.caption, color: colors.dim, marginTop: 6 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  note: { ...type.caption, textAlign: "center", marginTop: 10 },

  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: { backgroundColor: colors.panel, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, ...shadowCard },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: 14 },
  label: { ...type.label, marginBottom: 6 },
  scheduleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  schedChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  schedOn: { backgroundColor: colors.accentTint, borderColor: colors.accent },
  schedOff: { backgroundColor: colors.panel, borderColor: colors.line },
  schedText: { fontSize: 13, fontFamily: type.bodyMedium.fontFamily },
  sheetActions: { flexDirection: "row", gap: 10, marginTop: 8 },
});
