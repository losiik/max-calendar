import os
import uvicorn

from dotenv import load_dotenv
from yoyo import get_backend, read_migrations

if os.path.exists('.env'):
    load_dotenv('.env')

from backend.database import AsyncDBSessionMiddleware

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.settings.settings import settings
from backend.api.routers import api_router_external, api_router_internal
from backend.enums.profile_enum import Profile

from pathlib import Path

MIGRATIONS_PATH = Path(__file__).parent / "migrations" / "yoyo"

# При использовании yoyo-миграций
backend = get_backend(settings.sql_alchemy_connection_url.replace("+asyncpg", ""))
migrations = read_migrations(str(MIGRATIONS_PATH))

with backend.lock():
    backend.apply_migrations(backend.to_apply(migrations))


if settings.profile == Profile.PROD:
    app = FastAPI(openapi_prefix="/", docs_url=None, redoc_url=None, openapi_url=None)
else:
    app = FastAPI(openapi_prefix="/")

# Middlewares
app.add_middleware(
    AsyncDBSessionMiddleware,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aeroserg.github.io",
        "http://localhost:9000",
        "http://bot",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router_external)
app.include_router(api_router_internal)


if __name__ == "__main__":
    uvicorn.run(app, port=settings.port)
