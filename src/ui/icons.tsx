// Central icon system — MaterialCommunityIcons throughout (has real dog/cat/rabbit glyphs).
// One <Icon> wrapper + name maps for our domain concepts, so usage is consistent everywhere.
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { EventKind, Species } from "@/data/types";
import { colors } from "./theme";

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

export function Icon({ name, size = 22, color = colors.ink }: { name: MCIName; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

// Pet species → distinct MCI glyphs.
export const speciesIcon: Record<Species, MCIName> = {
  dog: "dog",
  cat: "cat",
  other: "rabbit",
};

// Timeline event kinds → MCI glyphs.
export const kindIcon: Record<EventKind, MCIName> = {
  weight: "scale-bathroom",
  meal: "food-drumstick",
  symptom: "bandage",
  medication: "pill",
  vaccine: "needle",
  vet_visit: "hospital-box",
  lab_result: "test-tube",
  note: "note-text",
  document: "file-document",
  triage: "help-circle",
};

// Bottom-tab icons.
export const tabIcon = {
  home: "view-dashboard" as MCIName,
  timeline: "timeline-text" as MCIName,
  ask: "comment-question" as MCIName,
  reminders: "bell" as MCIName,
  pack: "file-document" as MCIName,
};

// Entry-action / misc icons used in the UI.
export const ui = {
  voice: "microphone" as MCIName,
  scan: "camera" as MCIName,
  add: "pencil" as MCIName,
  plus: "plus" as MCIName,
  settings: "cog" as MCIName,
  gear: "cog" as MCIName,
  flag: "flag" as MCIName,
  riskFlag: "alert" as MCIName,
  back: "chevron-left" as MCIName,
  mic: "microphone" as MCIName,
  reminder: "bell" as MCIName,
  vaccineDue: "calendar-clock" as MCIName,
  paw: "paw" as MCIName,
};
