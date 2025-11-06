from uuid import UUID
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SettingsCreateRequest(BaseModel):
    timezone: int
    work_time_start: float
    work_time_end: float
    alert_offset_minutes: Optional[int] = None
    daily_reminder_time: Optional[float] = None
    working_days: list[str] # [пн, вт, ср, чт, пт, сб, вс]


class SettingsModelPydantic(BaseModel):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    timezone: int
    work_time_start: float
    work_time_end: float
    alert_offset_minutes: Optional[int] = None
    daily_reminder_time: Optional[float] = None
    working_days: int

    model_config = ConfigDict(from_attributes=True)

