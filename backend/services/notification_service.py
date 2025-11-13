import asyncio
from uuid import UUID
from datetime import datetime, timezone, timedelta

from maxapi import Bot
from maxapi.types import ButtonsPayload, CallbackButton
from maxapi.filters.callback_payload import CallbackPayload

from backend.settings.settings import Settings
from backend.schemas.notification_schema import (
    Notification,
    ConfirmTimeSlotNotification,
    MeetAlertNotification,
    SelfBookingNotification,
    DailyReminderNotification
)
from backend.signals import (
    confirm_time_slot_signal,
    new_slot_signal,
    alert_before_meet_signal,
    self_booking_signal,
    daily_reminder_signal
)


class CreateTimeSlotPayload(CallbackPayload, prefix='create_time_slot'):
    accept: bool
    time_slot_id: UUID


class NotificationService:
    def __init__(self, settings: Settings):
        self._bot = Bot(settings.max_api_key)
        new_slot_signal.connect(self._handle_new_slot)
        confirm_time_slot_signal.connect(self._handle_confirm_time_slot)
        alert_before_meet_signal.connect(self._handle_alert_meet)
        self_booking_signal.connect(self._handel_self_booking)
        daily_reminder_signal.connect(self._handel_daily_reminder)

    def from_utc_naive(self, dt_utc: datetime, tz_offset_hours: int) -> datetime:
        dt_utc = dt_utc.replace(tzinfo=timezone.utc)
        local_time = dt_utc.astimezone(timezone(timedelta(hours=tz_offset_hours)))
        return local_time.replace(tzinfo=None)

    async def _handel_daily_reminder(self, notification_data: DailyReminderNotification):
        asyncio.create_task(self.send_daily_reminder_notification(notification_data=notification_data))

    async def _handel_self_booking(self, notification_data: SelfBookingNotification):
        asyncio.create_task(self.self_booking_notification(notification_data=notification_data))

    async def _handle_alert_meet(self, notification_data: MeetAlertNotification):
        asyncio.create_task(self.send_alert_meet(notification_data=notification_data))

    async def _handle_confirm_time_slot(self, notification_data: ConfirmTimeSlotNotification):
        asyncio.create_task(self.send_notification_confirm_slot(notification_data=notification_data))

    async def _handle_new_slot(self, notification_data: Notification):
        asyncio.create_task(self.send_notification_new_slot(notification_data=notification_data))

    def message_builder_new_slot(self, notification_data: Notification):
        meet_start_at = self.from_utc_naive(
            dt_utc=notification_data.meet_start_at,
            tz_offset_hours=notification_data.owner_time_zone
        )

        meet_end_at = self.from_utc_naive(
            dt_utc=notification_data.meet_end_at,
            tz_offset_hours=notification_data.owner_time_zone
        )
        meet_start_at = meet_start_at.strftime("%d.%m.%Y %H:%M")
        meet_end_at = meet_end_at.strftime("%d.%m.%Y %H:%M")

        return f"""Пользователь {notification_data.invite_user_name} хочет запланировать с вами встречу
Название: {notification_data.title}
Время: с {meet_start_at} по {meet_end_at}
        """

    async def send_notification_new_slot(self, notification_data: Notification):
        message = self.message_builder_new_slot(notification_data=notification_data)

        buttons = [
            [
                CallbackButton(
                    text="Подтвердить",
                    payload=CreateTimeSlotPayload(
                        accept=True,
                        time_slot_id=notification_data.time_slot_id
                    ).pack()
                ),
                CallbackButton(
                    text="Отказаться",
                    payload=CreateTimeSlotPayload(
                        accept=False,
                        time_slot_id=notification_data.time_slot_id
                    ).pack()
                )
            ]
        ]

        payload = ButtonsPayload(buttons=buttons).pack()

        await self._bot.send_message(
            user_id=notification_data.owner_user_max_id,
            text=message,
            attachments=[payload]
        )

    def message_invited_builder_confirm_slot(
            self,
            notification_data: ConfirmTimeSlotNotification
    ):
        invited_meet_start_at = self.from_utc_naive(
            dt_utc=notification_data.meet_start_at,
            tz_offset_hours=notification_data.invite_timezone
        )

        invited_meet_end_at = self.from_utc_naive(
            dt_utc=notification_data.meet_end_at,
            tz_offset_hours=notification_data.invite_timezone
        )

        invited_meet_start_at = invited_meet_start_at.strftime("%d.%m.%Y %H:%M")
        invited_meet_end_at = invited_meet_end_at.strftime("%d.%m.%Y %H:%M")
        if notification_data.owner_user_max_id == notification_data.invite_user_max_id:
            if notification_data.confirm:
                confirm_text = "подтвердили"
                emoji = "✅"
            else:
                confirm_text = "не подтвердили или отменили"
                emoji = "❌"
            return f"""{emoji} Вы {confirm_text} встречу
Название: {notification_data.title}    
Время: с {invited_meet_start_at} по {invited_meet_end_at}        
"""
        if notification_data.confirm:
            confirm_text = "подтвердил"
            emoji = "✅"
        else:
            confirm_text = "не подтвердил или отменил"
            emoji = "❌"

        return f"""{emoji} Пользователь {notification_data.owner_user_user_name} {confirm_text} с вами встречу
Название: {notification_data.title}
Время: с {invited_meet_start_at} по {invited_meet_end_at}
Ссылка на встречу: {notification_data.meeting_url}
        """

    def message_owner_builder_confirm_slot(self, notification_data: ConfirmTimeSlotNotification):
        owner_meet_start_at = self.from_utc_naive(
            dt_utc=notification_data.meet_start_at,
            tz_offset_hours=notification_data.owner_timezone
        )

        owner_meet_end_at = self.from_utc_naive(
            dt_utc=notification_data.meet_end_at,
            tz_offset_hours=notification_data.owner_timezone
        )

        owner_meet_start_at = owner_meet_start_at.strftime("%d.%m.%Y %H:%M")
        owner_meet_end_at = owner_meet_end_at.strftime("%d.%m.%Y %H:%M")

        if notification_data.confirm:
            confirm_text = "подтвердили"
            emoji = "✅"
        else:
            confirm_text = "отменили"
            emoji = "❌"

        return f"""{emoji} Вы успешно {confirm_text} встречу с {notification_data.invite_use_name}
Название: {notification_data.title}
Время: с {owner_meet_start_at} по {owner_meet_end_at}
Ссылка на встречу: {notification_data.meeting_url}
"""

    async def send_notification_confirm_slot(self, notification_data: ConfirmTimeSlotNotification):
        message_invited = self.message_invited_builder_confirm_slot(
            notification_data=notification_data
        )
        message_owner = self.message_owner_builder_confirm_slot(
            notification_data=notification_data
        )

        await self._bot.send_message(
            user_id=notification_data.invite_user_max_id,
            text=message_invited
        )

        if notification_data.owner_user_max_id != notification_data.invite_user_max_id:
            await self._bot.send_message(
                user_id=notification_data.owner_user_max_id,
                text=message_owner
            )

    def alert_meet_message_builder(self, notification_data: MeetAlertNotification) -> str:
        meet_start_at = self.from_utc_naive(
            dt_utc=notification_data.meet_start_at,
            tz_offset_hours=notification_data.user_timezone
        )

        meet_end_at = self.from_utc_naive(
            dt_utc=notification_data.meet_end_at,
            tz_offset_hours=notification_data.user_timezone
        )

        meet_start_at = meet_start_at.strftime("%d.%m.%Y %H:%M")
        meet_end_at = meet_end_at.strftime("%d.%m.%Y %H:%M")

        return f"""Через {notification_data.alert_offset_minutes} минут у вас стоится встреча с пользователем {notification_data.invite_use_name}
        
Название: {notification_data.title}
Начало в: {meet_start_at}
Конец в:  {meet_end_at}
Ссылка на встречу: {notification_data.meeting_url if notification_data.meeting_url is not None else 'отсутствует'}
"""

    async def send_alert_meet(self, notification_data: MeetAlertNotification):
        message = self.alert_meet_message_builder(notification_data=notification_data)
        await self._bot.send_message(
            user_id=notification_data.user_max_id,
            text=message
        )

    def self_booking_message_builder(self, notification_data: SelfBookingNotification) -> str:
        meet_start_at = self.from_utc_naive(
            dt_utc=notification_data.meet_start_at,
            tz_offset_hours=notification_data.user_timezone
        )

        meet_end_at = self.from_utc_naive(
            dt_utc=notification_data.meet_end_at,
            tz_offset_hours=notification_data.user_timezone
        )
        meet_start_at = meet_start_at.strftime("%d.%m.%Y %H:%M")
        meet_end_at = meet_end_at.strftime("%d.%m.%Y %H:%M")
        return f"""✅ Вы успешно запланировали встречу

Название: {notification_data.title}
Начало в: {meet_start_at}
Конец в:  {meet_end_at}
        """

    async def self_booking_notification(self, notification_data: SelfBookingNotification):
        message = self.self_booking_message_builder(notification_data=notification_data)
        await self._bot.send_message(
            user_id=notification_data.user_max_id,
            text=message
        )

    def daily_reminder_message_builder(self, notification_data: DailyReminderNotification) -> str:
        message = ""

        for slot in notification_data.slot_list:
            meet_start_at = self.from_utc_naive(
                dt_utc=slot.meet_start_at,
                tz_offset_hours=slot.user_timezone
            )

            meet_end_at = self.from_utc_naive(
                dt_utc=slot.meet_end_at,
                tz_offset_hours=slot.user_timezone
            )

            meet_start_at = meet_start_at.strftime("%d.%m.%Y %H:%M")
            meet_end_at = meet_end_at.strftime("%d.%m.%Y %H:%M")

            message += f"""🕕\nНазвание: {slot.title}
            Дата: c {meet_start_at} по {meet_end_at}
            """
            if slot.meeting_url is not None:
                message += f"Ссылка на встречу: {slot.meeting_url}"

            message += "\n\n"

        if message != "":
            message = "📆 Сегодняшние встречи:\n\n" + message
        return message

    async def send_daily_reminder_notification(self, notification_data: DailyReminderNotification):
        message = self.daily_reminder_message_builder(notification_data=notification_data)
        await self._bot.send_message(
            user_id=notification_data.user_max_id,
            text=message
        )

