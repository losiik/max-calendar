from backend.exceptions import UserDoesNotExistsError

from backend.services.user_service import UserService
from backend.services.settings_service import SettingsService
from backend.schemas.settings_schema import SettingsCreateRequest, SettingsModelPydantic


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
    ) -> SettingsModelPydantic:
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
        return settings_pydantic_model
