import { Typography } from "@maxhub/max-ui";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { ExternalCalendarView } from "./ExternalCalendarView";
import { useGuestCalendarStore } from "@/features/calendar/guest/model/guest-calendar.store";

export function ExternalCalendarPage() {
  const { userId } = useParams<{ userId: string }>();
  const initMeta = useGuestCalendarStore((state) => state.initFromPayload);
  const ownerName = useGuestCalendarStore((state) => state.ownerName);

  useEffect(() => {
    if (userId) {
      initMeta(userId, { activate: false });
    }
  }, [initMeta, userId]);

  if (!userId) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Typography.Label>Нет идентификатора календаря</Typography.Label>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pb-32">
      <ExternalCalendarView
        calendarId={userId}
        title="Календарь пользователя"
        subtitle="Выберите слот, чтобы предложить встречу"
        ownerName={ownerName}
      />
    </div>
  );
}
