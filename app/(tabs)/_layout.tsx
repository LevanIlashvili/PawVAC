// App-level bottom navbar — the SAME 5 tabs on every main screen:
// Home · Pets · Ask · Reminders · Calendar. Home/Calendar are cross-pet;
// Pets/Ask/Reminders act on the active pet (from the app store).
import { Tabs } from "expo-router";
import { type ColorValue } from "react-native";
import { colors } from "@/ui/theme";
import { Icon } from "@/ui/icons";
import { FONT } from "@/ui/type";
import type { ComponentProps } from "react";

type MCIName = ComponentProps<typeof Icon>["name"];
const icon = (name: MCIName) => ({ color }: { color: ColorValue }) => (
  <Icon name={name} size={22} color={color as string} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentBright,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11, fontFamily: FONT.medium },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("view-dashboard") }} />
      <Tabs.Screen name="pets" options={{ title: "Pets", tabBarIcon: icon("paw") }} />
      <Tabs.Screen name="ask" options={{ title: "Ask", tabBarIcon: icon("comment-question") }} />
      <Tabs.Screen name="reminders" options={{ title: "Reminders", tabBarIcon: icon("bell") }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar", tabBarIcon: icon("calendar-month") }} />
    </Tabs>
  );
}
