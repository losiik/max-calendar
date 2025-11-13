from uuid import UUID
from datetime import datetime, timezone
from typing import Optional

from backend.models.models import DailyAlert
from backend.repository.daily_alert_repository import DailyAlertRepository
from backend.schemas.time_slot_alert_schema import TimeSlotAlertModelPydantic


class DailyAlertService:
    def __init__(
            self,
            daily_alert_repository: DailyAlertRepository
    ):
        self._daily_alert_repository = daily_alert_repository

    async def create_alert(self, user_id: UUID, time_slot_id: UUID) -> TimeSlotAlertModelPydantic:
        alert_data = await self._daily_alert_repository.save(
            entity=DailyAlert(
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
        alerts = await self._daily_alert_repository.find_by_user_id_and_time_slot_id(
            user_id=user_id,
            time_slot_id=time_slot_id
        )
        return alerts
