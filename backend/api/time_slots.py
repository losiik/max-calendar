from datetime import date

from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.dependes import get_time_slots_facade
from backend.schemas.time_slots_schema import (
    TimeSlotsCreateRequest,
    TimeSlotsCreateResponse,
    TimeSlotsSelfCreateRequest,
    SelfTimeSlotsGetResponse,
    ExternalTimeSlotsGetResponse
)
from backend.facade.time_slots_facade import TimeSlotsFacade
from backend.exceptions import UserDoesNotExistsError, ShareTokenDoesNotExistsError


time_slots_router = APIRouter(prefix='/time_slots')
time_slots_router.tags = ["Time Slots"]


@time_slots_router.put('/', response_model=TimeSlotsCreateResponse)
async def book_time_slot(
        booking_data: TimeSlotsCreateRequest,
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        slot = await time_slots_facade.create_time_slot(
            owner_token=booking_data.owner_token,
            invited_max_id=booking_data.invited_max_id,
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


@time_slots_router.put('/self/', response_model=TimeSlotsCreateResponse)
async def book_self_time_slot(
        booking_data: TimeSlotsSelfCreateRequest,
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    try:
        slot = await time_slots_facade.create_self_time_slot(
            max_id=booking_data.max_id,
            meet_start_at=booking_data.meet_start_at,
            meet_end_at=booking_data.meet_end_at,
            title=booking_data.title,
            description=booking_data.description
        )
        return TimeSlotsCreateResponse(id=slot)
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")


@time_slots_router.get('/self/{max_id}/{target_date}', response_model=SelfTimeSlotsGetResponse)
async def get_my_time_slots(
        max_id: int,
        target_date: date,
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    time_slots = await time_slots_facade.get_self_time_slot(
        max_id=max_id,
        target_date=target_date
    )
    return time_slots


@time_slots_router.get(
    '/{invited_max_id}/{owner_hash}/{target_date}',
    response_model=ExternalTimeSlotsGetResponse
)
async def get_external_time_slots(
        invited_max_id: int,
        owner_hash: str,
        target_date: date,
        time_slots_facade: TimeSlotsFacade = Depends(get_time_slots_facade)
):
    pass


# @time_slots_router.patch('/', response_model=UserCreateResponse)
# async def update_time_slot(
#         user_data: UserCreateRequest,
#         user_service: UserService = Depends(get_user_service)
# ):
#     pass
