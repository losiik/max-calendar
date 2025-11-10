import axios from "axios";

import type {
  CalendarDay,
  CalendarEvent,
  CreateEventPayload,
  TimeRange,
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
  removeMockPersonalEvent,
  updateMockSettings,
} from "./mock-data";
import {
  getMaxUserId,
  getWebAppUser,
} from "@/shared/lib/max-web-app";
import { toLocalISODate } from "@/shared/util/date";
import { toTimeParts } from "@/shared/util/time";

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

export type CalendarMonthCursor = {
  year: number;
  month: number; // 0-11
};

type CalendarMonthInput = {
  year?: number;
  month?: number;
};

export interface UserCreateRequest {
  max_id: number;
  name?: string | null;
  username?: string | null;
}

export interface ShareTokenResponse {
  token: string;
}

interface GetSelfTimeSlot {
  id?: string;
  slot_id?: string;
  meet_start_at: number;
  meet_end_at: number;
  title?: string | null;
  description?: string | null;
}

type SelfTimeSlotsGetResponse = {
  time_slots: GetSelfTimeSlot[];
};

type ExternalTimeSlotsGetResponse = SelfTimeSlotsGetResponse;

type SelfTimeSlot = GetSelfTimeSlot & { id?: string; slot_id?: string };

interface TimeSlotsCreateResponse {
  id: string;
}

export interface UserNameCreateResponse {
  name: string
}
export interface UserNameCreateRequest {
  token: string
}


interface TimeSlotsCreateRequest {
  meet_start_at: string;
  meet_end_at: string;
  owner_token: string;
  invited_max_id: number;
  title?: string | null;
  description?: string | null;
}

interface TimeSlotsSelfCreateRequest {
  meet_start_at: string;
  meet_end_at: string;
  max_id: number;
  title?: string | null;
  description?: string | null;
}

type GuestCalendarMeta = {
  token: string;
  calendarId: string;
  ownerId: string;
  ownerName: string;
  ownerUsername?: string;
  title: string;
};

interface TokenOwnerResponse {
  name: string | null;

}

const getBrowserTimezoneHours = () => -new Date().getTimezoneOffset() / 60;

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateTimeForApi = (iso: string): string => {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const resolveMonthCursor = (input?: CalendarMonthInput): CalendarMonthCursor => {
  const now = new Date();
  const month =
    typeof input?.month === "number" && input.month >= 0 && input.month <= 11
      ? input.month
      : now.getMonth();
  const year = typeof input?.year === "number" ? input.year : now.getFullYear();
  return { year, month };
};

const buildMonthDates = ({ year, month }: CalendarMonthCursor): string[] => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const cursor = new Date(start);
  const dates: string[] = [];
  while (cursor <= end) {
    dates.push(toLocalISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const filterDaysByCursor = (
  days: CalendarDay[],
  cursor: CalendarMonthCursor
): CalendarDay[] =>
  days.filter((day) => {
    const parsed = new Date(day.date);
    return (
      parsed.getFullYear() === cursor.year && parsed.getMonth() === cursor.month
    );
  });

const combineDateAndFloatTime = (date: string, floatValue: number): string => {
  const { hours, minutes } = toTimeParts(floatValue);
  const h = hours === "" ? 0 : hours;
  const m = minutes === "" ? 0 : minutes;
  const local = new Date(`${date}T${pad(h)}:${pad(m)}:00`);
  return local.toISOString();
};

const floatToTimeLabel = (floatValue: number): string => {
  const { hours, minutes } = toTimeParts(floatValue);
  const h = hours === "" ? 0 : hours;
  const m = minutes === "" ? 0 : minutes;
  return `${pad(h)}:${pad(m)}`;
};

const fetchSelfSlotsForDate = async (
  maxId: number,
  date: string
): Promise<SelfTimeSlot[]> => {
  try {
    const { data } = await apiClient.get<SelfTimeSlotsGetResponse>(
      `/time_slots/self/${maxId}/${date}`
    );
    return data.time_slots ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response || error.response.status === 404) {
        console.warn("Self time slots request blocked (network/CORS).");
        return [];
      }
    }
    throw error;
  }
};

const fetchExternalSlotsForDate = async (
  calendarId: string,
  date: string,
  invitedId: number
): Promise<SelfTimeSlot[]> => {
  if (!invitedId) return [];
  try {
    const { data } = await apiClient.get<ExternalTimeSlotsGetResponse>(
      `/time_slots/${invitedId}/${calendarId}/${date}`,
    );
    return data.time_slots ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        console.warn("External time slots blocked (network/CORS).");
        return [];
      }
      if (error.response.status === 404 || error.response.status === 409) {
        return [];
      }
    }
    throw error;
  }
};

