from backend.repository.user_repository import UserRepository
from backend.repository.settings_repository import SettingsRepository

from backend.services.user_service import UserService
from backend.services.settings_service import SettingsService

#######################
#      Repository     #
#######################

_user_repository = UserRepository()


def get_user_repository() -> UserRepository:
    return _user_repository


_settings_repository = SettingsRepository()


def get_settings_repository() -> SettingsRepository:
    return _settings_repository


#######################
#       Services      #
#######################

_user_service = UserService(
    user_repository=get_user_repository()
)


def get_user_service() -> UserService:
    return _user_service


_settings_service = SettingsService(
    settings_repository=get_settings_repository()
)


def get_settings_service() -> SettingsService:
    return _settings_service
