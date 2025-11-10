from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    DateTime,
    BigInteger,
    Float,
    Boolean,
    Integer
)
from sqlalchemy.dialects.postgresql import UUID

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
    timezone = Column(Integer, nullable=True, default=0)
    work_time_start = Column(Float, nullable=True)
    work_time_end = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    alert_offset_minutes = Column(Integer, nullable=True)
    daily_reminder_time = Column(Float, nullable=True)
    working_days = Column(Integer, nullable=True)


class TimeSlots(Base):
    __tablename__ = "time_slots"

    id = Column(UUID, primary_key=True)
    owner_id = Column(UUID, ForeignKey('user.id', ondelete='CASCADE'))
    invited_id = Column(UUID, ForeignKey('user.id', ondelete='CASCADE'))
    meet_start_at = Column(DateTime, nullable=True, default=datetime.now())
    meet_end_at = Column(DateTime, nullable=True, default=datetime.now())
    confirm = Column(Boolean, nullable=False, default=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    meeting_url = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.now())


class Share(Base):
    __tablename__ = "share"

    id = Column(UUID, primary_key=True)
    owner_id = Column(UUID, ForeignKey('user.id', ondelete='CASCADE'))
    share_token = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, nullable=False)
