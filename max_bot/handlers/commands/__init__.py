from maxapi import Dispatcher

from max_bot.handlers.commands.start_command import start_router


def register_commands_router(dp: Dispatcher):
    dp.include_routers(start_router)
