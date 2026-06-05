// Mock data for the UI phase — a fake Toby (+ Luna, Pip) so screens have content.
// Replaced by the real store when functionality binds in a later phase.
import { Pet, TimelineEvent, Reminder } from "./types";

export const PETS: Pet[] = [
  { id: "toby", name: "Toby", species: "dog", breed: "Rottweiler", sex: "m", ageLabel: "7y", weightKg: 50, emoji: "🐕", riskFlags: ["large breed", "deep-chested"] },
  { id: "luna", name: "Luna", species: "cat", breed: "Domestic Shorthair", sex: "f", ageLabel: "4y", weightKg: 5, emoji: "🐈", riskFlags: [] },
  { id: "pip", name: "Pip", species: "other", breed: "Holland Lop", sex: "m", ageLabel: "2y", weightKg: 2, emoji: "🐇", riskFlags: [] },
];

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

export const eventsFor = (petId: string) => EVENTS.filter((e) => e.petId === petId);
export const remindersFor = (petId: string) => REMINDERS.filter((r) => r.petId === petId);
export const nextReminder = (petId: string) => remindersFor(petId)[0];
