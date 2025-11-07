import { create } from 'zustand'

export type PeriodKey = 5 | 10 | 15 | 30 | 45 | 60 | 90 | 120

type State = {
  periods: Record<PeriodKey, boolean>
  toggle: (d: PeriodKey) => void
}

export const useMeetingPeriodsStore = create<State>((set) => ({
  periods: { 5: true, 10: false, 15: true, 30: false, 45: false, 60: false, 90: false, 120: false },
  toggle: (d) => set((s) => ({ periods: { ...s.periods, [d]: !s.periods[d] } })),
}))
