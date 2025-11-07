from fastapi import APIRouter, Depends

from backend.dependes import get_share_facade
from backend.facade.share_facade import ShareFacade


share_router = APIRouter(prefix='/share')
share_router.tags = ["Share"]


@share_router.get('/{max_id}', response_model=str)
async def get_share_token(
        max_id: int,
        share_facade: ShareFacade = Depends(get_share_facade)
):
    token = await share_facade.get_share_token(max_id=max_id)
    return token
