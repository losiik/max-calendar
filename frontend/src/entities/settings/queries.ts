import { useQuery } from "@tanstack/react-query";

import { fetchSettings, getCurrentMaxId, isMockApi } from "@/entities/event/api";
import { settingsKeys } from "./query-keys";

export const useSettingsQuery = () => {
  const maxId = getCurrentMaxId();
  return useQuery({
    queryKey: settingsKeys.current(maxId),
    queryFn: fetchSettings,
    enabled: isMockApi || Boolean(maxId),
  });
};
