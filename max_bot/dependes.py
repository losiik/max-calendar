from max_bot.services.server_service import ServerService
from max_bot.services.user_service import UserService
from max_bot.settings.settings import settings


_server_service = ServerService(settings=settings)


def get_server_service() -> ServerService:
    return _server_service


_user_service = UserService(
    server_service=get_server_service()
)


def get_user_service() -> UserService:
    return _user_service
