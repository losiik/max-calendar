import { create } from 'zustand';


type NotificationState = {

  leadTimeMin: number;
  setLeadTime: (min: number) => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>(

    (set) => ({
      leadTimeMin: 0,
      setLeadTime: (min) => set({ leadTimeMin: min }),
      reset: () => set({ leadTimeMin: 0 }),
    }),


);