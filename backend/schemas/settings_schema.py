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
    working_days: list[str]  # [пн, вт, ср, чт, пт, сб, вс]


class SettingsModelPydantic(BaseModel):
    id: UUID
    user_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    timezone: Optional[int] = None
    work_time_start: Optional[float] = None
    work_time_end: Optional[float] = None
    alert_offset_minutes: Optional[int] = None
    daily_reminder_time: Optional[float] = None
    working_days: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class BaseSettings(BaseModel):
    timezone: Optional[int] = None
    work_time_start: Optional[float] = None
    work_time_end: Optional[float] = None
    alert_offset_minutes: Optional[int] = None
    daily_reminder_time: Optional[float] = None
    working_days: Optional[list[str]] = None  # [пн, вт, ср, чт, пт, сб, вс]


class SettingsResponse(BaseSettings):
    pass


class SettingsUpdateRequest(BaseSettings):
    pass
