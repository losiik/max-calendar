from uuid import UUID
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TimeSlots(BaseModel):
    meet_start_at: datetime
    meet_end_at: datetime
    title: Optional[str] = None
    description: Optional[str] = None


class TimeSlotsCreateRequest(TimeSlots):
    owner_id: UUID
    invited_id: UUID


class TimeSlotsModelPydantic(BaseModel):
    id: UUID
    owner_id: UUID
    invited_id: UUID
    meet_start_at: datetime
    meet_end_at: datetime
    confirm: bool
    title: Optional[str] = None
    description: Optional[str] = None
    meeting_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

