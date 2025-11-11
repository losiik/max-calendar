import asyncio
from uuid import UUID

from maxapi import Bot
from maxapi.types import ButtonsPayload, CallbackButton
from maxapi.filters.callback_payload import CallbackPayload

from backend.settings.settings import Settings
from backend.schemas.notification_schema import (
    Notification,
    ConfirmTimeSlotNotification,
    MeetAlertNotification
)
from backend.signals import (
    confirm_time_slot_signal,
    new_slot_signal,
    alert_before_meet_signal
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

    async def _handle_alert_meet(self, notification_data: MeetAlertNotification):
        asyncio.create_task(self.send_alert_meet(notification_data=notification_data))

    async def _handle_confirm_time_slot(self, notification_data: ConfirmTimeSlotNotification):
        asyncio.create_task(self.send_notification_confirm_slot(notification_data=notification_data))

    async def _handle_new_slot(self, notification_data: Notification):
        asyncio.create_task(self.send_notification_new_slot(notification_data=notification_data))

    def message_builder_new_slot(self, notification_data: Notification):
        return f"""Пользователь {notification_data.invite_user_name} хочет запланировать с вами встречу
Название: {notification_data.title}
Время: с {notification_data.meet_start_at} по {notification_data.meet_end_at}
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

    def message_invited_builder_confirm_slot(self, notification_data: ConfirmTimeSlotNotification):
        if notification_data.owner_user_max_id == notification_data.invite_user_max_id:
            if notification_data.confirm:
                confirm_text = "подтвердил"
            else:
                confirm_text = "не подтвердил или отменил"
            return f"""Вы {confirm_text} встречу
Название: {notification_data.title}    
Время: с {notification_data.meet_start_at} по {notification_data.meet_end_at}        
"""
        if notification_data.confirm:
            confirm_text = "подтвердил"
        else:
            confirm_text = "не подтвердил или отменил"
        return f"""Пользователь {notification_data.owner_user_user_name} {confirm_text} с вами встречу
Название: {notification_data.title}
Время: с {notification_data.meet_start_at} по {notification_data.meet_end_at}
Ссылка на встречу: {notification_data.meeting_url}
        """

    def message_owner_builder_confirm_slot(self, notification_data: ConfirmTimeSlotNotification):
        if notification_data.confirm:
            confirm_text = "подтвердили"
        else:
            confirm_text = "отменили"

        return f"""Вы успешно {confirm_text} встречу с {notification_data.invite_use_name}
Название: {notification_data.title}
Время: с {notification_data.meet_start_at} по {notification_data.meet_end_at}
Ссылка на встречу: {notification_data.meeting_url}
"""

    async def send_notification_confirm_slot(self, notification_data: ConfirmTimeSlotNotification):
        message_invited = self.message_invited_builder_confirm_slot(notification_data=notification_data)
        message_owner = self.message_owner_builder_confirm_slot(notification_data=notification_data)

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
        return f"""Через {notification_data.alert_offset_minutes} минут у вас стоится встреча с пользователем {notification_data.invite_use_name}
        
Название: {notification_data.title}
Начало в: {notification_data.meet_start_at}
Конец в:  {notification_data.meet_end_at}
Ссылка на встречу: {notification_data.meeting_url}
"""

    async def send_alert_meet(self, notification_data: MeetAlertNotification):
        message = self.alert_meet_message_builder(notification_data=notification_data)
        await self._bot.send_message(
            user_id=notification_data.user_max_id,
            text=message
        )
