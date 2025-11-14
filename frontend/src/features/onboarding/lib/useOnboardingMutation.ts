import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentMaxId,
  completeOnboardingRemote,
} from "@/entities/event/api";
import { onboardingKeys } from "@/entities/onboarding/model/query-keys";

export const useOnboardingMutation = () => {
  const queryClient = useQueryClient();
  const maxId = getCurrentMaxId();

  return useMutation({

    mutationFn: () => completeOnboardingRemote(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.current(maxId),
      });
    },
  });
};
