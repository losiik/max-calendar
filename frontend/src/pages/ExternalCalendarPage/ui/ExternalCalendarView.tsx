import { Button, Dot, Flex, Typography } from "@maxhub/max-ui";
import { useState } from "react";

import { Calendar } from "@/widgets/Calendar/ui/Calendar";
import { useSharedCalendarQuery } from "@/entities/event/model/queries";
import { useBookSlotStore } from "@/features/calendar/book-availability/model/book-slot.store";
import { ExternalBookingForm } from "@/features/calendar/book-availability/ui/ExternalBookingForm";
import { BookingSuccessOverlay } from "@/features/calendar/book-availability/ui/BookingSuccessOverlay";
import type { ISODateString } from "@/entities/event/model/types";
import { PALETTE } from "@/shared/config/consts/consts";
import { useThemeScheme } from "@/shared/lib/theme-context";

type ExternalCalendarViewProps = {
  calendarId: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
  onExit?: () => void;
  exitLabel?: string;
  ownerName?: string;
};

export function ExternalCalendarView({
  calendarId,
  hideHeader = false,
  onExit,
  exitLabel = "Закрыть",
  ownerName,
}: ExternalCalendarViewProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const { data, isLoading } = useSharedCalendarQuery(calendarId, {
    year: viewDate.getFullYear(),
    month: viewDate.getMonth(),
  });
  const openDay = useBookSlotStore((state) => state.openDay);

  const days = data ?? [];
  const hasSlots = days.some(
    (day) =>
      (day.availability && day.availability.length > 0) ||
      (day.events && day.events.length > 0)
  );
  const disableMonth = !isLoading && !hasSlots;

  const handleSelectDay = (isoDate: ISODateString) => {
    const day = days.find((d) => d.date === isoDate) ?? {
      date: isoDate,
      events: [],
      availability: [],
      isDisabled: true,
    };
    openDay(day);
  };

  const theme = useThemeScheme();

  return (
    <div className="flex w-full flex-col gap-4 ">
      {!hideHeader && (
        <div className="flex items-center justify-between px-3">
          <div>
            {ownerName && (
              <Typography.Title className="text-neutral-500 ">
                {ownerName} делится с вами календарем
              </Typography.Title>
            )}
          </div>
          {onExit && (
            <Button
              mode="secondary"
              appearance="neutral-themed"
              onClick={onExit}
            >
              {exitLabel}
            </Button>
          )}
        </div>
      )}

      <Calendar
        days={days}
        isLoading={isLoading}
        initialDate={viewDate}
        disableAllDays={disableMonth}
        onSelectDay={handleSelectDay}
        onMonthChange={(year, month) =>
          setViewDate((prev) =>
            prev.getFullYear() === year && prev.getMonth() === month
              ? prev
              : new Date(year, month, 1)
          )
        }
      />

      {disableMonth && !isLoading && (
        <Typography.Label className="text-center text-neutral-500">
          У пользователя {ownerName} нет свободных слотов на этот месяц
        </Typography.Label>
      )}
      <Flex direction="row" gap="2" className="text-neutral-500 p-3" align="center">
        <Dot className={`${PALETTE[theme].availability} mr-2`} /> - Дни со свободными слотами
      </Flex>

      <ExternalBookingForm calendarId={calendarId} />
      <BookingSuccessOverlay />
    </div>
  );
}
