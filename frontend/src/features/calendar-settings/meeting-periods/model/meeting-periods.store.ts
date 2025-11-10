import { create } from "zustand";

export type PeriodKey = 15 | 30 | 45 | 60 | 90;

type State = {
  selected: PeriodKey | null;
  setSelected: (value: PeriodKey | null) => void;
};

export const useMeetingPeriodsStore = create<State>((set) => ({
  selected: null,
  setSelected: (value) => set({ selected: value }),
}));
