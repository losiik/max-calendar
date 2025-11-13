from typing import Optional

from backend.services.onboarding_service import OnboardingService
from backend.services.user_service import UserService
from backend.schemas.onboarding_schema import OnboardingModelPydantic


class OnboardingFacade:
    def __init__(
            self,
            onboarding_service: OnboardingService,
            user_service: UserService
    ):
        self._onboarding_service = onboarding_service
        self._user_service = user_service

    async def create_onboarding(self, max_id: int) -> OnboardingModelPydantic:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        onboarding = await self._onboarding_service.create_onboarding(
            user_id=user.id
        )
        return onboarding

    async def delete_onboarding(self, max_id: int):
        user = await self._user_service.find_by_max_id(max_id=max_id)
        onboarding = await self._onboarding_service.delete_onboarding(
            user_id=user.id
        )
        return onboarding

    async def get_onboarding(self, max_id: int) -> Optional[OnboardingModelPydantic]:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        onboarding = await self._onboarding_service.get_onboarding(
            user_id=user.id
        )
        return onboarding
