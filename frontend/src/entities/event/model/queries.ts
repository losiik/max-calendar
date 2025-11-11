import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { CreateEventPayload } from "./types";
import {
  bookSlot,
  createEvent,
  fetchOwnCalendar,
  fetchSharedCalendar,
} from "../api";
import { calendarKeys } from "./query-keys";

export const usePersonalCalendarQuery = () => {
  return useQuery({
    queryKey: calendarKeys.personal(),
    queryFn: fetchOwnCalendar,
  });
};

export const useSharedCalendarQuery = (calendarId: string) => {
  return useQuery({
    queryKey: calendarKeys.shared(calendarId),
    queryFn: () => fetchSharedCalendar(calendarId),
    enabled: Boolean(calendarId),
  });
};

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.personal() });
    },
  });
};

export const useBookSlotMutation = (calendarId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => bookSlot(calendarId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.shared(calendarId) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.personal() });
    },
  });
};
