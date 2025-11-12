from uuid import UUID
from typing import Optional

from sqlalchemy.future import select

from backend.database import db
from backend.models.models import TimeSlotAlert
from backend.repository.crud_repository import CrudRepository
from backend.schemas.time_slot_alert_schema import TimeSlotAlertModelPydantic


class TimeSlotAlertRepository(CrudRepository[TimeSlotAlert, UUID]):
    async def find_by_user_id_and_time_slot_id(
            self,
            user_id: UUID,
            time_slot_id: UUID
    ) -> Optional[TimeSlotAlertModelPydantic]:
        stmt = select(TimeSlotAlert).where(
            TimeSlotAlert.user_id == user_id,
            TimeSlotAlert.time_slot_id == time_slot_id
        )
        result = await db.session.execute(stmt)
        alert_data = result.scalar_one_or_none()

        if alert_data:
            return TimeSlotAlertModelPydantic.from_orm(alert_data)
        return None
