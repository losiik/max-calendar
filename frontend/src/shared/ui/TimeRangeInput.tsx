import { CellInput, CellList, Typography } from '@maxhub/max-ui'

type Props = {
  hours: number | ''
  minutes: number | ''
  onHoursChange: (v: number | '') => void
  onMinutesChange: (v: number | '') => void
}

export function TimeRangeInput({ hours, minutes, onHoursChange, onMinutesChange }: Props) {
  const handleHours = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim()
    if (v === '') return onHoursChange('')
    const vNum = Number(v);
    if (!isNaN(vNum) && vNum >= 0 && vNum <= 23) onHoursChange(vNum)
  }

  const handleMinutes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (v === '') return onMinutesChange('');
    const vNum = Number(v);
    if (!isNaN(vNum) && vNum >= 0 && vNum <= 59) onMinutesChange(vNum);
  }

  return (
    <div  className='justify-start gap-2 flex my-2 row '>
      <CellList mode='island'>

        <CellInput
        inputMode="numeric"
         before={<Typography.Body>Час</Typography.Body>}
         
        type="number"
        value={hours}
        min={0}
        max={23}
        onChange={handleHours}
        placeholder="ЧЧ"

      />
     

      <CellInput
        title='C '
       before={<Typography.Body>Мин</Typography.Body>}
        inputMode="numeric"
        type="number"
        value={minutes}
        min={0}
        max={59}
        onChange={handleMinutes}
        placeholder="MM"

      />

      </CellList>
    </div>
  )
}
