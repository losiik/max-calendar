import { useEffect } from "react";

import { AppRouter } from "../providers/router";
import { getStartAppPayload } from "@/shared/lib/max-web-app";
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

  return (
    <>
      <div id="portal-root" />
      <GuestCalendarOverlay />
      <AppRouter />
    </>
  );
}
