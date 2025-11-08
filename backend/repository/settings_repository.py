from uuid import UUID
from typing import Optional

from sqlalchemy.future import select

from backend.database import db
from backend.models.models import Settings
from backend.repository.crud_repository import CrudRepository
from backend.schemas.settings_schema import SettingsModelPydantic


class SettingsRepository(CrudRepository[Settings, UUID]):
    async def find_by_user_id(self, user_id: UUID) -> Optional[SettingsModelPydantic]:
        stmt = select(Settings).where(Settings.user_id == user_id)
        result = await db.session.execute(stmt)
        settings_data = result.scalar_one_or_none()

        if settings_data:
            return SettingsModelPydantic.from_orm(settings_data)
        return None
