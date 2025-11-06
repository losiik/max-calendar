import logging

from maxapi import Bot, Dispatcher

from max_bot.settings.settings import settings


logging.basicConfig(level=logging.INFO)

bot = Bot(settings.max_api_key)
dp = Dispatcher()
