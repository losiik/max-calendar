from uuid import UUID
from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel


class Notification(BaseModel):
    time_slot_id: UUID
    invite_user_name: str
    owner_user_max_id: int
    owner_time_zone: int
    meet_start_at: datetime
    meet_end_at: datetime
    title: str
    description: Optional[str] = None


class ConfirmTimeSlotNotification(BaseModel):
    meet_start_at: datetime
    meet_end_at: datetime
    title: str
    invite_user_max_id: int
    invite_use_name: str
    invite_timezone: int
    owner_user_max_id: int
    owner_user_user_name: str
    owner_timezone: int
    confirm: bool
    meeting_url: Optional[str] = None


class MeetAlertNotification(BaseModel):
    meet_start_at: datetime
    meet_end_at: datetime
    title: str
    invite_use_name: str
    user_max_id: int
    user_timezone: int
    meeting_url: Optional[str] = None
    alert_offset_minutes: int


class SelfBookingNotification(BaseModel):
    meet_start_at: datetime
    meet_end_at: datetime
    title: str
    user_max_id: int
    user_timezone: int


class DailyReminderNotification(BaseModel):
    slot_list: List[MeetAlertNotification]
