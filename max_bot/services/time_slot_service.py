from uuid import UUID
import logging
from typing import Any, Optional
from datetime import date

from max_bot.services.server_service import ServerService


class TimeSlotService:
    def __init__(self, server_service: ServerService):
        self._server_service = server_service

    async def update_time_slot(
            self,
            time_slot_id: UUID,
            confirm: bool
    ) -> Optional[dict[str, Any]]:
        new_user = await self._server_service.update_time_slot(
            time_slot_id=time_slot_id,
            confirm=confirm
        )

        if new_user[1] != 200:
            logging.error(f"User does not registered. Status code: {new_user[1]}")
            return None
        return new_user[0]

    def __construct_daly_timetable_message(
            self,
            data: dict[str, Any]
    ) -> str:
        message = ""
        for slot in data['time_slots']:
            meet_start_at = str(slot['meet_start_at']).replace('.', ':')
            meet_end_at = str(slot['meet_end_at']).replace('.', ':')

            message += f"""Название: {slot['title']}
Дата: c {meet_start_at} по {meet_end_at}
"""
            if slot.get('description', None):
                message += f"Описание: {slot['description']}"
            if slot.get('meeting_url', None):
                message += f"Ссылка на встречу: {slot['meeting_url']}"

            message += "\n\n"

        if message != "":
            message = "📆 Сегодняшние встречи:\n\n" + message
        return message

    async def get_daly_timetable(
            self,
            max_id: int,
            target_date: date
    ) -> str:
        response = await self._server_service.get_daly_timetable(
            max_id=max_id,
            target_date=target_date
        )
        if response[1] != 200:
            logging.error(response[1])
            return "Что-то пошло не так"

        message = self.__construct_daly_timetable_message(data=response[0])

        if message == "":
            return "На сегодня нет запланированных событий"
        return message

    async def book_time_slot_by_text(self, max_id: int, message: str) -> Optional[str]:
        response = await self._server_service.book_time_slot_by_text(
            max_id=max_id,
            message=message
        )

        if response[1] != 200:
            logging.error(response[1])
            return "Извините, не смог распознать текст"
        return None
