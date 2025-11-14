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
import { getMaxUserId, getWebApp } from "@/shared/lib/max-web-app";
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

const TOKEN_STORAGE_KEY = "max-calendar:auth-token";
const TOKEN_DEFAULT_TTL_MS = 2 * 60 * 60 * 1000;
const TOKEN_REFRESH_LEEWAY_MS = 2 * 60 * 1000;

type StoredAuthToken = {
  token: string;
  expiresAt: number;
};

let authToken: string | null = null;
let authTokenExpiresAt = 0;
let refreshTimer: number | null = null;
let authPromise: Promise<boolean> | null = null;
let initialAuthPerformed = false;

const isBrowser = typeof window !== "undefined";

export const sleep = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

const persistAuthToken = (value: StoredAuthToken) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // 
  }
};

const clearStoredAuthToken = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // 
  }
};

const setAuthToken = (token: string, ttlMs: number = TOKEN_DEFAULT_TTL_MS) => {
  authToken = token;
  authTokenExpiresAt = Date.now() + ttlMs;
  persistAuthToken({ token, expiresAt: authTokenExpiresAt });
  scheduleTokenRefresh();
};

const clearAuthToken = () => {
  authToken = null;
  authTokenExpiresAt = 0;
  if (refreshTimer && isBrowser) {
    window.clearTimeout(refreshTimer);
  }
  refreshTimer = null;
  clearStoredAuthToken();
};

const loadTokenFromStorage = () => {
  if (!isBrowser) return;
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredAuthToken;
    if (parsed.expiresAt > Date.now()) {
      authToken = parsed.token;
      authTokenExpiresAt = parsed.expiresAt;
      scheduleTokenRefresh();
    } else {
      clearStoredAuthToken();
    }
  } catch {
    clearStoredAuthToken();
  }
};

function scheduleTokenRefresh() {
  if (!isBrowser || !authTokenExpiresAt) return;
  if (refreshTimer) {
    window.clearTimeout(refreshTimer);
  }
  const delay = authTokenExpiresAt - Date.now() - TOKEN_REFRESH_LEEWAY_MS;
  if (delay <= 0) {
    void requestAuthToken();
    return;
  }
  refreshTimer = window.setTimeout(() => {
    void requestAuthToken();
  }, delay);
}

export const hasValidAuthToken = (): boolean =>
  Boolean(authToken && authTokenExpiresAt - Date.now() > TOKEN_REFRESH_LEEWAY_MS);

async function requestAuthToken(): Promise<boolean> {
  if (useMocks) return true;
  const initData = getWebApp()?.initData;
  if (!initData) {
    console.warn("MAX initData не доступна");
    return false;
  }
  try {
    const { data } = await apiClient.put<AuthResponse>("/users/", {
      init_data: initData,
    });
    if (data?.token) {
      const ttlMs = TOKEN_DEFAULT_TTL_MS;
      setAuthToken(data.token, ttlMs);
      return true;
    }
  } catch (error) {
    console.error("Failed to refresh auth token", error);
  }
  clearAuthToken();
  return false;
}

export const ensureAuthToken = async (): Promise<boolean> => {
  if (useMocks) return true;
  const needsUpdate = !initialAuthPerformed || !hasValidAuthToken();
  initialAuthPerformed = true;
  if (!needsUpdate) return true;
  if (!authPromise) {
    authPromise = requestAuthToken().finally(() => {
      authPromise = null;
    });
  }
  return authPromise;
};

const requireAuth = async () => {
  const ok = await ensureAuthToken();
  if (!ok) {
    throw new Error("Authorization token is not available");
  }
};

if (!useMocks) {
  loadTokenFromStorage();
}

apiClient.interceptors.request.use((config) => {
  if (!useMocks && authToken) {
    if (!config.headers?.set) {
      config.headers = new axios.AxiosHeaders(config.headers);
    }
    config.headers.set("Authorization", `Bearer ${authToken}`);
  }
  return config;
});

type CalendarId = string;

export type CalendarMonthCursor = {
  year: number;
  month: number;
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
  meeting_url: string;
  meet_end_at: number;
  title?: string | null;
  description?: string | null;
}

type SelfTimeSlotsGetResponse = {
  time_slots: GetSelfTimeSlot[];
};

type ExternalTimeSlotsGetResponse = SelfTimeSlotsGetResponse;

type SelfTimeSlot = GetSelfTimeSlot & { id?: string; slot_id?: string };

