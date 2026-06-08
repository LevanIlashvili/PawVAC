// Consistent shell for detail / modal screens: safe area + slim DetailHeader + scroll body.
// (No bottom navbar — these are pushed over the tabs.)
import { ReactNode } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DetailHeader } from "./DetailHeader";
import { colors } from "./theme";

export function DetailScreen({
  title, onBack, scroll = true, contentStyle, children,
}: { title: string; onBack?: () => void; scroll?: boolean; contentStyle?: object; children: ReactNode }) {
  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <DetailHeader title={title} onBack={onBack} />
      {scroll ? (
        <ScrollView contentContainerStyle={[s.body, contentStyle]}>{children}</ScrollView>
      ) : (
        <View style={[s.body, { flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40 },
});
