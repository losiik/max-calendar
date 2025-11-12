import { useEffect } from "react";

import { AppRouter } from "../providers/router";
import {
  getStartAppPayload,
  enableClosingConfirmation,
  disableClosingConfirmation,
  triggerHapticImpact,
  triggerHapticNotification,
  type HapticImpactStyle,
} from "@/shared/lib/max-web-app";
import { useGuestCalendarStore } from "@/features/calendar/guest/model/guest-calendar.store";
import { GuestCalendarOverlay } from "@/features/calendar/guest/ui/GuestCalendarOverlay";
import { ensureUserRegistered, getBrowserTimezoneHours, saveSettings } from "@/entities/event/api";

export default function App() {
  const initGuest = useGuestCalendarStore((state) => state.initFromPayload);

  useEffect(() => {
   (async function() {
     const isRegistered = await ensureUserRegistered();
    if (isRegistered) {
      console.log("User is registered");  
      saveSettings({timezone: getBrowserTimezoneHours()})
    }
   })();
  }, []);

  useEffect(() => {
    const token = getStartAppPayload();
    if (token) {
      initGuest(token);
    }
  }, [initGuest]);

  useEffect(() => {
    enableClosingConfirmation();
    return () => {
      disableClosingConfirmation();
    };
  }, []);

  useEffect(() => {
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest<HTMLElement>(
        "[data-haptic], button, [role='button']"
      );
      if (!button) return;
      const attr = (button.getAttribute("data-haptic") ?? "light").toLowerCase();
      if (attr === "none") return;
      if (attr === "success") {
        triggerHapticNotification("success");
        return;
      }
      const impact = (
        ["soft", "light", "medium", "heavy", "rigid"].includes(attr)
          ? attr
          : "light"
      ) as HapticImpactStyle;
      triggerHapticImpact(impact);
    };

    document.addEventListener("click", handleButtonClick, true);
    return () => {
      document.removeEventListener("click", handleButtonClick, true);
    };
  }, []);

  return (
    <>
      <div id="portal-root" />
      <GuestCalendarOverlay />
      <AppRouter />
    </>
  );
}
