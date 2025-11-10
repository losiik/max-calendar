import { Panel, Spinner, Typography } from "@maxhub/max-ui";
import { useEffect } from "react";

import type {
  CalendarDay,
  ISODateString,
} from "@/entities/event/model/types";
import { useCalendarNavigation } from "../model/useCalendarNavigation";
import { CalendarHeader } from "./CalendarHeader";
import { WeekdayRow } from "./WeekdayRow";
import { DayCell } from "./DayCell";
import { useThemeScheme } from "@/shared/lib/theme-context";

type CalendarProps = {
  days: CalendarDay[];
  isLoading?: boolean;
  selectedDate?: ISODateString;
  onSelectDay?: (isoDate: ISODateString) => void;
  initialDate?: Date;
  onMonthChange?: (year: number, month: number) => void;
  disableAllDays?: boolean;
};

export function Calendar({
  days,
  isLoading,
  selectedDate,
  onSelectDay,
  initialDate,
  onMonthChange,
  disableAllDays = false,
}: CalendarProps) {
  const colorScheme = useThemeScheme();
  const {
    weeks,
    monthLabel,
    yearLabel,
    selectedDay,
    selectDay,
    goPrevMonth,
    goNextMonth,
    goToday,
    viewDate,
  } = useCalendarNavigation(days, { selectedDate, initialDate });

  const handleSelect = (dayIso: ISODateString) => {
    selectDay(dayIso);
    onSelectDay?.(dayIso);
  };

  useEffect(() => {
    if (!onMonthChange) return;
    onMonthChange(viewDate.getFullYear(), viewDate.getMonth());
  }, [onMonthChange, viewDate]);

  const panelClass =
    colorScheme === "dark"
      ? "rounded-xl border border-neutral-800 bg-neutral-950/70 py-4 shadow-sm"
      : "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm";

  return (
    <Panel className={panelClass}>
      <CalendarHeader
        monthLabel={monthLabel}
        yearLabel={yearLabel}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
        onToday={goToday}
      />

      <WeekdayRow />

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <Spinner size={20} title="Загрузка..." />
          <Typography.Body
            className={
              colorScheme === "dark" ? "text-neutral-400" : "text-neutral-500"
            }
          >
            Загружаем календарь...
          </Typography.Body>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week) =>
            week.map((day) => (
              <DayCell
                key={day.isoDate}
                day={day}
                isSelected={selectedDay?.isoDate === day.isoDate}
                onSelect={handleSelect}
                forceDisabled={disableAllDays}
              />
            ))
          )}
        </div>
      )}
    </Panel>
  );
}
