import { useEffect, useMemo } from "react";
import { Panel, Typography } from "@maxhub/max-ui";

import { AppRouter } from "../providers/router";
import { getStartAppParams, getStartAppPayload } from "@/shared/lib/max-web-app";
import { useGuestCalendarStore } from "@/features/calendar/guest/model/guest-calendar.store";
import { GuestCalendarOverlay } from "@/features/calendar/guest/ui/GuestCalendarOverlay";

export default function App() {
  const startParams = useMemo(() => getStartAppParams(), []);
  const initGuest = useGuestCalendarStore((state) => state.initFromPayload);
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
      <div className="p-2">
        <Panel className="mb-2 rounded-xl border border-dashed border-primary-300/60 bg-primary-50/60 p-3 text-sm text-primary-900">
          <Typography.Label className="block font-medium text-primary-800">
            Debug start_param payload
          </Typography.Label>
          <pre className="mt-1 whitespace-pre-wrap text-xs text-primary-900">
            {JSON.stringify(startParams ?? {}, null, 2) || "—"}
          </pre>
         
        </Panel>
      </div>
      <AppRouter />
    </>
  );
}
