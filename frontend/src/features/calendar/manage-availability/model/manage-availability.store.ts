import { create } from "zustand";

import type {
  CalendarDay,
  CalendarEvent,
  EntityId,
} from "@/entities/event/model/types";

type ManageAvailabilityState = {
  selectedDay?: CalendarDay;
  isOpen: boolean;
  openDay: (day: CalendarDay) => void;
  close: () => void;
  appendEvent: (event: CalendarEvent) => void;
  removeEvent: (eventId: EntityId) => void;
};

export const useManageAvailabilityStore = create<ManageAvailabilityState>(
  (set) => ({
    selectedDay: undefined,
    isOpen: false,
    openDay: (day) => set({ selectedDay: day, isOpen: true }),
    close: () => set({ isOpen: false }),
    appendEvent: (event) =>
      set((state) => {
        if (!state.selectedDay) return state;
        const eventDate = event.startsAt.slice(0, 10);
        if (eventDate !== state.selectedDay.date) return state;
        const events = [...(state.selectedDay.events ?? []), event];
        return { selectedDay: { ...state.selectedDay, events } };
      }),
    removeEvent: (eventId) =>
      set((state) => {
        if (!state.selectedDay?.events?.length) return state;
        return {
          selectedDay: {
            ...state.selectedDay,
            events: state.selectedDay.events.filter(
              (event) =>
                event.id !== eventId &&
                event.slotId !== eventId &&
                event.slot_id !== eventId
            ),
          },
        };
      }),
  })
);
