from maxapi import Router
from maxapi.types import MessageCreated

from max_bot.services.share_service import ShareService
from max_bot.dependes import get_share_service

share_router = Router()


@share_router.bot_started()
async def get_share_link(
        event: MessageCreated,
        share_service: ShareService = get_share_service()
):
    link = await share_service.get_share_link(max_id=event.message.from_user.user_id)

    await event.message.answer(text=link)
