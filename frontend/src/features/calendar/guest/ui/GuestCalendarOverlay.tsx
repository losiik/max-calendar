import { Button, Panel, Typography } from "@maxhub/max-ui";
import { createPortal } from "react-dom";

import { useGuestCalendarStore } from "../model/guest-calendar.store";
import { ExternalCalendarView } from "@/pages/ExternalCalendarPage/ui/ExternalCalendarView";
import { useThemeScheme } from "@/shared/lib/theme-context";
import { getMaxUserId } from "@/shared/lib/max-web-app";
import { useBookSlotStore } from "@/features/calendar/book-availability/model/book-slot.store";
import { MdClose } from "react-icons/md";

export function GuestCalendarOverlay() {
  const { isActive, calendarId, ownerName, exit } =
    useGuestCalendarStore();
  const colorScheme = useThemeScheme();
  const closeBooking = useBookSlotStore((state) => state.close);

  if (!isActive || !calendarId) return null;

  const portalNode =
    typeof document !== "undefined"
      ? document.getElementById("portal-root")
      : null;
  if (!portalNode) return null;

  const handleExit = () => {
    const currentUserId = getMaxUserId();
    console.info("Exiting guest calendar for user", currentUserId);
    closeBooking();
    exit();
  };

  const panelClass =
    colorScheme === "dark"
      ? "bg-neutral-950 text-neutral-50"
      : "bg-gray-100 text-neutral-900";

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-neutral-950/70 p-0 backdrop-blur">
      <Panel
        className={`w-full max-w-4xl overflow-hidden rounded-b-xl shadow-xl ${panelClass}`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200/40 px-3 py-3">
          <div >
            
            {ownerName && (
              <Typography.Title className="text-neutral-500">
                {ownerName} делится с вами календарем
              </Typography.Title>
            )}
          </div>
          <Button
            mode="secondary"
            appearance="neutral-themed"
            onClick={handleExit}
          >
            <MdClose/>
          </Button>
        </div>

        <div className="max-h-[90vh] overflow-y-auto py-3">
          <ExternalCalendarView
            calendarId={calendarId}
            title={`Календарь ${ownerName ?? "юзера"}`}
            subtitle="Выберите слот, чтобы предложить встречу"
            hideHeader
            ownerName={ownerName}
          />
        </div>
      </Panel>
    </div>,
    portalNode
  );
}
