import type { DayKey } from "../working-days/model/working-days.store";
import type { WorkingDayCode } from "@/entities/settings/types";
import { createEmptyWorkingDays } from "../working-days/model/working-days.store";

const DAY_TO_RU: Record<DayKey, WorkingDayCode> = {
  mon: "пн",
  tue: "вт",
  wed: "ср",
  thu: "чт",
  fri: "пт",
  sat: "сб",
  sun: "вс",
};

const RU_TO_DAY = Object.fromEntries(
  Object.entries(DAY_TO_RU).map(([k, v]) => [v, k])
) as Record<WorkingDayCode, DayKey>;

const EN_TO_RU: Record<string, WorkingDayCode> = {
  mon: "пн",
  tue: "вт",
  wed: "ср",
  thu: "чт",
  fri: "пт",
  sat: "сб",
  sun: "вс",
};

export const mapServerDaysToRecord = (
  workingDays?: WorkingDayCode[] | null
): Record<DayKey, boolean> => {
  const record = createEmptyWorkingDays();
  (workingDays ?? []).forEach((rawCode) => {
    const normalized = EN_TO_RU[rawCode] ?? (rawCode as WorkingDayCode);
    const day = RU_TO_DAY[normalized];
    if (day) {
      record[day] = true;
    }
  });
  return record;
};

export const mapRecordToServerDays = (
  record: Record<DayKey, boolean>
): WorkingDayCode[] =>
  (Object.keys(record) as DayKey[])
    .filter((key) => record[key])
    .map((key) => DAY_TO_RU[key]);
