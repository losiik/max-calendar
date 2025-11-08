import { create } from "zustand";

type EventFormState = {
  defaultReminderMinutes: number;
  setDefaultReminderMinutes: (value: number) => void;
};

export const useEventFormStore = create<EventFormState>((set) => ({
  defaultReminderMinutes: 30,
  setDefaultReminderMinutes: (value) => set({ defaultReminderMinutes: value }),
}));
