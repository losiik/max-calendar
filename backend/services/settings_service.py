from datetime import datetime
from uuid import UUID

from backend.models.models import Settings
from backend.repository.settings_repository import SettingsRepository
from backend.schemas.settings_schema import SettingsModelPydantic


class SettingsService:
    def __init__(self, settings_repository: SettingsRepository):
        self._settings_repository = settings_repository

    @staticmethod
    def days_to_bitmask(days_list) -> int:
        day_map = {
            'пн': 1 << 0,  # 1
            'вт': 1 << 1,  # 2
            'ср': 1 << 2,  # 4
            'чт': 1 << 3,  # 8
            'пт': 1 << 4,  # 16
            'сб': 1 << 5,  # 32
            'вс': 1 << 6,  # 64
        }

        bitmask = 0
        for day in days_list:
            day_lower = day.lower().strip()
            if day_lower in day_map:
                bitmask |= day_map[day_lower]

        return bitmask

    async def create_settings(
            self,
            user_id: UUID,
            timezone: int,
            work_time_start: float,
            work_time_end: float,
            alert_offset_minutes: int,
            daily_reminder_time: float,
            working_days: list[str]
    ) -> SettingsModelPydantic:
        working_days_bit_mask = self.days_to_bitmask(days_list=working_days)

        settings = Settings(
            user_id=user_id,
            updated_at=datetime.now(),
            timezone=timezone,
            work_time_start=work_time_start,
            work_time_end=work_time_end,
            alert_offset_minutes=alert_offset_minutes,
            daily_reminder_time=daily_reminder_time,
            working_days=working_days_bit_mask
        )

        settings_data = await self._settings_repository.save(
            entity=settings
        )
        return SettingsModelPydantic.from_orm(settings_data)

    async def update_settings(self):
        pass
