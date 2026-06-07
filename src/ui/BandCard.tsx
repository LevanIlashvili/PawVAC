// Triage band card (home/soon/urgent) + red-flag box. The user-facing safety output.
import { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Band, bandColor, bandLabel, colors, radius, shadowCard } from "./theme";

export function BandCard({ band, children }: { band: Band; children: ReactNode }) {
  return (
    <View style={s.card}>
      <View style={[s.top, { backgroundColor: bandColor(band) }]}>
        <Text style={s.topText}>{bandLabel(band)}</Text>
      </View>
      <View style={s.body}>{children}</View>
    </View>
  );
}

export function RedFlag({ children }: { children: ReactNode }) {
  return (
    <View style={s.flag}>
      <Text style={s.flagText}>🚩 {children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.card, overflow: "hidden", borderWidth: 1, borderColor: colors.line, ...shadowCard },
  top: { paddingVertical: 13, paddingHorizontal: 16 },
  topText: { color: "#fff", fontWeight: "700", fontSize: 15, letterSpacing: 0.3 },
  body: { backgroundColor: colors.panel, padding: 14 },
  flag: { backgroundColor: colors.bandUrgentTint, borderWidth: 1, borderColor: "#f7c4ca", borderRadius: radius.product, padding: 10, marginVertical: 10 },
  flagText: { color: "#b42334", fontSize: 12.5, lineHeight: 18 },
});
