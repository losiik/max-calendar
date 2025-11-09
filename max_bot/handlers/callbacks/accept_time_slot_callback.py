from uuid import UUID

from maxapi.types import MessageCallback
from maxapi import Router
from maxapi.filters.callback_payload import CallbackPayload

from max_bot.services.time_slot_service import TimeSlotService
from max_bot.dependes import get_time_slot_service


accept_time_slot_router = Router()


class CreateTimeSlotPayload(CallbackPayload, prefix='create_time_slot'):
    accept: bool
    time_slot_id: UUID


@accept_time_slot_router.message_callback(CreateTimeSlotPayload.filter())
async def accept_time_slot(
        callback: MessageCallback,
        payload: CreateTimeSlotPayload,
        share_service: TimeSlotService = get_time_slot_service()
):
    await share_service.update_time_slot(
        time_slot_id=payload.time_slot_id,
        confirm=payload.accept
    )

    await callback.message.answer(text="Ответ")
