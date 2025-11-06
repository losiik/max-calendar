from contextvars import ContextVar
from typing import AsyncGenerator, Optional, Dict

from fastapi_sqlalchemy.exceptions import MissingSessionError
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.types import ASGIApp

from settings.settings import settings


DATABASE_URL = settings.sql_alchemy_connection_url

# Создаем движок один раз
async_engine = create_async_engine(
    DATABASE_URL,
    echo=settings.sql_echo,
    pool_size=50,
    max_overflow=10,
    pool_pre_ping=True
)

# Создаем фабрику сессий один раз
async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# Асинхронная функция-генератор для внедрения зависимостей FastAPI
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


# Функция для очистки ресурсов движка (вызывается в lifespan)
async def dispose_engine():
    """Dispose of the SQLAlchemy engine."""
    await async_engine.dispose()


class Base(DeclarativeBase):
    pass


class Boolean:
    def __init__(self, value: bool):
        self.value: bool = value


_session: ContextVar[Optional[AsyncSession]] = ContextVar("_session", default=None)
close_session_after_exit: ContextVar[Optional[Boolean]] = ContextVar("close_session_after_exit", default=None)


class AsyncDBSessionMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        session_args: Dict = None,
        commit_on_exit: bool = False,
    ):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        async with db():
            response = await call_next(request)
        return response


class DBSessionMeta(type):
    @property
    def session(self) -> AsyncSession:
        """Return an instance of Session local to the current async context."""
        session = _session.get()
        if session is None:
            raise MissingSessionError
        return session

    def set_close_session_after_exit(self, value: bool):
        close_session_after_exit.get().value = value


class DBSession(metaclass=DBSessionMeta):
    def __init__(self):
        self.token = None
        self.token_close_session_after_exit = None

    async def __aenter__(self):
        async with async_session_factory() as session:
            self.token = _session.set(session)
            boolean = Boolean(True)
            self.token_close_session_after_exit = close_session_after_exit.set(boolean)

    async def __aexit__(self, exc_type, exc_value, traceback):
        if close_session_after_exit.get().value is False:
            return

        sess = _session.get()
        try:
            if exc_type is not None:
                await sess.rollback()
            else:
                await sess.commit()
        finally:
            await sess.close()
            _session.reset(self.token)


async def commit_and_close_session():
    sess = _session.get()
    await sess.commit()
    await sess.close()


async def rollback_and_close_session():
    sess = _session.get()
    await sess.commit()
    await sess.close()


db: DBSessionMeta = DBSession
