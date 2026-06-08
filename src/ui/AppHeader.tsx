// Consistent app header: brand + settings (top row), pet-switcher chips, screen title.
// Rendered by the (tabs) layout so every tab gets the same chrome.
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { PETS } from "@/data/mock";
import { useApp } from "@/store/app";
import { colors } from "./theme";
import { Icon, speciesIcon, ui } from "./icons";
import { type } from "./type";

export function AppHeader({ title, showSwitcher = true }: { title: string; showSwitcher?: boolean }) {
  const activePetId = useApp((s) => s.activePetId);
  const setActivePet = useApp((s) => s.setActivePet);

  return (
    <View style={s.wrap}>
      <View style={s.topRow}>
        <Text style={s.brand}>PawVac</Text>
        <Pressable onPress={() => router.push("/settings")} hitSlop={8}>
          <Icon name={ui.settings} size={20} color={colors.muted} />
        </Pressable>
      </View>

      {showSwitcher && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.switcher}>
          {PETS.map((p) => {
            const on = p.id === activePetId;
            return (
              <Pressable key={p.id} onPress={() => setActivePet(p.id)} style={[s.av, on && s.avOn]}>
                <Icon name={speciesIcon[p.species]} size={20} color={on ? colors.accent : colors.dim} />
              </Pressable>
            );
          })}
          <Pressable onPress={() => router.push("/add-pet")} style={[s.av, s.avAdd]}>
            <Icon name={ui.plus} size={20} color={colors.muted} />
          </Pressable>
        </ScrollView>
      )}

      <Text style={s.title}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 6 },
  brand: { ...type.heading, color: colors.accent },
  switcher: { gap: 8, paddingHorizontal: 16, paddingTop: 10, alignItems: "center" },
  av: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  avOn: { borderColor: colors.accent },
  avAdd: { backgroundColor: "#f3f4f6" },
  title: { ...type.title, paddingHorizontal: 16, paddingTop: 12 },
});
