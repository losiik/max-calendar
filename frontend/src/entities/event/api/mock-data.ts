import type {
  CalendarDay,
  CalendarEvent,
  ISODateString,
} from "../model/types";
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
  title: string
): CalendarEvent => {
  const start = new Date(date);
  start.setHours(startHours, startMinutes, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  return {
    id: uid(),
    title,
    description: "",
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
  };
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const twoDaysLater = new Date(today);
twoDaysLater.setDate(today.getDate() + 2);

const todayEvent = buildEvent(today, 10, 0, 60, "Стэндап команды");
const todayGuestEvent = buildEvent(
  today,
  15,
  30,
  30,
  "Встреча с заказчиком"
);
const tomorrowEvent = buildEvent(tomorrow, 9, 0, 45, "Интервью кандидата");

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
  const date = event.startsAt.slice(0, 10);
  const day = mockPersonalDays.find((d) => d.date === date);
  if (day) {
    day.events = [...(day.events ?? []), event];
  } else {
    mockPersonalDays.push({ date, events: [event] });
  }
};

export const pushSharedEvent = (calendarId: string, event: CalendarEvent) => {
  const calendar = mockSharedCalendars[calendarId] ?? [];
  const date = event.startsAt.slice(0, 10);
  const day = calendar.find((d) => d.date === date);
  if (day) {
    day.events = [...(day.events ?? []), event];
  } else {
    calendar.push({ date, events: [event] });
  }
  mockSharedCalendars[calendarId] = calendar;
  pushPersonalEvent(event);
};
