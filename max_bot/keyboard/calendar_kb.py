from maxapi.types import OpenAppButton, CallbackButton, ButtonsPayload
from max_bot.bot import bot


def get_open_calendar_button() -> OpenAppButton:
    return OpenAppButton(
        text="Мой календарь",
        web_app="https://aeroserg.github.io/max-calendar",
        contact_id=bot.me.user_id
    )


def get_share_calendar_button() -> CallbackButton:
    return CallbackButton(text="Поделиться календарем", payload="share_link")


def get_calendar_kb() -> ButtonsPayload:
    buttons = [
        [get_open_calendar_button()],
        [get_share_calendar_button()]
    ]
    return ButtonsPayload(buttons=buttons)
