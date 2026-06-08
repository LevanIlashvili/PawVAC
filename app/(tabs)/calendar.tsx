// Calendar tab — full cross-pet calendar with color-coded multi-dots + per-day agenda.
import { useMemo, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Calendar as RNCalendar } from "react-native-calendars";
import { PETS, petById, calendarFor, itemsOn } from "@/data/mock";
import { useApp } from "@/store/app";
import { Screen } from "@/ui/Screen";
import { Card } from "@/ui/primitives";
import { Icon, kindIcon } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

const TODAY = "2026-06-21";

export default function CalendarTab() {
  const setActivePet = useApp((s) => s.setActivePet);
  const [petFilter, setPetFilter] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState(TODAY);

  const marked = useMemo(() => {
    const m: Record<string, { dots: { key: string; color: string }[]; selected?: boolean; selectedColor?: string }> = {};
    for (const c of calendarFor(petFilter)) {
      const color = petById(c.petId)?.color ?? colors.accent;
      (m[c.date] ??= { dots: [] }).dots.push({ key: c.id, color });
    }
    m[selected] = { ...(m[selected] ?? { dots: [] }), selected: true, selectedColor: colors.accent };
    return m;
  }, [petFilter, selected]);

  const dayItems = itemsOn(selected, petFilter);

  return (
    <Screen title="Calendar">
      <View style={s.filterRow}>
        <FilterChip label="All" active={!petFilter} onPress={() => setPetFilter(undefined)} />
        {PETS.map((p) => (
          <FilterChip key={p.id} label={p.name} color={p.color} active={petFilter === p.id} onPress={() => setPetFilter(p.id)} />
        ))}
      </View>

      <Card style={s.calCard}>
        <RNCalendar
          current={TODAY}
          markingType="multi-dot"
          markedDates={marked}
          onDayPress={(d) => setSelected(d.dateString)}
          theme={{
            calendarBackground: colors.panel,
            monthTextColor: colors.ink,
            textMonthFontFamily: type.heading.fontFamily,
            textDayFontFamily: type.body.fontFamily,
            textDayHeaderFontFamily: type.label.fontFamily,
            dayTextColor: colors.ink,
            textDisabledColor: colors.faint,
            todayTextColor: colors.accent,
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor: colors.onAccent,
            arrowColor: colors.accent,
          }}
        />
      </Card>

      <Text style={[type.heading, s.sectionTitle]}>{selected === TODAY ? "Today" : selected}</Text>
      {dayItems.length === 0 ? (
        <Text style={s.empty}>Nothing scheduled.</Text>
      ) : (
        <View style={s.agenda}>
          {dayItems.map((c) => {
            const pet = petById(c.petId)!;
            return (
              <Pressable key={c.id} onPress={() => { setActivePet(pet.id); router.push("/pets"); }} style={s.agendaRow}>
                <View style={[s.dot, { backgroundColor: pet.color }]} />
                <Icon name={kindIcon[c.kind]} size={18} color={colors.dim} />
                <View style={{ flex: 1 }}>
                  <Text style={type.bodyMedium}>{c.title}</Text>
                  <Text style={type.caption}>{pet.name}{c.timeLabel ? ` · ${c.timeLabel}` : ""}</Text>
                </View>
                {c.done && <Icon name="check-circle" size={16} color={colors.bandHome} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function FilterChip({ label, color, active, onPress }: { label: string; color?: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active ? s.chipOn : s.chipOff]}>
      {color && <View style={[s.dot, { backgroundColor: color }]} />}
      <Text style={[s.chipText, { color: active ? colors.accent : colors.dim }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1 },
  chipOn: { backgroundColor: colors.accentTint, borderColor: colors.accent },
  chipOff: { backgroundColor: colors.panel, borderColor: colors.line },
  chipText: { fontSize: 13, fontFamily: type.bodyMedium.fontFamily },
  calCard: { marginHorizontal: 16, marginTop: 12, padding: 6, overflow: "hidden" },
  sectionTitle: { marginHorizontal: 16, marginTop: 18, marginBottom: 8 },
  empty: { ...type.caption, marginHorizontal: 16 },
  agenda: { marginHorizontal: 16, gap: 8 },
  agendaRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.product, padding: 12, ...shadowCard },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
