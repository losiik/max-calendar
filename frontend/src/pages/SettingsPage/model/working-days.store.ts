import { create } from 'zustand'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

type State = {
  days: Record<DayKey, boolean>
  toggle: (d: DayKey) => void
}

export const useWorkingDaysStore = create<State>((set) => ({
  days: { mon:false, tue:false, wed:false, thu:false, fri:false, sat:false, sun:false },
  toggle: (d) => set((s) => ({ days: { ...s.days, [d]: !s.days[d] } })),
}))
