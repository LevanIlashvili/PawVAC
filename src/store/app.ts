// App store — now backed by SQLite (src/db). Holds the active pet + a `rev` counter that
// bumps on every write so screens re-query and re-render. DB init/seed happens at startup.
import { create } from "zustand";
import { initSchema } from "@/db/schema";
import { seedIfEmpty } from "@/db/seed";
import * as repo from "@/db/repo";
import { Pet, TimelineEvent, Reminder, CalendarItem } from "@/data/types";

interface AppState {
  ready: boolean;
  rev: number;            // bumps on any mutation → selectors re-read
  activePetId: string;

  init: () => void;
  setActivePet: (id: string) => void;
  bump: () => void;

  // mutations (write through repo, then bump)
  addPet: (p: Omit<Pet, "id">) => string;
  updatePet: (id: string, p: Partial<Omit<Pet, "id">>) => void;
  addEvent: (e: Omit<TimelineEvent, "id">) => string;
  correctEvent: (id: string, patch: Partial<Omit<TimelineEvent, "id" | "petId">>) => void;
  deleteEvent: (id: string) => void;
  addReminder: (r: Omit<Reminder, "id">) => string;
  setReminderDone: (id: string, done: boolean) => void;
  snoozeReminder: (id: string, nextLabel: string) => void;
  addCalendarItem: (c: Omit<CalendarItem, "id">) => string;
}

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  rev: 0,
  activePetId: "",

  init: () => {
    initSchema();
    seedIfEmpty();
    const first = repo.listPets()[0];
    set({ ready: true, activePetId: first?.id ?? "" });
  },

  setActivePet: (id) => set({ activePetId: id }),
  bump: () => set((s) => ({ rev: s.rev + 1 })),

  addPet: (p) => { const id = repo.insertPet(p); set((s) => ({ rev: s.rev + 1, activePetId: id })); return id; },
  updatePet: (id, p) => { repo.updatePet(id, p); get().bump(); },
  addEvent: (e) => { const id = repo.insertEvent(e); get().bump(); return id; },
  correctEvent: (id, patch) => { repo.correctEvent(id, patch); get().bump(); },
  deleteEvent: (id) => { repo.deleteEvent(id); get().bump(); },
  addReminder: (r) => { const id = repo.insertReminder(r); get().bump(); return id; },
  setReminderDone: (id, done) => { repo.setReminderDone(id, done); get().bump(); },
  snoozeReminder: (id, nextLabel) => { repo.snoozeReminder(id, nextLabel); get().bump(); },
  addCalendarItem: (c) => { const id = repo.insertCalendarItem(c); get().bump(); return id; },
}));

// ---- selector hooks (re-read from repo whenever rev changes) ----
const useRev = () => useApp((s) => s.rev);

export const usePets = (): Pet[] => { useRev(); return repo.listPets(); };
export const useActivePet = (): Pet | undefined => {
  const id = useApp((s) => s.activePetId); useRev();
  return repo.getPet(id) ?? repo.listPets()[0];
};
export const usePetById = (petId: string): Pet | undefined => { useRev(); return repo.getPet(petId); };
export const useEventsFor = (petId: string): TimelineEvent[] => { useRev(); return repo.listEvents(petId); };
export const useEventById = (id: string): TimelineEvent | undefined => { useRev(); return repo.getEvent(id); };
export const useRemindersFor = (petId: string): Reminder[] => { useRev(); return repo.listReminders(petId); };
export const useNextReminder = (petId: string): Reminder | undefined => { useRev(); return repo.nextReminder(petId); };
export const useCalendar = (petId?: string): CalendarItem[] => { useRev(); return repo.listCalendar(petId); };
