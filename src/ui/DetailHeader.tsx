// Slim header bar for detail / modal screens: back chevron + centered title + bottom border.
// Tab screens use AppHeader (branded); detail screens use this for a consistent slim bar.
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "./theme";
import { Icon } from "./icons";
import { type } from "./type";

export function DetailHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={s.bar}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={10} style={s.back}>
        <Icon name="chevron-left" size={24} color={colors.ink} />
      </Pressable>
      <Text style={s.title} numberOfLines={1}>{title}</Text>
      <View style={s.spacer} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", height: 52, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.bg },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { ...type.heading, flex: 1, textAlign: "center" },
  spacer: { width: 40 }, // balances the back button so the title is truly centered
});
