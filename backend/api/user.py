from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.dependes import get_user_service
from backend.schemas.user_schema import UserCreateRequest, UserCreateResponse, UserResponse
from backend.services.user_service import UserService
from backend.exceptions import UserAlreadyExistsError

import logging


user_router = APIRouter(prefix='/users')
user_router.tags = ["User"]


@user_router.put('/', response_model=UserCreateResponse)
async def create_user(
        user_data: UserCreateRequest,
        user_service: UserService = Depends(get_user_service)
):
    try:
        user = await user_service.create(
            max_id=user_data.max_id,
            name=user_data.name,
            username=user_data.username
        )

        return UserCreateResponse(id=user.id)
    except UserAlreadyExistsError:
        raise HTTPException(status_code=409, detail={"detail": "User already exists"})
    except Exception as e:
        logging.error(str(e))
        raise HTTPException(status_code=500, detail={"detail": "Internal server error"})


@user_router.put('/', response_model=UserResponse)
async def get_user(
        max_id: int,
        user_service: UserService = Depends(get_user_service)
):
    user = await user_service.find_by_max_id(max_id=max_id)
    if user:
        return UserResponse(
            id=user.id,
            max_id=user.max_id,
            name=user.name,
            username=user.username
        )
    raise HTTPException(status_code=409, detail={"detail": "User does not exists"})