interface OnboardingResponse {
  success: boolean;
}

interface AuthResponse {
  token: string;
  expires_in?: number;
}

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
  title?: string | null;
  description?: string | null;
}

interface TimeSlotsSelfCreateRequest {
  meet_start_at: string;
  meet_end_at: string;
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

export const getBrowserTimezoneHours = () => -new Date().getTimezoneOffset() / 60;
export const getBrowserTimezoneLocation = () => new Date().toString().split('+')[1].split(' ')[1].replace(/(\(|,)/, '')
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

const fetchSelfSlotsForDate = async (date: string): Promise<SelfTimeSlot[]> => {
  await requireAuth();
  try {
    const safeDate = encodeURIComponent(date);
    const { data } = await apiClient.get<SelfTimeSlotsGetResponse>(
      `/time_slots/self/${safeDate}`
    );
    return data.time_slots ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response || error.response.status === 404) {
        
        return [];
      }
    }
    throw error;
  }
};

const fetchExternalSlotsForDate = async (
  calendarId: string,
  date: string
): Promise<SelfTimeSlot[]> => {
  await requireAuth();
  try {
    const safeCalendarId = encodeURIComponent(calendarId);
    const safeDate = encodeURIComponent(date);
    const { data } = await apiClient.get<ExternalTimeSlotsGetResponse>(
      `/time_slots/${safeCalendarId}/${safeDate}`
    );
    return data.time_slots ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        
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
          meetingUrl: slot.meeting_url ?? null,
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
  const currentUserId = getCurrentMaxId();
  if (!currentUserId) return [];

  const dates = buildMonthDates(cursor);
  const results = await Promise.all(
    dates.map(async (date) => {
      const slots = await fetchSelfSlotsForDate(date);
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

  const currentUserId = getCurrentMaxId();
  if (!currentUserId) return [];

  const dates = buildMonthDates(cursor);
  const results = await Promise.all(
    dates.map(async (date) => {
      const slots = await fetchExternalSlotsForDate(calendarId, date);
      return convertSlotsToCalendarDay(date, slots, { markEmptyAsDisabled: true });
    })
  );
  return results.filter(Boolean) as CalendarDay[];
};

export const createEvent = async (
  payload: CreateEventPayload
): Promise<CalendarEvent> => {
  const body = payload;
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

  await requireAuth();
  const request: TimeSlotsSelfCreateRequest = {
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
  const body = payload;
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

  await requireAuth();
  const request: TimeSlotsCreateRequest = {
    owner_token: calendarId,
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
  await requireAuth();
  const safeSlotId = encodeURIComponent(slotId);
  await apiClient.delete(`/time_slots/self/${safeSlotId}`);
};

export const ensureUserRegistered = async (): Promise<boolean> => {
  return ensureAuthToken();
};

export const fetchOnboardingStatus = async (): Promise<boolean> => {
  if (useMocks) return true;
  await requireAuth();
  try {
    const { data } = await apiClient.get<OnboardingResponse>("/onboarding/");
    return Boolean(data?.success);
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const completeOnboardingRemote = async (): Promise<boolean> => {
  if (useMocks) return true;
  await requireAuth();
  try {
    const { data } = await apiClient.post<OnboardingResponse>("/onboarding/");
    return Boolean(data?.success);
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const resetOnboardingRemote = async (): Promise<boolean> => {
  if (useMocks) return true;
  await requireAuth();
  try {
    const { data } = await apiClient.delete<OnboardingResponse>("/onboarding/");
    return Boolean(data?.success);
  } catch (error) {
    console.error(error);
    return false;
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
        
        return null;
      }
      if (error.response.status === 404 || error.response.status === 409) {
        return null;
      }
    }
    
    return null;
  }
};

export const fetchSettings = async (): Promise<SettingsResponse | null> => {
  if (useMocks) {
    return simulateNetwork(clone(mockSettings));
  }
  await requireAuth();
  await sleep(1000);
  try {
    const { data } = await apiClient.get<SettingsResponse>("/settings/");
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.response?.status === 409) {
        return null;
      }
      if (!error.response) {
        
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
  await requireAuth();
  const body: SettingsUpdateRequest = {
    timezone: payload.timezone ?? getBrowserTimezoneHours(),
    ...payload,
  };
  const { data } = await apiClient.patch<SettingsResponse>("/settings/", body);

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
