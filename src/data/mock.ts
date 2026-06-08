// Mock data for the UI phase — a fake Toby (+ Luna, Pip) so screens have content.
// Replaced by the real store when functionality binds in a later phase.
import { Pet, TimelineEvent, Reminder, CalendarItem } from "./types";

export const PETS: Pet[] = [
  { id: "toby", name: "Toby", species: "dog", breed: "Rottweiler", sex: "m", ageLabel: "7y", weightKg: 50, riskFlags: ["large breed", "deep-chested"], color: "#E8853F" },
  { id: "luna", name: "Luna", species: "cat", breed: "Domestic Shorthair", sex: "f", ageLabel: "4y", weightKg: 5, riskFlags: [], color: "#48BFE7" },
  { id: "pip", name: "Pip", species: "other", breed: "Holland Lop", sex: "m", ageLabel: "2y", weightKg: 2, riskFlags: [], color: "#3ECF8E" },
];

export const petById = (id: string) => PETS.find((p) => p.id === id);

export const EVENTS: TimelineEvent[] = [
  { id: "e1", petId: "toby", kind: "symptom", summary: "Limping rear-left, off food", dateLabel: "today", source: "voice", confirmed: true },
  { id: "e2", petId: "toby", kind: "vaccine", summary: "Rabies booster", dateLabel: "Jan 15", source: "manual", confirmed: true },
  { id: "e3", petId: "toby", kind: "weight", summary: "50 kg", dateLabel: "Sep 1", source: "manual", confirmed: true },
  { id: "e4", petId: "toby", kind: "vet_visit", summary: "Vet visit: osteomyelitis, clindamycin course", dateLabel: "Mar '24", source: "ocr", confirmed: true },
  { id: "e5", petId: "toby", kind: "lab_result", summary: "CBC: WBC 14.2 (ref 6–17)", dateLabel: "Mar '24", source: "ocr", confirmed: true },
  { id: "e6", petId: "luna", kind: "note", summary: "New scratching post, settling in well", dateLabel: "2 days ago", source: "manual", confirmed: true },
];

export const REMINDERS: Reminder[] = [
  { id: "r1", petId: "toby", title: "Clindamycin", schedule: "twice a day", nextLabel: "today 8:00 pm", remainingLabel: "7 days left" },
  { id: "r2", petId: "toby", title: "Rabies due", schedule: "annual", nextLabel: "Jan 2027" },
];

// Dated, scheduled items for the dashboard calendar/agenda (around June 2026).
export const CALENDAR: CalendarItem[] = [
  { id: "c1", petId: "toby", date: "2026-06-21", kind: "medication", title: "Clindamycin", timeLabel: "8:00 am" },
  { id: "c2", petId: "toby", date: "2026-06-21", kind: "medication", title: "Clindamycin", timeLabel: "8:00 pm" },
  { id: "c3", petId: "luna", date: "2026-06-21", kind: "meal", title: "Weight check", timeLabel: "morning" },
  { id: "c4", petId: "toby", date: "2026-06-22", kind: "medication", title: "Clindamycin", timeLabel: "8:00 am" },
  { id: "c5", petId: "luna", date: "2026-06-24", kind: "vaccine", title: "FVRCP booster due", timeLabel: "vet" },
  { id: "c6", petId: "toby", date: "2026-06-26", kind: "vet_visit", title: "Recheck: limp / labs", timeLabel: "3:30 pm" },
  { id: "c7", petId: "pip", date: "2026-06-28", kind: "weight", title: "Monthly weigh-in" },
  { id: "c8", petId: "toby", date: "2026-07-02", kind: "medication", title: "Clindamycin course ends" },
  { id: "c9", petId: "pip", date: "2026-06-19", kind: "note", title: "Nail trim", done: true },
];

export const eventsFor = (petId: string) => EVENTS.filter((e) => e.petId === petId);
export const remindersFor = (petId: string) => REMINDERS.filter((r) => r.petId === petId);
export const nextReminder = (petId: string) => remindersFor(petId)[0];
export const calendarFor = (petId?: string) =>
  petId ? CALENDAR.filter((c) => c.petId === petId) : CALENDAR;
export const itemsOn = (date: string, petId?: string) =>
  calendarFor(petId).filter((c) => c.date === date);