const convertSlotsToCalendarDay = (
  date: string,
  slots: SelfTimeSlot[],
  options?: { markEmptyAsDisabled?: boolean }
): CalendarDay | null => {
  if (!slots.length) {
    if (options?.markEmptyAsDisabled) {
      return { date, events: [], availability: [], isDisabled: true };
    }
    return null;
  }
  const events: CalendarEvent[] = [];
  const availability: TimeRange[] = [];

  [...slots]
    .sort((a, b) => a.meet_start_at - b.meet_start_at)
    .forEach((slot) => {
      const startISO = combineDateAndFloatTime(date, slot.meet_start_at);
      const endISO = combineDateAndFloatTime(date, slot.meet_end_at);
      const startLabel = floatToTimeLabel(slot.meet_start_at);
      const endLabel = floatToTimeLabel(slot.meet_end_at);
      const title = slot.title?.trim();
      const serverSlotId = slot.slot_id ?? slot.id;
      const slotUuid = serverSlotId ?? uid();

      if (title) {
        events.push({
          id: slotUuid,
          slotId: slotUuid,
          slot_id: serverSlotId,
          title,
          description: slot.description ?? undefined,
          startsAt: startISO,
          endsAt: endISO,
        });
      } else {
        availability.push({
          start: startLabel,
          end: endLabel,
          startISO,
          endISO,
          slotId: slotUuid,
        });
      }
    });

  if (!events.length && !availability.length) return null;
  return {
    date,
    events: events.length ? events : undefined,
    availability: availability.length ? availability : undefined,
    isDisabled: false,
  };
};

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

export const fetchOwnCalendar = async (
  input?: CalendarMonthInput
): Promise<CalendarDay[]> => {
  const cursor = resolveMonthCursor(input);
  if (useMocks) {
    return simulateNetwork(clone(filterDaysByCursor(mockPersonalDays, cursor)));
  }
  const maxId = getCurrentMaxId();
  if (!maxId) return [];

  const dates = buildMonthDates(cursor);
  const results = await Promise.all(
    dates.map(async (date) => {
      const slots = await fetchSelfSlotsForDate(maxId, date);
      return convertSlotsToCalendarDay(date, slots);
    })
  );
  return results.filter(Boolean) as CalendarDay[];
};

export const fetchSharedCalendar = async (
  calendarId: CalendarId,
  input?: CalendarMonthInput
): Promise<CalendarDay[]> => {
  const cursor = resolveMonthCursor(input);
  if (useMocks) {
    const calendar = mockSharedCalendars[calendarId] ?? [];
    return simulateNetwork(clone(filterDaysByCursor(calendar, cursor)));
  }

  const invitedId = getCurrentMaxId();
  if (!invitedId) return [];

  const dates = buildMonthDates(cursor);
  const results = await Promise.all(
    dates.map(async (date) => {
      const slots = await fetchExternalSlotsForDate(calendarId, date, invitedId);
      return convertSlotsToCalendarDay(date, slots, { markEmptyAsDisabled: true });
    })
  );
  return results.filter(Boolean) as CalendarDay[];
};

