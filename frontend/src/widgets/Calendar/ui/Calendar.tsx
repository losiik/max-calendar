import { Panel, Spinner, Typography } from "@maxhub/max-ui";

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
};

export function Calendar({
  days,
  isLoading,
  selectedDate,
  onSelectDay,
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
  } = useCalendarNavigation(days, { selectedDate });

  const handleSelect = (dayIso: ISODateString) => {
    selectDay(dayIso);
    onSelectDay?.(dayIso);
  };

  const panelClass =
    colorScheme === "dark"
      ? "rounded-lg border border-neutral-800 bg-neutral-950/70 p-4 shadow-sm"
      : "rounded-lg border border-neutral-200 bg-white p-4 shadow-sm";

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
        <div className="flex h-64 items-center justify-center">
          <Typography.Body
            className={
              colorScheme === "dark" ? "text-neutral-400" : "text-neutral-500"
            }
          >
            
        <Spinner size={16} title="Загрузка..."  />
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
              />
            ))
          )}
        </div>
      )}
    </Panel>
  );
}
