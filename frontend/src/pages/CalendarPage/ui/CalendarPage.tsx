import { Typography } from "@maxhub/max-ui";
import { useMemo, useState } from "react";

import type { CalendarDay, ISODateString } from "@/entities/event/model/types";
import { usePersonalCalendarQuery } from "@/entities/event/model/queries";
import { Calendar } from "@/widgets/Calendar/ui/Calendar";
import { useManageAvailabilityStore } from "@/features/calendar/manage-availability/model/manage-availability.store";
import { DaySlotsDrawer } from "@/features/calendar/manage-availability/ui/DaySlotsDrawer";
import { getMaxUserName } from "@/shared/lib/max-web-app";

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const { data, isLoading } = usePersonalCalendarQuery({
    year: viewDate.getFullYear(),
    month: viewDate.getMonth(),
  });
  const openDay = useManageAvailabilityStore((state) => state.openDay);
  const username = getMaxUserName();

  const days = useMemo(() => data ?? [], [data]);
  const daysMap = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days]
  );

  const handleSelectDay = (isoDate: ISODateString) => {
    const day: CalendarDay =
      daysMap.get(isoDate) ?? {
        date: isoDate,
        events: [],
        isDisabled: false,
      };

    openDay(day);
  };

  const handleMonthChange = (year: number, month: number) => {
    setViewDate((prev) => {
      if (prev.getFullYear() === year && prev.getMonth() === month) {
        return prev;
      }
      return new Date(year, month, 1);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-3 min-h-[calc(100vh-32px)]">
      <div>
        <Typography.Title variant="large-strong">
          {username ? `Привет, ${username}` : "Привет!"}
        </Typography.Title> 
      </div>

      <Calendar
        days={days}
        isLoading={isLoading}
        initialDate={viewDate}
        onSelectDay={handleSelectDay}
        onMonthChange={handleMonthChange}
      />


      <DaySlotsDrawer />
    </div>
  );
}
