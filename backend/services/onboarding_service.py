from typing import Optional
from uuid import UUID

from backend.repository.onboarding_repository import OnboardingRepository
from backend.models.models import Onboarding
from backend.schemas.onboarding_schema import OnboardingModelPydantic


class OnboardingService:
    def __init__(self, onboarding_repository: OnboardingRepository):
        self._onboarding_repository = onboarding_repository

    async def get_onboarding(self, user_id: UUID) -> Optional[OnboardingModelPydantic]:
        onboarding = await self._onboarding_repository.find_by_user_id(user_id=user_id)
        return onboarding

    async def create_onboarding(self, user_id: UUID) -> OnboardingModelPydantic:
        onboarding = await self._onboarding_repository.save(
            entity=Onboarding(user_id=user_id)
        )
        return OnboardingModelPydantic.from_orm(onboarding)

    async def delete_onboarding(self, user_id: UUID):
        onboarding = await self._onboarding_repository.find_by_user_id(user_id=user_id)
        await self._onboarding_repository.delete_by_id(entity_id=onboarding.id)
