from uuid import UUID
from typing import Optional

from sqlalchemy.future import select

from backend.database import db
from backend.models.models import Onboarding
from backend.repository.crud_repository import CrudRepository
from backend.schemas.onboarding_schema import OnboardingModelPydantic


class OnboardingRepository(CrudRepository[Onboarding, UUID]):
    async def find_by_user_id(self, user_id: UUID) -> Optional[OnboardingModelPydantic]:
        stmt = select(Onboarding).where(Onboarding.user_id == user_id)
        result = await db.session.execute(stmt)
        onboarding = result.scalar_one_or_none()

        if onboarding:
            return OnboardingModelPydantic.from_orm(onboarding)
        return None
