import type {
  CalendarDay,
  CalendarEvent,
  ISODateString,
} from "../model/types";
import type { SettingsResponse } from "@/entities/settings/types";
import { toLocalISODate } from "@/shared/util/date";

const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const formatDate = (date: Date): ISODateString => toLocalISODate(date);

const buildEvent = (
  date: Date,
  startHours: number,
  startMinutes: number,
  durationMinutes: number,
  title: string,
  meetingUrl: string,

): CalendarEvent => {
  const id = uid();
  const start = new Date(date);
  start.setHours(startHours, startMinutes, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  return {
    id,
    slotId: id,
    title,
    description: "Очень длинное поисание писать стоят  мальчик Италия жетско конь трава корова скачки кнут девочка",
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    meetingUrl,
  };
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const twoDaysLater = new Date(today);
twoDaysLater.setDate(today.getDate() + 2);

const todayEvent = buildEvent(today, 10, 0, 60, "Стэндап команды", "https://web.max.ru/74771308");
const todayGuestEvent = buildEvent(
  today,
  15,
  30,
  30,
  "Встреча с заказчиком"
, "https://web.max.ru/74771308");
const tomorrowEvent = buildEvent(tomorrow, 9, 0, 45, "Интервью кандидата", "https://web.max.ru/74771308");

export const mockPersonalDays: CalendarDay[] = [
  {
    date: formatDate(today),
    events: [todayEvent, todayGuestEvent],
  },
  {
    date: formatDate(tomorrow),
    events: [tomorrowEvent],
  },
  {
    date: formatDate(twoDaysLater),
    events: [],
  },
];

const baseSharedDays: CalendarDay[] = [
  {
    date: formatDate(today),
    events: [todayEvent],
    availability: [
      { start: "11:00", end: "13:00" },
      { start: "16:00", end: "18:00" },
    ],
  },
  {
    date: formatDate(tomorrow),
    events: [],
    availability: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
  },
];

export const mockSharedCalendars: Record<string, CalendarDay[]> = {
  demo: baseSharedDays,
  "dfkdfmvkfmvkm": baseSharedDays,
};

export let mockSettings: SettingsResponse = {
  timezone: 0,
  work_time_start: 9,
  work_time_end: 18,
  duration_minutes: 30,
  alert_offset_minutes: 30,
  daily_reminder_time: 9,
  working_days: ["пн", "вт", "ср", "чт", "пт"],
};

export const updateMockSettings = (
  changes: Partial<SettingsResponse>
): SettingsResponse => {
  mockSettings = { ...mockSettings, ...changes };
  return mockSettings;
};

type GuestMeta = {
  token: string;
  calendarId: string;
  ownerId: string;
  ownerName: string;
  ownerUsername?: string;
  title: string;
};

export const mockGuestMeta: Record<string, GuestMeta> = {
  dfkdfmvkfmvkm: {
    token: "dfkdfmvkfmvkm",
    calendarId: "dfkdfmvkfmvkm",
    ownerId: "54321",
    ownerName: "Максим Петров",
    ownerUsername: "calendar.host",
    title: "Календарь Максима Петрова",
  },
};

export const pushPersonalEvent = (event: CalendarEvent) => {
  const normalizedId = event.id ?? uid();
  const normalized: CalendarEvent = {
    ...event,
    id: normalizedId,
    slotId: event.slotId ?? normalizedId,
    slot_id: event.slot_id ?? event.slotId ?? normalizedId,
  };
  const date = event.startsAt.slice(0, 10);
  const day = mockPersonalDays.find((d) => d.date === date);
  if (day) {
    day.events = [...(day.events ?? []), normalized];
  } else {
    mockPersonalDays.push({ date, events: [normalized] });
  }
};

export const pushSharedEvent = (calendarId: string, event: CalendarEvent) => {
  const normalizedId = event.id ?? uid();
  const normalized: CalendarEvent = {
    ...event,
    id: normalizedId,
    slotId: event.slotId ?? normalizedId,
    slot_id: event.slot_id ?? event.slotId ?? normalizedId,
  };
  const calendar = mockSharedCalendars[calendarId] ?? [];
  const date = normalized.startsAt.slice(0, 10);
  const day = calendar.find((d) => d.date === date);
  if (day) {
    day.events = [...(day.events ?? []), normalized];
  } else {
    calendar.push({ date, events: [normalized] });
  }
  mockSharedCalendars[calendarId] = calendar;
  pushPersonalEvent(normalized);
};

export const removeMockPersonalEvent = (slotId: string) => {
  const matcher = (event?: CalendarEvent) =>
    event
      ? event.slotId === slotId ||
        event.slot_id === slotId ||
        event.id === slotId
      : false;

  mockPersonalDays.forEach((day) => {
    if (!day.events) return;
    day.events = day.events.filter((event) => !matcher(event));
  });

  Object.keys(mockSharedCalendars).forEach((key) => {
    const calendar = mockSharedCalendars[key];
    calendar.forEach((day) => {
      if (!day.events) return;
      day.events = day.events.filter((event) => !matcher(event));
    });
  });
};
