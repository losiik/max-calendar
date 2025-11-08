import { useModalStore } from "@/shared/modal";
import { CellHeader, CellList, CellSimple } from "@maxhub/max-ui";
import { WorkingHoursContent } from "@/features/calendar-settings/working-hours/ui/WorkingHoursContent";
import { formatTime } from "@/shared/util/format-time";
import { WorkingDaysContent } from "@/features/calendar-settings/working-days/ui/WorkingDaysContent";
import { MeetingPeriodContent } from "@/features/calendar-settings/meeting-periods/ui/MeetingPeriodContent";
import { useAgendaStore } from "@/features/calendar-settings/agenda/model/agenda.store";
import { useWorkingDaysStore } from "@/features/calendar-settings/working-days/model/working-days.store";
import { useNotificationStore } from "@/features/calendar-settings/notifications/model/notification.store";
import NotificationContent from "@/features/calendar-settings/notifications/ui/NotificationContent";
import AgendaContent from "@/features/calendar-settings/agenda/ui/AgendaContent";

function SettingsPage() {
  const open = useModalStore((s) => s.open);
  const workingDays = useWorkingDaysStore((s) => s.days);
  const fromHours = useModalStore((s) => s.fromHours);
  const fromMinutes = useModalStore((s) => s.fromMinutes);
  const toHours = useModalStore((s) => s.toHours);
  const toMinutes = useModalStore((s) => s.toMinutes);
  const remindBeforeTime = useNotificationStore((s) => s.leadTimeMin);
  const agendaTimeHours = useAgendaStore((s) => s.hours);
  const agendaTimeMinutes = useAgendaStore((s) => s.minutes);
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
            <>
              C {fromHours}:{fromMinutes} по {toHours}:{toMinutes}
            </>
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
            remindBeforeTime === 0
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
            agendaTimeHours && agendaTimeMinutes
              ? `${String(agendaTimeHours).padStart(2, "0")}:${String(
                  agendaTimeMinutes
                ).padStart(2, "0")}`
              : "Выкл"
          }
        />
      </CellList>
    </div>
  );
}

export default SettingsPage;
