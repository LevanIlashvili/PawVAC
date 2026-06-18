// Seed data — Toby's real record (mapped from the patient health record markdown).
// This is the first-run seed copied into SQLite by src/db/seed.ts.
import { Pet, TimelineEvent, Reminder, CalendarItem } from "./types";

export const PETS: Pet[] = [
  {
    id: "toby",
    name: "Toby",
    species: "dog",
    breed: "Rottweiler",
    sex: "m",
    ageLabel: "7y",
    weightKg: 48,
    riskFlags: ["large breed", "deep-chested"],
    color: "#E8853F",
  },
];

export const petById = (id: string) => PETS.find((p) => p.id === id);

// Timeline = the clinically meaningful record, newest first (the store/UI render order).
// Dates are the real ones from the record; [approx] dates kept as given.
export const EVENTS: TimelineEvent[] = [
  { id: "e_mdt",      petId: "toby", kind: "vet_visit",  summary: "MDT discussion (ortho/surgery + oncology): immune-mediated bone disease now a differential. Analgesia only to date. OPEN: bone culture to exclude infection — infection NOT yet excluded.", dateLabel: "Jun 22", source: "manual", confirmed: true },
  { id: "e_xray3",    petId: "toby", kind: "lab_result", summary: "Follow-up radiograph (hindlimb stifle, lateral): lesion appearance stable vs prior; focal lucencies correspond to the bone-biopsy site (confirmed with surgeon), not a primary lesion.", dateLabel: "Jun 20", source: "ocr",    confirmed: true },
  { id: "e_osa_out",  petId: "toby", kind: "note",       summary: "Osteosarcoma RULED OUT — histology negative, cytology negative, no radiographic progression over ~5 weeks.", dateLabel: "Jun 20", source: "manual", confirmed: true },
  { id: "e_cyto",     petId: "toby", kind: "lab_result", summary: "Cytology: negative for neoplasia.", dateLabel: "Jun 19", source: "ocr", confirmed: true },
  { id: "e_histo",    petId: "toby", kind: "lab_result", summary: "Bone biopsy histopathology: chronic osteomyelitis + focal fibrosis; mild chronic mixed-cell inflammation; partial trabecular destruction. No evidence of sarcoma. (Dr. Baade / Dr. Kirchhoff)", dateLabel: "Jun 18", source: "ocr", confirmed: true },
  { id: "e_onsior_end", petId: "toby", kind: "medication", summary: "Onsior (robenacoxib) course completed; continued on ongoing analgesia.", dateLabel: "Jun 16", source: "manual", confirmed: true },
  { id: "e_biopsy",   petId: "toby", kind: "vet_visit",  summary: "Bone biopsy under general anaesthesia (creates focal lucencies at the sample site).", dateLabel: "Jun 12", source: "manual", confirmed: true },
  { id: "e_ct",       petId: "toby", kind: "lab_result", summary: "CT scan (pelvic limb / stifle): findings NOT fully consistent with sarcoma.", dateLabel: "Jun 9", source: "ocr", confirmed: true },
  { id: "e_consult",  petId: "toby", kind: "vet_visit",  summary: "Primary consult: acute pelvic-limb lameness, severe. Initial radiographs — aggressive-appearing lytic lesion, osteosarcoma suspected. Onsior started.", dateLabel: "Jun 5", source: "manual", confirmed: true },
  { id: "e_sx_lame",  petId: "toby", kind: "symptom",    summary: "Pelvic-limb lameness (rear), severe — acute onset; can barely weight-bear on the affected limb.", dateLabel: "Jun 5", source: "voice", confirmed: true },
  { id: "e_sx_fall",  petId: "toby", kind: "symptom",    summary: "Instability / near-falls — nearly fell twice in one day; localized pain at the stifle.", dateLabel: "Jun 5", source: "voice", confirmed: true },
  { id: "e_weight",   petId: "toby", kind: "weight",     summary: "48 kg", dateLabel: "Jun 5", source: "manual", confirmed: true },
];

export const REMINDERS: Reminder[] = [
  { id: "r_analgesia", petId: "toby", title: "Pain meds (analgesia)", schedule: "ongoing", nextLabel: "today", remainingLabel: "monitor for breakthrough pain" },
  { id: "r_culture",   petId: "toby", title: "Bone culture (bacterial + fungal)", schedule: "one-off", nextLabel: "with vet — HIGH priority", remainingLabel: "exclude infection" },
];

// Dated items for the dashboard calendar/agenda (ISO dates from the record).
export const CALENDAR: CalendarItem[] = [
  { id: "c_consult", petId: "toby", date: "2026-06-05", kind: "vet_visit",  title: "Primary consult + first X-rays", done: true },
  { id: "c_ct",      petId: "toby", date: "2026-06-09", kind: "lab_result", title: "CT scan", done: true },
  { id: "c_biopsy",  petId: "toby", date: "2026-06-12", kind: "vet_visit",  title: "Bone biopsy (GA)", done: true },
  { id: "c_histo",   petId: "toby", date: "2026-06-18", kind: "lab_result", title: "Histopathology result", done: true },
  { id: "c_xray3",   petId: "toby", date: "2026-06-20", kind: "lab_result", title: "Follow-up radiograph", done: true },
  { id: "c_mdt",     petId: "toby", date: "2026-06-22", kind: "vet_visit",  title: "MDT case discussion", done: true },
  // Upcoming
  { id: "c_onco",    petId: "toby", date: "2026-06-24", kind: "vet_visit",  title: "Call oncologist for follow-up" },
  { id: "c_chest",   petId: "toby", date: "2026-06-30", kind: "lab_result", title: "Chest X-ray scan", timeLabel: "imaging" },
];

export const eventsFor = (petId: string) => EVENTS.filter((e) => e.petId === petId);
export const remindersFor = (petId: string) => REMINDERS.filter((r) => r.petId === petId);
export const nextReminder = (petId: string) => remindersFor(petId)[0];
export const calendarFor = (petId?: string) =>
  petId ? CALENDAR.filter((c) => c.petId === petId) : CALENDAR;
export const itemsOn = (date: string, petId?: string) =>
  calendarFor(petId).filter((c) => c.date === date);
