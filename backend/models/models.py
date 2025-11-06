from datetime import datetime
from types import MappingProxyType
from typing import Final, List

from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    Date,
    DateTime,
    BigInteger,
    Enum,
    Float,
    Boolean,
    Integer
)
from sqlalchemy.dialects.postgresql import JSONB, UUID, ARRAY
from sqlalchemy.orm import Mapped, relationship

from backend.database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(UUID, primary_key=True)
    max_id = Column(BigInteger, unique=True, nullable=False)
    name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.now())


class Settings(Base):
    __tablename__ = "settings"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey('user.id', ondelete='CASCADE'))
    created_at = Column(DateTime, nullable=True, default=datetime.now())
    updated_at = Column(DateTime, nullable=True, default=datetime.now())
    timezone = Column(Integer, nullable=False, default=0)
    work_time_start = Column(Float, nullable=False)
    work_time_end = Column(Float, nullable=False)
    alert_offset_minutes = Column(Integer, nullable=False)
    daily_reminder_time = Column(Float, nullable=False)
    working_days = Column(Integer, nullable=False)
