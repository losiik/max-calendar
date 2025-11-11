import asyncio
import os
from dotenv import load_dotenv


if os.path.exists('.env'):
    load_dotenv('.env')

from max_bot.bot import dp, bot
from max_bot.handlers import register_all_routers
from maxapi.types import BotCommand


async def main():
    """
    /calendar - мой календарь
/start - запустить бот
/schedule_today - расписание на сегодня
/share - поделиться календарем
    :return:
    """
    await bot.change_info(commands=[BotCommand(name="start", description="запустить бот")])
    register_all_routers(dp)
    await dp.start_polling(bot)


if __name__ == '__main__':
    asyncio.run(main())
