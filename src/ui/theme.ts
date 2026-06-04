// PawVac theme — palette/type/shape from the BuddyCare UI Kit (licensed), plus the medical
// "band" semantics PawVac needs (green/amber/red) layered on top. Light + warm-orange.

export const colors = {
  // surfaces
  bg: "#FFFFFF",
  panel: "#FFFFFF",
  panelAlt: "#FFF4EC", // orange-50 tint
  line: "#E9E9E9",
  lineSoft: "#E7E7E7",

  // text
  ink: "#0B0B0B",
  dim: "#5C5C5C",
  muted: "#8F8F8F",
  faint: "#B3B3B3",

  // brand
  accent: "#E8853F", // orange-600 (primary)
  accentBright: "#FF9245", // orange-500
  accentTint: "#FFF4EC",
  accentTint2: "#FFDDC5",
  onAccent: "#FFFFFF",

  // bands (PawVac safety)
  bandHome: "#3ECF8E",
  bandSoon: "#FF9245",
  bandUrgent: "#F04438",
  bandHomeTint: "#E7F9F0",
  bandSoonTint: "#FFF4EC",
  bandUrgentTint: "#FDECEE",

  // misc (from kit)
  info: "#48BFE7",
  warn: "#FFDC5C",
} as const;

export const radius = { card: 16, product: 12, button: 12, pill: 50, chip: 50 } as const;

export const space = (n: number) => n * 4; // base 4 → screen pad space(4)=16, card pad space(5)=20

export const shadowCard = {
  shadowColor: "#A4ACB9",
  shadowOpacity: 0.24,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
} as const;

export type Band = "home_monitor" | "vet_soon" | "vet_urgent";
export const bandColor = (b: Band) =>
  b === "vet_urgent" ? colors.bandUrgent : b === "vet_soon" ? colors.bandSoon : colors.bandHome;
export const bandTint = (b: Band) =>
  b === "vet_urgent" ? colors.bandUrgentTint : b === "vet_soon" ? colors.bandSoonTint : colors.bandHomeTint;
export const bandLabel = (b: Band) =>
  b === "vet_urgent" ? "URGENT — ACT NOW" : b === "vet_soon" ? "SEE A VET SOON" : "MONITOR AT HOME";

export const theme = { colors, radius, space, shadowCard };
