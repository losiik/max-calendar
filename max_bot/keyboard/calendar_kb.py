from maxapi.types import OpenAppButton
from max_bot.bot import bot


def get_open_calendar_button() -> OpenAppButton:
    return OpenAppButton(
        text="Мой календарь",
        web_app="https://aeroserg.github.io/max-calendar",
        contact_id=bot.me.user_id
    )
