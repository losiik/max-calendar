from uuid import UUID
from typing import Optional

from sqlalchemy.future import select

from backend.database import db
from backend.models.models import Share
from backend.repository.crud_repository import CrudRepository
from backend.schemas.share_schema import ShareModelPydantic


class ShareRepository(CrudRepository[Share, UUID]):
    async def find_by_user_id(self, user_id: UUID) -> Optional[ShareModelPydantic]:
        stmt = select(Share).where(Share.owner_id == user_id)
        result = await db.session.execute(stmt)
        share_data = result.scalar_one_or_none()

        if share_data:
            return ShareModelPydantic.from_orm(share_data)
        return None
