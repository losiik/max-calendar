// src/pages/SettingsPage/ui/NotificationContent.tsx
import { CellList, CellSimple, Button, Panel } from '@maxhub/max-ui';
import { useState, useMemo } from 'react';
import { useNotificationStore } from '../model/notification.store';
import { useModalStore } from '@/shared/modal';
import { formatTime } from '@/shared/util/format-time';

const ranges: { min: number; step: number; max: number }[] = [
  { min: 5, step: 5, max: 15 },
  { min: 30, step: 30, max: 120 },
  { min: 180, step: 60, max: 240 },
  { min: 300, step: 120, max: 24 * 60 },
];

const toOptions = (cfg: typeof ranges) =>
  cfg.flatMap(({ min, step, max }) => {
    const arr: number[] = [];
    for (let i = min; i <= max; i += step) arr.push(i);
    return arr;
  });


export default function NotificationContent() {
  const close = useModalStore((s) => s.close);
  const savedLeadTime = useNotificationStore((s) => s.leadTimeMin);
  const setLeadTime = useNotificationStore((s) => s.setLeadTime);

  const options = useMemo(() => toOptions(ranges), []);
  const [value, setValue] = useState<number>(savedLeadTime);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(parseInt(e.target.value, 10));
  };

  const handleSave = () => {
    setLeadTime(value);
    close();
  };

  const handleReset = () => {
    setValue(0);
  };

  const dirty = value !== savedLeadTime;

  return (
    <Panel className="rounded-lg">
      <CellList className="p-3">
        <CellSimple height="compact" title="Напомнить за">
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={value}
            onChange={handleChange}
          >
            <option value={0}>Не напоминать</option>
            {options.map((m) => (
              <option key={m} value={m}>
                {formatTime(m)}
              </option>
            ))}
          </select>
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
