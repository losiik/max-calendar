from backend.services.share_service import ShareService
from backend.services.user_service import UserService
from backend.exceptions import UserDoesNotExistsError
from backend.schemas.user_schema import UserModelPydantic


class ShareFacade:
    def __init__(self, share_service: ShareService, user_service: UserService):
        self._share_service = share_service
        self._user_service = user_service

    async def get_share_token(self, max_id: int) -> str:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        if user is None:
            raise UserDoesNotExistsError

        token = await self._share_service.get_share_token(user_id=user.id)
        return token

    async def get_user_by_token(self, token: str) -> UserModelPydantic:
        share_data = await self._share_service.get_share_data_by_token(token=token)
        user = await self._user_service.get_by_user_id(user_id=share_data.owner_id)
        return user
