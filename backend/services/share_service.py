import secrets
import string
from uuid import UUID
from typing import Optional

from backend.models.models import Share
from backend.repository.share_repository import ShareRepository
from backend.schemas.share_schema import ShareModelPydantic


class ShareService:
    def __init__(self, share_repository: ShareRepository):
        self._share_repository = share_repository

    @staticmethod
    def create_token():
        return ''.join(
            secrets.choice(
                string.ascii_letters + string.digits
            )
            for _ in range(32)
        )

    async def get_share_token(self, user_id: UUID) -> str:
        share = await self._share_repository.find_by_user_id(user_id=user_id)

        if share:
            return share.share_token

        share = await self.create_share(user_id=user_id)
        return share.share_token

    async def create_share(self, user_id: UUID) -> ShareModelPydantic:
        token = self.create_token()

        share = await self._share_repository.save(
            entity=Share(
                owner_id=user_id,
                share_token=token
            )
        )
        return ShareModelPydantic.from_orm(share)

    async def get_share_data_by_token(self, token: str) -> Optional[ShareModelPydantic]:
        share_data = await self._share_repository.find_by_token(token=token)
        return share_data
