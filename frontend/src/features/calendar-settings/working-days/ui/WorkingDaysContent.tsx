import { CellList, Typography, Switch, CellSimple, Button, Panel } from '@maxhub/max-ui'
import { useWorkingDaysStore } from '../model/working-days.store';
import { useModalStore } from '@/shared/modal';
import { useSettingsMutation } from '@/features/calendar-settings/lib/useSettingsMutation';
import { mapRecordToServerDays } from '@/features/calendar-settings/lib/working-days.mapper';

const LABELS: { key: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'; label: string }[] = [
  { key: 'mon', label: 'Понедельник' },
  { key: 'tue', label: 'Вторник' },
  { key: 'wed', label: 'Среда' },
  { key: 'thu', label: 'Четверг' },
  { key: 'fri', label: 'Пятница' },
  { key: 'sat', label: 'Суббота' },
  { key: 'sun', label: 'Воскресенье' },
]

export function WorkingDaysContent() {
  const days = useWorkingDaysStore((s) => s.days)
  const toggle = useWorkingDaysStore((s) => s.toggle)
  const { mutateAsync, isPending } = useSettingsMutation()

  const close = useModalStore((s) => s.close);
  
  const handleSave = async () => {
    const workingDays = mapRecordToServerDays(days)
    await mutateAsync({ working_days: workingDays }).catch(() => {alert("Ошибка сохранения рабочих дней")});
    close()
  }


  return (
    <Panel className='rounded-lg' >
        <CellList  className=" p-3 rounded-lg" mode="island" header={<Typography.Title variant='large-strong'>Мне можно ставить встречи по этим дням</Typography.Title>} >
       {LABELS.map((d) => (
        <CellSimple
          key={d.key}
          title={<Typography.Body variant="medium">{d.label}</Typography.Body>}
          after={<Switch checked={days[d.key]} onChange={() => toggle(d.key)} />}
        />
      ))}
      <Button data-haptic="success" mode='primary' className="mt-4 w-full" onClick={handleSave} disabled={isPending}>
        Сохранить
      </Button>
    </CellList>
    </Panel>
  )
}
