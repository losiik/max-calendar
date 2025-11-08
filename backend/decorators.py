import functools
from contextvars import Token

from backend.database import async_session_factory, _session


def background_session(func):
    """
    Для фоновых тасок: игнорируем текущий db.session,
    создаём свою AsyncSession и вкидываем её в ContextVar.
    """
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        # создаём новую сессию независимо от контекста
        async with async_session_factory() as new_sess:
            token: Token = _session.set(new_sess)
            try:
                return await func(*args, **kwargs)
            finally:
                _session.reset(token)
    return wrapper
