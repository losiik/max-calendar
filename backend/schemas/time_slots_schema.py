from uuid import UUID
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TimeSlots(BaseModel):
    meet_start_at: datetime = Field(..., example="2025-11-08T10:30:00")
    meet_end_at: datetime = Field(..., example="2025-11-08T10:30:00")
    title: Optional[str] = None
    description: Optional[str] = None


class TimeSlotsCreateRequest(TimeSlots):
    owner_token: str
    invited_max_id: int


class TimeSlotsCreateResponse(BaseModel):
    id: UUID


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

