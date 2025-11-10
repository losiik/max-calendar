import { CellList, Typography, Switch, CellSimple, Button, Panel } from "@maxhub/max-ui";
import { useMeetingPeriodsStore } from "../model/meeting-periods.store";
import { useModalStore } from "@/shared/modal";
import { useSettingsMutation } from "@/features/calendar-settings/lib/useSettingsMutation";

const LABELS: { key: 15 | 30 | 45 | 60 | 90; label: string }[] = [
  { key: 15, label: "15 минут" },
  { key: 30, label: "30 минут" },
  { key: 45, label: "45 минут" },
  { key: 60, label: "60 минут" },
  { key: 90, label: "90 минут" },
];

export function MeetingPeriodContent() {
  const selected = useMeetingPeriodsStore((s) => s.selected);
  const setSelected = useMeetingPeriodsStore((s) => s.setSelected);
  const close = useModalStore((s) => s.close);
  const { mutateAsync, isPending } = useSettingsMutation();

  const toggle = (key: (typeof LABELS)[number]["key"]) => {
    setSelected(selected === key ? null : key);
  };

  const handleSave = async () => {
    await mutateAsync({ duration_minutes: selected ?? null });
    close();
  };

  return (
    <Panel className="rounded-lg">
      <CellList
        className="p-3 rounded-lg"
        mode="full-width"
        header={<Typography.Title variant="large-strong">Длительность встреч</Typography.Title>}
      >
        {LABELS.map((d) => (
          <CellSimple
            key={d.key}
            title={<Typography.Body variant="medium">{d.label}</Typography.Body>}
            after={
              <Switch
                checked={selected === d.key}
                onChange={() => toggle(d.key)}
              />
            }
          />
        ))}
        <Button mode="primary" className="mt-4 w-full" onClick={handleSave} disabled={isPending}>
          Сохранить
        </Button>
      </CellList>
    </Panel>
  );
}
