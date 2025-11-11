import { Typography } from "@maxhub/max-ui";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function WeekdayRow() {
  return (
    <div className="mb-2 grid grid-cols-7 gap-1 text-center">
      {WEEKDAYS.map((label) => (
        <Typography.Label
          key={label}
          className="text-xs font-semibold uppercase text-neutral-500"
        >
          {label}
        </Typography.Label>
      ))}
    </div>
  );
}
