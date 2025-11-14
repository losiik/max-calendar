import { useQuery } from "@tanstack/react-query";

import { onboardingKeys } from "@/entities/onboarding/model/query-keys";
import {
  fetchOnboardingStatus,
  getCurrentMaxId,
} from "@/entities/event/api";

export const useOnboardingQuery = () => {
  const maxId = getCurrentMaxId();

  return useQuery({
    queryKey: onboardingKeys.current(maxId),
    queryFn: () => fetchOnboardingStatus(),
    enabled: Boolean(maxId),
    staleTime: 5 * 60 * 1000,
  });
};
