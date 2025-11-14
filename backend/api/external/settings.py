from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.api.auth import get_current_user
from backend.dependes import get_settings_facade
from backend.schemas.settings_schema import (
    SettingsCreateRequest,
    SettingsResponse,
    SettingsUpdateRequest
)
from backend.facade.settings_facade import SettingsFacade
from backend.exceptions import UserDoesNotExistsError


settings_router_external = APIRouter(prefix='/settings')
settings_router_external.tags = ["Settings"]


@settings_router_external.put('/', response_model=SettingsResponse)
async def add_settings(
        settings_data: SettingsCreateRequest,
        current_user_id: UUID = Depends(get_current_user),
        settings_facade: SettingsFacade = Depends(get_settings_facade)
):
    try:
        settings = await settings_facade.create_user_settings(
            user_id=current_user_id,
            settings=settings_data
        )

        return settings
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except:
        raise HTTPException(status_code=500, detail="Internal server error")


@settings_router_external.patch('/', response_model=SettingsResponse)
async def update_settings(
        update_data: SettingsUpdateRequest,
        current_user_id: UUID = Depends(get_current_user),
        settings_facade: SettingsFacade = Depends(get_settings_facade)
):
    try:
        settings = await settings_facade.update_settings(
            user_id=current_user_id,
            timezone=update_data.timezone,
            work_time_start=update_data.work_time_start,
            work_time_end=update_data.work_time_end,
            duration_minutes=update_data.duration_minutes,
            alert_offset_minutes=update_data.alert_offset_minutes,
            daily_reminder_time=update_data.daily_reminder_time,
            working_days=update_data.working_days
        )
        return settings
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except:
        raise HTTPException(status_code=500, detail="Internal server error")


@settings_router_external.get('/', response_model=SettingsResponse)
async def get_settings(
        current_user_id: UUID = Depends(get_current_user),
        settings_facade: SettingsFacade = Depends(get_settings_facade)
):
    try:
        settings = await settings_facade.get_settings(
            user_id=current_user_id
        )

        return settings
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except:
        raise HTTPException(status_code=500, detail="Internal server error")
