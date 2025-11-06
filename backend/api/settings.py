from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.dependes import get_settings_facade
from backend.schemas.settings_schema import SettingsCreateRequest, SettingsModelPydantic
from backend.facade.settings_facade import SettingsFacade
from backend.exceptions import UserDoesNotExistsError


settings_router = APIRouter(prefix='/settings')
settings_router.tags = ["Settings"]


@settings_router.put('/', response_model=SettingsModelPydantic)
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
        raise HTTPException(status_code=409, detail={"detail": "User does not exists"})
    except:
        raise HTTPException(status_code=500, detail={"detail": "Internal server error"})
