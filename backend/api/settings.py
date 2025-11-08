from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.dependes import get_settings_facade
from backend.schemas.settings_schema import (
    SettingsCreateRequest,
    SettingsResponse,
    SettingsUpdateRequest
)
from backend.facade.settings_facade import SettingsFacade
from backend.exceptions import UserDoesNotExistsError


settings_router = APIRouter(prefix='/settings')
settings_router.tags = ["Settings"]


@settings_router.put('/', response_model=SettingsResponse)
async def add_settings(
        max_id: int,
        settings_data: SettingsCreateRequest,
        settings_facade: SettingsFacade = Depends(get_settings_facade)
):
    try:
        settings = await settings_facade.create_user_settings(
            max_id=max_id,
            settings=settings_data
        )

        return settings
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except:
        raise HTTPException(status_code=500, detail="Internal server error")


@settings_router.patch('/', response_model=SettingsResponse)
async def update_settings(
        max_id: int,
        update_data: SettingsUpdateRequest,
        settings_facade: SettingsFacade = Depends(get_settings_facade)
):
    try:
        settings = await settings_facade.update_settings(
            max_id=max_id,
            timezone=update_data.timezone,
            work_time_start=update_data.work_time_start,
            work_time_end=update_data.work_time_end,
            alert_offset_minutes=update_data.alert_offset_minutes,
            daily_reminder_time=update_data.daily_reminder_time,
            working_days=update_data.working_days
        )
        return settings
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except:
        raise HTTPException(status_code=500, detail="Internal server error")


@settings_router.get('/', response_model=SettingsResponse)
async def get_settings(
        max_id: int,
        settings_facade: SettingsFacade = Depends(get_settings_facade)
):
    try:
        settings = await settings_facade.get_settings(
            max_id=max_id
        )

        return settings
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except:
        raise HTTPException(status_code=500, detail="Internal server error")
