from maxapi import Dispatcher

from max_bot.handlers.callbacks.share_link_callback import share_link_router


def register_callback_router(dp: Dispatcher):
    dp.include_routers(share_link_router)
