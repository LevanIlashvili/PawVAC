// Base UI primitives in the BuddyCare skin: Button, Card, Chip, Field (input), Pill.
import { ReactNode } from "react";
import {
  Pressable, Text, TextInput, View, StyleSheet,
  type ViewStyle, type TextStyle, type TextInputProps, type StyleProp,
} from "react-native";
import { colors, radius, shadowCard } from "./theme";
import { Icon } from "./icons";
import { FONT } from "./type";

export function Button({
  title, onPress, variant = "primary", style,
}: { title: string; onPress?: () => void; variant?: "primary" | "ghost"; style?: StyleProp<ViewStyle> }) {
  const ghost = variant === "ghost";
  return (
    <Pressable onPress={onPress} style={[s.btn, ghost ? s.btnGhost : s.btnPrimary, style]}>
      <Text style={[s.btnText, ghost && { color: colors.ink }]}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function BackLink({ onPress, label = "back" }: { onPress?: () => void; label?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={s.back}>
      <Icon name="chevron-left" size={18} color={colors.accent} />
      <Text style={s.backText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label, tone = "accent", icon,
}: { label: string; tone?: "accent" | "muted"; icon?: Parameters<typeof Icon>[0]["name"] }) {
  const accent = tone === "accent";
  const fg = accent ? colors.accent : colors.dim;
  return (
    <View style={[s.chip, { backgroundColor: accent ? colors.accentTint : "#f3f4f6", borderColor: accent ? colors.accentTint2 : colors.line }]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text style={[s.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.pill, active ? s.pillOn : s.pillOff]}>
      <Text style={[s.pillText, { color: active ? colors.accent : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: { label?: string } & TextInputProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.muted} style={s.input} {...props} />
    </View>
  );
}

const s = StyleSheet.create({
  btn: { borderRadius: radius.button, paddingVertical: 14, alignItems: "center" },
  btnPrimary: { backgroundColor: colors.accent, ...shadowCard },
  btnGhost: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line },
  btnText: { color: colors.onAccent, fontFamily: FONT.semibold, fontSize: 15 } as TextStyle,

  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, ...shadowCard },

  back: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 8, alignSelf: "flex-start" },
  backText: { color: colors.accent, fontSize: 14, fontFamily: FONT.medium },

  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.chip, borderWidth: 1 },
  chipText: { fontSize: 11, fontFamily: FONT.medium } as TextStyle,

  pill: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: "center", borderWidth: 1 },
  pillOn: { backgroundColor: colors.accentTint, borderColor: colors.accent },
  pillOff: { backgroundColor: colors.panel, borderColor: colors.line },
  pillText: { fontSize: 13, fontFamily: FONT.semibold } as TextStyle,

  fieldLabel: { color: colors.dim, fontSize: 12, marginBottom: 4, fontFamily: FONT.medium },
  input: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11, color: colors.ink, fontSize: 14, fontFamily: FONT.regular },
});
