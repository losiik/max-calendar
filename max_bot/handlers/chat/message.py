from maxapi.types import MessageCreated
from maxapi import Router, F

from max_bot.services.time_slot_service import TimeSlotService
from max_bot.dependes import get_time_slot_service

message_router = Router()


@message_router.message_created(F.message.body.text)
async def book_time_slot_by_text(
        event: MessageCreated,
        time_slot_service: TimeSlotService = get_time_slot_service()
):
    response = await time_slot_service.book_time_slot_by_text(
        max_id=event.from_user.user_id,
        message=event.message.body.text
    )
    if response is not None:
        await event.message.answer(response)
