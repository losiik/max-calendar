export const calendarKeys = {
  all: ["calendar"] as const,
  personal: () => [...calendarKeys.all, "personal"] as const,
  shared: (calendarId: string) =>
    [...calendarKeys.all, "shared", calendarId] as const,
};
