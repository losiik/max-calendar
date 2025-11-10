import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    reminder_url: str = os.getenv("BACKEND_URL")


settings = Settings()
