export type WorkingDayCode =
  | "пн"
  | "вт"
  | "ср"
  | "чт"
  | "пт"
  | "сб"
  | "вс";

export interface SettingsBase {
  timezone?: number | null;
  work_time_start?: number | null;
  work_time_end?: number | null;
  duration_minutes?: number | null;
  alert_offset_minutes?: number | null;
  daily_reminder_time?: number | null;
  working_days?: WorkingDayCode[] | null;
}

export interface SettingsCreateRequest extends SettingsBase {
  timezone: number;
  work_time_start: number;
  work_time_end: number;
  working_days: WorkingDayCode[];
}

export type SettingsUpdateRequest = SettingsBase;

export interface SettingsResponse extends SettingsBase {}
