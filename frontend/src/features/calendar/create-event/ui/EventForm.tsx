import { Button, Flex, Input, Textarea, Typography } from "@maxhub/max-ui";
import { FormEvent, useMemo, useState } from "react";

import type { CreateEventPayload } from "@/entities/event/model/types";
import { useEventFormStore } from "../model/event-form.store";

type EventFormProps = {
  defaultValues?: Partial<CreateEventPayload> & {
    startsAt?: string;
    endsAt?: string;
  };
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (payload: CreateEventPayload) => Promise<void> | void;
  onCancel?: () => void;
};

const toInputValue = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoString = (value: string) =>
  value ? new Date(value).toISOString() : "";

export function EventForm({
  defaultValues,
  submitLabel = "Сохранить",
  isSubmitting,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const defaultReminder = useEventFormStore(
    (state) => state.defaultReminderMinutes
  );

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [startsAt, setStartsAt] = useState(
    toInputValue(defaultValues?.startsAt)
  );
  const [endsAt, setEndsAt] = useState(toInputValue(defaultValues?.endsAt));
  const [reminderMinutes, setReminderMinutes] = useState<number | "">(
    defaultValues?.reminderMinutes ?? defaultReminder
  );

  const isSubmitDisabled =
    !title || !startsAt || !endsAt || new Date(startsAt) >= new Date(endsAt);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    const payload: CreateEventPayload = {
      title,
      description: description || undefined,
      startsAt: toIsoString(startsAt),
      endsAt: toIsoString(endsAt),
      reminderMinutes:
        reminderMinutes === "" ? undefined : Number(reminderMinutes),
    };

    await onSubmit(payload);
  };

  const errorMessage = useMemo(() => {
    if (!startsAt || !endsAt) return "Укажите даты начала и окончания";
    if (new Date(startsAt) >= new Date(endsAt)) {
      return "Дата окончания должна быть позднее начала";
    }
    return null;
  }, [startsAt, endsAt]);

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <Typography.Label>Название</Typography.Label>
        <Input
          placeholder="Например, встреча с клиентом"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Typography.Label>Описание</Typography.Label>
        <Textarea
          placeholder="Детали встречи"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Typography.Label>Начало</Typography.Label>
          <Input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Typography.Label>Окончание</Typography.Label>
          <Input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Typography.Label>Напомнить за (мин)</Typography.Label>
        <Input
          type="number"
          min={0}
          step={5}
          value={reminderMinutes}
          onChange={(e) =>
            setReminderMinutes(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
        />
      </div>

      {errorMessage && (
        <Typography.Body variant="small" className="text-red-500">
          {errorMessage}
        </Typography.Body>
      )}

      <Flex gap={8} className="pt-1">
       
        {onCancel && (
          <Button
            mode="secondary"
            appearance="neutral-themed"
            type="button"
            onClick={onCancel}
          >
            Отмена
          </Button>
        )}
         <Button
          mode="primary"
          appearance="neutral-themed"
          type="submit"
          disabled={isSubmitDisabled || isSubmitting}
        >
          {isSubmitting ? "Сохраняем…" : submitLabel}
        </Button> 
      </Flex>
    </form>
  );
}
