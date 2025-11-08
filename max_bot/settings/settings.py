import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    max_api_key: str = os.getenv("MAX_API_KEY")
    backend_url: str = os.getenv("BACKEND_URL")
    bot_url: str = os.getenv("BOT_URL")


settings = Settings()
