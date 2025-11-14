from typing import Optional
from uuid import UUID

from backend.repository.user_repository import UserRepository
from backend.models.models import User
from backend.schemas.user_schema import UserModelPydantic
from backend.exceptions import UserAlreadyExistsError
from backend.signals import user_register_signal


class UserService:
    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository

    async def find_by_max_id(self, max_id: int) -> Optional[UserModelPydantic]:
        return await self._user_repository.find_by_max_id(max_id)

    async def get_by_user_id(self, user_id: UUID) -> Optional[UserModelPydantic]:
        user = await self._user_repository.find_by_id(entity_id=user_id)
        return UserModelPydantic.from_orm(user)

    async def create(
            self,
            max_id: int,
            name: Optional[str] = None,
            username: Optional[str] = None
    ) -> UserModelPydantic:
        user = await self.find_by_max_id(max_id=max_id)
        if user is not None:
            return user

        user = await self._user_repository.save(
            entity=User(
                max_id=max_id,
                name=name,
                username=username
            )
        )

        await user_register_signal.send_async(user.id)
        return UserModelPydantic.from_orm(user)
