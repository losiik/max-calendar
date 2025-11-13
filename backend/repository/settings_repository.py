from uuid import UUID
from typing import Optional, List
from datetime import datetime, timezone

from sqlalchemy.future import select
from sqlalchemy import cast, Float

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

    async def find_users_with_current_reminder_time(self) -> List[SettingsModelPydantic]:
        list_settings = []

        now_utc = datetime.now(timezone.utc).replace(second=0, microsecond=0)
        now_float = now_utc.hour + now_utc.minute / 100

        stmt = (
            select(Settings)
            .where(
                cast(Settings.daily_reminder_time - Settings.timezone, Float)
                .between(now_float - 0.01, now_float + 0.01)
            )
        )

        result = await db.session.execute(stmt)
        settings = result.scalars().all()

        for s in settings:
            list_settings.append(SettingsModelPydantic.from_orm(s))
        return list_settings
