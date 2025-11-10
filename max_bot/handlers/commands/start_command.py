from maxapi import Router
from maxapi.types import BotStarted, Command, MessageCreated
from maxapi.types import ButtonsPayload, LinkButton, CallbackButton, MessageCallback

from max_bot.services.user_service import UserService
from max_bot.dependes import get_user_service
from max_bot.keyboard.calendar_kb import get_open_calendar_button

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

    buttons = [
        [get_open_calendar_button()],
        [CallbackButton(text="Поделиться календарем", payload="share_link")]
    ]

    payload = ButtonsPayload(buttons=buttons).pack()

    await event.bot.send_message(
        chat_id=event.chat_id,
        text=f"Я самый удобный календарь в мире! Я делаю встречи еще удобнее! Чтобы продолжить, необходимо перейти в настройки",
        attachments=[payload]
    )


@start_router.message_created(Command('start'))
async def hello(event: MessageCreated):
    m = await event.message.answer(
        text=f"список команд:"
             f"/calendar - мой календарь"
             f"/start - запустить бот"
             f"/schedule_today - расписание на сегодня"
             f"/share - поделиться календарем"
    )
    await m.pin()
