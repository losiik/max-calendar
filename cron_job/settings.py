import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    reminder_alert_url: str = os.getenv("REMINDER_ALERT_URL")
    reminder_daily_url: str = os.getenv("REMINDER_DAILY_URL")


settings = Settings()
