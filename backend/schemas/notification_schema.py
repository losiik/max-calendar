from uuid import UUID
from typing import Optional
from datetime import datetime

from pydantic import BaseModel


class Notification(BaseModel):
    time_slot_id: UUID
    invite_user_name: str
    owner_user_max_id: int
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
    owner_user_max_id: int
    owner_user_user_name: str
    confirm: bool
    meeting_url: Optional[str] = None
