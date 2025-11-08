import { create } from 'zustand'

interface UIMenuState {
  activeTab: 'calendar' | 'settings'
  setActiveTab: (tab: 'calendar' | 'settings') => void
}

export const useUIStore = create<UIMenuState>((set) => ({
  activeTab: 'calendar',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
