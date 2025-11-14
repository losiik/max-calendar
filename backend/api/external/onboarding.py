from uuid import UUID

from fastapi import APIRouter, Depends

from backend.api.auth import get_current_user
from backend.dependes import get_onboarding_service
from backend.services.onboarding_service import OnboardingService
from backend.schemas.onboarding_schema import OnboardingResponse


onboarding_router_external = APIRouter(prefix='/onboarding')
onboarding_router_external.tags = ["Onboarding"]


@onboarding_router_external.put('/', response_model=OnboardingResponse)
async def create_onboarding(
        current_user_id: UUID = Depends(get_current_user),
        onboarding_service: OnboardingService = Depends(get_onboarding_service)
):
    try:
        onboarding = await onboarding_service.create_onboarding(user_id=current_user_id)
        return OnboardingResponse(success=True)
    except:
        return OnboardingResponse(success=False)


@onboarding_router_external.get('/', response_model=OnboardingResponse)
async def get_onboarding(
        current_user_id: UUID = Depends(get_current_user),
        onboarding_service: OnboardingService = Depends(get_onboarding_service)
):
    onboarding = await onboarding_service.get_onboarding(user_id=current_user_id)
    if onboarding:
        return OnboardingResponse(success=True)
    return OnboardingResponse(success=False)


@onboarding_router_external.delete('/', response_model=OnboardingResponse)
async def delete_onboarding(
        current_user_id: UUID = Depends(get_current_user),
        onboarding_service: OnboardingService = Depends(get_onboarding_service)
):
    try:
        onboarding = await onboarding_service.delete_onboarding(user_id=current_user_id)
        return OnboardingResponse(success=True)
    except:
        return OnboardingResponse(success=False)
