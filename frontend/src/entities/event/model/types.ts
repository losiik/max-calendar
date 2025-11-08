/**
 * Common type aliases reused across the calendar domain.
 */
export type EntityId = string;
export type ISODateString = string; // e.g. "2025-02-14"
export type ISOTimeString = string; // e.g. "13:30"
export type ISODateTimeString = string; // e.g. "2025-02-14T13:30:00.000Z"

/**
 * Поля, общие для собственного события и для слота, который забронировали извне.
 * Наследуемся от этой базы, чтобы не дублировать свойства.
 */
export interface BaseEventFields {
  title: string;
  description?: string;
  url?: string;
  startsAt: ISODateTimeString;
  endsAt: ISODateTimeString;
  reminderMinutes?: number;
}

/**
 * Единый тип события. На клиенте мы не отличаем свои события от слотов,
 * поставленных гостями: обе сущности приходят/уходят через один и тот же контракт.
 */
export interface CalendarEvent extends BaseEventFields {
  id?: EntityId; // от бэка
  maxId?: string; // только при отправке: WebAppData.user.id
}

/**
 * Alias для тех случаев, когда нужно явно подчеркнуть гостевую бронь.
 * По структуре это тот же CalendarEvent.
 */
export type BookingSlot = CalendarEvent;

/**
 * Availability windows returned by the backend for the external calendar page.
 * They already include working hours, agenda reminders, etc.
 */
export interface AvailabilityWindow {
  date: ISODateString;
  ranges: TimeRange[];
}

export interface TimeRange {
  start: ISOTimeString;
  end: ISOTimeString;
}

/**
 * Unified representation of a calendar day used by the shared calendar widget.
 */
export interface CalendarDay {
  date: ISODateString;
  events?: CalendarEvent[]; // все события, включая гостевые слоты
  availability?: TimeRange[]; // свободные окна, которые можно показать гостю
}

/**
 * Payloads for creating events / booking slots.
 */
export interface CreateEventPayload extends BaseEventFields {
  id?: EntityId;
  maxId?: string;
}

/**
 * Бронирование слота гостем полностью совпадает с созданием события,
 * поэтому используем тот же контракт.
 */
export type BookSlotPayload = CreateEventPayload;
