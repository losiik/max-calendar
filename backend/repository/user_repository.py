from uuid import UUID
from typing import Optional

from sqlalchemy.future import select

from backend.database import db
from backend.models.models import User
from backend.repository.crud_repository import CrudRepository
from backend.schemas.user_schema import UserModelPydantic


class UserRepository(CrudRepository[User, UUID]):
    async def find_by_max_id(self, max_id: int) -> Optional[UserModelPydantic]:
        stmt = select(User).where(User.max_id == max_id)
        result = await db.session.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            return UserModelPydantic.from_orm(user)
        return None

