from fastapi import APIRouter

from backend.api.user import user_router


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(user_router)
