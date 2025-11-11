from maxapi import Dispatcher

from max_bot.handlers.commands.start_command import start_router
from max_bot.handlers.commands.calendar_command import calendar_router
from max_bot.handlers.commands.share_command import share_router
from max_bot.handlers.commands.schedule_command import schedule_router


def register_commands_router(dp: Dispatcher):
    dp.include_routers(start_router)
    dp.include_routers(calendar_router)
    dp.include_routers(calendar_router)
    dp.include_routers(schedule_router)
