from typing import Final

from blinker import signal

user_register_signal: Final = signal("user.register")
