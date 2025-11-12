import json
import logging
import asyncio
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
        self.max_retries = 3
        self.delay = 0.5

    def _build_prompt(self, message: str) -> str:
        return f"""
        Ты — ассистент, который извлекает данные о встречах из текста.

        Верни ответ строго в формате JSON без пояснений.
        Все ключи должны присутствовать, даже если значение null.

        ⚙️ Формат вывода:
        Верни строго JSON без пояснений, только объект, со следующими ключами:
        - "title": str — название встречи;
        - "meet_start_at": str или null — время начала (в 24-часовом формате HH:MM);
        - "meet_end_at": str или null — время конца (в 24-часовом формате HH:MM);
        - "description": str — краткое описание;
        - "date": str или null — дата в строгом формате ISO (YYYY-MM-DD);
        - "weekday": str или null — день недели ('пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс');
        - "is_today": bool или null;
        - "is_tomorrow": bool или null;
        - "is_after_tomorrow": bool или null.

        ❗ ВАЖНО:
        - Формат даты всегда должен быть YYYY-MM-DD (например, "2025-11-19").
        - Никогда не используй точки, слэши или сокращения вроде "19.11." или "19/11".
        - Если дата указана словами ("завтра", "послезавтра") — вычисли и подставь ISO-дату.
        - Если дата не указана явно — верни "date": null.
        - Если указан только день недели (например, "в понедельник") — верни "weekday": "пн", но "date": null.
        - Все ключи должны присутствовать, даже если значение null.
        
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

        for attempt in range(1, self.max_retries + 1):
            try:
                response = await self.giga.achat(prompt)
                content = response.choices[0].message.content.strip()

                # Попытка распарсить JSON
                parsed = json.loads(content)

                # Гарантируем наличие всех ключей
                for key in [
                    "title", "meet_start_at", "meet_end_at", "description",
                    "date", "weekday", "is_today", "is_tomorrow", "is_after_tomorrow"
                ]:
                    parsed.setdefault(key, None)

                return parsed

            except json.JSONDecodeError:
                if attempt < self.max_retries:
                    logging.info(f"⚠️ Ошибка парсинга JSON, попытка {attempt}/{self.max_retries}... повтор через {delay}s")
                    await asyncio.sleep(self.delay)
                else:
                    print("❌ Не удалось получить корректный JSON после 3 попыток.")
                    return None
            except Exception as e:
                print(f"❌ Ошибка при вызове GigaChat: {e}")
                return None
