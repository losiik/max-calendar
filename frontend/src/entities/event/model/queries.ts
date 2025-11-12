import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateEventPayload } from "./types";
import {
  bookSlot,
  createEvent,
  deleteOwnTimeSlot,
  fetchOwnCalendar,
  fetchSharedCalendar,
  type CalendarMonthCursor,
} from "../api";
import { calendarKeys } from "./query-keys";
import { triggerHapticNotification } from "@/shared/lib/max-web-app";

export const usePersonalCalendarQuery = (cursor: CalendarMonthCursor) => {
  return useQuery({
    queryKey: calendarKeys.personal(cursor.year, cursor.month),
    queryFn: () => fetchOwnCalendar(cursor),
  });
};

export const useSharedCalendarQuery = (
  calendarId: string,
  cursor: CalendarMonthCursor
) => {
  return useQuery({
    queryKey: calendarKeys.shared(calendarId, cursor.year, cursor.month),
    queryFn: () => fetchSharedCalendar(calendarId, cursor),
    enabled: Boolean(calendarId),
  });
};

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: () => {
      triggerHapticNotification("success");
      queryClient.invalidateQueries({
        queryKey: calendarKeys.personalRoot(),
        exact: false,
      });
    },
  });
};

export const useBookSlotMutation = (calendarId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => bookSlot(calendarId, payload),
    onSuccess: () => {
      triggerHapticNotification("success");
      queryClient.invalidateQueries({
        queryKey: calendarKeys.sharedRoot(calendarId),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: calendarKeys.personalRoot(),
        exact: false,
      });
    },
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: string) => deleteOwnTimeSlot(slotId),
    onSuccess: () => {
      triggerHapticNotification("success");

      queryClient.invalidateQueries({
        queryKey: calendarKeys.personalRoot(),
        exact: false,
      });
    },
  });
};
