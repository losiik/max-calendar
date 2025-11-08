import { create } from "zustand";


type State = {
  minutes: number | "";
  hours: number | "";
  setHours: (v: number | "") => void;
  setMinutes: (v: number | "") => void;
  reset: () => void;
};

export const useAgendaStore = create<State>(

    (set) => ({
      minutes: "",
      hours: "",
      setHours: (v) => set({ hours: v }),
      setMinutes: (v) => set({ minutes: v }),
      reset: () => set({ minutes: "", hours: "" }),
    }),


);
