import { Button, Dot, Typography } from "@maxhub/max-ui";

import type { CalendarViewDay } from "../model/useCalendarNavigation";
import type { ISODateString } from "@/entities/event/model/types";
import { useThemeScheme } from "@/shared/lib/theme-context";

type DayCellProps = {
  day: CalendarViewDay;
  isSelected: boolean;
  onSelect: (isoDate: ISODateString) => void;
};

const palette = {
  light: {
    selected: "bg-primary-100 border-primary-400 text-primary-900",
    current: "bg-white border-transparent text-neutral-900 hover:border-primary-200",
    outside: "bg-neutral-50 border-transparent text-neutral-400",
    dot: "bg-primary-500",
  },
  dark: {
    selected: "bg-primary-600/40 border-primary-400 text-white",
    current:
      "bg-neutral-900 border-neutral-800 text-neutral-50 hover:border-primary-500/40",
    outside: "bg-neutral-900 border-transparent text-neutral-500",
    dot: "bg-primary-300",
  },
};

export function DayCell({ day, isSelected, onSelect }: DayCellProps) {
  const colorScheme = useThemeScheme();
  const colors = palette[colorScheme];

  const eventCount = day.events?.length ?? 0;

  const baseClass = isSelected
    ? colors.selected
    : day.inCurrentMonth
    ? colors.current
    : colors.outside;

  const handleClick = () => onSelect(day.isoDate);

  return (
    <Button
      aria-pressed={isSelected}
      mode="secondary"
      appearance="neutral-themed"
      className={`flex h-11 flex-col items-center justify-center rounded-lg border transition ${baseClass}`}
      onClick={handleClick}
    >
      <Typography.Body className="text-base font-medium">
        {day.dateObj.getDate()}
      </Typography.Body>

      <div className="mt-1 flex items-center justify-center gap-1">
        {eventCount > 0 && (
          <Dot />
        )}
      </div>
    </Button>
  );
}
