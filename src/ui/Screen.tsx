// Consistent screen shell: safe area + AppHeader + scrollable body.
// Every tab wraps its content in <Screen> so header/chrome is identical app-wide.
import { ReactNode } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "./AppHeader";
import { colors } from "./theme";

export function Screen({
  title, showSwitcher = true, scroll = true, children,
}: { title: string; showSwitcher?: boolean; scroll?: boolean; children: ReactNode }) {
  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <AppHeader title={title} showSwitcher={showSwitcher} />
      {scroll ? (
        <ScrollView contentContainerStyle={s.body}>{children}</ScrollView>
      ) : (
        <View style={[s.body, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingBottom: 24 },
});
