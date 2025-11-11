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
import { toServerTimeNumber, toTimeParts } from "@/shared/util/time";
import { createEmptyWorkingDays } from "@/features/calendar-settings/working-days/model/working-days.store";
import { mapServerDaysToRecord } from "@/features/calendar-settings/lib/working-days.mapper";
import { useMeetingPeriodsStore } from "@/features/calendar-settings/meeting-periods/model/meeting-periods.store";
import type { PeriodKey } from "@/features/calendar-settings/meeting-periods/model/meeting-periods.store";
import { MdAccessTime, MdDateRange, MdNotificationsActive, MdOutlineViewAgenda, MdWorkHistory } from "react-icons/md";
import { getBrowserTimezoneHours, getBrowserTimezoneLocation } from "@/entities/event/api";

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
  const meetingDuration = useMeetingPeriodsStore((s) => s.selected);
  const setMeetingDuration = useMeetingPeriodsStore((s) => s.setSelected);

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
      setMeetingDuration(null);
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
    const duration = settings.duration_minutes ?? null;
    const allowed: PeriodKey[] = [15, 30, 45, 60, 90];
    setMeetingDuration(
      duration && allowed.includes(duration as PeriodKey)
        ? (duration as PeriodKey)
        : null
    );
  }, [
    settings,
    setAgendaHours,
    setAgendaMinutes,
    setFromHours,
    setFromMinutes,
    setLeadTime,
    setMeetingDuration,
    setToHours,
    setToMinutes,
    setWorkingDays,
  ]);

  const formatRange = (
    hours: number | "",
    minutes: number | ""
  ): string => {
    if (hours === "" && minutes === "") return "Не задано";
    const pad = (value: number | "") =>
      value === "" ? "00" : String(value).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}`;
  };

  const workingHoursLabel = useMemo(() => {
    const fromLabel = formatRange(fromHours, fromMinutes);
    const toLabel = formatRange(toHours, toMinutes);
    if (fromLabel === "Не задано" && toLabel === "Не задано") {
      return "Не задано";
    }
    return `С ${fromLabel} по ${toLabel}`;
  }, [fromHours, fromMinutes, toHours, toMinutes]);

  const agendaLabel = formatRange(agendaTimeHours, agendaTimeMinutes);
  const meetingDurationLabel = meetingDuration
    ? `${meetingDuration} мин`
    : "Не выбрано";

  const workingDayCount = useMemo(
    () => Object.values(workingDays).filter(Boolean).length,
    [workingDays]
  );

  const workStartNumber = toServerTimeNumber(fromHours, fromMinutes);
  const workEndNumber = toServerTimeNumber(toHours, toMinutes);

  const blockedReasons = useMemo(() => {
    const reasons: string[] = [];
    const bothSet =
      workStartNumber !== null && workEndNumber !== null;
    if (!bothSet || workStartNumber === workEndNumber) {
      reasons.push("Настройте рабочие часы: время начала и окончания должны отличаться.");
    }
    if (!meetingDuration) {
      reasons.push("Выберите длительность встречи в разделе «Периоды встреч».");
    }
    if (workingDayCount === 0) {
      reasons.push("Укажите хотя бы один рабочий день недели.");
    }
    return reasons;
  }, [workEndNumber, workStartNumber, meetingDuration, workingDayCount]);

  const isSchedulingBlocked = blockedReasons.length > 0;

  if (isLoading) {
    return (
      <div className="p-4 min-h-[calc(100vh-32px)] ">
        <Spinner size={16} title="Загрузка..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 min-h-[calc(100vh-32px)]">
        <Typography.Body variant="small">
          Не удалось загрузить настройки. Попробуйте позже.
        </Typography.Body>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-[calc(100vh-32px)]">
      {isSchedulingBlocked && (
        <div className="mx-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <Typography.Label className="font-semibold">
            Вы убрали возможность ставить вам встречи:
          </Typography.Label>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
            {blockedReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
  <CellList
        filled
        mode="island"
        header={<CellHeader>Часовой пояс</CellHeader>}
      >
       <CellSimple
          height="compact"
          title="Ваш часовой пояс"
          after={`${getBrowserTimezoneLocation()} ${getBrowserTimezoneHours()} UTC`}
        />
        </CellList>


      <CellList
        filled
        mode="island"
        header={<CellHeader>Свободное время</CellHeader>}
      >
        



        <CellSimple
          height="compact"
          before={<MdWorkHistory size={20} />}
          onClick={() => open({ content: WorkingHoursContent })}
          showChevron
          title="Рабочее время"
          after={workingHoursLabel}
        />

        <CellSimple
          height="compact"
          before={<MdDateRange size={20} />}

          onClick={() => open({ content: WorkingDaysContent })}
          showChevron
        after={
          <>
              {workingDayCount}{" "}
              из 7
          </>
        }
          title="Рабочие дни"
        />

        <CellSimple
          before={<MdAccessTime size={20} />}
          height="compact"
          onClick={() => open({ content: MeetingPeriodContent })}
          showChevron
          title="Периоды встреч"
          after={meetingDurationLabel}
        />
      </CellList>

      <CellList
        filled
        mode="island"
        header={<CellHeader>Уведомления</CellHeader>}
      >
        <CellSimple
          before={<MdNotificationsActive size={20} />}

          height="compact"
          onClick={() => open({ content: NotificationContent })}
          showChevron
          title="Уведомлять за"
          subtitle="Напомнить о событии"
          after={
            remindBeforeTime > 0
              ? `За ${formatTime(remindBeforeTime)}`
              : "Выкл"
          }
        />

        <CellSimple
          before={<MdOutlineViewAgenda size={20} />}
          height="compact"
          onClick={() => open({ content: AgendaContent })}
          showChevron
          title="Расписание на день"
          subtitle="Ежедневно присылать расписание на день"
          after={
            agendaLabel === "Не задано" ? "Выкл" : agendaLabel
          }
        />
      </CellList>
    </div>
  );
}

export default SettingsPage;
