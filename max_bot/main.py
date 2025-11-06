import asyncio
import os
from dotenv import load_dotenv


if os.path.exists('.env'):
    load_dotenv('.env')

from max_bot.bot import dp, bot
from max_bot.handlers import register_all_routers


async def main():
    register_all_routers(dp)
    await dp.start_polling(bot)


if __name__ == '__main__':
    asyncio.run(main())
