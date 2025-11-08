from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.dependes import get_time_slots_service
from backend.schemas.time_slots_schema import TimeSlotsCreateRequest
from backend.services.time_slots_service import TimeSlotsService
from backend.exceptions import UserAlreadyExistsError


time_slots_router = APIRouter(prefix='/time_slots')
time_slots_router.tags = ["Time Slots"]


@time_slots_router.put('/', response_model=UserCreateResponse)
async def book_time_slot(
        book_data: TimeSlotsCreateRequest,
        user_service: TimeSlotsService = Depends(get_time_slots_service)
):
    pass


@time_slots_router.get('/my/', response_model=UserCreateResponse)
async def get_my_time_slots(
        user_data: UserCreateRequest,
        user_service: UserService = Depends(get_user_service)
):
    pass


@time_slots_router.get('/', response_model=UserCreateResponse)
async def get_time_slots(
        user_data: UserCreateRequest,
        user_service: UserService = Depends(get_user_service)
):
    pass


@time_slots_router.patch('/', response_model=UserCreateResponse)
async def update_time_slot(
        user_data: UserCreateRequest,
        user_service: UserService = Depends(get_user_service)
):
    pass
