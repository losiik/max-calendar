from typing import Optional

from fastapi import APIRouter, Depends

from backend.dependes import get_onboarding_facade
from backend.facade.onboarding_facade import OnboardingFacade
from backend.schemas.onboarding_schema import OnboardingModelPydantic, OnboardingResponse


onboarding_router = APIRouter(prefix='/onboarding')
onboarding_router.tags = ["Onboarding"]


@onboarding_router.put('/', response_model=OnboardingResponse)
async def create_onboarding(
        max_id: int,
        onboarding_facade: OnboardingFacade = Depends(get_onboarding_facade)
):
    try:
        onboarding = await onboarding_facade.create_onboarding(max_id=max_id)
        return OnboardingResponse(success=True)
    except:
        return OnboardingResponse(success=False)


@onboarding_router.get('/', response_model=OnboardingResponse)
async def get_onboarding(
        max_id: int,
        onboarding_facade: OnboardingFacade = Depends(get_onboarding_facade)
):
    onboarding = await onboarding_facade.get_onboarding(max_id=max_id)
    if onboarding:
        return OnboardingResponse(success=True)
    return OnboardingResponse(success=False)


@onboarding_router.delete('/', response_model=OnboardingResponse)
async def delete_onboarding(
        max_id: int,
        onboarding_facade: OnboardingFacade = Depends(get_onboarding_facade)
):
    try:
        onboarding = await onboarding_facade.delete_onboarding(max_id=max_id)
        return OnboardingResponse(success=True)
    except:
        return OnboardingResponse(success=False)
