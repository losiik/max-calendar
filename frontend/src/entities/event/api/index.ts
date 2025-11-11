import axios from "axios";

import type {
  CalendarDay,
  CalendarEvent,
  CreateEventPayload,
} from "../model/types";
import {
  mockGuestMeta,
  mockPersonalDays,
  mockSharedCalendars,
  pushPersonalEvent,
  pushSharedEvent,
} from "./mock-data";
import { getMaxUserId } from "@/shared/lib/max-web-app";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

type CalendarId = string;

const withMaxId = (payload: CreateEventPayload): CreateEventPayload => ({
  ...payload,
  maxId: payload.maxId ?? getMaxUserId(),
});

const useMocks = (import.meta.env.VITE_USE_MOCKS ?? "true") === "true";

const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const simulateNetwork = async <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 400));

export const fetchOwnCalendar = async (): Promise<CalendarDay[]> => {
  if (useMocks) {
    return simulateNetwork(clone(mockPersonalDays));
  }
  const { data } = await apiClient.get<CalendarDay[]>("/calendar");
  return data;
};

export const fetchSharedCalendar = async (
  calendarId: CalendarId
): Promise<CalendarDay[]> => {
  if (useMocks) {
    const calendar = mockSharedCalendars[calendarId] ?? [];
    return simulateNetwork(clone(calendar));
  }
  const { data } = await apiClient.get<CalendarDay[]>(
    `/external-calendar/${calendarId}`
  );
  return data;
};

export const createEvent = async (
  payload: CreateEventPayload
): Promise<CalendarEvent> => {
  const body = withMaxId(payload);
  if (useMocks) {
    const event: CalendarEvent = {
      ...body,
      id: uid(),
    };
    pushPersonalEvent(event);
    return simulateNetwork(event);
  }
  const { data } = await apiClient.post<CalendarEvent>("/events", body);
  return data;
};

export const bookSlot = async (
  calendarId: CalendarId,
  payload: CreateEventPayload
): Promise<CalendarEvent> => {
  const body = withMaxId(payload);
  if (useMocks) {
    const event: CalendarEvent = {
      ...body,
      id: uid(),
    };
    pushSharedEvent(calendarId, event);
    return simulateNetwork(event);
  }
  const { data } = await apiClient.post<CalendarEvent>(
    `/external-calendar/${calendarId}/book`,
    body
  );
  return data;
};

type GuestCalendarMeta = {
  token: string;
  calendarId: string;
  ownerId: string;
  ownerName: string;
  ownerUsername?: string;
  title: string;
};

export const fetchGuestCalendarMeta = async (
  token: string
): Promise<GuestCalendarMeta> => {
  if (useMocks) {
    const meta = mockGuestMeta[token];
    if (!meta) throw new Error("Guest calendar not found");
    return simulateNetwork(clone(meta));
  }
  const { data } = await apiClient.get<GuestCalendarMeta>(
    `/external-calendar/meta/${token}`
  );
  return data;
};
