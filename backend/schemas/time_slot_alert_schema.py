from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TimeSlotAlertModelPydantic(BaseModel):
    id: UUID
    user_id: UUID
    time_slot_id: UUID
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)
