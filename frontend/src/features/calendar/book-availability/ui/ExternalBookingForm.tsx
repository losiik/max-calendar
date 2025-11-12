import {
  Button,
  Panel,
  Typography,
  Input,
  Textarea,
  Flex,
  Spinner,
  useColorScheme,
  CellSimple,
  CellList,
} from "@maxhub/max-ui";
import { useEffect, useState } from "react";

import { useBookSlotStore } from "../model/book-slot.store";
import { useBookSlotMutation } from "@/entities/event/model/queries";
import { FaRegCalendarTimes } from "react-icons/fa";
import { MdCheck, MdClose } from "react-icons/md";
import { useSettingsQuery } from "@/entities/settings/queries";


type ExternalBookingFormProps = {
  calendarId: string;
};

export function ExternalBookingForm({ calendarId }: ExternalBookingFormProps) {
  const { selectedDay, selectedRange, isOpen, close, selectRange } =
    useBookSlotStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSettingsFilledIn, setSettingsFilledIn] = useState(false);
  const theme = useColorScheme();
  const mutation = useBookSlotMutation(calendarId);
  const { data: settings } = useSettingsQuery();


  useEffect(() => {
      if (
    settings &&
    settings.work_time_end &&
    settings.work_time_start &&
    settings.work_time_end !== settings.work_time_start &&
    settings.working_days?.length &&
    settings.duration_minutes
  ) {
    
    setSettingsFilledIn(true);
  }
  }, [settings]);

  if (!isOpen || !selectedDay) return null;

  const availability = selectedDay.availability ?? [];
  const isSubmitDisabled = !title || !selectedRange;
  const handleSubmit = async () => {
    if (!selectedRange) return;

    await mutation
      .mutateAsync({
        title,
        description: description || undefined,
        startsAt:
          selectedRange.startISO ??
          new Date(
            `${selectedDay.date}T${selectedRange.start}:00`
          ).toISOString(),
        endsAt:
          selectedRange.endISO ??
          new Date(`${selectedDay.date}T${selectedRange.end}:00`).toISOString(),
      })
      .catch(() => {
        alert("Ошибка бронирования слота");
      });
    setTitle("");
    setDescription("");
    close();
  };

  const handleClose = () => {

    close();
  };

  const handleSelectRange = (range: typeof availability[number]) => {
    selectRange(range);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto w-full max-w-md ">
        <Panel
          className={`rounded-lg border p-4 !pb-8 shadow-xl ${
            theme === "dark" ? "" : " bg-neutral-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <Typography.Title variant="medium-strong">
              Выбор времени
            </Typography.Title>
            <Button
              mode="secondary"
              appearance="neutral-themed"
              onClick={handleClose}
            >
              <MdClose />
            </Button>
          </div>

          <div className="mt-3">
            <Typography.Label className="mb-2 block">
              Доступные слоты
            </Typography.Label>
            {availability.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-2 text-sm text-neutral-500">
                <FaRegCalendarTimes />
                Нет доступного времени
              </div>
            ) : isSettingsFilledIn ? (
              <div className="max-h-[40vh] overflow-y-auto">
                <CellList mode="island">
                  {availability.map((range) => {
                    const isActive =
                      selectedRange?.start === range.start &&
                      selectedRange?.end === range.end;
                    return (
                      <CellSimple
                        key={`${range.start}-${range.end}`}
                        before={isActive ? <MdCheck /> : null}
                        onClick={() => handleSelectRange(range)}
                        title={`${range.start} - ${range.end}`}
                        aria-pressed={isActive}
                        subtitle={"Свободно"}
                      ></CellSimple>
                    );
                  })}
                </CellList>
              </div>
            ) : (
              <CellSimple before={<FaRegCalendarTimes />} title={'Вы не выбрали дни недели и время для встреч в настройках, пожалуйста, заполните настройки'} />
            )}
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
              data-haptic="success"
              mode="primary"
              appearance="neutral-themed"
              stretched
              disabled={isSubmitDisabled || mutation.isPending}
              onClick={handleSubmit}
            >
              {mutation.isPending ? (
                <Spinner size={16} title="Загрузка..." />
              ) : (
                "Забронировать"
              )}
            </Button>
          </Flex>
        </Panel>
      </div>
    </div>
  );
}
