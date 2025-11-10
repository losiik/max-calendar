import os

from dotenv import load_dotenv

if os.path.exists('../.env'):
    load_dotenv('../.env')

import base64
import datetime
import json
import uuid

import jwt
from jwt import PyJWK

import requests

from backend.settings.settings import settings

# Разбор ключа SDK
# Ключ содержит идентификатор проекта и JWK, который используется для подписи JWT
sdk_key_encoded = settings.sber_api_key
sdk_key = json.loads(base64.b64decode(sdk_key_encoded))

# В заголовке JWT нужно указать идентификатор ключа и алгоритм подписи
# Алгоритм можно определить по полю kty и другим параметрам ключа sdk_key['key']
# Например, для kty=EC и crv=P-384 следует указывать алгоритм ES384
# Описание алгоритмов и их кодов можно изучить по ссылке https://datatracker.ietf.org/doc/html/rfc7518#section-3.1
jwt_header = {
    'typ': 'JWT',
    "alg": 'ES384',
    'kid': sdk_key['key']['kid'],
}

# Тело JWT
iat = datetime.datetime.now(datetime.UTC)
exp = iat + datetime.timedelta(hours=1)
jti = str(uuid.uuid4())
jwt_payload = {
    "iat": iat,
    "exp": exp,
    "jti": jti,
    "sdkProjectId": sdk_key['projectId'],
    # В поле sub нужно передать идентификатор пользователя в бэкенде вашего приложения
    # Идентификатор должен соответствовать формату UUID4
    "sub": '15eca6c5-fb2d-48f2-804a-f97e542ebd33',
    #'userName': 'User Name',
    #'userEmail': 'user@email',
}

# Подпись JWT
jwk = PyJWK.from_dict(sdk_key['key'], algorithm='ES384')
jws = jwt.encode(headers=jwt_header, payload=jwt_payload, key=jwk.key, algorithm='ES384')
print(jws)  # Вывод строки с транспортным токеном

headers = {
    'Accept': 'application/json',
    'Authorization': f'Bearer {jws}'
}
transport_token = requests.post(
    url="https://api.salutejazz.ru/v1/auth/login",
    headers=headers
).json()

print(transport_token['token'])


headers_room = {
    'Authorization': f'Bearer {transport_token["token"]}'
}

body = {
  "roomTitle": "Мастер-класс",
  "serverVideoRecordAutoStartEnabled": False,
  "roomType": "MEETING",
  "webinar": {
    "reusable": False,
    "scheduledAt": "2024-10-11T12:37:27.065710Z",
    "description": "На этой встрече вы узнаете много нового."
  },
  "transcriptionAutoStartEnabled": False,
  "summarizationEnabled": False
}

room = requests.post(
    url="https://api.salutejazz.ru/v1/room/create",
    headers=headers,
    json=body
).json()

print(room)

