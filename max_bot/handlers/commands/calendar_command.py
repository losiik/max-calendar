from maxapi import Router
from maxapi.types import MessageCreated, Command

from max_bot.keyboard.calendar_kb import get_calendar_kb

calendar_router = Router()


@calendar_router.message_created(Command('calendar'))
async def get_calendar_menu(
        event: MessageCreated
):
    payload = get_calendar_kb().pack()

    await event.bot.send_message(
        chat_id=event.chat_id,
        text=f"В этом календаре вы можете планировать собственные задачи и встречи с другими пользователями",
        attachments=[payload]
    )
