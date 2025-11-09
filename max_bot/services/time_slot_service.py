from uuid import UUID
import logging

from max_bot.services.server_service import ServerService


class TimeSlotService:
    def __init__(self, server_service: ServerService):
        self._server_service = server_service

    async def update_time_slot(self, time_slot_id: UUID, confirm: bool):
        new_user = await self._server_service.update_time_slot(
            time_slot_id=time_slot_id,
            confirm=confirm
        )

        if new_user[1] != 200:
            logging.error(f"User does not registered. Status code: {new_user[1]}")
