import { TimeRangeInput } from "@/shared/ui/TimeRangeInput";
import { CellList, CellSimple, Button, Panel } from "@maxhub/max-ui";
import { useAgendaStore } from "../model/agenda.store";
import { useModalStore } from "@/shared/modal";
import { useEffect, useState } from "react";
import { useSettingsMutation } from "@/features/calendar-settings/lib/useSettingsMutation";
import { toServerTimeNumber } from "@/shared/util/time";

export default function AgendaContent() {
  const hours = useAgendaStore((s) => s.hours);
  const minutes = useAgendaStore((s) => s.minutes); 
  const setMinutes = useAgendaStore((s) => s.setMinutes);
  const setHours = useAgendaStore((s) => s.setHours);
  const close = useModalStore((s) => s.close);
  const { mutateAsync, isPending } = useSettingsMutation();
  const [valueMinutes, setValueMinutes] = useState<number | "">(minutes);
  const [valueHours, setValueHours] = useState<number | "">(hours);
  const dirty = (valueMinutes !== minutes || valueHours !== hours) || (!valueMinutes && !valueHours );

  useEffect(() => {
    setValueMinutes(minutes);
  }, [minutes]);

  useEffect(() => {
    setValueHours(hours);
  }, [hours]);
  
  const handleReset = () => {
    setHours("");
    setMinutes("");
    setValueMinutes("");
    setValueHours("");
  };
  
  const handleSave = async () => {
    await mutateAsync({
      daily_reminder_time: toServerTimeNumber(valueHours, valueMinutes),
    }).catch(() => {alert("Ошибка сохранения времени напоминания")});
    setHours(valueHours);
    setMinutes(valueMinutes);
    close();
  };

  return (
    <Panel className="rounded-lg">
      <CellList className="p-3">
        <CellSimple height="compact" title="Напоминать о повестке дня в">
          <TimeRangeInput
            hours={valueHours}
            minutes={valueMinutes}
            onHoursChange={setValueHours}
            onMinutesChange={setValueMinutes}
          />
        </CellSimple>
        <div className="flex gap-2 mt-4">
          
          <Button mode="secondary" className="flex-1" onClick={handleReset}>
            Сбросить
          </Button>
          <Button
            data-haptic="success"
            mode="primary"
            className="flex-1"
            disabled={!dirty || isPending}
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </div>
      </CellList>
    </Panel>
  );
}
