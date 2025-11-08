// app/layouts/MainLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUIStore } from "../../providers/store";
import { MenuTabs } from "../../widgets/MenuTabs/ui/MenuTabs";
import { ModalHost } from "@/shared/modal";

export function MainLayout() {
  const { pathname } = useLocation();
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  useEffect(() => {
    if (pathname.includes("/settings")) setActiveTab("settings");
    else setActiveTab("calendar");
  }, [pathname, setActiveTab]);

  return (
    <div className="p-1 pt-3 pb-5">
      <ModalHost />
      <Outlet />
      <MenuTabs />
    </div>
  );
}
