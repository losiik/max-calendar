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

    if "user" in params:
        params["user"] = json.loads(params["user"])

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

    return {
        "params": params,
        "correct": calculated_hash == received_hash
    }


if __name__ == "__main__":
    # Пример данных из документации
    test_init_data = "ip=79.104.38.102&user=%7B%22id%22%3A5933603%2C%22first_name%22%3A%22%D0%A1%D0%B5%D1%80%D0%B3%D0%B5%D0%B9%22%2C%22last_name%22%3A%22%22%2C%22username%22%3Anull%2C%22language_code%22%3A%22ru%22%2C%22photo_url%22%3A%22https%3A%2F%2Fi.oneme.ru%2Fi%3Fr%3DBTGBPUwtwgYUeoFhO7rESmr81M_4nx97oU2nFSrj5R6ZuVxrYpcuZYQ8DeRx33ZwTvM%22%7D&query_id=9ba0888b-b504-4251-a6ef-8a4d0d1d44fd&auth_date=1763078704&hash=1a48a6ec6af4c9433335bc0349958e1b9d45d9cdf655a35e84d7c326ec9b38e1&chat=%7B%22id%22%3A74771308%2C%22type%22%3A%22DIALOG%22%7D"
    test_bot_token = "f9LHodD0cOK71zkbeDvAE2bYxTfQpnLiG3QbVAmq0acBjJxI7Bc1VnBOjJzYLwtLqYPL4wtxA2NfBXuftlRv"

    result = validate_max_webapp_data(test_init_data, test_bot_token)
    print(result)
    print(f"Валидация: {'Успешна' if result else 'Неуспешна'}")

    # Пример с подделанными данными
    fake_init_data = test_init_data.replace("400", "999")
    result_fake = validate_max_webapp_data(fake_init_data, test_bot_token)
    print(f"Валидация подделанных данных: {'Успешна' if result_fake else 'Неуспешна'}")