import { Button, Typography } from "@maxhub/max-ui";

import { Calendar } from "@/widgets/Calendar/ui/Calendar";
import { useSharedCalendarQuery } from "@/entities/event/model/queries";
import { useBookSlotStore } from "@/features/calendar/book-availability/model/book-slot.store";
import { ExternalBookingForm } from "@/features/calendar/book-availability/ui/ExternalBookingForm";
import type { ISODateString } from "@/entities/event/model/types";

type ExternalCalendarViewProps = {
  calendarId: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
  onExit?: () => void;
  exitLabel?: string;
};

export function ExternalCalendarView({
  calendarId,
  title = "Календарь пользователя",
  subtitle,
  hideHeader = false,
  onExit,
  exitLabel = "Закрыть",
}: ExternalCalendarViewProps) {
  const { data, isLoading } = useSharedCalendarQuery(calendarId);
  const openDay = useBookSlotStore((state) => state.openDay);

  const days = data ?? [];

  const handleSelectDay = (isoDate: ISODateString) => {
    const day =
      days.find((d) => d.date === isoDate) ?? {
        date: isoDate,
        events: [],
        availability: [],
      };
    openDay(day);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <Typography.Title variant="large-strong">
              {title}
            </Typography.Title>
            {subtitle && (
              <Typography.Label className="text-neutral-500">
                {subtitle}
              </Typography.Label>
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
        onSelectDay={handleSelectDay}
      />

      <ExternalBookingForm calendarId={calendarId} />
    </div>
  );
}
