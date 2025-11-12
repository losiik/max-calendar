import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveSettings, getCurrentMaxId } from "@/entities/event/api";
import type { SettingsUpdateRequest } from "@/entities/settings/types";
import { settingsKeys } from "@/entities/settings/query-keys";


export const useSettingsMutation = () => {
  const queryClient = useQueryClient();
  const maxId = getCurrentMaxId();

  return useMutation({
    mutationFn: (payload: SettingsUpdateRequest) => saveSettings(payload),
    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: settingsKeys.current(maxId),
      });
    },
  });
};
