from uuid import UUID
from datetime import datetime
from typing import Optional

from backend.repository.time_slots_repository import TimeSlotsRepository
from backend.schemas.time_slots_schema import TimeSlotsModelPydantic


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
        pass

    async def update_time_slot(self):
        pass

    async def get_time_slots(self):
        pass
