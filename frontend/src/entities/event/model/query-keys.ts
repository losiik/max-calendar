export const calendarKeys = {
  all: ["calendar"] as const,
  personalRoot: () => [...calendarKeys.all, "personal"] as const,
  personal: (year: number, month: number) =>
    [...calendarKeys.all, "personal", year, month] as const,
  sharedRoot: (calendarId: string) =>
    [...calendarKeys.all, "shared", calendarId] as const,
  shared: (calendarId: string, year: number, month: number) =>
    [...calendarKeys.all, "shared", calendarId, year, month] as const,
};
