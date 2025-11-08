import { Button, CellList, Panel, Typography } from "@maxhub/max-ui"
import { useModalStore } from "@/shared/modal"
import { TimeRangeInput } from "@/shared/ui/TimeRangeInput"

export function WorkingHoursContent() {
  const {
    fromHours, fromMinutes, toHours, toMinutes,
    setFromHours, setFromMinutes, setToHours, setToMinutes, close
  } = useModalStore()

  const save = () => {
    const payload = {
      from: `${String(fromHours ?? "").padStart(2,"0")}:${String(fromMinutes ?? "").padStart(2,"0")}`,
      to: `${String(toHours ?? "").padStart(2,"0")}:${String(toMinutes ?? "").padStart(2,"0")}`,
    }
    console.log(payload)
    close()
  }

  return (
    <Panel className='rounded-lg p-3' >
    <CellList >
      <Typography.Title  variant="large-strong">От</Typography.Title>
      <TimeRangeInput
        hours={fromHours}
        minutes={fromMinutes}
        onHoursChange={setFromHours}
        onMinutesChange={setFromMinutes}
      />
      <Typography.Title  variant="large-strong">До</Typography.Title>
      <TimeRangeInput
        hours={toHours}
        minutes={toMinutes}
        onHoursChange={setToHours}
        onMinutesChange={setToMinutes}
      />
      <Button className="w-full mt-4" appearance="themed" mode="primary" size="medium" onClick={save}>
        <Typography.Body variant="small">Сохранить</Typography.Body>
      </Button>
    </CellList>
    </Panel>
  )
}
