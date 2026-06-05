// Bottom tab bar scoped to the active pet: Timeline · Ask · Reminders · Pack.
import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { colors } from "@/ui/theme";

const icon = (glyph: string) => ({ color }: { color: ColorValue }) => (
  <Text style={{ fontSize: 19, color }}>{glyph}</Text>
);

export default function PetTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentBright,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Timeline", tabBarIcon: icon("📜") }} />
      <Tabs.Screen name="ask" options={{ title: "Ask", tabBarIcon: icon("❓") }} />
      <Tabs.Screen name="reminders" options={{ title: "Reminders", tabBarIcon: icon("⏰") }} />
      <Tabs.Screen name="pack" options={{ title: "Pack", tabBarIcon: icon("📄") }} />
    </Tabs>
  );
}
