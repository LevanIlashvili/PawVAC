// Home tab — cross-pet dashboard: mini calendar peek, today's agenda, per-pet status cards.
import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router, Redirect } from "expo-router";
import { PETS, petById, calendarFor, itemsOn } from "@/data/mock";
import { useApp } from "@/store/app";
import { Screen } from "@/ui/Screen";
import { Icon, speciesIcon, kindIcon } from "@/ui/icons";
import { colors, radius, shadowCard } from "@/ui/theme";
import { type } from "@/ui/type";

const TODAY = "2026-06-21"; // UI phase: fixed "today" so mock data lines up.

export default function Home() {
  const setActivePet = useApp((s) => s.setActivePet);
  const todays = itemsOn(TODAY);

  // First-run: no pets yet → welcome screen.
  if (PETS.length === 0) return <Redirect href="/welcome" />;

  const openPet = (id: string) => { setActivePet(id); router.push("/pets"); };

  return (
    <Screen title="Dashboard">
      <Pressable style={s.calPeek} onPress={() => router.push("/calendar")}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="calendar-month" size={18} color={colors.accent} />
          <Text style={type.bodyMedium}>Open calendar</Text>
        </View>
        <Icon name="chevron-right" size={18} color={colors.muted} />
      </Pressable>

      <Text style={[type.heading, s.sectionTitle]}>Today</Text>
      {todays.length === 0 ? (
        <Text style={s.empty}>Nothing scheduled.</Text>
      ) : (
        <View style={s.agenda}>
          {todays.map((c) => {
            const pet = petById(c.petId)!;
            return (
              <Pressable key={c.id} onPress={() => openPet(pet.id)} style={s.agendaRow}>
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

      <Text style={[type.heading, s.sectionTitle]}>Pets</Text>
      <View style={s.petGrid}>
        {PETS.map((p) => {
          const next = calendarFor(p.id).find((c) => c.date >= TODAY && !c.done);
          return (
            <Pressable key={p.id} onPress={() => openPet(p.id)} style={s.petCard}>
              <View style={[s.petIcon, { backgroundColor: p.color + "22" }]}>
                <Icon name={speciesIcon[p.species]} size={22} color={p.color} />
              </View>
              <Text style={type.bodyMedium}>{p.name}</Text>
              <Text style={type.caption} numberOfLines={1}>{next ? `next: ${next.title}` : "all clear"}</Text>
              {p.riskFlags.length > 0 && (
                <View style={s.flagRow}>
                  <Icon name="alert" size={12} color={colors.bandSoon} />
                  <Text style={s.flagText} numberOfLines={1}>{p.riskFlags[0]}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
        <Pressable onPress={() => router.push("/add-pet")} style={[s.petCard, s.addCard]}>
          <Icon name="plus" size={24} color={colors.muted} />
          <Text style={type.caption}>Add pet</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  calPeek: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 16, marginTop: 14, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14, ...shadowCard },
  sectionTitle: { marginHorizontal: 16, marginTop: 18, marginBottom: 8 },
  empty: { ...type.caption, marginHorizontal: 16 },
  agenda: { marginHorizontal: 16, gap: 8 },
  agendaRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.product, padding: 12, ...shadowCard },
  dot: { width: 8, height: 8, borderRadius: 4 },
  petGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 },
  petCard: { width: "47%", backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14, gap: 4, ...shadowCard },
  addCard: { alignItems: "center", justifyContent: "center", borderStyle: "dashed" },
  petIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  flagRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  flagText: { ...type.caption, color: colors.bandSoon },
});
