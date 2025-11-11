from typing import Optional, List
from datetime import datetime, date, timedelta
from uuid import UUID
import math
from copy import deepcopy

from backend.services.user_service import UserService
from backend.services.time_slots_service import TimeSlotsService
from backend.services.share_service import ShareService
from backend.services.settings_service import SettingsService
from backend.exceptions import (
    UserDoesNotExistsError,
    ShareTokenDoesNotExistsError,
    TimeSlotDoesNotExistsError,
    TimeSlotOverlapError
)
from backend.schemas.notification_schema import (
    Notification,
    ConfirmTimeSlotNotification,
    MeetAlertNotification
)
from backend.schemas.time_slots_schema import (
    SelfTimeSlotsGetResponse,
    GetSelfTimeSlot,
    TimeSlotsModelPydantic,
    GetExternalTimeSlot
)
from backend.client.sber_jazz_client import SberJazzClient
from backend.signals import (
    new_slot_signal,
    alert_before_meet_signal,
    confirm_time_slot_signal
)


class TimeSlotsFacade:
    def __init__(
            self,
            user_service: UserService,
            time_slots_service: TimeSlotsService,
            share_service: ShareService,
            settings_service: SettingsService,
            sber_jazz_client: SberJazzClient
    ):
        self._user_service = user_service
        self._time_slots_service = time_slots_service
        self._share_service = share_service
        self._settings_service = settings_service
        self._sber_jazz_client = sber_jazz_client

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
                description=description,
                time_slot_id=time_slot.id
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

        overlap_slots = await self._time_slots_service.get_user_overlapping_slot(
            user_id=user.id,
            meet_start_at_target=meet_start_at,
            meet_end_at_target=meet_end_at
        )

        if overlap_slots != []:
            raise TimeSlotOverlapError

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

    def is_working_day(self, target_date: date, working_days_bitmask: int) -> bool:
        weekday_index = target_date.weekday()
        return bool(working_days_bitmask & (1 << weekday_index))

    def is_overlap(self, start1: float, end1: float, start2: float, end2: float) -> bool:
        return not (end1 <= start2 or start1 >= end2)

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

    def get_available_external_slots(
            self,
            all_slots: List[GetSelfTimeSlot],
            owner_booked_slots: List[TimeSlotsModelPydantic],
            invited_booked_slots: List[TimeSlotsModelPydantic]
    ) -> List[GetExternalTimeSlot]:
        owner_confirmed = [s for s in owner_booked_slots if s.confirm]
        invited_confirmed = [s for s in invited_booked_slots if s.confirm]

        booked_intervals = []
        for s in owner_confirmed + invited_confirmed:
            booked_intervals.append((
                self.datetime_to_float(s.meet_start_at),
                self.datetime_to_float(s.meet_end_at)
            ))

        free_slots: List[GetExternalTimeSlot] = []

        for slot in all_slots:
            overlaps = any(
                self.is_overlap(slot.meet_start_at, slot.meet_end_at, start, end)
                for start, end in booked_intervals
            )
            if not overlaps:
                free_slots.append(
                    GetExternalTimeSlot(
                        meet_start_at=slot.meet_start_at,
                        meet_end_at=slot.meet_end_at
                    )
                )

        return free_slots

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
        result_slots = []

        user = await self._user_service.find_by_max_id(max_id=max_id)
        if user is None:
            raise UserDoesNotExistsError

        booked_slots = await self._time_slots_service.get_time_self_slots(
            user_id=user.id,
            target_date=target_date
        )

        for slot in booked_slots:
            result_slots.append(
                GetSelfTimeSlot(
                    meet_start_at=self.datetime_to_float(slot.meet_start_at),
                    meet_end_at=self.datetime_to_float(slot.meet_end_at),
                    title=slot.title,
                    description=slot.description,
                    slot_id=slot.id
                )
            )

        return SelfTimeSlotsGetResponse(time_slots=result_slots)

    async def get_external_time_slots(
            self,
            invited_max_id: int,
            owner_token: str,
            target_date: date
    ) -> List[GetExternalTimeSlot]:
        share_data = await self._share_service.get_share_data_by_token(token=owner_token)

        if share_data is None:
            raise ShareTokenDoesNotExistsError

        owner_user = await self._user_service.get_by_user_id(user_id=share_data.owner_id)
        owner_settings = await self._settings_service.get_settings(user_id=owner_user.id)

        if not self.is_working_day(
                target_date=target_date,
                working_days_bitmask=owner_settings.working_days
        ):
            return []

        invited_user = await self._user_service.find_by_max_id(max_id=invited_max_id)
        if invited_user is None:
            raise UserDoesNotExistsError

        owner_booked_slots = await self._time_slots_service.get_time_self_slots(
            user_id=owner_user.id,
            target_date=target_date
        )

        invited_booked_slots = await self._time_slots_service.get_time_self_slots(
            user_id=invited_user.id,
            target_date=target_date
        )

        all_owner_slots = self.generate_daily_time_slots(
            work_time_start=owner_settings.work_time_start,
            work_time_end=owner_settings.work_time_end,
            duration_minutes=owner_settings.duration_minutes
        )

        available_external_slots = self.get_available_external_slots(
            all_slots=all_owner_slots,
            owner_booked_slots=owner_booked_slots,
            invited_booked_slots=invited_booked_slots
        )
        return available_external_slots

    async def update_time_slot(
            self,
            time_slot_id: UUID,
            confirm: Optional[bool] = None,
            title: Optional[str] = None,
            description: Optional[str] = None,
            meeting_url: Optional[str] = None
    ) -> TimeSlotsModelPydantic:
        time_slot = await self._time_slots_service.get_time_slot(
            time_slot_id=time_slot_id
        )
        update_data = {}
        if confirm is not None:
            update_data['confirm'] = confirm
        if title:
            update_data['title'] = title
        if description:
            update_data['description'] = description
        if meeting_url:
            update_data['meeting_url'] = meeting_url

        if confirm:
            meeting_url = await self._sber_jazz_client.create_meeting(
                user_id=time_slot.owner_id,
                title=time_slot.title,
                description=time_slot.description
            )
            update_data['meeting_url'] = meeting_url

        updated_time_slot = await self._time_slots_service.update_time_slot(
            time_slot_id=time_slot_id,
            update_data=update_data
        )

        invited_user = await self._user_service.get_by_user_id(user_id=updated_time_slot.invited_id)
        owner_user = await self._user_service.get_by_user_id(user_id=updated_time_slot.owner_id)

        if confirm is not None:
            await confirm_time_slot_signal.send_async(
                ConfirmTimeSlotNotification(
                    meet_start_at=updated_time_slot.meet_start_at,
                    meet_end_at=updated_time_slot.meet_end_at,
                    title=updated_time_slot.title,
                    invite_user_max_id=invited_user.max_id,
                    invite_use_name=invited_user.name,
                    owner_user_max_id=owner_user.max_id,
                    owner_user_user_name=owner_user.name,
                    confirm=confirm,
                    meeting_url=meeting_url
                )
            )

        return updated_time_slot

    async def delete_self_time_slot(self, max_id: int, time_slot_id: UUID):
        invited_user = await self._user_service.find_by_max_id(max_id=max_id)
        if invited_user is None:
            raise UserDoesNotExistsError

        time_slot = await self._time_slots_service.get_time_slot(time_slot_id=time_slot_id)

        if time_slot is None:
            raise TimeSlotDoesNotExistsError

        await self.update_time_slot(time_slot_id=time_slot_id, confirm=False)

    def is_time_to_alert(self, meet_start_at: datetime, alert_offset_minutes: int) -> bool:
        now = datetime.now()

        # Приводим meet_start_at к UTC
        if meet_start_at.tzinfo is None:
            meet_start_at = meet_start_at.replace()
        else:
            meet_start_at = meet_start_at.astimezone()

        now = now.replace(second=0, microsecond=0)
        meet_start_at = meet_start_at.replace(second=0, microsecond=0)

        alert_time = meet_start_at - timedelta(minutes=alert_offset_minutes)
        alert_time = alert_time.replace(second=0, microsecond=0)
        return alert_time == now and now < meet_start_at

    async def check_reminders(self):
        upcoming_time_slots = await self._time_slots_service.get_upcoming()

        for slot in upcoming_time_slots:
            owner_settings = await self._settings_service.get_settings(
                user_id=slot.owner_id
            )
            invited_settings = await self._settings_service.get_settings(
                user_id=slot.invited_id
            )

            send_notification_to_owner = self.is_time_to_alert(
                meet_start_at=slot.meet_start_at,
                alert_offset_minutes=owner_settings.alert_offset_minutes
            )

            send_notification_to_invited = self.is_time_to_alert(
                meet_start_at=slot.meet_start_at,
                alert_offset_minutes=invited_settings.alert_offset_minutes
            )

            if send_notification_to_owner or send_notification_to_invited:
                owner_user = await self._user_service.get_by_user_id(user_id=slot.owner_id)
                invited_user = await self._user_service.get_by_user_id(user_id=slot.invited_id)

                if send_notification_to_owner:
                    await alert_before_meet_signal.send_async(
                        MeetAlertNotification(
                            meet_start_at=slot.meet_start_at,
                            meet_end_at=slot.meet_end_at,
                            title=slot.title,
                            invite_use_name=invited_user.name,
                            user_max_id=owner_user.max_id,
                            meeting_url=slot.meeting_url,
                            alert_offset_minutes=owner_settings.alert_offset_minutes
                        )
                    )

                if send_notification_to_invited:
                    await alert_before_meet_signal.send_async(
                        MeetAlertNotification(
                            meet_start_at=slot.meet_start_at,
                            meet_end_at=slot.meet_end_at,
                            title=slot.title,
                            invite_use_name=owner_user.name,
                            user_max_id=invited_user.max_id,
                            meeting_url=slot.meeting_url,
                            alert_offset_minutes=invited_settings.alert_offset_minutes
                        )
                    )
