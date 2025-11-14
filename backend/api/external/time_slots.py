from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.api.auth import get_current_user
from backend.dependes import get_time_slots_facade
from backend.schemas.time_slots_schema import (
    TimeSlotsCreateRequest,
    TimeSlotsCreateResponse,
    TimeSlotsSelfCreateRequest,
    SelfTimeSlotsGetResponse,
    ExternalTimeSlotsGetResponse,
    UpdateTimeSlotsRequest,
    TimeSlotsModelPydantic
)
from backend.facade.time_slots_facade import TimeSlotsFacade
from backend.exceptions import (
    UserDoesNotExistsError,
    ShareTokenDoesNotExistsError,
    TimeSlotOverlapError
)


time_slots_router_external = APIRouter(prefix='/time_slots')
time_slots_router_external.tags = ["Time Slots"]


@time_slots_router_external.put('/', response_model=TimeSlotsCreateResponse)
async def book_time_slot(
        booking_data: TimeSlotsCreateRequest,
        current_user_id: UUID = Depends(get_current_user),
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        slot = await time_slots_facade.create_time_slot(
            owner_token=booking_data.owner_token,
            invited_user_id=current_user_id,
            meet_start_at=booking_data.meet_start_at,
            meet_end_at=booking_data.meet_end_at,
            title=booking_data.title,
            description=booking_data.description
        )
        return TimeSlotsCreateResponse(id=slot)
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except ShareTokenDoesNotExistsError:
        raise HTTPException(status_code=404, detail="Incorrect token")


@time_slots_router_external.put('/self/', response_model=TimeSlotsCreateResponse)
async def book_self_time_slot(
        booking_data: TimeSlotsSelfCreateRequest,
        current_user_id: UUID = Depends(get_current_user),
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        slot = await time_slots_facade.create_self_time_slot(
            user_id=current_user_id,
            meet_start_at=booking_data.meet_start_at,
            meet_end_at=booking_data.meet_end_at,
            title=booking_data.title,
            description=booking_data.description
        )
        return TimeSlotsCreateResponse(id=slot)
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except TimeSlotOverlapError:
        raise HTTPException(status_code=409, detail="Time slot overlap")


@time_slots_router_external.get('/self/{target_date}', response_model=SelfTimeSlotsGetResponse)
async def get_self_time_slots(
        target_date: date,
        current_user_id: UUID = Depends(get_current_user),
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        time_slots = await time_slots_facade.get_self_time_slot(
            user_id=current_user_id,
            target_date=target_date
        )
        return time_slots
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")


@time_slots_router_external.get(
    '/{owner_token}/{target_date}',
    response_model=ExternalTimeSlotsGetResponse
)
async def get_external_time_slots(
        owner_token: str,
        target_date: date,
        current_user_id: UUID = Depends(get_current_user),
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        time_slots = await time_slots_facade.get_external_time_slots(
            user_id=current_user_id,
            owner_token=owner_token,
            target_date=target_date
        )
        return ExternalTimeSlotsGetResponse(time_slots=time_slots)
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except ShareTokenDoesNotExistsError:
        raise HTTPException(status_code=404, detail="Incorrect token")


@time_slots_router_external.patch('/', response_model=TimeSlotsModelPydantic)
async def update_time_slot(
        update_data: UpdateTimeSlotsRequest,
        current_user_id: UUID = Depends(get_current_user),
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


@time_slots_router_external.delete('/self/{time_slot_id}')
async def delete_time_slot(
        time_slot_id: UUID,
        current_user_id: UUID = Depends(get_current_user),
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    await time_slots_facade.delete_self_time_slot(user_id=current_user_id, time_slot_id=time_slot_id)
