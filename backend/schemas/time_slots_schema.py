from uuid import UUID
from typing import Optional, List
from datetime import datetime, date

from pydantic import BaseModel, ConfigDict, Field


class TimeSlots(BaseModel):
    meet_start_at: datetime = Field(..., example="2025-11-08T10:30:00")
    meet_end_at: datetime = Field(..., example="2025-11-08T10:30:00")
    title: Optional[str] = None
    description: Optional[str] = None


class TimeSlotsCreateRequest(TimeSlots):
    owner_token: str
    invited_max_id: int


class TimeSlotsSelfCreateRequest(TimeSlots):
    max_id: int


class TimeSlotsCreateResponse(BaseModel):
    id: UUID


class SelfTimeSlotsGetRequests(BaseModel):
    max_id: int
    date: date


class GetSelfTimeSlot(BaseModel):
    meet_start_at: float
    meet_end_at: float
    title: Optional[str] = None
    description: Optional[str] = None
    slot_id: Optional[UUID] = None
    meeting_url: Optional[str] = None


class GetExternalTimeSlot(BaseModel):
    meet_start_at: float
    meet_end_at: float


class SelfTimeSlotsGetResponse(BaseModel):
    time_slots: List[GetSelfTimeSlot]


class ExternalTimeSlotsGetResponse(BaseModel):
    time_slots: List[GetExternalTimeSlot]


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


class UpdateTimeSlots(BaseModel):
    time_slot_id: UUID
    confirm: Optional[bool] = None
    title: Optional[str] = None
    description: Optional[str] = None
    meeting_url: Optional[str] = None


class UpdateTimeSlotsRequest(UpdateTimeSlots):
    pass


class TimeSlotSelfCreateByTextRequest(TimeSlots):
    max_id: int
    message: str
