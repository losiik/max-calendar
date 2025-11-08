import axios from "axios";

import type {
  CalendarDay,
  CalendarEvent,
  CreateEventPayload,
} from "../model/types";
import type {
  SettingsResponse,
  SettingsUpdateRequest,
} from "@/entities/settings/types";
import {
  mockGuestMeta,
  mockPersonalDays,
  mockSettings,
  mockSharedCalendars,
  pushPersonalEvent,
  pushSharedEvent,
  updateMockSettings,
} from "./mock-data";
import {
  getMaxUserId,
  getWebAppUser,
} from "@/shared/lib/max-web-app";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
});

const isWebAppAvailable =
  typeof window !== "undefined" && typeof window.WebApp !== "undefined";
const envMockFlag = import.meta.env.VITE_USE_MOCKS;
const shouldMockByEnv = envMockFlag === "true";
const useMocks = shouldMockByEnv || !isWebAppAvailable;

export const isMockApi = useMocks;

type CalendarId = string;

export interface UserCreateRequest {
  max_id: number;
  name?: string | null;
  username?: string | null;
}

export interface ShareTokenResponse {
  token: string;
}

export interface TimeSlotDto {
  id?: string;
  meet_start_at: string;
  meet_end_at: string;
  title?: string;
  description?: string;
}

type GuestCalendarMeta = {
  token: string;
  calendarId: string;
  ownerId: string;
  ownerName: string;
  ownerUsername?: string;
  title: string;
};

const getBrowserTimezoneHours = () => -new Date().getTimezoneOffset() / 60;

export const getCurrentMaxId = (): number | null => {
  const raw = getMaxUserId();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const ensureMaxId = (): number => {
  const id = getCurrentMaxId();
  if (id === null) {
    throw new Error("MAX user id is not available");
  }
  return id;
};

const withMaxId = (payload: CreateEventPayload): CreateEventPayload => ({
  ...payload,
  maxId: payload.maxId ?? getMaxUserId(),
});

const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const simulateNetwork = async <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 300));

const toCalendarEvent = (slot: TimeSlotDto): CalendarEvent => ({
  id: slot.id ?? uid(),
  title: slot.title ?? "Встреча",
  description: slot.description,
  startsAt: slot.meet_start_at,
  endsAt: slot.meet_end_at,
});

const groupSlotsByDay = (slots: TimeSlotDto[]): CalendarDay[] => {
  const dayMap = new Map<string, CalendarDay>();
  slots.forEach((slot) => {
    if (!slot.meet_start_at) return;
    const dateKey = slot.meet_start_at.slice(0, 10);
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, { date: dateKey, events: [] });
    }
    const day = dayMap.get(dateKey)!;
    day.events = [...(day.events ?? []), toCalendarEvent(slot)];
  });
  return Array.from(dayMap.values());
};

export const fetchOwnCalendar = async (): Promise<CalendarDay[]> => {
  if (useMocks) {
    return simulateNetwork(clone(mockPersonalDays));
  }
  const maxId = getCurrentMaxId();
  if (!maxId) return [];

  const { data } = await apiClient.request<TimeSlotDto[]>({
    method: "GET",
    url: "/time_slots/my/",
    data: { max_id: maxId },
  });
  return groupSlotsByDay(data ?? []);
};

export const fetchSharedCalendar = async (
  calendarId: CalendarId
): Promise<CalendarDay[]> => {
  if (useMocks) {
    const calendar = mockSharedCalendars[calendarId] ?? [];
    return simulateNetwork(clone(calendar));
  }

  const { data } = await apiClient.request<TimeSlotDto[]>({
    method: "GET",
    url: "/time_slots/",
    data: { share_token: calendarId },
  });
  return groupSlotsByDay(data ?? []);
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

  await apiClient.put("/time_slots/", {
    max_id: body.maxId ? Number(body.maxId) : undefined,
    title: body.title,
    description: body.description,
    meet_start_at: body.startsAt,
    meet_end_at: body.endsAt,
  });

  return {
    ...body,
    id: uid(),
  };
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

  await apiClient.put("/time_slots/", {
    share_token: calendarId,
    title: body.title,
    description: body.description,
    meet_start_at: body.startsAt,
    meet_end_at: body.endsAt,
  });

  return {
    ...body,
    id: uid(),
  };
};

export const ensureUserRegistered = async (): Promise<void> => {
  if (useMocks) return;
  const maxId = getCurrentMaxId();
  if (!maxId) return;

  try {
    const user = getWebAppUser();
    await apiClient.put("/users/", {
      max_id: maxId,
      name: user?.first_name ?? user?.username ?? "MAX user",
      username: user?.username ?? undefined,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        console.warn("User registration skipped (network/CORS issue).");
        return;
      }
      if (error.response.status === 409) {
        return;
      }
    }
    console.error("Failed to ensure user exists", error);
  }
};

export const fetchSettings = async (): Promise<SettingsResponse | null> => {
  if (useMocks) {
    return simulateNetwork(clone(mockSettings));
  }
  const maxId = getCurrentMaxId();
  if (!maxId) return null;
  try {
    const { data } = await apiClient.get<SettingsResponse>("/settings/", {
      params: { max_id: maxId },
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.response?.status === 409) {
        return null;
      }
      if (!error.response) {
        console.warn("Settings request skipped (network/CORS issue).");
        return null;
      }
    }
    throw error;
  }
};

export const saveSettings = async (
  payload: SettingsUpdateRequest
): Promise<SettingsResponse> => {
  if (useMocks) {
    return simulateNetwork(clone(updateMockSettings(payload)));
  }
  const maxId = ensureMaxId();
  const body: SettingsUpdateRequest = {
    timezone: payload.timezone ?? getBrowserTimezoneHours(),
    ...payload,
  };
  const { data } = await apiClient.patch<SettingsResponse>("/settings/", body, {
    params: { max_id: maxId },
  });
  return data;
};

export const fetchGuestCalendarMeta = async (
  token: string
): Promise<GuestCalendarMeta> => {
  if (useMocks) {
    const meta = mockGuestMeta[token];
    if (!meta) throw new Error("Guest calendar not found");
    return simulateNetwork(clone(meta));
  }

  const ownerId = parseInt(token, 10);
  return {
    token,
    calendarId: token,
    ownerId: Number.isFinite(ownerId) ? String(ownerId) : token,
    ownerName: Number.isFinite(ownerId)
      ? `Календарь пользователя ${ownerId}`
      : "Расшаренный календарь",
    title: "Календарь пользователя",
  };
};
