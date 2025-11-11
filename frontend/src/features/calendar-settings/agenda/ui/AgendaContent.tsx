import { TimeRangeInput } from "@/shared/ui/TimeRangeInput";
import { CellList, CellSimple, Button, Panel } from "@maxhub/max-ui";
import { useAgendaStore } from "../model/agenda.store";
import { useModalStore } from "@/shared/modal";
import { useEffect, useState } from "react";

export default function AgendaContent() {
  const hours = useAgendaStore((s) => s.hours);
  const minutes = useAgendaStore((s) => s.minutes); 
  const setMinutes = useAgendaStore((s) => s.setMinutes);
  const setHours = useAgendaStore((s) => s.setHours);
  const close = useModalStore((s) => s.close);
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
  
  const handleSave = () => {
    
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
          <Button
            mode="primary"
            className="flex-1"
            disabled={!dirty}
            onClick={handleSave}
          >
            Сохранить
          </Button>
          <Button mode="secondary" className="flex-1" onClick={handleReset}>
            Сбросить
          </Button>
        </div>
      </CellList>
    </Panel>
  );
}
