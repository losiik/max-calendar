from typing import Optional

from backend.exceptions import UserDoesNotExistsError
from backend.services.user_service import UserService
from backend.services.settings_service import SettingsService
from backend.schemas.settings_schema import (
    SettingsCreateRequest,
    SettingsResponse
)


class SettingsFacade:
    def __init__(
            self,
            user_service: UserService,
            settings_service: SettingsService
    ):
        self._user_service = user_service
        self._settings_service = settings_service

    async def create_user_settings(
            self,
            max_id: int,
            settings: SettingsCreateRequest
    ) -> SettingsResponse:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        if user is None:
            raise UserDoesNotExistsError

        settings_pydantic_model = await self._settings_service.create_settings(
            user_id=user.id,
            timezone=settings.timezone,
            work_time_start=settings.work_time_start,
            work_time_end=settings.work_time_end,
            alert_offset_minutes=settings.alert_offset_minutes,
            daily_reminder_time=settings.daily_reminder_time,
            working_days=settings.working_days
        )
        return self._settings_service.settings_model_to_response(model=settings_pydantic_model)

    async def get_settings(self, max_id: int) -> SettingsResponse:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        if user is None:
            raise UserDoesNotExistsError

        settings = await self._settings_service.get_settings(user_id=user.id)
        return self._settings_service.settings_model_to_response(model=settings)

    async def update_settings(
            self,
            max_id: int,
            timezone: Optional[int] = None,
            work_time_start: Optional[float] = None,
            work_time_end: Optional[float] = None,
            alert_offset_minutes: Optional[int] = None,
            daily_reminder_time: Optional[float] = None,
            working_days: list[str] = None
    ) -> SettingsResponse:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        if user is None:
            raise UserDoesNotExistsError

        update_data_dict = {}

        if timezone:
            update_data_dict["timezone"] = timezone
        if work_time_start:
            update_data_dict["work_time_start"] = work_time_start
        if work_time_end:
            update_data_dict["work_time_end"] = work_time_end
        if alert_offset_minutes:
            update_data_dict["alert_offset_minutes"] = alert_offset_minutes
        if daily_reminder_time:
            update_data_dict["daily_reminder_time"] = daily_reminder_time
        if working_days:
            working_days = self._settings_service.days_to_bitmask(
                days_list=working_days
            )
            update_data_dict["working_days"] = working_days

        updated_settings = await self._settings_service.update_settings(
            user_id=user.id,
            update_data=update_data_dict
        )

        return self._settings_service.settings_model_to_response(model=updated_settings)
