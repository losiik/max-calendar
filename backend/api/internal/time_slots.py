from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.dependes import get_time_slots_facade
from backend.schemas.time_slots_schema import (
    TimeSlotsCreateRequest,
    TimeSlotsCreateResponse,
    TimeSlotsSelfCreateRequest,
    SelfTimeSlotsGetResponse,
    ExternalTimeSlotsGetResponse,
    UpdateTimeSlotsRequest,
    TimeSlotsModelPydantic,
    TimeSlotSelfCreateByTextRequest
)
from backend.facade.time_slots_facade import TimeSlotsFacade
from backend.exceptions import (
    UserDoesNotExistsError,
    ShareTokenDoesNotExistsError,
    TimeSlotOverlapError,
    TextParserError
)


time_slots_router_internal = APIRouter(prefix='/time_slots')
time_slots_router_internal.tags = ["Time Slots"]


@time_slots_router_internal.get('/self/{max_id}/{target_date}', response_model=SelfTimeSlotsGetResponse)
async def get_self_time_slots(
        max_id: int,
        target_date: date,
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        time_slots = await time_slots_facade.get_self_time_slot_internal(
            max_id=max_id,
            target_date=target_date
        )
        return time_slots
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")


@time_slots_router_internal.patch('/', response_model=TimeSlotsModelPydantic)
async def update_time_slot(
        update_data: UpdateTimeSlotsRequest,
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    time_slot = await time_slots_facade.update_time_slot(
        time_slot_id=update_data.time_slot_id,
        confirm=update_data.confirm,
        title=update_data.title,
        description=update_data.description,
        meeting_url=update_data.meeting_url
    )

    return time_slot


@time_slots_router_internal.post('/self/by_text/', response_model=TimeSlotsCreateResponse)
async def book_time_slot_by_text(
        data: TimeSlotSelfCreateByTextRequest,
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        time_slot_id = await time_slots_facade.book_self_timeslot_by_text(
            text_message=data.message,
            user_max_id=data.max_id
        )
        return TimeSlotsCreateResponse(id=time_slot_id)
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except TimeSlotOverlapError:
        raise HTTPException(status_code=409, detail="Time slot overlap")
    except TextParserError:
        raise HTTPException(status_code=400, detail="Parsing message error")

