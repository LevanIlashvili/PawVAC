// Typography — Montserrat (bundled via @expo-google-fonts/montserrat, loaded at startup).
import { TextStyle } from "react-native";
import { colors } from "./theme";

// Family names match the keys registered in app/_layout.tsx useFonts({...}).
export const FONT = {
  regular: "Montserrat_400Regular",
  medium: "Montserrat_500Medium",
  semibold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
} as const;

export const size = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, display: 28 } as const;
const LH = 1.4;

const make = (fontSize: number, family: string, color: string = colors.ink): TextStyle => ({
  fontSize, fontFamily: family, lineHeight: Math.round(fontSize * LH), color,
});

export const type = {
  display: make(size.display, FONT.bold),
  title: make(size.lg, FONT.semibold),
  heading: make(size.md, FONT.semibold),
  body: make(size.sm, FONT.regular, colors.dim),
  bodyMedium: make(size.sm, FONT.medium),
  label: make(size.xs, FONT.medium, colors.dim),
  caption: make(size.xs, FONT.regular, colors.muted),
};
