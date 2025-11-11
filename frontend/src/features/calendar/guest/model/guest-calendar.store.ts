import { create } from "zustand";

import { fetchGuestCalendarMeta } from "@/entities/event/api";

type GuestCalendarState = {
  inviteToken?: string;
  calendarId?: string;
  ownerId?: string;
  ownerName?: string;
  ownerUsername?: string;
  title?: string;
  isActive: boolean;
  isLoading: boolean;
  ignoredTokens: string[];
  initFromPayload: (token: string) => Promise<void>;
  exit: () => void;
};

export const useGuestCalendarStore = create<GuestCalendarState>((set, get) => ({
  isActive: false,
  isLoading: false,
  ignoredTokens: [],

  async initFromPayload(token) {
    if (!token) return;
    const state = get();
    if (state.isActive || state.inviteToken === token) return;
    if (state.ignoredTokens.includes(token)) return;

    set({ isLoading: true });
    try {
      const meta = await fetchGuestCalendarMeta(token);
      set({
        inviteToken: token,
        calendarId: meta.calendarId,
        ownerId: meta.ownerId,
        ownerName: meta.ownerName,
        ownerUsername: meta.ownerUsername,
        title: meta.title,
        isActive: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load guest calendar", error);
      set((prev) => ({
        isLoading: false,
        ignoredTokens: [...prev.ignoredTokens, token],
      }));
    }
  },

  exit() {
    set((prev) => ({
      ignoredTokens: prev.inviteToken
        ? [...prev.ignoredTokens, prev.inviteToken]
        : prev.ignoredTokens,
      inviteToken: undefined,
      calendarId: undefined,
      ownerId: undefined,
      ownerName: undefined,
      ownerUsername: undefined,
      title: undefined,
      isActive: false,
    }));
  },
}));
