// App-level UI state. In the UI phase this just tracks which pet is "active" so the
// shared header + tabs (Pets / Ask / Reminders) all act on the same pet.
import { create } from "zustand";
import { PETS } from "@/data/mock";

interface AppState {
  activePetId: string;
  setActivePet: (id: string) => void;
}

export const useApp = create<AppState>((set) => ({
  activePetId: PETS[0]?.id ?? "",
  setActivePet: (id) => set({ activePetId: id }),
}));

export const useActivePet = () => {
  const id = useApp((s) => s.activePetId);
  return PETS.find((p) => p.id === id) ?? PETS[0];
};
