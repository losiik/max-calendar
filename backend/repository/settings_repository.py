from uuid import UUID
from typing import Optional

from sqlalchemy.future import select

from backend.database import db
from backend.models.models import Settings
from backend.repository.crud_repository import CrudRepository


class SettingsRepository(CrudRepository[Settings, UUID]):
    pass
