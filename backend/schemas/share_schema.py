from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ShareModelPydantic(BaseModel):
    id: UUID
    owner_id: UUID
    share_token: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
