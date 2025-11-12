from maxapi import Dispatcher

from max_bot.handlers.chat.message import message_router


def register_chat_router(dp: Dispatcher):
    dp.include_routers(message_router)
