from maxapi import Router
from maxapi.types import MessageCreated, Command
from datetime import datetime

from max_bot.services.time_slot_service import TimeSlotService
from max_bot.dependes import get_time_slot_service

schedule_router = Router()


@schedule_router.message_created(Command('schedule_today'))
async def today_timetable(
        event: MessageCreated,
        time_slot_service: TimeSlotService = get_time_slot_service()
):
    message = await time_slot_service.get_daly_timetable(
        max_id=event.message.from_user.user_id,
        target_date=datetime.now().date()
    )

    await event.message.answer(text=message)
