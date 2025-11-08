import { create } from "zustand";
import { FC, ReactNode } from "react";

export type ModalId = string;

export type ModalOptions = {
  id?: ModalId;
  content: ReactNode;
  backdropClassName?: string;
  contentClassName?: string;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  preventScroll?: boolean;
};

type ModalItem = { id: string; content: FC };

type ModalState = {
  stack: ModalItem[];
  open: (i: { content: FC }) => void;
  close: () => void;

  fromHours: number | "";
  fromMinutes: number | "";
  toHours: number | "";
  toMinutes: number | "";
  setFromHours: (v: number | "") => void;
  setFromMinutes: (v: number | "") => void;
  setToHours: (v: number | "") => void;
  setToMinutes: (v: number | "") => void;
};

export const useModalStore = create<ModalState>((set) => ({
  stack: [],
  open: ({ content }) =>
    set((s) => ({
      stack: [
        ...s.stack,
        { id: crypto.randomUUID?.() || Math.random().toString(36), content },
      ],
    })),
  close: () => set((s) => ({ stack: s.stack.slice(0, -1) })),

  fromHours: "",
  fromMinutes: "",
  toHours: "",
  toMinutes: "",
  setFromHours: (v) => set({ fromHours: v }),
  setFromMinutes: (v) => set({ fromMinutes: v }),
  setToHours: (v) => set({ toHours: v }),
  setToMinutes: (v) => set({ toMinutes: v }),
}));
