import { create } from 'zustand'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

type State = {
  days: Record<DayKey, boolean>
  toggle: (d: DayKey) => void
  setDays: (next: Record<DayKey, boolean>) => void
}

export const createEmptyWorkingDays = (): Record<DayKey, boolean> => ({
  mon: false,
  tue: false,
  wed: false,
  thu: false,
  fri: false,
  sat: false,
  sun: false,
})

export const useWorkingDaysStore = create<State>((set) => ({
  days: createEmptyWorkingDays(),
  toggle: (d) => set((s) => ({ days: { ...s.days, [d]: !s.days[d] } })),
  setDays: (next) => set({ days: next }),
}))
