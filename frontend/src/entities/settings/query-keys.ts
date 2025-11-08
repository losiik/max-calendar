export const settingsKeys = {
  all: ["settings"] as const,
  current: (maxId?: number | null) =>
    [...settingsKeys.all, maxId ?? "guest"] as const,
};
