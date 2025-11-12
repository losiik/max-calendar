from maxapi import Router
from maxapi.types import BotStarted, Command, MessageCreated

from max_bot.services.user_service import UserService
from max_bot.dependes import get_user_service
from max_bot.keyboard.calendar_kb import get_calendar_kb

start_router = Router()


@start_router.bot_started()
async def bot_started(
        event: BotStarted,
        user_service: UserService = get_user_service()
):
    await user_service.create_user(
        max_id=event.from_user.user_id,
        username=event.from_user.username,
        name=f"{event.from_user.first_name} {event.from_user.last_name}"
    )

    payload = get_calendar_kb().pack()

    await event.bot.send_message(
        chat_id=event.chat_id,
        text=f"""Ваш персональный календарь встреч.

📅 Планируйте свой день, делитесь календарём с коллегами и назначайте встречи без лишних сообщений.
🕓 Настройте рабочие часы и длительность слотов.
🎧 Все встречи автоматически получают ссылку на Sber Jazz.
🤖 Бот поможет добавить задачу текстом или напомнит, о чём говорили на прошлой встрече.""",
        attachments=[payload]
    )


@start_router.message_created(Command('start'))
async def command_start(event: MessageCreated):
    await event.message.answer(
        text=f""""Ваш персональный календарь встреч.

📅 Планируйте свой день, делитесь календарём с коллегами и назначайте встречи без лишних сообщений.
🕓 Настройте рабочие часы и длительность слотов.
🎧 Все встречи автоматически получают ссылку на Sber Jazz.
🤖 Бот поможет добавить задачу текстом или напомнит, о чём говорили на прошлой встрече.
"""
    )
