import asyncio

from maxapi import Bot
from maxapi.types import ButtonsPayload, CallbackButton

from backend.settings.settings import Settings
from backend.schemas.notification_schema import Notification
from backend.signals import new_slot_signal


class NotificationService:
    def __init__(self, settings: Settings):
        self._bot = Bot(settings.max_api_key)
        new_slot_signal.connect(self._handle_new_notification)

    async def _handle_new_notification(self, notification_data: Notification):
        asyncio.create_task(self.send_notification(notification_data=notification_data))

    def message_builder(self, notification_data: Notification):
        return f"""Пользователь {notification_data.invite_user_name} хочет запланировать с вами встречу
Название: {notification_data.title}
Время: с {notification_data.meet_start_at} по {notification_data.meet_end_at}
        """

    async def send_notification(self, notification_data: Notification):
        message = self.message_builder(notification_data=notification_data)

        buttons = [
            [
                CallbackButton(text="Подтвердить", payload="accept"),
                CallbackButton(text="Отказаться", payload="reject")
            ]
        ]

        payload = ButtonsPayload(buttons=buttons).pack()

        await self._bot.send_message(
            user_id=notification_data.owner_user_max_id,
            text=message,
            attachments=[payload]
        )
