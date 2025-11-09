import { Button, Panel, Typography } from "@maxhub/max-ui";
import { useEffect, useMemo, useState } from "react";

import { useManageAvailabilityStore } from "../model/manage-availability.store";
import { EventForm } from "@/features/calendar/create-event/ui/EventForm";
import { useCreateEventMutation } from "@/entities/event/model/queries";
import { fromLocalISODate } from "@/shared/util/date";

const formatDateLong = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fromLocalISODate(iso));

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function DaySlotsDrawer() {
  const { selectedDay, isOpen, close, appendEvent } =
    useManageAvailabilityStore();
  const [formOpen, setFormOpen] = useState(false);
  const createMutation = useCreateEventMutation();

  const defaultStart = useMemo(() => {
    if (!selectedDay) return undefined;
    return `${selectedDay.date}T10:00`;
  }, [selectedDay]);

  const defaultEnd = useMemo(() => {
    if (!selectedDay) return undefined;
    return `${selectedDay.date}T11:00`;
  }, [selectedDay]);

  useEffect(() => {
    if (!isOpen) setFormOpen(false);
  }, [isOpen]);

  if (!isOpen || !selectedDay) return null;

  const events = selectedDay.events ?? [];

  return (
    <div className="fixed inset-x-0 bottom-[75px] z-20">
      <div className="mx-auto w-full max-w-md p-4">
        <Panel className="rounded-lg border-neutral-700 border-[1px] border-solid p-4 shadow-lg">
          {!formOpen && (
            <>
              <div className="flex items-center justify-between">
                <Typography.Title className="capitalize">
                  {formatDateLong(selectedDay.date)}
                </Typography.Title>{" "}
                <Button
                  mode="secondary"
                  appearance="neutral-themed"
                  onClick={close}
                >
                  Закрыть
                </Button>
              </div>

              <div className="mt-3 flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                {events.length === 0 && (
                  <Typography.Label className="text-neutral-500">
                    На этот день событий нет
                  </Typography.Label>
                )}
                {events.map((event) => (
                  <div
                    key={event.id ?? event.startsAt}
                    className="rounded-lg border border-neutral-200 p-1"
                  >
                    <Typography.Label>{event.title}</Typography.Label>{" "}
                    <Typography.Body
                      variant="small"
                      className="text-neutral-500"
                    >
                      {formatTime(event.startsAt)} — {formatTime(event.endsAt)}
                    </Typography.Body>
                    {event.description && (
                      <Typography.Body
                        variant="small"
                        className="mt-1 block text-neutral-600"
                      >
                        {event.description}
                      </Typography.Body>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-4">
            {formOpen ? (
              <EventForm
                defaultValues={{
                  startsAt: defaultStart,
                  endsAt: defaultEnd,
                }}
                onSubmit={async (payload) => {
                  const event = await createMutation.mutateAsync(payload).catch(() => {alert("Ошибка создания события")});
                  if (event) appendEvent(event);
                  setFormOpen(false);
                }}
                onCancel={() => setFormOpen(false)}
                isSubmitting={createMutation.isPending}
                submitLabel="Создать"
              />
            ) : (
              <Button
                mode="primary"
                appearance="neutral-themed"
                stretched
                onClick={() => setFormOpen(true)}
              >
                Добавить событие
              </Button>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
