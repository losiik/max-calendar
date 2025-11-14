import json
from datetime import datetime, timedelta, timezone
import jwt
import hmac
import hashlib
from urllib.parse import unquote
from typing import Any
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.settings.settings import settings


# Конфигурация JWT
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

security = HTTPBearer()


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен истёк",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token_data: dict = Depends(verify_token)) -> UUID:
    user_id = token_data.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидные данные токена"
        )

    return UUID(user_id)


def validate_max_webapp_data(init_data: str, bot_token: str) -> dict[str, Any]:
    decoded_data = unquote(init_data)

    params = {}
    received_hash = None

    for pair in decoded_data.split('&'):
        if '=' in pair:
            key, value = pair.split('=', 1)
            if key == 'hash':
                received_hash = value
            else:
                params[key] = value

    if not received_hash:
        return {
            "params": params,
            "correct": False
        }

    sorted_keys = sorted(params.keys())
    data_check_string = '\n'.join([f"{key}={params[key]}" for key in sorted_keys])

    secret_key = hmac.new(
        key="WebAppData".encode('utf-8'),
        msg=bot_token.encode('utf-8'),
        digestmod=hashlib.sha256
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode('utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()

    if "user" in params:
        params["user"] = json.loads(params["user"])

    return {
        "params": params,
        "correct": calculated_hash == received_hash
    }
