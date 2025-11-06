from maxapi import Dispatcher

from max_bot.handlers.commands import register_commands_router


def register_all_routers(dp: Dispatcher):
    register_commands_router(dp)
