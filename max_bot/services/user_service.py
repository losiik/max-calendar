import logging

from max_bot.services.server_service import ServerService


class UserService:
    def __init__(self, server_service: ServerService):
        self._server_service = server_service

    async def create_user(self, max_id: int, username: str, name: str):
        new_user = await self._server_service.create_user(
            max_id=max_id,
            username=username,
            name=name
        )

        if new_user[1] != 200:
            logging.error(f"User does not registered. Status code: {new_user[1]}")
