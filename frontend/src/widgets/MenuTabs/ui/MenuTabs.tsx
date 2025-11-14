// src/widgets/MenuTabs/ui/MenuTabs.tsx
import { Button, Container, Flex } from "@maxhub/max-ui";
import { memo, useMemo, useState } from "react";
import { useUIStore } from "@/providers/store";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_BY_TAB, TABS, TabValue } from "@/shared/config/route";
import { resetLocalOnboarding } from "@/features/onboarding/model/onboarding.store";
import {
  getCurrentMaxId,
  resetOnboardingRemote,
} from "@/entities/event/api";
import { useQueryClient } from "@tanstack/react-query";
import { onboardingKeys } from "@/entities/onboarding/model/query-keys";

const MAX_COUNTER_VALUE = 5;

export const MenuTabs = memo(function MenuTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const [counter, setCounter] = useState(0);
  const [isWithinTime, setIsWithinTime] = useState(false);
  const queryClient = useQueryClient();

  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  const path = pathname.startsWith(base)
    ? pathname.slice(base.length) || "/"
    : pathname;

  const current = useMemo(() => {
    const hit = TABS.find((t) =>
      matchPath({ path: t.pattern, end: false }, path)
    );
    return hit?.value ?? "calendar";
  }, [path]);

  if (useUIStore.getState().activeTab !== current) setActiveTab(current);

  const items = useMemo(
    () => TABS.map((t) => ({ label: t.label, value: t.value })),
    []
  );
  const activeIndex = items.findIndex((i) => i.value === current);
  const sliderLeft = `${Math.max(activeIndex, 0) * 100}%`;
  function handleRemoveKey(): void {
    setCounter(counter + 1);
  }
  const go = (value: TabValue) => {
    const target = ROUTE_BY_TAB[value];
    if (ROUTE_BY_TAB[value] === TABS[1].value) {

      setTimeout(() => {
        setIsWithinTime(false);
        setCounter(0);


      }, 1000);
      setIsWithinTime(true);
      setCounter(counter + 1);
      if (isWithinTime && counter >= MAX_COUNTER_VALUE) {
        resetLocalOnboarding();
        resetOnboardingRemote().finally(() => {
          queryClient.invalidateQueries({
            queryKey: onboardingKeys.current(getCurrentMaxId()),
          });
        });
      }
    }

    navigate(target);
    setActiveTab(value);
  };

  return (
    <Container className="fixed bottom-8 left-0 right-0 z-10">
      <Flex
        direction="row"
        role="tablist"
        aria-label="Main menu"
        className="relative mx-auto mt-4 flex w-full max-w-md select-none rounded-lg bg-white p-1"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-gray-100 shadow transition-all duration-200 ease-out"
          style={{ transform: `translateX(${sliderLeft})` }}
        />

        {items.map((it) => {
          const isActive = it.value === current;
          return (
            <div key={it.value} className="w-full relative">
              <Button
                role="tab"
                aria-selected={isActive}
                mode="secondary"
                appearance="neutral-themed"
                size="medium"
                stretched
                onClick={() => {
                  handleRemoveKey();
                  go(it.value);
                }}
                className="w-full bg-transparent"
              >
                {it.label}
              </Button>
            </div>
          );
        })}
      </Flex>
    </Container>
  );
});
