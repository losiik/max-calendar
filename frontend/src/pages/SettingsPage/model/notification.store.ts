import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NotificationState = {

  leadTimeMin: number;
  setLeadTime: (min: number) => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      leadTimeMin: 0,
      setLeadTime: (min) => set({ leadTimeMin: min }),
      reset: () => set({ leadTimeMin: 0 }),
    }),
    { name: 'notification-settings' }
  )
);