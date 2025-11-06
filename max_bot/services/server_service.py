import aiohttp

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
