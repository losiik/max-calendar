import logging

from max_bot.services.server_service import ServerService
from max_bot.settings.settings import Settings


class ShareService:
    def __init__(
            self,
            server_service: ServerService,
            settings: Settings
    ):
        self._server_service = server_service
        self._settings = settings

    async def get_share_token(self, max_id: int) -> str:
        share_data = await self._server_service.share_token(max_id=max_id)

        if share_data[1] != 200:
            logging.error(f"Something went wrong in generate share token")
            raise Exception("Token does not exists")

        return share_data[0]['token']

    async def get_share_link(self, max_id: int) -> str:
        token = await self.get_share_token(max_id=max_id)
        link = f"{self._settings.bot_url}?startapp={token}"
        return link
