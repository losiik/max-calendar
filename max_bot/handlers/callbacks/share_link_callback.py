from maxapi.types import MessageCallback
from maxapi import F
from maxapi import Router

from max_bot.services.share_service import ShareService
from max_bot.dependes import get_share_service


share_link_router = Router()


@share_link_router.message_callback(F.callback.payload == 'share_link')
async def share_link_callback(
        callback: MessageCallback,
        share_service: ShareService = get_share_service()
):
    link = await share_service.get_share_link(max_id=callback.from_user.user_id)

    await callback.message.answer(text=link)
