import { Typography } from "@maxhub/max-ui";
import { useParams } from "react-router-dom";

import { ExternalCalendarView } from "./ExternalCalendarView";

export function ExternalCalendarPage() {
  const { userId } = useParams<{ userId: string }>();

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
      />
    </div>
  );
}
