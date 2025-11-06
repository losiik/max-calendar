import os
import secrets

import uvicorn

from dotenv import load_dotenv
from yoyo import get_backend, read_migrations

if os.path.exists('.env'):
    load_dotenv('.env')

from backend.database import AsyncDBSessionMiddleware

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from settings.settings import settings
from backend.api.routers import api_router

# При использовании yoyo-миграций
backend = get_backend(settings.sql_alchemy_connection_url.replace("+asyncpg", ""))
migrations = read_migrations('./migrations/yoyo')

with backend.lock():
    backend.apply_migrations(backend.to_apply(migrations))


app = FastAPI(openapi_prefix="/")

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    AsyncDBSessionMiddleware,
)


# Routers
app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run(app, port=settings.port)
