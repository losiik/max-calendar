import { CellList, Typography, Switch, CellSimple, Button, Panel } from '@maxhub/max-ui'
import { useMeetingPeriodsStore } from '../model/meeting-periods.store';
import { useModalStore } from '@/shared/modal';





const LABELS: { key: 5 | 10 | 15 | 30 | 45 | 60 | 90 | 120; label: string }[] = [
  { key: 5, label: '5 минут' },
  { key: 10, label: '10 минут' },
  { key: 15, label: '15 минут' },
  { key: 30, label: '30 минут' },
  { key: 45, label: '45 минут' },
  { key: 60, label: '60 минут' },
  { key: 90, label: '90 минут' },
  { key: 120, label: '120 минут' },
]

export function MeetingPeriodContent() {
  const periods = useMeetingPeriodsStore((s) => s.periods)
  const toggle = useMeetingPeriodsStore((s) => s.toggle)
  const close = useModalStore((s) => s.close);

  const handleSave = () => {
    close()
  }

  return (
    <Panel className='rounded-lg' >
        <CellList className=" p-3 rounded-lg" mode="full-width" header={<Typography.Title variant='large-strong'>Настройки</Typography.Title>} >
       {LABELS.map((d) => (
        <CellSimple
          key={d.key}
          title={<Typography.Body variant="medium">{d.label}</Typography.Body>}
          after={<Switch checked={periods[d.key]} onChange={() => toggle(d.key)} />}
        />
      ))}
      <Button mode='primary' className="mt-4 w-full" onClick={handleSave}>
        Сохранить
      </Button>
    </CellList>
    </Panel>
  )
}
