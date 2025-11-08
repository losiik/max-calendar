import { CellList, Typography, Switch, CellSimple, Button, Panel } from '@maxhub/max-ui'
import { useWorkingDaysStore } from '../model/working-days.store';
import { useModalStore } from '@/shared/modal';




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

  const close = useModalStore((s) => s.close);
  
  const handleSave = () => {
    close()
  }


  return (
    <Panel className='rounded-lg' >
        <CellList  className=" p-3 rounded-lg" mode="full-width" header={<Typography.Title variant='large-strong'>Настройки</Typography.Title>} >
       {LABELS.map((d) => (
        <CellSimple
          key={d.key}
          title={<Typography.Body variant="medium">{d.label}</Typography.Body>}
          after={<Switch checked={days[d.key]} onChange={() => toggle(d.key)} />}
        />
      ))}
      <Button mode='primary' className="mt-4 w-full" onClick={handleSave}>
        Сохранить
      </Button>
    </CellList>
    </Panel>
  )
}
