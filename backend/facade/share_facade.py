from backend.services.share_service import ShareService
from backend.services.user_service import UserService


class ShareFacade:
    def __init__(self, share_service: ShareService, user_service: UserService):
        self._share_service = share_service
        self._user_service = user_service

    async def get_share_token(self, max_id: int) -> str:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        token = await self._share_service.get_share_token(user_id=user.id)
        return token
