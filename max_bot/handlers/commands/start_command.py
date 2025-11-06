from maxapi import Router
from maxapi.types import BotStarted, Command, MessageCreated
from maxapi.types import ButtonsPayload, LinkButton, CallbackButton, MessageCallback

from max_bot.services.user_service import UserService
from max_bot.dependes import get_user_service

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
        [LinkButton(text="Настройки", url="https://explainagent.ru")],
        [CallbackButton(text="Список команд", payload="command_list")]
    ]

    payload = ButtonsPayload(buttons=buttons).pack()

    await event.bot.send_message(
        chat_id=event.chat_id,
        text=f"Я самый удобный календарь в мире! Я делаю встречи еще удобнее! Чтобы продолжить, необходимо перейти в настройки",
        attachments=[payload]
    )


# Ответ бота на команду /start
@start_router.message_created(Command('start'))
async def hello(event: MessageCreated):
    buttons = [
        [LinkButton(text="Настройки", url="https://explainagent.ru")],
        [CallbackButton(text="Список команд", payload="command_list")]
    ]

    payload = ButtonsPayload(buttons=buttons).pack()

    payload = ButtonsPayload(buttons=buttons).pack()
    # print(event)
    # print(event.__dict__)
    # print(event.message.from_user)
    print(event.from_user)
    await event.message.answer(
        text=f"Я самый удобный календарь в мире! Я делаю встречи еще удобнее! Чтобы продолжить, необходимо перейти в настройки",
        attachments=[payload]
    )
