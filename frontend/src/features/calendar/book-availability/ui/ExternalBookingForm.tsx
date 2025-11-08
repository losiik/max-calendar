import { Button, Panel, Typography, Input, Textarea, Flex } from "@maxhub/max-ui";
import { useState } from "react";

import { useBookSlotStore } from "../model/book-slot.store";
import { useBookSlotMutation } from "@/entities/event/model/queries";

type ExternalBookingFormProps = {
  calendarId: string;
};

const combineDateWithTime = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString();

export function ExternalBookingForm({ calendarId }: ExternalBookingFormProps) {
  const { selectedDay, selectedRange, isOpen, close, selectRange } =
    useBookSlotStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useBookSlotMutation(calendarId);

  if (!isOpen || !selectedDay) return null;

  const availability = selectedDay.availability ?? [];
  const isSubmitDisabled = !title || !selectedRange;

  const handleSubmit = async () => {
    if (!selectedRange) return;
    await mutation.mutateAsync({
      title,
      description: description || undefined,
      startsAt: combineDateWithTime(selectedDay.date, selectedRange.start),
      endsAt: combineDateWithTime(selectedDay.date, selectedRange.end),
    });
    setTitle("");
    setDescription("");
    close();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto w-full max-w-md p-4">
        <Panel className="rounded-lg border p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <Typography.Title variant="medium-strong">
              Выбор времени
            </Typography.Title>
            <Button mode="secondary" appearance="neutral-themed" onClick={close}>
              Закрыть
            </Button>
          </div>

          <div className="mt-3">
            <Typography.Label className="mb-2 block">
              Доступные слоты
            </Typography.Label>
            <div className="grid grid-cols-2 gap-2">
              {availability.length === 0 && (
                <Typography.Body
                  variant="small"
                >
                  Нет доступного времени
                </Typography.Body>
              )}
              {availability.map((range) => {
                const isActive =
                  selectedRange?.start === range.start &&
                  selectedRange?.end === range.end;
                return (
                  <Button
                    key={`${range.start}-${range.end}`}
                    mode={isActive ? "primary" : "secondary"}
                    appearance="neutral-themed"
                    onClick={() => selectRange(range)}
                  >
                    {range.start} — {range.end}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Typography.Label>Название встречи</Typography.Label>
              <Input
                placeholder="Например, демо продукта"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Typography.Label>Комментарий</Typography.Label>
              <Textarea
                rows={3}
                placeholder="О чем будет встреча"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <Flex gap={1} className="mt-4">
            <Button
              mode="primary"
              appearance="neutral-themed"
              stretched
              disabled={isSubmitDisabled || mutation.isPending}
              onClick={handleSubmit}
            >
              {mutation.isPending ? "Бронируем…" : "Забронировать"}
            </Button>
            <Button
              mode="secondary"
              appearance="neutral-themed"
              onClick={close}
            >
              Отмена
            </Button>
          </Flex>
        </Panel>
      </div>
    </div>
  );
}
