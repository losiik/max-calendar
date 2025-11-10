from backend.settings.settings import settings

from backend.repository.user_repository import UserRepository
from backend.repository.settings_repository import SettingsRepository
from backend.repository.time_slots_repository import TimeSlotsRepository
from backend.repository.share_repository import ShareRepository

from backend.services.user_service import UserService
from backend.services.settings_service import SettingsService
from backend.services.time_slots_service import TimeSlotsService
from backend.services.share_service import ShareService
from backend.services.notification_service import NotificationService

from backend.facade.settings_facade import SettingsFacade
from backend.facade.share_facade import ShareFacade
from backend.facade.time_slots_facade import TimeSlotsFacade

from backend.client.sber_jazz_client import SberJazzClient

#######################
#       Client        #
#######################


_sber_jazz_client = SberJazzClient(
    settings=settings
)


def get_sber_jazz_client() -> SberJazzClient:
    return _sber_jazz_client


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


_share_repository = ShareRepository()


def get_share_repository() -> ShareRepository:
    return _share_repository


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


_share_service = ShareService(
    share_repository=get_share_repository()
)


def get_share_service() -> ShareService:
    return _share_service


_notification_service = NotificationService(
    settings=settings
)


def get_notification_service() -> NotificationService:
    return _notification_service


#######################
#       Facade        #
#######################


_settings_facade = SettingsFacade(
    settings_service=get_settings_service(),
    user_service=get_user_service()
)


def get_settings_facade() -> SettingsFacade:
    return _settings_facade


_share_facade = ShareFacade(
    share_service=get_share_service(),
    user_service=get_user_service()
)


def get_share_facade() -> ShareFacade:
    return _share_facade


_time_slots_facade = TimeSlotsFacade(
    time_slots_service=get_time_slots_service(),
    user_service=get_user_service(),
    share_service=get_share_service(),
    settings_service=get_settings_service(),
    sber_jazz_client=get_sber_jazz_client()
)


def get_time_slots_facade() -> TimeSlotsFacade:
    return _time_slots_facade
