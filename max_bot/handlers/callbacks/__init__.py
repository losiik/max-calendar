from maxapi import Dispatcher

from max_bot.handlers.callbacks.share_link_callback import share_link_router
from max_bot.handlers.callbacks.accept_time_slot_callback import accept_time_slot_router


def register_callback_router(dp: Dispatcher):
    dp.include_routers(share_link_router)
    dp.include_routers(accept_time_slot_router)
