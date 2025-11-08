from uuid import UUID
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserCreateRequest(BaseModel):
    max_id: int
    name: Optional[str] = None
    username: Optional[str] = None


class UserCreateResponse(BaseModel):
    id: UUID


class UserModelPydantic(BaseModel):
    id: UUID
    max_id: int
    name: Optional[str] = None
    username: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: UUID
    max_id: int
    name: Optional[str] = None
    username: Optional[str] = None
