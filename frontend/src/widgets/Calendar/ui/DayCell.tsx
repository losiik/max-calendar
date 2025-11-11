import { Button, Dot, Typography } from "@maxhub/max-ui";

import type { CalendarViewDay } from "../model/useCalendarNavigation";
import type { ISODateString } from "@/entities/event/model/types";
import { useThemeScheme } from "@/shared/lib/theme-context";

type DayCellProps = {
  day: CalendarViewDay;
  isSelected: boolean;
  onSelect: (isoDate: ISODateString) => void;
  forceDisabled?: boolean;
};

const palette = {
  light: {
    selected: "bg-primary-100 border-primary-400 text-primary-900",
    current:
      "bg-gray-100 border-transparent text-neutral-900 hover:border-primary-200",
    outside: "opacity-0",
    dot: "bg-primary-500",
    availability: "bg-emerald-500",
    todayRing: "!border-[#000000] border-[0.5px] border-solid",
  },
  dark: {
    selected: "bg-primary-600/40 border-primary-400 text-white",
    current:
      "bg-neutral-900 border-neutral-800 text-neutral-50 hover:border-primary-500/40",
    outside: "opacity-0",
    dot: "bg-primary-300",
    availability: "bg-emerald-300",
    todayRing: "!border-[#ffffff] border-[0.5px] border-solid",
  },
};

export function DayCell({
  day,
  isSelected,
  onSelect,
  forceDisabled,
}: DayCellProps) {
  const colorScheme = useThemeScheme();
  const colors = palette[colorScheme];

  const eventCount = day.events?.length ?? 0;
  const hasAvailability = (day.availability?.length ?? 0) > 0;
  const isDisabled = Boolean(forceDisabled || day.isDisabled);

  const baseClass = isSelected
    ? colors.selected
    : day.inCurrentMonth
    ? colors.current
    : colors.outside;
  const todayClass =
    day.isToday ? colors.todayRing : "border-transparent";
  const disabledClass = isDisabled ? "50 pointer-events-none" : "";

  const handleClick = () => {
    if (isDisabled) return;
    if (baseClass === colors.outside) return;
    onSelect(day.isoDate);
  };

  return (
    <Button
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
      mode="secondary"
      appearance="neutral-themed"
      className={`flex h-11 flex-col items-center justify-center rounded-lg border transition ${baseClass} ${todayClass} ${disabledClass}`}
      onClick={handleClick}
    >
      <Typography.Body className="text-base font-medium">
        {day.dateObj.getDate()}
      </Typography.Body>

      <div className="mt-1 flex items-center justify-center gap-1">
        {eventCount > 0 && <Dot />}
        {hasAvailability && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${colors.availability}`}
          />
        )}
      </div>
    </Button>
  );
}
