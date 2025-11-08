import { useEffect, useMemo } from "react";
import { useModalStore } from "@/shared/modal";
import { CellHeader, CellList, CellSimple, Spinner, Typography } from "@maxhub/max-ui";
import { WorkingHoursContent } from "@/features/calendar-settings/working-hours/ui/WorkingHoursContent";
import { formatTime } from "@/shared/util/format-time";
import { WorkingDaysContent } from "@/features/calendar-settings/working-days/ui/WorkingDaysContent";
import { MeetingPeriodContent } from "@/features/calendar-settings/meeting-periods/ui/MeetingPeriodContent";
import { useAgendaStore } from "@/features/calendar-settings/agenda/model/agenda.store";
import { useWorkingDaysStore } from "@/features/calendar-settings/working-days/model/working-days.store";
import { useNotificationStore } from "@/features/calendar-settings/notifications/model/notification.store";
import NotificationContent from "@/features/calendar-settings/notifications/ui/NotificationContent";
import AgendaContent from "@/features/calendar-settings/agenda/ui/AgendaContent";
import { useSettingsQuery } from "@/entities/settings/queries";
import { toTimeParts } from "@/shared/util/time";
import { createEmptyWorkingDays } from "@/features/calendar-settings/working-days/model/working-days.store";
import { mapServerDaysToRecord } from "@/features/calendar-settings/lib/working-days.mapper";

function SettingsPage() {
  const open = useModalStore((s) => s.open);
  const workingDays = useWorkingDaysStore((s) => s.days);
  const setWorkingDays = useWorkingDaysStore((s) => s.setDays);
  const fromHours = useModalStore((s) => s.fromHours);
  const fromMinutes = useModalStore((s) => s.fromMinutes);
  const toHours = useModalStore((s) => s.toHours);
  const toMinutes = useModalStore((s) => s.toMinutes);
  const setFromHours = useModalStore((s) => s.setFromHours);
  const setFromMinutes = useModalStore((s) => s.setFromMinutes);
  const setToHours = useModalStore((s) => s.setToHours);
  const setToMinutes = useModalStore((s) => s.setToMinutes);
  const remindBeforeTime = useNotificationStore((s) => s.leadTimeMin);
  const setLeadTime = useNotificationStore((s) => s.setLeadTime);
  const agendaTimeHours = useAgendaStore((s) => s.hours);
  const agendaTimeMinutes = useAgendaStore((s) => s.minutes);
  const setAgendaHours = useAgendaStore((s) => s.setHours);
  const setAgendaMinutes = useAgendaStore((s) => s.setMinutes);

  const { data: settings, isLoading, isError } = useSettingsQuery();

  useEffect(() => {
    if (settings === undefined) return;
    if (!settings) {
      setWorkingDays(createEmptyWorkingDays());
      setFromHours("");
      setFromMinutes("");
      setToHours("");
      setToMinutes("");
      setAgendaHours("");
      setAgendaMinutes("");
      setLeadTime(0);
      return;
    }
    const workingDaysRecord = mapServerDaysToRecord(settings.working_days);
    setWorkingDays(workingDaysRecord);

    const fromParts = toTimeParts(settings.work_time_start ?? null);
    const toParts = toTimeParts(settings.work_time_end ?? null);
    setFromHours(fromParts.hours);
    setFromMinutes(fromParts.minutes);
    setToHours(toParts.hours);
    setToMinutes(toParts.minutes);

    const reminderParts = toTimeParts(settings.daily_reminder_time ?? null);
    setAgendaHours(reminderParts.hours);
    setAgendaMinutes(reminderParts.minutes);

    setLeadTime(settings.alert_offset_minutes ?? 0);
  }, [
    settings,
    setAgendaHours,
    setAgendaMinutes,
    setFromHours,
    setFromMinutes,
    setLeadTime,
    setToHours,
    setToMinutes,
    setWorkingDays,
  ]);

  const formatRange = (
    hours: number | "",
    minutes: number | ""
  ): string => {
    if (hours === "" && minutes === "") return "";
    const pad = (value: number | "") =>
      value === "" ? "00" : String(value).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}`;
  };

  const workingHoursLabel = useMemo(
    () => fromHours === "" && toHours === "" ? "Выкл" : `С ${formatRange(fromHours, fromMinutes)} по ${formatRange(toHours, toMinutes)}`,
    [fromHours, fromMinutes, toHours, toMinutes]
  );

  if (isLoading) {
    return (
      <div className="p-4 min-h-[calc(100vh-32px)] ">
        <Spinner size={16} title="Загрузка..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <Typography.Body variant="small">
          Не удалось загрузить настройки. Попробуйте позже.
        </Typography.Body>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-[calc(100vh-32px)]">
   
      <CellList
        filled
        mode="island"
        header={<CellHeader>Свободное время</CellHeader>}
      >
        <CellSimple
          height="compact"
          onClick={() => open({ content: WorkingHoursContent })}
          showChevron
          title="Рабочее время"
          after={
            <>{workingHoursLabel}</>
          }
        />

        <CellSimple
          height="compact"
          onClick={() => open({ content: WorkingDaysContent })}
          showChevron
          after={
            <>
              {
                Object.entries(workingDays)
                  .filter(([, v]) => !!v)
                  .map(([k]) => k).length
              }{" "}
              из 7
            </>
          }
          title="Рабочие дни"
        />

        <CellSimple
          height="compact"
          onClick={() => open({ content: MeetingPeriodContent })}
          showChevron
          title="Периоды встреч"
        />
      </CellList>

      <CellList
        filled
        mode="island"
        header={<CellHeader>Уведомления</CellHeader>}
      >
        <CellSimple
          height="compact"
          onClick={() => open({ content: NotificationContent })}
          showChevron
          title="Уведомлять о событиях"
          after={
            (!remindBeforeTime && remindBeforeTime !== 0)
              ? "Выкл"
              : `За ${formatTime(remindBeforeTime)}`
          }
        />

        <CellSimple
          height="compact"
          onClick={() => open({ content: AgendaContent })}
          showChevron
          title="Расписание на день"
          subtitle="Ежедневно присылать расписание на день"
          after={
            (!agendaTimeHours && agendaTimeHours !== 0) ? "Выкл" :
               `${String(agendaTimeHours).padStart(2, "0")}:${String(
                  agendaTimeMinutes
                ).padStart(2, "0")}`
              
          }
        />
      </CellList>
    </div>
  );
}

export default SettingsPage;
