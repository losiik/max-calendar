from typing import Final

from blinker import signal

user_register_signal: Final = signal("user.register")

new_slot_signal: Final = signal("new_slot")

confirm_time_slot_signal: Final = signal("confirm_slot")

alert_before_meet_signal: Final = signal("alert_before_meet")

self_booking_signal: Final = signal("self_booking_signal")

daily_reminder_signal: Final = signal("daily_reminder_signal")
