export type EntityId = string;
export type ISODateString = string;
export type ISOTimeString = string;
export type ISODateTimeString = string;
export interface BaseEventFields {
  title: string;
  description?: string;
  url?: string;
  startsAt: ISODateTimeString;
  endsAt: ISODateTimeString;
  reminderMinutes?: number;
}
export interface CalendarEvent extends BaseEventFields {
  id?: EntityId;
  maxId?: string;
  slotId?: EntityId;

  slot_id?: EntityId;
  meetingUrl?: string;
}

export type BookingSlot = CalendarEvent;
export interface AvailabilityWindow {
  date: ISODateString;
  ranges: TimeRange[];
}
export interface TimeRange {
  start: ISOTimeString;
  end: ISOTimeString;
  startISO?: ISODateTimeString;
  endISO?: ISODateTimeString;
  slotId?: EntityId;
}
export interface CalendarDay {
  date: ISODateString;
  events?: CalendarEvent[];
  availability?: TimeRange[];
  isDisabled?: boolean;
}
export interface CreateEventPayload extends BaseEventFields {
  id?: EntityId;
  maxId?: string;
  slotId?: EntityId;
  
}

export type BookSlotPayload = CreateEventPayload;
