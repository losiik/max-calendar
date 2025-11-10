import { useEffect, useMemo, useState } from "react";

import type {
  CalendarDay,
  ISODateString,
} from "@/entities/event/model/types";
import { toLocalISODate } from "@/shared/util/date";


export type CalendarViewDay = CalendarDay & {
  isoDate: ISODateString;
  dateObj: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  isDisabled?: boolean;
};

type Options = {
  initialDate?: Date;
  selectedDate?: ISODateString;
};

const DAYS_IN_GRID = 42; // 6 недель по 7 дней

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getStartOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const getGridStartDate = (date: Date) => {
  const startOfMonth = getStartOfMonth(date);
  const weekday = (startOfMonth.getDay() + 6) % 7; // смещаем, чтобы неделя начиналась с понедельника
  const gridStart = new Date(startOfMonth);
  gridStart.setDate(startOfMonth.getDate() - weekday);
  return gridStart;
};

const buildGrid = (viewDate: Date): Date[] => {
  const gridStart = getGridStartDate(viewDate);
  return Array.from({ length: DAYS_IN_GRID }, (_, index) => {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);
    return cellDate;
  });
};

export const useCalendarNavigation = (
  sourceDays: CalendarDay[],
  options?: Options
) => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(
    options?.initialDate ?? today
  );
  const [selectedDate, setSelectedDate] = useState<ISODateString | undefined>(
    options?.selectedDate
  );

  useEffect(() => {
    if (!options?.initialDate) return;
    setViewDate((prev) => {
      const incoming = options.initialDate as Date;
      if (
        prev.getFullYear() === incoming.getFullYear() &&
        prev.getMonth() === incoming.getMonth()
      ) {
        return prev;
      }
      return incoming;
    });
  }, [options?.initialDate]);

  useEffect(() => {
    if (options?.selectedDate) {
      setSelectedDate(options.selectedDate);
    }
  }, [options?.selectedDate]);

  const sourceMap = useMemo(
    () => new Map(sourceDays.map((day) => [day.date, day])),
    [sourceDays]
  );

  const gridDates = useMemo(() => buildGrid(viewDate), [viewDate]);
  const viewDays: CalendarViewDay[] = useMemo(
    () =>
      gridDates.map((date) => {
        const isoDate = toLocalISODate(date);
        const source = sourceMap.get(isoDate);
        return {
          date: isoDate,
          isoDate,
          dateObj: date,
          inCurrentMonth: date.getMonth() === viewDate.getMonth(),
          isToday: isSameDay(date, today),
          events: source?.events ?? [],
          availability: source?.availability,
          isDisabled: source?.isDisabled ?? false,
        };
      }),
    [gridDates, sourceMap, today, viewDate]
  );

  const weeks = useMemo(() => {
    const chunk: CalendarViewDay[][] = [];
    for (let i = 0; i < viewDays.length; i += 7) {
      chunk.push(viewDays.slice(i, i + 7));
    }
    return chunk;
  }, [viewDays]);

  const goPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    setViewDate(today);
    setSelectedDate(toLocalISODate(today));
  };

  const selectDay = (isoDate: ISODateString) => {
    setSelectedDate(isoDate);
  };

  const monthLabel = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
  }).format(viewDate);

  const yearLabel = viewDate.getFullYear().toString();

  const selectedDay = viewDays.find((day) => day.isoDate === selectedDate);

  return {
    weeks,
    monthLabel,
    yearLabel,
    viewDate,
    selectedDay,
    selectedDate,
    selectDay,
    goPrevMonth,
    goNextMonth,
    goToday,
  };
};
