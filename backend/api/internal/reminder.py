from fastapi import APIRouter, Depends

from backend.dependes import get_time_slots_facade
from backend.facade.time_slots_facade import TimeSlotsFacade


reminder_router_internal = APIRouter(prefix='/reminder')
reminder_router_internal.tags = ["Reminder"]


@reminder_router_internal.post('/')
async def check_reminder(
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    await time_slots_facade.check_reminders()


@reminder_router_internal.post('/daily_reminder/')
async def daily_reminder(
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    await time_slots_facade.daily_reminder()
