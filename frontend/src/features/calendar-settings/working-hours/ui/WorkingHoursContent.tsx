import { Button, CellList, Panel, Typography } from "@maxhub/max-ui"
import { useModalStore } from "@/shared/modal"
import { TimeRangeInput } from "@/shared/ui/TimeRangeInput"
import { toServerTimeNumber } from "@/shared/util/time"
import { useSettingsMutation } from "@/features/calendar-settings/lib/useSettingsMutation"

export function WorkingHoursContent() {
  const {
    fromHours, fromMinutes, toHours, toMinutes,
    setFromHours, setFromMinutes, setToHours, setToMinutes, close
  } = useModalStore()
  const { mutateAsync, isPending } = useSettingsMutation()

  const save = async () => {
    await mutateAsync({
      work_time_start: toServerTimeNumber(fromHours, fromMinutes),
      work_time_end: toServerTimeNumber(toHours, toMinutes),
    }).catch(() => {
      alert("Ошибка сохранения рабочих часов");
    });
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
      <Button className="w-full mt-4" appearance="themed" mode="primary" size="medium" onClick={save} disabled={isPending}>
        <Typography.Body variant="small">Сохранить</Typography.Body>
      </Button>
    </CellList>
    </Panel>
  )
}
