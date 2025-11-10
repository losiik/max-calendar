from uuid import UUID
from datetime import datetime, date
from typing import List

from sqlalchemy import func
from sqlalchemy.future import select

from backend.database import db
from backend.models.models import TimeSlots
from backend.repository.crud_repository import CrudRepository
from backend.schemas.time_slots_schema import TimeSlotsModelPydantic


class TimeSlotsRepository(CrudRepository[TimeSlots, UUID]):
    async def find_by_user_id_an_date(
            self,
            user_id: UUID,
            target_date: date
    ) -> List[TimeSlotsModelPydantic]:
        slot_list = []

        stmt = select(TimeSlots).where(
            TimeSlots.owner_id == user_id,
            TimeSlots.confirm == True,
            func.date(TimeSlots.meet_start_at) == target_date
        )
        result = await db.session.execute(stmt)
        time_slots = result.scalars().all()

        for time_slot in time_slots:
            slot_list.append(
                TimeSlotsModelPydantic.from_orm(time_slot)
            )

        return slot_list

    async def find_upcoming(
            self,
            current_time: datetime
    ) -> List[TimeSlotsModelPydantic]:
        slot_list = []

        stmt = (
            select(TimeSlots)
            .where(
                TimeSlots.confirm == True,
                TimeSlots.meet_end_at > current_time
            )
            .order_by(TimeSlots.meet_start_at.asc())
        )

        result = await db.session.execute(stmt)
        time_slots = result.scalars().all()

        for time_slot in time_slots:
            slot_list.append(TimeSlotsModelPydantic.from_orm(time_slot))

        return slot_list
