import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    max_api_key: str = os.getenv("f9LHodD0cOK71zkbeDvAE2bYxTfQpnLiG3QbVAmq0acBjJxI7Bc1VnBOjJzYLwtLqYPL4wtxA2NfBXuftlRv")
    backend_url: str = os.getenv("BACKEND_URL")
    bot_url: str = os.getenv("BOT_URL")


settings = Settings()
