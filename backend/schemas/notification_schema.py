from typing import Optional
from datetime import datetime

from pydantic import BaseModel


class Notification(BaseModel):
    invite_user_name: str
    owner_user_max_id: int
    meet_start_at: datetime
    meet_end_at: datetime
    title: str
    description: Optional[str] = None
