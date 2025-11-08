from maxapi import Dispatcher

from max_bot.handlers.commands import register_commands_router
from max_bot.handlers.callbacks import register_callback_router


def register_all_routers(dp: Dispatcher):
    register_commands_router(dp)
    register_callback_router(dp)
