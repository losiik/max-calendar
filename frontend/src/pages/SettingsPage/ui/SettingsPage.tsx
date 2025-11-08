import { useModalStore } from "@/shared/modal";
import {
  CellHeader,
  CellList,
  CellSimple,

} from "@maxhub/max-ui";
import { WorkingHoursContent } from "./WorkingHoursContent";
import { WorkingDaysContent } from "./WorkingDaysContent";

import { useWorkingDaysStore } from "../model/working-days.store";
import { MeetingPeriodContent } from "./MeetingPeriodContent";
import NotificationContent from "./NotificationContent";
import AgendaContent from "./AgendaContent";
import { useNotificationStore } from "../model/notification.store";
import { formatTime } from "@/shared/util/format-time";



function SettingsPage() {
  const open = useModalStore((s) => s.open);
  const workingDays = useWorkingDaysStore((s) => s.days);
  const fromHours   = useModalStore(s => s.fromHours);
  const fromMinutes = useModalStore(s => s.fromMinutes);
  const toHours     = useModalStore(s => s.toHours);
  const toMinutes   = useModalStore(s => s.toMinutes);
  const remindBeforeTime = useNotificationStore(s => s.leadTimeMin);

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
          after={<>C {fromHours}:{fromMinutes} по {toHours}:{toMinutes}</>}
        />
        
        <CellSimple
        height="compact"
          onClick={() => open({ content: WorkingDaysContent })}
          showChevron
          after={<>{Object.entries(workingDays).filter(([, v]) => !!v).map(([k]) => k).length} из 7</>}
          title="Рабочие дни"
        />

         <CellSimple
        height="compact"
          onClick={() => open({ content: MeetingPeriodContent})}
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
          after={remindBeforeTime === 0 ? 'Не напоминать' : `За ${formatTime(remindBeforeTime)}`}
        />
        
        <CellSimple
        height="compact"
          onClick={() => open({ content: AgendaContent })}
          showChevron
          title="Расписание на день"
          subtitle="Ежедневно присылать расписание на день"

        />

       
      </CellList>
    </div>
  );
}

export default SettingsPage;
