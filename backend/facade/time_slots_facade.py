from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
import math
from copy import deepcopy

from backend.services.user_service import UserService
from backend.services.time_slots_service import TimeSlotsService
from backend.services.share_service import ShareService
from backend.services.settings_service import SettingsService
from backend.exceptions import UserDoesNotExistsError, ShareTokenDoesNotExistsError
from backend.schemas.notification_schema import Notification
from backend.schemas.time_slots_schema import SelfTimeSlotsGetResponse, GetSelfTimeSlot, TimeSlotsModelPydantic
from backend.signals import new_slot_signal


class TimeSlotsFacade:
    def __init__(
            self,
            user_service: UserService,
            time_slots_service: TimeSlotsService,
            share_service: ShareService,
            settings_service: SettingsService
    ):
        self._user_service = user_service
        self._time_slots_service = time_slots_service
        self._share_service = share_service
        self._settings_service = settings_service

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

    async def create_self_time_slot(
            self,
            max_id: int,
            meet_start_at: datetime,
            meet_end_at: datetime,
            title: Optional[str] = None,
            description: Optional[str] = None
    ) -> UUID:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        if user is None:
            raise UserDoesNotExistsError

        time_slot = await self._time_slots_service.create_time_slot(
            owner_id=user.id,
            invited_id=user.id,
            meet_start_at=meet_start_at,
            meet_end_at=meet_end_at,
            confirm=True,
            title=title,
            description=description
        )

        return time_slot.id

    def float_time_to_minutes(self, t: float) -> int:
        hours = int(math.floor(t))
        minutes = int(round((t - hours) * 100))
        if minutes < 0 or minutes >= 60:
            raise ValueError(f"Некорректное значение минут: {minutes} (вход: {t})")
        return hours * 60 + minutes

    def minutes_to_float_time(self, m: int) -> float:
        hours = m // 60
        minutes = m % 60
        return float(f"{hours}.{minutes:02d}")

    def datetime_to_float(self, dt: datetime) -> float:
        return float(f"{dt.hour}.{dt.minute:02d}")

    def merge_slots_with_bookings(
            self,
            all_slots: List[GetSelfTimeSlot],
            booked_slots: List[TimeSlotsModelPydantic]
    ) -> List[GetSelfTimeSlot]:
        result_slots = deepcopy(all_slots)

        confirmed_bookings = [
            b for b in booked_slots if b.confirm
        ]

        confirmed_lookup = {
            (self.datetime_to_float(b.meet_start_at), self.datetime_to_float(b.meet_end_at)): b
            for b in confirmed_bookings
        }

        for slot in result_slots:
            key = (slot.meet_start_at, slot.meet_end_at)
            if key in confirmed_lookup:
                booked = confirmed_lookup[key]
                slot.title = booked.title
                slot.description = booked.description

        return result_slots

    def generate_daily_time_slots(
            self,
            work_time_start: float,
            work_time_end: float,
            duration_minutes: int
    ) -> List[GetSelfTimeSlot]:
        start_min = self.float_time_to_minutes(work_time_start)
        end_min = self.float_time_to_minutes(work_time_end)

        if end_min <= start_min:
            raise ValueError("work_time_end должен быть больше work_time_start")

        slots: List[GetSelfTimeSlot] = []
        current = start_min

        while current + duration_minutes <= end_min:
            slot_start = current
            slot_end = current + duration_minutes
            slots.append(
                GetSelfTimeSlot(
                    meet_start_at=self.minutes_to_float_time(slot_start),
                    meet_end_at=self.minutes_to_float_time(slot_end)
                )
            )
            current += duration_minutes

        return slots

    async def get_self_time_slot(
            self,
            max_id: int,
            target_date: date
    ) -> SelfTimeSlotsGetResponse:
        user = await self._user_service.find_by_max_id(max_id=max_id)
        if user is None:
            raise UserDoesNotExistsError

        booked_slots = await self._time_slots_service.get_time_self_slots(
            user_id=user.id,
            target_date=target_date
        )

        user_settings = await self._settings_service.get_settings(user_id=user.id)

        all_slots = self.generate_daily_time_slots(
            work_time_start=user_settings.work_time_start,
            work_time_end=user_settings.work_time_end,
            duration_minutes=user_settings.duration_minutes
        )

        result_slots = self.merge_slots_with_bookings(
            all_slots=all_slots,
            booked_slots=booked_slots
        )

        return SelfTimeSlotsGetResponse(time_slots=result_slots)
