import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  minutes: number | "";
  hours: number | "";
  setHours: (v: number | "") => void;
  setMinutes: (v: number | "") => void;
  reset: () => void;
};

export const useAgendaStore = create<State>()(
  persist(
    (set) => ({
      minutes: "",
      hours: "",
      setHours: (v) => set({ hours: v }),
      setMinutes: (v) => set({ minutes: v }),
      reset: () => set({ minutes: "", hours: "" }),
    }),
    { name: "agenda-settings" }
  )
);
