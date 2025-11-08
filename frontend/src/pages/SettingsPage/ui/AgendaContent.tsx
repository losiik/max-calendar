
import { useModalStore } from '@/shared/modal'
import { TimeRangeInput } from '@/shared/ui/TimeRangeInput'
import { CellList, CellSimple, Button, Panel } from '@maxhub/max-ui'


export default function AgendaContent() {
     const {
        fromHours, fromMinutes,
        setFromHours, setFromMinutes, close
      } = useModalStore();

    const save = () => {
        const payload = {
            from: `${String(fromHours ?? "").padStart(2,"0")}:${String(fromMinutes ?? "").padStart(2,"0")}`,
        }
        console.log(payload)
        close()
    }

    
  return (
    <Panel className='rounded-lg' >
     <CellList className="p-3">
        <CellSimple
          height="compact"
          title="Напоминать о повестке дня в"
            
        >
           <TimeRangeInput  hours={fromHours} minutes={fromMinutes} onHoursChange={setFromHours} onMinutesChange={setFromMinutes} />
        </CellSimple>
      <Button mode='primary' className="mt-4 w-full"  onClick={save}>
        Сохранить
      </Button>
    </CellList>
    </Panel>
  )
}

