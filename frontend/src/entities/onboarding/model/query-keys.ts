export const onboardingKeys = {
  all: ["onboarding"] as const,
  current: (maxId?: number | null) =>
    [...onboardingKeys.all, maxId ?? "guest"] as const,
};