export const createEvent = async (
  payload: CreateEventPayload
): Promise<CalendarEvent> => {
  const body = withMaxId(payload);
  if (useMocks) {
    const slotUuid = uid();
    const event: CalendarEvent = {
      ...body,
      id: slotUuid,
      slotId: slotUuid,
      slot_id: slotUuid,
    };
    pushPersonalEvent(event);
    return simulateNetwork(event);
  }

  const request: TimeSlotsSelfCreateRequest = {
    max_id: ensureMaxId(),
    meet_start_at: formatDateTimeForApi(body.startsAt),
    meet_end_at: formatDateTimeForApi(body.endsAt),
    title: body.title ?? null,
    description: body.description ?? null,
  };

  const { data } = await apiClient.put<TimeSlotsCreateResponse>(
    "/time_slots/self/",
    request
  );

  const persistedId = data?.id ?? uid();
  return {
    ...body,
    id: body.id ?? persistedId,
    slotId: body.slotId ?? persistedId,
    slot_id: persistedId,
  };
};

export const bookSlot = async (
  calendarId: CalendarId,
  payload: CreateEventPayload
): Promise<CalendarEvent> => {
  const body = withMaxId(payload);
  if (useMocks) {
    const slotUuid = uid();
    const event: CalendarEvent = {
      ...body,
      id: slotUuid,
      slotId: slotUuid,
      slot_id: slotUuid,
    };
    pushSharedEvent(calendarId, event);
    return simulateNetwork(event);
  }

  const request: TimeSlotsCreateRequest = {
    owner_token: calendarId,
    invited_max_id: ensureMaxId(),
    meet_start_at: formatDateTimeForApi(body.startsAt),
    meet_end_at: formatDateTimeForApi(body.endsAt),
    title: body.title ?? null,
    description: body.description ?? null,
  };

  const { data } = await apiClient.put<TimeSlotsCreateResponse>(
    "/time_slots/",
    request
  );

  const persistedId = data?.id ?? uid();
  return {
    ...body,
    id: body.id ?? persistedId,
    slotId: body.slotId ?? persistedId,
    slot_id: persistedId,
  };
};

export const deleteOwnTimeSlot = async (slotId: string): Promise<void> => {
  if (!slotId) return;
  if (useMocks) {
    removeMockPersonalEvent(slotId);
    return simulateNetwork(undefined);
  }
  const maxId = ensureMaxId();
  await apiClient.delete(`/time_slots/self/${maxId}/${slotId}`);
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


export const getNameByToken = async (
  token: string
): Promise<TokenOwnerResponse | null> => {
  if (!token) return null;

  if (useMocks) {
    const meta = mockGuestMeta[token];
    return meta
      ? {
          name: meta.ownerName,
        }
      : null;
  }

  try {
    const { data } = await apiClient.get<TokenOwnerResponse>(
      `/users/by/token/${token}`
    );
    return data ?? null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        console.warn("Owner name request skipped (network/CORS issue).");
        return null;
      }
      if (error.response.status === 404 || error.response.status === 409) {
        return null;
      }
    }
    console.error("Failed to fetch user by token", error);
    return null;
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

  const zeroSafeFields: Array<
    Extract<
      keyof SettingsResponse,
      | "timezone"
      | "work_time_start"
      | "work_time_end"
      | "daily_reminder_time"
      | "alert_offset_minutes"
      | "duration_minutes"
    >
  > = [
    "timezone",
    "work_time_start",
    "work_time_end",
    "daily_reminder_time",
    "alert_offset_minutes",
    "duration_minutes",
  ];

  const normalized: SettingsResponse = { ...data };
  zeroSafeFields.forEach((field) => {
    if (payload[field] === 0) {
      normalized[field] = 0;
    }
  });

  return normalized;
};

export const fetchGuestCalendarMeta = async (
  token: string
): Promise<GuestCalendarMeta> => {
  if (useMocks) {
    const meta = mockGuestMeta[token];
    if (!meta) throw new Error("Guest calendar not found");
    return simulateNetwork(clone(meta));
  }

  const ownerInfo = await getNameByToken(token);
  const ownerName =
    ownerInfo?.name ?? ownerInfo?.name ?? "Кто-то ";

  return {
    token,
    calendarId: token,
    ownerId: token,
    ownerName,
    ownerUsername: ownerInfo?.name ?? undefined,
    title: `Вы просматриваете чужой календарь`,
  };
};
