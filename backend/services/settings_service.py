import asyncio
from datetime import datetime
from uuid import UUID
from typing import Optional, Any

from backend.models.models import Settings
from backend.repository.settings_repository import SettingsRepository
from backend.schemas.settings_schema import SettingsModelPydantic, SettingsResponse
from backend.signals import user_register_signal
from backend.decorators import background_session


class SettingsService:
    def __init__(self, settings_repository: SettingsRepository):
        self._settings_repository = settings_repository
        user_register_signal.connect(self._handle_user_created_wrapper)

    async def _handle_user_created_wrapper(self, user_id: UUID):
        asyncio.create_task(self.handle_user_created(user_id))

    @background_session
    async def handle_user_created(self, user_id: UUID):
        await self.create_settings(user_id)

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

    @staticmethod
    def bitmask_to_days(bitmask: int) -> list[str]:
        day_map = {
            0: 'пн',
            1: 'вт',
            2: 'ср',
            3: 'чт',
            4: 'пт',
            5: 'сб',
            6: 'вс',
        }

        days_list = []
        for bit_position, day_name in day_map.items():
            if bitmask & (1 << bit_position):
                days_list.append(day_name)

        return days_list

    def settings_model_to_response(
            self,
            model: SettingsModelPydantic
    ) -> SettingsResponse:
        if model.working_days:
            working_days = self.bitmask_to_days(model.working_days)
        else:
            working_days = None

        return SettingsResponse(
            timezone=model.timezone,
            work_time_start=model.work_time_start,
            work_time_end=model.work_time_end,
            alert_offset_minutes=model.alert_offset_minutes,
            daily_reminder_time=model.daily_reminder_time,
            working_days=working_days
        )

    async def create_settings(
            self,
            user_id: UUID,
            timezone: Optional[int] = None,
            work_time_start: Optional[float] = None,
            work_time_end: Optional[float] = None,
            alert_offset_minutes: Optional[int] = None,
            daily_reminder_time: Optional[float] = None,
            working_days: Optional[list[str]] = None
    ) -> SettingsModelPydantic:
        if working_days is not None:
            working_days_bit_mask = self.days_to_bitmask(
                days_list=working_days
            )
        else:
            working_days_bit_mask = None

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

    async def update_settings(self, user_id: UUID, update_data: dict[str, Any]) -> SettingsModelPydantic:
        settings = await self.get_settings(user_id=user_id)
        updated_settings = await self._settings_repository.update(
            entity_id=settings.id,
            data=update_data
        )
        return SettingsModelPydantic.from_orm(updated_settings)

    async def get_settings(self, user_id: UUID) -> SettingsModelPydantic:
        settings = await self._settings_repository.find_by_user_id(user_id=user_id)
        return SettingsModelPydantic.from_orm(settings)
