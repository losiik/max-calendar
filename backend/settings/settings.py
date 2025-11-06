import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 9000

    # postgres settings
    db_host: str = os.getenv("DB_HOST")
    db_port: str = os.getenv("DB_PORT")
    db_main_database: str = os.getenv("DB_MAIN_DATABASE")
    db_user: str = os.getenv("DB_USER")
    db_password: str = os.getenv("DB_PASSWORD")

    db_connection_rout: str = f"{db_user}:{db_password}@{db_host}:{db_port}/{db_main_database}"

    sql_alchemy_connection_url: str = f"postgresql+asyncpg://{db_connection_rout}"

    sql_echo: bool = False  # True для отладки SQL-запросов


settings = Settings()
