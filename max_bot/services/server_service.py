from uuid import UUID
import aiohttp
from datetime import date
import logging

from max_bot.settings.settings import Settings


class ServerService:
    def __init__(self, settings: Settings):
        self.timeout = aiohttp.ClientTimeout(total=90)
        self.base_url_api = settings.backend_url

    async def create_user(self, max_id: int, username: str, name: str) -> tuple[dict, int]:
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            data = {
                "max_id": max_id,
                "username": username,
                "name": name
            }
            url = f"{self.base_url_api}api/v1/users/"
            async with session.put(url, json=data) as r:
                return await r.json(), r.status

    async def share_token(self, max_id: int) -> tuple[dict, int]:
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            url = f"{self.base_url_api}api/v1/share/{max_id}"
            async with session.get(url) as r:
                return await r.json(), r.status

    async def update_time_slot(self, time_slot_id: UUID, confirm: bool) -> tuple[dict, int]:
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            data = {
                "time_slot_id": str(time_slot_id),
                "confirm": confirm
            }
            url = f"{self.base_url_api}api/v1/time_slots/"
            async with session.patch(url, json=data) as r:
                return await r.json(), r.status

    async def get_daly_timetable(self, max_id: int, target_date: date) -> tuple[dict, int]:
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            url = f"{self.base_url_api}api/v1/time_slots/self/{max_id}/{target_date}"
            logging.info(url)
            async with session.get(url) as r:
                return await r.json(), r.status
