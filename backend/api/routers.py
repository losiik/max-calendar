from fastapi import APIRouter

from backend.api.user import user_router
from backend.api.settings import settings_router
from backend.api.share import share_router
from backend.api.time_slots import time_slots_router
from backend.api.reminder import reminder_router


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(user_router)
api_router.include_router(settings_router)
api_router.include_router(share_router)
api_router.include_router(time_slots_router)
api_router.include_router(reminder_router)
