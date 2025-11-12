import {
  Button,
  CellList,
  CellSimple,
  IconButton,
  Panel,
  Typography,
  useColorScheme,
} from "@maxhub/max-ui";
import { useEffect, useMemo, useState } from "react";
import { MdClose, MdDelete } from "react-icons/md";

import { useManageAvailabilityStore } from "../model/manage-availability.store";
import { EventForm } from "@/features/calendar/create-event/ui/EventForm";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
} from "@/entities/event/model/queries";
import { fromLocalISODate } from "@/shared/util/date";
import type {
  CalendarEvent,
  CreateEventPayload,
} from "@/entities/event/model/types";
import { Link } from "react-router-dom";

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

const intersects = (existing: CalendarEvent, candidate: CreateEventPayload) => {
  const existingStart = new Date(existing.startsAt).getTime();
  const existingEnd = new Date(existing.endsAt).getTime();
  const candidateStart = new Date(candidate.startsAt).getTime();
  const candidateEnd = new Date(candidate.endsAt).getTime();
  if (Number.isNaN(existingStart) || Number.isNaN(existingEnd)) return false;
  if (Number.isNaN(candidateStart) || Number.isNaN(candidateEnd)) return false;
  return candidateStart < existingEnd && existingStart < candidateEnd;
};

export function DaySlotsDrawer() {
  const { selectedDay, isOpen, close, appendEvent, removeEvent } =
    useManageAvailabilityStore();
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const createMutation = useCreateEventMutation();
  const deleteMutation = useDeleteEventMutation();
  const theme = useColorScheme();

  const defaultStart = useMemo(() => {
    if (!selectedDay) return undefined;
    return `${selectedDay.date}T10:00`;
  }, [selectedDay]);

  const defaultEnd = useMemo(() => {
    if (!selectedDay) return undefined;
    return `${selectedDay.date}T11:00`;
  }, [selectedDay]);

  const events = useMemo(() => {
    if (!selectedDay?.events?.length) return [];
    return [...selectedDay.events].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  }, [selectedDay]);

  useEffect(() => {
    if (!isOpen) setFormOpen(false);
  }, [isOpen]);

  useEffect(() => {
    setFormError(null);
    setDeleteError(null);
    setDeletingId(null);
  }, [selectedDay?.date, formOpen]);

  if (!isOpen || !selectedDay) return null;

  const handleSubmit = async (payload: CreateEventPayload) => {
    const hasConflict = events.some((event) => intersects(event, payload));
    if (hasConflict) {
      setFormError("Новый слот пересекается с существующим событием.");
      return;
    }
    setFormError(null);
    try {
      const event = await createMutation.mutateAsync(payload);
      if (event) appendEvent(event);
      setFormOpen(false);
    } catch (error) {
      
      setFormError("Не удалось сохранить событие. Попробуйте ещё раз.");
    }
  };

  const handleDelete = async (event: CalendarEvent) => {
    const slotId = event.slotId ?? event.slot_id ?? event.id;
    if (!slotId) {
      setDeleteError("Не удалось определить идентификатор события.");
      return;
    }
    setDeleteError(null);
    setDeletingId(slotId);
    try {
      await deleteMutation.mutateAsync(slotId);
      removeEvent(slotId);
    } catch (error) {
      
      setDeleteError("Не удалось удалить событие. Попробуйте ещё раз.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[75px] z-20">
      <div className="mx-auto w-full max-w-md p-4">
        <Panel
          className={`p-1 shadow-lg ${
            theme === "dark" ? "rounded-xl bg-zinc-900" : "rounded-xl bg-neutral-100 border-[0.5px] border-solid"
          }`}
        >
          {!formOpen && (
            <>
              <div className="flex items-center justify-between p-3">
                <Typography.Title className="capitalize">
                  {formatDateLong(selectedDay.date)}
                </Typography.Title>
                <Button
                  mode="secondary"
                  appearance="neutral-themed"
                  onClick={close}
                >
                  <MdClose />
                </Button>
              </div>

              <div className={`mt-3 max-h-60 space-y-2 overflow-y-auto ${events.length === 0 ? "px-3" : ""}`}>
                {events.length === 0 && (
                  <Typography.Label className="text-neutral-500">
                    На этот день событий нет
                  </Typography.Label>
                )}
                <CellList mode="island">
                  {events.map((event) => {
                    const slotId = event.slotId ?? event.slot_id;
                    const isDeleting = deletingId === slotId;
                    return (
                      <CellSimple
                        key={slotId ?? event.startsAt}
                        className="flex-1"
                        title={event.title}
                        subtitle={`${formatTime(event.startsAt)} - ${formatTime(
                          event.endsAt
                        )}`}
                        after={
                          <IconButton
                            mode="secondary"
                            appearance="negative"
                            size="small"
                            aria-label="Удалить событие"
                            title="Удалить событие"
                            className="!p-2"
                            disabled={isDeleting || deleteMutation.isPending}
                            onClick={() => handleDelete(event)}
                          >
                            <MdDelete />
                          </IconButton>
                        }
                      >
                        {event.description && (
                          <Typography.Body
                            variant="small"
                            className="mt-1 block text-neutral-600"
                          >
                            {event.description}
                          </Typography.Body>
                          
                        )}
                        {event.meetingUrl && (
                          <Typography.Label
                            className="mt-1 block text-blue-600"
                          >
                            <Link to={event.meetingUrl} target="_blank" rel="noopener noreferrer" >
                              {event.meetingUrl}
                            </Link>
                          </Typography.Label>
                          
                        )}
                      </CellSimple>
                    );
                  })}
                </CellList>
                {deleteError && (
                  <Typography.Label
                    // variant="small"
                    className="px-3 text-red-500"
                  >
                    {deleteError}
                  </Typography.Label>
                )}
              </div>
            </>
          )}

          <div className="mt-4 p-3">
            {formOpen ? (
              <EventForm
                defaultValues={{
                  startsAt: defaultStart,
                  endsAt: defaultEnd,
                }}
                onSubmit={handleSubmit}
                onCancel={() => setFormOpen(false)}
                isSubmitting={createMutation.isPending}
                submitLabel="Создать"
                externalError={formError}
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
