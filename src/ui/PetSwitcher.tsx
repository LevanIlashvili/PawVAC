// Persistent top bar: avatar row to switch the active pet + add button + settings gear.
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";
import { PETS } from "@/data/mock";
import { colors } from "./theme";

export function PetSwitcher({ activePetId }: { activePetId?: string }) {
  const pathname = usePathname();
  return (
    <View style={s.row}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {PETS.map((p) => {
          const on = p.id === activePetId;
          return (
            <Pressable key={p.id} onPress={() => router.replace(`/pet/${p.id}`)} style={[s.av, on && s.avOn]}>
              <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => router.push("/add-pet")} style={[s.av, s.avAdd]}>
          <Text style={{ fontSize: 20, color: colors.muted }}>＋</Text>
        </Pressable>
      </ScrollView>
      <Pressable onPress={() => router.push("/settings")} style={s.gear} hitSlop={8}>
        <Text style={{ fontSize: 18, color: colors.muted }}>⚙</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.bg, paddingRight: 12 },
  scroll: { gap: 8, paddingVertical: 10, paddingHorizontal: 12, alignItems: "center" },
  av: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  avOn: { borderColor: colors.accent },
  avAdd: { backgroundColor: "#f3f4f6" },
  gear: { marginLeft: "auto", padding: 4 },
});
