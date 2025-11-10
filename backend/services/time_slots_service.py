from uuid import UUID
from datetime import datetime, date
from typing import Optional, List, Any

from backend.repository.time_slots_repository import TimeSlotsRepository
from backend.schemas.time_slots_schema import TimeSlotsModelPydantic
from backend.models.models import TimeSlots


class TimeSlotsService:
    def __init__(self, time_slots_repository: TimeSlotsRepository):
        self._time_slots_repository = time_slots_repository

    async def create_time_slot(
            self,
            owner_id: UUID,
            invited_id: UUID,
            meet_start_at: datetime,
            meet_end_at: datetime,
            confirm: bool,
            title: Optional[str] = None,
            description: Optional[str] = None,
            meeting_url: Optional[str] = None
    ) -> TimeSlotsModelPydantic:
        time_slot = await self._time_slots_repository.save(
            entity=TimeSlots(
                owner_id=owner_id,
                invited_id=invited_id,
                meet_start_at=meet_start_at,
                meet_end_at=meet_end_at,
                confirm=confirm,
                title=title,
                description=description,
                meeting_url=meeting_url
            )
        )
        return TimeSlotsModelPydantic.from_orm(time_slot)

    async def update_time_slot(
            self,
            time_slot_id: UUID,
            update_data: dict[str, Any]
    ) -> TimeSlotsModelPydantic:
        updated_time_slot = await self._time_slots_repository.update(
            entity_id=time_slot_id,
            data=update_data
        )

        return TimeSlotsModelPydantic.from_orm(updated_time_slot)

    async def get_time_self_slots(
            self,
            user_id: UUID,
            target_date: date
    ) -> List[TimeSlotsModelPydantic]:
        time_slots_where_owner = await self._time_slots_repository.find_by_user_id_an_date(
            user_id=user_id, target_date=target_date
        )
        time_slots_where_invited = await self._time_slots_repository.find_user_invited_byuser_id_an_date(
            user_id=user_id, target_date=target_date
        )
        return time_slots_where_owner + time_slots_where_invited

    async def get_time_slot(self, time_slot_id: UUID) -> Optional[TimeSlotsModelPydantic]:
        time_slot = await self._time_slots_repository.find_by_id(
            entity_id=time_slot_id
        )

        if time_slot:
            return TimeSlotsModelPydantic.from_orm(time_slot)
        return None

    async def get_upcoming(self) -> List[TimeSlotsModelPydantic]:
        time_slots = await self._time_slots_repository.find_upcoming(
            current_time=datetime.now()
        )
        return time_slots
