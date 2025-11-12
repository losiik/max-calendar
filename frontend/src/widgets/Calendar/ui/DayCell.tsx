import { Button, Dot, Typography } from "@maxhub/max-ui";

import type { CalendarViewDay } from "../model/useCalendarNavigation";
import type { ISODateString } from "@/entities/event/model/types";
import { useThemeScheme } from "@/shared/lib/theme-context";
import { PALETTE } from "@/shared/config/consts/consts";

type DayCellProps = {
  day: CalendarViewDay;
  isSelected: boolean;
  onSelect: (isoDate: ISODateString) => void;
  forceDisabled?: boolean;
};

export function DayCell({
  day,
  isSelected,
  onSelect,
  forceDisabled,
}: DayCellProps) {
  const colorScheme = useThemeScheme();
const colors = PALETTE[colorScheme];

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
      data-haptic="light"
      className={`flex h-11 flex-col items-center justify-center rounded-lg border transition ${baseClass} ${todayClass} ${disabledClass}`}
      onClick={handleClick}
    >
      <Typography.Body className="text-base font-medium">
        {day.dateObj.getDate()}
      </Typography.Body>

      <div className="mt-1 flex items-center justify-center gap-1">
        {eventCount > 0 && <Dot />}
        {hasAvailability && (
          <Dot
            className={`${colors.availability}`}
          />
        )}
      </div>
    </Button>
  );
}
