// src/pages/SettingsPage/ui/NotificationContent.tsx
import {
  CellList,
  CellSimple,
  Button,
  Panel,
  Typography,
  Switch,
} from "@maxhub/max-ui";
import { useState } from "react";
import { useNotificationStore } from "../model/notification.store";
import { useModalStore } from "@/shared/modal";
import { formatTime } from "@/shared/util/format-time";
import { useSettingsMutation } from "@/features/calendar-settings/lib/useSettingsMutation";

const TIMES: number[] = [5, 10, 15, 60, 24 * 60];

export default function NotificationContent() {
  const close = useModalStore((s) => s.close);
  const savedLeadTime = useNotificationStore((s) => s.leadTimeMin);
  const setLeadTime = useNotificationStore((s) => s.setLeadTime);
  const { mutateAsync, isPending } = useSettingsMutation();
  const [selected, setSelected] = useState<number | undefined>(savedLeadTime);

  const toggle = (key: number) => {
    setSelected(selected === key ? undefined : key);
  };


  const handleSave = async () => {
    await mutateAsync({
      alert_offset_minutes: selected === 0 ? null : selected,
    }).catch(() => {
      alert("Ошибка сохранения настроек напоминаний");
    });
    setLeadTime(selected);
    close();
  };

  const handleReset = () => {
    setSelected(0);
  };

  const dirty = selected !== savedLeadTime;

  return (
    <Panel className="rounded-lg">
      <CellList className="p-3">
        {TIMES.map((m) => (
          <CellSimple
            key={m}

            title={
              <Typography.Body variant="medium">
                {formatTime(m)}
              </Typography.Body>
            }
            after={
              <Switch checked={selected === m} onChange={() => toggle(m)} />
            }
          />
        ))}

        <div className="flex gap-2 mt-4">
          <Button mode="secondary" className="flex-1" onClick={handleReset}>
            Сбросить
          </Button>
          <Button
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
