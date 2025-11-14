import { create } from "zustand";

import type {
  CalendarDay,
  TimeRange,
} from "@/entities/event/model/types";

type BookingState = {
  selectedDay?: CalendarDay;
  selectedRange?: TimeRange;
  isOpen: boolean;
  isSuccessOverlayOpen: boolean;
  openDay: (day: CalendarDay) => void;
  close: () => void;
  selectRange: (range: TimeRange) => void;
  openSuccessOverlay: () => void;
  closeSuccessOverlay: () => void;
};

export const useBookSlotStore = create<BookingState>((set) => ({
  selectedDay: undefined,
  selectedRange: undefined,
  isOpen: false,
  isSuccessOverlayOpen: false,
  openDay: (day) =>
    set({
      selectedDay: day,
      isOpen: true,
      selectedRange: undefined,
      isSuccessOverlayOpen: false,
    }),
  close: () =>
    set({
      isOpen: false,
      selectedRange: undefined,
      selectedDay: undefined,
    }),
  selectRange: (range) => set({ selectedRange: range }),
  openSuccessOverlay: () => set({ isSuccessOverlayOpen: true }),
  closeSuccessOverlay: () => set({ isSuccessOverlayOpen: false }),
}));
