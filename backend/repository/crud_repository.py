import uuid
from datetime import datetime
from typing import Optional, List, TypeVar, Generic, Any
from uuid import UUID

from sqlalchemy.future import select
from sqlalchemy import delete, update

import typing_inspect
from backend.database import db


_T = TypeVar("_T", bound=Any)
_ID = TypeVar('_ID', UUID, int, str)


class CrudRepository(Generic[_T, _ID]):
    def __init__(self):
        self.entity_class = typing_inspect.get_generic_bases(self)[0].__args__[0]
        self.id_type = typing_inspect.get_generic_bases(self)[0].__args__[1]

    async def _add(self, entity: _T) -> _T:
        if self.id_type == UUID:
            entity.id = uuid.uuid4()
        if hasattr(entity, 'created_at') and entity.created_at is None:
            entity.created_at = datetime.now()
        if hasattr(entity, 'updated_at') and entity.updated_at is None:
            entity.updated_at = datetime.now()
        db.session.add(entity)
        await db.session.flush([entity])
        await db.session.commit()
        return entity

    async def _update(self, entity: _T) -> _T:
        await db.session.flush([entity])
        return entity

    async def save(self, entity: _T) -> _T:
        if entity.id is None:
            return await self._add(entity)
        else:
            return await self._update(entity)

    async def update(self, entity_id: _ID, data: dict) -> Optional[_T]:
        stmt_select = select(self.entity_class).where(self.entity_class.id == entity_id)
        result_select = await db.session.execute(stmt_select)
        entity = result_select.scalar_one_or_none()

        if entity is None:
            return None

        update_data = {k: v for k, v in data.items() if k not in ["id", "created_at"]}
        stmt_update = update(self.entity_class).where(self.entity_class.id == entity_id).values(
            **update_data)
        await db.session.execute(stmt_update)
        await db.session.commit()

        return entity

    async def find_by_id(self, entity_id: _ID, options = None) -> Optional[_T]:
        stmt = select(self.entity_class).where(self.entity_class.id == entity_id)
        if options is not None:
            stmt = stmt.options(options)
        result = await db.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_all(self) -> List[_T]:
        stmt = select(self.entity_class)
        result = await db.session.execute(stmt)
        return result.scalars().all()

    async def delete_by_id(self, entity_id: _ID) -> int:
        stmt_select = select(self.entity_class).where(self.entity_class.id == entity_id)
        result_select = await db.session.execute(stmt_select)
        entity = result_select.scalar_one_or_none()

        if entity is None:
            return 0

        stmt_delete = delete(self.entity_class).where(self.entity_class.id == entity_id)
        await db.session.execute(stmt_delete)
        await db.session.commit()
        return 1

    async def delete(self, entity: _T) -> None:
        await db.session.delete(entity)
