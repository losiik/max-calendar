from uuid import UUID
from datetime import datetime, timezone
from typing import Optional

from backend.models.models import TimeSlotAlert
from backend.repository.time_slot_alert_repository import TimeSlotAlertRepository
from backend.schemas.time_slot_alert_schema import TimeSlotAlertModelPydantic


class TimeSlotAlertService:
    def __init__(
            self,
            time_slot_alert_repository: TimeSlotAlertRepository
    ):
        self._time_slot_alert_repository = time_slot_alert_repository

    async def create_alert(self, user_id: UUID, time_slot_id: UUID) -> TimeSlotAlertModelPydantic:
        alert_data = await self._time_slot_alert_repository.save(
            entity=TimeSlotAlert(
                user_id=user_id,
                time_slot_id=time_slot_id,
                sent_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
        )

        return TimeSlotAlertModelPydantic.from_orm(alert_data)

    async def get_by_user_id_and_time_slot_id(
            self,
            user_id: UUID,
            time_slot_id: UUID
    ) -> Optional[TimeSlotAlertModelPydantic]:
        alerts = await self._time_slot_alert_repository.find_by_user_id_and_time_slot_id(
            user_id=user_id,
            time_slot_id=time_slot_id
        )
        return alerts
