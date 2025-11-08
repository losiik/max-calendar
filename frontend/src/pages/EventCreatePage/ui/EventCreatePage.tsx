import { Panel, Typography } from "@maxhub/max-ui";
import { useNavigate } from "react-router-dom";

import { EventForm } from "@/features/calendar/create-event/ui/EventForm";
import { useCreateEventMutation } from "@/entities/event/model/queries";

const now = () => new Date();
const plusMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60000);

export default function EventCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateEventMutation();

  const start = now();
  const end = plusMinutes(start, 60);

  return (
    <div className="mx-auto flex w-full max-w-2xl p-4">
      <Panel className="w-full rounded-lg border p-6 shadow-sm">
        <Typography.Title variant="large-strong" className="mb-4">
          Создание события
        </Typography.Title>

        <EventForm
          defaultValues={{
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
          }}
          submitLabel="Создать"
          isSubmitting={mutation.isPending}
          onSubmit={async (payload) => {
            await mutation.mutateAsync(payload).catch(() => {alert("Ошибка создания события")});
            navigate(-1);
          }}
          onCancel={() => navigate(-1)}
        />
      </Panel>
    </div>
  );
}
