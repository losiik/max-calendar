import { create } from "zustand";

import type {
  CalendarDay,
  CalendarEvent,
  CreateEventPayload,
} from "./types";
import {
  bookSlot,
  createEvent,
  fetchOwnCalendar,
  fetchSharedCalendar,
} from "../api";

type CalendarState = {
  personalDays: CalendarDay[];
  sharedDays: CalendarDay[];
  isLoadingPersonal: boolean;
  isLoadingShared: boolean;
  fetchPersonal: () => Promise<void>;
  fetchShared: (calendarId: string) => Promise<void>;
  createPersonalEvent: (payload: CreateEventPayload) => Promise<CalendarEvent>;
  bookSharedSlot: (
    calendarId: string,
    payload: CreateEventPayload
  ) => Promise<CalendarEvent>;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  personalDays: [],
  sharedDays: [],
  isLoadingPersonal: false,
  isLoadingShared: false,

  fetchPersonal: async () => {
    set({ isLoadingPersonal: true });
    try {
      const days = await fetchOwnCalendar();
      set({ personalDays: days });
    } finally {
      set({ isLoadingPersonal: false });
    }
  },

  fetchShared: async (calendarId: string) => {
    set({ isLoadingShared: true });
    try {
      const days = await fetchSharedCalendar(calendarId);
      set({ sharedDays: days });
    } finally {
      set({ isLoadingShared: false });
    }
  },

  createPersonalEvent: async (payload: CreateEventPayload) => {
    const event = await createEvent(payload);
    set((state) => {
      const dayIndex = state.personalDays.findIndex(
        (day) => day.date === event.startsAt.slice(0, 10)
      );
      if (dayIndex === -1) return state;
      const updatedDays = [...state.personalDays];
      const targetDay = updatedDays[dayIndex];
      updatedDays[dayIndex] = {
        ...targetDay,
        events: [...(targetDay.events ?? []), event],
      };
      return { personalDays: updatedDays };
    });
    return event;
  },

  bookSharedSlot: async (calendarId, payload) => {
    const booking = await bookSlot(calendarId, payload);
    set((state) => {
      const dayIndex = state.sharedDays.findIndex(
        (day) => day.date === booking.startsAt.slice(0, 10)
      );
      if (dayIndex === -1) return state;
      const updatedDays = [...state.sharedDays];
      const targetDay = updatedDays[dayIndex];
      updatedDays[dayIndex] = {
        ...targetDay,
        events: [...(targetDay.events ?? []), booking],
      };
      return { sharedDays: updatedDays };
    });
    return booking;
  },
}));
