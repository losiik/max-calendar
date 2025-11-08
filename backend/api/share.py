from fastapi import APIRouter, Depends
from fastapi import HTTPException

from backend.dependes import get_share_facade
from backend.facade.share_facade import ShareFacade
from backend.schemas.share_schema import ShareTokenResponse
from backend.exceptions import UserDoesNotExistsError


share_router = APIRouter(prefix='/share')
share_router.tags = ["Share"]


@share_router.get('/{max_id}', response_model=ShareTokenResponse)
async def get_share_token(
        max_id: int,
        share_facade: ShareFacade = Depends(get_share_facade)
):
    try:
        token = await share_facade.get_share_token(max_id=max_id)
        return ShareTokenResponse(token=token)
    except UserDoesNotExistsError:
        raise HTTPException(status_code=409, detail="User does not exists")
    except:
        raise HTTPException(status_code=500, detail="Internal server error")
