import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from gigachat import GigaChatAsyncClient

from backend.settings.settings import Settings


class GigachatClient:
    def __init__(
        self,
        settings: Settings,
        scope: str = "GIGACHAT_API_PERS",
        model: str = "GigaChat"
    ):
        self.giga = GigaChatAsyncClient(
            credentials=settings.gigachat_api_key,
            scope=scope,
            model=model,
            verify_ssl_certs=False
        )

    def _build_prompt(self, message: str) -> str:
        return f"""
        Ты — ассистент, который извлекает данные о встречах из текста.

        Верни ответ строго в формате JSON без пояснений.
        Все ключи должны присутствовать, даже если значение null.

        Если дата не указана явно, поле "date" должно быть null.
        Если указан только день недели (например, "в понедельник"),
        поле "weekday" должно содержать этот день в коротком формате:
        "пн", "вт", "ср", "чт", "пт", "сб", "вс".

        Если дата указана словами:
        - "сегодня" → is_today = true
        - "завтра" → is_tomorrow = true
        - "послезавтра" → is_after_tomorrow = true

        Пример 1:
        Вход: "запланируй встречу на завтра с 18:00 до 20:00"
        Выход:
        {{
          "title": "Встреча",
          "meet_start_at": "18:00",
          "meet_end_at": "20:00",
          "description": "Встреча, как указано в тексте",
          "date": null,
          "weekday": null,
          "is_today": false,
          "is_tomorrow": true,
          "is_after_tomorrow": false
        }}

        Пример 2:
        Вход: "поставь встречу на 7 вечера в понедельник"
        Выход:
        {{
          "title": "Встреча",
          "meet_start_at": "19:00",
          "meet_end_at": null,
          "description": "Встреча в понедельник в 19:00",
          "date": null,
          "weekday": "пн",
          "is_today": null,
          "is_tomorrow": null,
          "is_after_tomorrow": null
        }}

        Текст: "{message}"
        """

    async def parse_message(self, message: str) -> Optional[Dict[str, Any]]:
        prompt = self._build_prompt(message)

        response = await self.giga.achat(prompt)

        content = response.choices[0].message.content

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            return None

        for key in [
            "title", "meet_start_at", "meet_end_at", "description",
            "date", "weekday", "is_today", "is_tomorrow", "is_after_tomorrow"
        ]:
            parsed.setdefault(key, None)

        return parsed
