from typing import Final

from blinker import signal

user_register_signal: Final = signal("user.register")

new_slot_signal: Final = signal("new_slot")
