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
        text=f"""📅 Планируйте встречи, управляйте расписанием и делитесь доступностью без лишних согласований.
🕓 Гибко задавайте рабочие дни, часы и длительность слотов.
🔗 Делитесь календарём и принимайте бронирования в один клик.
🎧 Каждая встреча автоматически получает ссылку на Sber Jazz.
🗣 Можно просто записать голосовое - бот поймёт и сам создаст встречу по вашему описанию.
💬 Нативный ввод задач прямо в чат, без команд и форм.
🔍 ИИ-транскрибация прошедших встреч (в разработке).""",
        attachments=[payload]
    )


@start_router.message_created(Command('start'))
async def command_start(
        event: MessageCreated,
        user_service: UserService = get_user_service()
):
    await user_service.create_user(
        max_id=event.message.sender.user_id,
        username=event.message.sender.username,
        name=f"{event.message.sender.first_name} {event.message.sender.last_name}"
    )

    payload = get_calendar_kb().pack()

    await event.message.answer(
        text=f"""📅 Планируйте встречи, управляйте расписанием и делитесь доступностью без лишних согласований.
🕓 Гибко задавайте рабочие дни, часы и длительность слотов.
🔗 Делитесь календарём и принимайте бронирования в один клик.
🎧 Каждая встреча автоматически получает ссылку на Sber Jazz.
🗣 Можно просто записать голосовое - бот поймёт и сам создаст встречу по вашему описанию.
💬 Нативный ввод задач прямо в чат, без команд и форм.
🔍 ИИ-транскрибация прошедших встреч (в разработке).""",
        attachments=[payload]
    )
