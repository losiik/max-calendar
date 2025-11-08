from typing import Optional
from datetime import datetime
from uuid import UUID

from backend.services.user_service import UserService
from backend.services.time_slots_service import TimeSlotsService
from backend.services.share_service import ShareService
from backend.exceptions import UserDoesNotExistsError, ShareTokenDoesNotExistsError
from backend.schemas.notification_schema import Notification
from backend.signals import new_slot_signal


class TimeSlotsFacade:
    def __init__(
            self,
            user_service: UserService,
            time_slots_service: TimeSlotsService,
            share_service: ShareService
    ):
        self._user_service = user_service
        self._time_slots_service = time_slots_service
        self._share_service = share_service

    async def create_time_slot(
            self,
            owner_token: str,
            invited_max_id: int,
            meet_start_at: datetime,
            meet_end_at: datetime,
            title: Optional[str] = None,
            description: Optional[str] = None
    ) -> UUID:
        invited_user = await self._user_service.find_by_max_id(max_id=invited_max_id)
        if invited_user is None:
            raise UserDoesNotExistsError

        share_data = await self._share_service.get_share_data_by_token(token=owner_token)

        if share_data is None:
            raise ShareTokenDoesNotExistsError

        owner_user = await self._user_service.get_by_user_id(user_id=share_data.owner_id)

        time_slot = await self._time_slots_service.create_time_slot(
            owner_id=owner_user.id,
            invited_id=invited_user.id,
            meet_start_at=meet_start_at,
            meet_end_at=meet_end_at,
            confirm=False,
            title=title,
            description=description
        )

        await new_slot_signal.send_async(
            Notification(
                invite_user_name=invited_user.name,
                owner_user_max_id=owner_user.max_id,
                meet_start_at=meet_start_at,
                meet_end_at=meet_end_at,
                title=title,
                description=description
            )
        )
        return time_slot.id
