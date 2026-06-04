// Typography — BuddyCare uses "General Sans". Until the font files are bundled (expo-font),
// we fall back to the system font; the SCALE below is the real, final spec either way.
import { TextStyle } from "react-native";
import { colors } from "./theme";

// General Sans family names (as they'll register once .otf files are added to assets/fonts).
// Keep `undefined` for now → system font; swap to "GeneralSans-Regular" etc. when bundled.
const FAMILY = {
  regular: undefined as string | undefined,
  medium: undefined as string | undefined,
  semibold: undefined as string | undefined,
};

export const size = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, display: 28 } as const;
const LH = 1.5;

const make = (fontSize: number, weight: TextStyle["fontWeight"], family?: string, color: string = colors.ink): TextStyle => ({
  fontSize, fontWeight: weight, fontFamily: family, lineHeight: Math.round(fontSize * LH), color,
});

// Named text styles used across screens.
export const type = {
  display: make(size.display, "600", FAMILY.semibold),
  title: make(size.lg, "600", FAMILY.semibold),
  heading: make(size.md, "600", FAMILY.semibold),
  body: make(size.sm, "400", FAMILY.regular),
  bodyMedium: make(size.sm, "500", FAMILY.medium),
  label: make(size.xs, "500", FAMILY.medium, colors.dim),
  caption: make(size.xs, "400", FAMILY.regular, colors.muted),
};
