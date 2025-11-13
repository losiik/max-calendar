import base64
import datetime
import json
import uuid
from uuid import UUID

import jwt
from jwt import PyJWK
import aiohttp

from backend.settings.settings import Settings


class SberJazzClient:
    BASE_URL = "https://api.salutejazz.ru/v1"

    def __init__(self, settings: Settings):
        sdk_key_encoded = settings.sber_api_key
        sdk_key = json.loads(base64.b64decode(sdk_key_encoded))

        self.project_id = sdk_key['projectId']
        self.jwk = PyJWK.from_dict(sdk_key['key'], algorithm="ES384")
        self.kid = sdk_key['key']['kid']
        self.timeout = aiohttp.ClientTimeout(total=30)

    def _generate_jwt(self, user_id: UUID) -> str:
        iat = datetime.datetime.now(datetime.UTC)
        exp = iat + datetime.timedelta(hours=1)
        jti = str(uuid.uuid4())

        payload = {
            "iat": iat,
            "exp": exp,
            "jti": jti,
            "sdkProjectId": self.project_id,
            "sub": str(user_id),
        }

        headers = {
            "typ": "JWT",
            "alg": "ES384",
            "kid": self.kid,
        }

        token = jwt.encode(
            headers=headers,
            payload=payload,
            key=self.jwk.key,
            algorithm="ES384",
        )
        return token

    async def _get_transport_token(self, user_id: UUID) -> str:
        jws = self._generate_jwt(user_id)

        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {jws}"
        }

        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.post(f"{self.BASE_URL}/auth/login", headers=headers) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise RuntimeError(f"Ошибка при получении токена: {resp.status} {text}")
                data = await resp.json()
                return data["token"]

    async def create_meeting(
            self,
            user_id: UUID,
            title: str,
            description: str = None,
            summary: bool = False
    ) -> str:
        token = await self._get_transport_token(user_id)

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }

        body = {
            "roomTitle": title,
            "serverVideoRecordAutoStartEnabled": False,
            "roomType": "MEETING",
            "webinar": {
                "reusable": False,
                "scheduledAt": datetime.datetime.now(datetime.UTC).isoformat(),
                "description": description or ""
            },
            "transcriptionAutoStartEnabled": False,
            "summarizationEnabled": summary
        }

        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.post(f"{self.BASE_URL}/room/create", headers=headers, json=body) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise RuntimeError(f"Ошибка при создании комнаты: {resp.status} {text}")
                data = await resp.json()
                return data.get("roomUrl", "")

    async def get_meeting_summary(self, user_id: UUID, room_id: str) -> dict:
        token = await self._get_transport_token(user_id)
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }

        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get(f"{self.BASE_URL}/room/{room_id}/summarizations", headers=headers) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise RuntimeError(f"Ошибка при получении саммари: {resp.status} {text}")
                return await resp.json()
