from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.api.auth import get_current_user, create_access_token, validate_max_webapp_data
from backend.dependes import get_user_service, get_share_facade
from backend.schemas.user_schema import (
    UserResponse,
    UserNameResponse
)
from backend.schemas.token_schema import InputData, TokenResponse
from backend.services.user_service import UserService
from backend.facade.share_facade import ShareFacade
from backend.exceptions import UserAlreadyExistsError
from backend.settings.settings import settings

import logging


user_router_external = APIRouter(prefix='/users')
user_router_external.tags = ["User"]


@user_router_external.put('/', response_model=TokenResponse)
async def create_user(
        data: InputData,
        user_service: UserService = Depends(get_user_service)
):
    validated_data = validate_max_webapp_data(init_data=data.input_data, bot_token=settings.max_api_key)
    if not validated_data['correct']:
        raise HTTPException(status_code=400, detail="Input data is incorrect")

    try:
        user = await user_service.create(
            max_id=validated_data['params']['user']['id'],
            name=f"{validated_data['params']['user']['first_name']} {validated_data['params']['user']['last_name']}",
            username=validated_data['params']['user']['username']
        )

        token_data = {
            "user_id": user.id
        }

        access_token = create_access_token(
            data=token_data
        )

        return TokenResponse(token=access_token)
    except UserAlreadyExistsError:
        raise HTTPException(status_code=409, detail="User already exists")
    except Exception as e:
        logging.error(str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@user_router_external.get('/', response_model=UserResponse)
async def get_user(
        current_user_id: UUID = Depends(get_current_user),
        user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_by_user_id(user_id=current_user_id)
    if user:
        return UserResponse(
            id=user.id,
            max_id=user.max_id,
            name=user.name,
            username=user.username
        )
    raise HTTPException(status_code=409, detail="User does not exists")


@user_router_external.get('/by/token/{token}', response_model=UserNameResponse)
async def get_name_by_token(
        token: str,
        share_facade: ShareFacade = Depends(get_share_facade)
):
    user = await share_facade.get_user_by_token(token=token)
    return UserNameResponse(name=user.name)
