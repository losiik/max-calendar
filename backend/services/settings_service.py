from backend.repository.settings_repository import SettingsRepository


class SettingsService:
    def __init__(self, settings_repository: SettingsRepository):
        self._settings_repository = settings_repository

    async def create_settings(self):
        pass

    async def update_settings(self):
        pass
