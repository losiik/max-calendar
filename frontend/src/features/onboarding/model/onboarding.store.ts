import { create } from "zustand";

import { onboardingSlides, type OnboardingSlide } from "./onboarding.slides";

export const STORAGE_KEY = "max-calendar:onboarding-complete";

const getStoredFlag = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const setStoredFlag = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // 
  }
};

const clearStoredFlag = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 
  }
};

export const hasLocalOnboardingComplete = () => getStoredFlag();
export const markLocalOnboardingComplete = () => setStoredFlag();
export const resetLocalOnboarding = () => clearStoredFlag();

type OnboardingState = {
  isVisible: boolean;
  currentSlide: number;
  slides: OnboardingSlide[];
  openIfNeeded: (remoteCompleted: boolean) => void;
  advance: () => boolean;
  skip: () => void;
  close: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isVisible: false,
  currentSlide: 0,
  slides: onboardingSlides,
  openIfNeeded: (remoteCompleted: boolean) => {
    if (getStoredFlag() || remoteCompleted) return;
    set({ isVisible: true, currentSlide: 0 });
  },
  advance: () => {
    const { currentSlide, slides } = get();
    if (currentSlide < slides.length - 1) {
      set({ currentSlide: currentSlide + 1 });
      return false;
    }
    set({ isVisible: false, currentSlide: 0 });
    return true;
  },
  skip: () => {
    set({ isVisible: false, currentSlide: 0 });
  },
  close: () => set({ isVisible: false, currentSlide: 0 }),
}));
