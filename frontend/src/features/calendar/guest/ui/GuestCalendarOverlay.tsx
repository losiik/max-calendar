import { CellList, CellSimple, Panel } from "@maxhub/max-ui";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useGuestCalendarStore } from "../model/guest-calendar.store";
import { ExternalCalendarView } from "@/pages/ExternalCalendarPage/ui/ExternalCalendarView";
import { useThemeScheme } from "@/shared/lib/theme-context";
import { useBookSlotStore } from "@/features/calendar/book-availability/model/book-slot.store";
import { MdArrowBack } from "react-icons/md";
import {
  hideBackButton,
  onBackButtonClick,
  showBackButton,
} from "@/shared/lib/max-web-app";

export function GuestCalendarOverlay() {
  const {
    isActive,
    calendarId,
    ownerName,
    exit,
    pause,
    resume,
    inviteToken,
  } = useGuestCalendarStore();
  const colorScheme = useThemeScheme();
  const closeBooking = useBookSlotStore((state) => state.close);
  const navigate = useNavigate();
  const backCleanupRef = useRef<(() => void) | null>(null);
  const canUseNativeBack = Boolean(inviteToken);

  const portalNode =
    typeof document !== "undefined"
      ? document.getElementById("portal-root")
      : null;


  const disableNativeBack = useCallback(() => {
    if (backCleanupRef.current) {
      backCleanupRef.current();
      backCleanupRef.current = null;
    }
    hideBackButton();
  }, []);

  const handleNativeBack = useCallback(() => {
    disableNativeBack();
    resume();
    navigate("/max-calendar/calendar");
  }, [disableNativeBack, navigate, resume]);

  const enableNativeBack = useCallback(() => {
    if (!canUseNativeBack || backCleanupRef.current) return;
    showBackButton();
    const cleanup = onBackButtonClick(handleNativeBack);
    backCleanupRef.current = cleanup ?? null;
  }, [canUseNativeBack, handleNativeBack]);

  useEffect(() => {
    return () => {
      disableNativeBack();
    };
  }, [disableNativeBack]);

  useEffect(() => {
    if (isActive) {
      disableNativeBack();
    }
  }, [isActive, disableNativeBack]);

  const handleExit = () => {
    disableNativeBack();
    closeBooking();
    exit();
  };

  const handleSettingsLinkClick = () => {
    pause();
    enableNativeBack();
  };
    if (!portalNode) return null;

  const panelClass =
    colorScheme === "dark"
      ? "bg-neutral-950 text-neutral-50"
      : "bg-gray-100 text-neutral-900";

  const shouldRender = isActive && calendarId;

  return shouldRender
    ? createPortal(
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-neutral-950/70 p-0 backdrop-blur">
          <Panel
            className={`w-full max-w-4xl overflow-hidden rounded-b-xl shadow-xl ${panelClass}`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200/40 px-3 pb-3">
          <CellList >
            <CellSimple
              title="Вернуться в мой календарь"
              before={<MdArrowBack onClick={handleExit} size={24} />}
            />

            <CellSimple height="compact"
              title={
                <>
                  <b>{ownerName}</b> делится с вами календарем.
                </>
              }
              subtitle={
                <i className="!text-xs">
                  * Доступные слоты - это время, которые подходят и вам, и
                  владельцу календаря. Если подходящих слотов мало,
                  скорректируйте свое рабочее время в{" "}
                  <Link
                    to="/max-calendar/settings"
                    onClick={handleSettingsLinkClick}
                    className="underline"
                  >
                    настройках
                  </Link>
                  .
                </i>
              }
            />
          </CellList>
        </div>

        <div className="max-h-[90vh] overflow-y-auto px-4 py-3">
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
      )
    : null;
}
