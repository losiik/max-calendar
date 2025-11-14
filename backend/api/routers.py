from fastapi import APIRouter

from backend.api.external import (
    onboarding_router_external,
    settings_router_external,
    time_slots_router_external,
    user_router_external
)

from backend.api.internal import (
    reminder_router_internal,
    share_router_internal,
    time_slots_router_internal,
    user_router_internal
)


api_router_external = APIRouter(prefix="/api/v1")
api_router_external.include_router(onboarding_router_external)
api_router_external.include_router(settings_router_external)
api_router_external.include_router(time_slots_router_external)
api_router_external.include_router(user_router_external)

api_router_internal = APIRouter(prefix="/internal/api/v1")
api_router_internal.include_router(reminder_router_internal)
api_router_internal.include_router(share_router_internal)
api_router_internal.include_router(time_slots_router_internal)
api_router_internal.include_router(user_router_internal)