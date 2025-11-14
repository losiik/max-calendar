// app/layouts/MainLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUIStore } from "../../providers/store";
import { MenuTabs } from "../../widgets/MenuTabs/ui/MenuTabs";
import { ModalHost } from "@/shared/modal";
import { useColorScheme } from "@maxhub/max-ui";
import { GuestCalendarOverlay } from "@/features/calendar/guest/ui/GuestCalendarOverlay";
import { OnboardingOverlay } from "@/features/onboarding/ui/OnboardingOverlay";


export function MainLayout() {
  const { pathname } = useLocation();
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const colorTheme = useColorScheme();

  useEffect(() => {
    if (pathname.includes("/settings")) setActiveTab("settings");
    else setActiveTab("calendar");
  }, [pathname, setActiveTab]);

  return (
    <div className={`p-1 pt-3 pb-5 ${colorTheme === "dark" ? "bg-neutral-950" : "bg-gray-100"} min-h-screen`}>
      <ModalHost />
      <Outlet />
      <OnboardingOverlay />
      <GuestCalendarOverlay />
      <MenuTabs />
    </div>
  );
}
