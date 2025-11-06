from backend.repository.user_repository import UserRepository
from backend.repository.settings_repository import SettingsRepository
from backend.repository.time_slots_repository import TimeSlotsRepository

from backend.services.user_service import UserService
from backend.services.settings_service import SettingsService
from backend.services.time_slots_service import TimeSlotsService

from backend.facade.settings_facade import SettingsFacade

#######################
#      Repository     #
#######################

_user_repository = UserRepository()


def get_user_repository() -> UserRepository:
    return _user_repository


_settings_repository = SettingsRepository()


def get_settings_repository() -> SettingsRepository:
    return _settings_repository


_time_slots_repository = TimeSlotsRepository()


def get_time_slots_repository() -> TimeSlotsRepository:
    return _time_slots_repository


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


_time_slots_service = TimeSlotsService(
    time_slots_repository=get_time_slots_repository()
)


def get_time_slots_service() -> TimeSlotsService:
    return _time_slots_service

#######################
#       Facade        #
#######################


_settings_facade = SettingsFacade(
    settings_service=get_settings_service(),
    user_service=get_user_service()
)


def get_settings_facade() -> SettingsFacade:
    return _settings_facade
