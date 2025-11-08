export type TimePart = number | "";

export const toTimeParts = (
  value?: number | null
): { hours: TimePart; minutes: TimePart } => {
  if (value === null || value === undefined) {
    return { hours: "", minutes: "" };
  }
  const [hoursStr, rawMinutes = ""] = value.toString().split(".");
  const hours = Number(hoursStr);
  const minutes = Number(rawMinutes.padEnd(2, "0").slice(0, 2));
  return {
    hours: Number.isNaN(hours) ? "" : hours,
    minutes: Number.isNaN(minutes) ? "" : minutes,
  };
};

export const toServerTimeNumber = (
  hours: TimePart,
  minutes: TimePart
): number | null => {
  if (hours === "" && minutes === "") return null;
  const h = hours === "" ? 0 : hours;
  const m = minutes === "" ? 0 : minutes;
  return Number.parseFloat(`${h}.${String(m).padStart(2, "0")}`);
};
