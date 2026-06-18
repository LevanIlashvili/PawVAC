// Domain types (UI-phase shape; matches specs-v2 §7). Functionality binds in a later phase.
export type Species = "dog" | "cat" | "other";

export type EventKind =
  | "weight" | "meal" | "symptom" | "medication" | "vaccine"
  | "vet_visit" | "lab_result" | "note" | "document" | "triage";

export type EventSource = "voice" | "ocr" | "photo" | "manual" | "agent";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  sex?: "m" | "f";
  ageLabel?: string;     // e.g. "7y" (UI label; DOB math comes later)
  weightKg?: number;
  riskFlags: string[];
  color: string;         // dashboard color-coding (calendar dots, status cards)
  photoUri?: string;     // local image uri (expo-image-picker), optional
}

// A scheduled, dated item shown on the dashboard calendar/agenda (med dose, vaccine, appt).
export interface CalendarItem {
  id: string;
  petId: string;
  date: string;          // ISO "YYYY-MM-DD"
  kind: EventKind;
  title: string;
  timeLabel?: string;    // e.g. "8:00 pm"
  done?: boolean;
}

export interface TimelineEvent {
  id: string;
  petId: string;
  kind: EventKind;
  summary: string;
  dateLabel: string;     // e.g. "today", "Jan 15" (UI label)
  source: EventSource;
  confirmed: boolean;
}

export interface Reminder {
  id: string;
  petId: string;
  title: string;
  schedule: string;      // e.g. "twice a day"
  nextLabel: string;     // e.g. "today 8:00 pm"
  remainingLabel?: string;
  done?: boolean;
}
