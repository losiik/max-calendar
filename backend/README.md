# Backend

## Назначение
FastAPI сервис хранит пользователей MAX, их настройки рабочего времени и заявки на встречи. Он обслуживает три клиента: фронтенд WebApp, MAX бот и cron сервис напоминаний.

## Архитектура
Входные точки находятся в `api/*` и сгруппированы по доменам (users, settings, share, time_slots, reminder). Каждый роутер обращается к фасадам (`facade/*`), фасады оркестрируют доменные сервисы (`services/*`), которые инкапсулируют бизнес-логику и вызывают репозитории (`repository/*`) поверх SQLAlchemy. Такой слой фасадов позволяет переиспользовать сценарии между HTTP, ботом и cron без дублирования. Работа с БД ведётся через Async SQLAlchemy + FastAPI SQLAlchemy middleware. Миграции выполняются yoyo при старте. Внешние интеграции собраны в `client/` (например, `SberJazzClient` создаёт встречи на платформе Salute Jazz). Сигналы (`signals.py`) рассылают события регистрации и создания слота, что позволяет триггерить асинхронные уведомления.

## Основные модули
`api/user.py` - создание и чтение пользователей по `max_id`.  
`api/share.py` - выдача токена для расшаривания календаря.  
`api/time_slots.py` - операции со слотами (создание, подтверждение, удаление, получение self и external расписаний).  
`api/settings.py` - CRUD настроек рабочего времени, продолжительности и уведомлений.  
`api/reminder.py` - ручка, которую дергает cron, чтобы рассылать напоминания.

## База данных и модели
PostgreSQL 16 используется как основное хранилище. Модели `models/models.py` описывают таблицы `user`, `settings`, `time_slots`, `share`, `time_slot_alert`. Каждая сущность имеет UUID первичный ключ. Repository слой строит SQL запросы через SQLAlchemy Core/ORM, а сервисы возвращают Pydantic-модели (`schemas/*`). Миграции лежат в `migrations/yoyo`; `backend/main.py` применяет их автоматически.

## Переменные окружения
DB_HOST, DB_PORT, DB_MAIN_DATABASE, DB_USER, DB_PASSWORD - параметры подключения к PostgreSQL.  
MAX_API_KEY - токен MAX бота (используется для регистрации и нотификаций).  
SBER_API_KEY - JSON Web Key для доступа к Salute Jazz API.  
PORT - опциональный порт FastAPI (по умолчанию 9000).  
Любые дополнительные переменные можно положить в `backend/.env`, который подключается при старте.

## Локальный запуск
1. Создайте и заполните `backend/.env` переменными из раздела выше.  
2. Установите зависимости: `pip install -r backend/requirements.txt`.  
3. Запустите Postgres (локально или через docker).  
4. Выполните `uvicorn backend.main:app --reload --port 9000`. Миграции применятся автоматически.  
5. Swagger доступен по `/docs`, а REST ручки - по `/api/v1/*`.

## Тестовый прогон без Docker
Вместо uvicorn можно запустить `python backend/main.py`. Для применения миграций вручную используйте `yoyo apply --database postgresql://user:pass@host:port/db backend/migrations/yoyo`.

## Docker
`backend/Dockerfile` собирает образ из python:3.12, копирует монорепозиторий, устанавливает зависимости из `backend/requirements.txt` и выставляет `PYTHONPATH=/app`. В docker-compose сервис поднимается с командой `uvicorn backend.main:app --host 0.0.0.0 --port 9090`. Переменные подставляются из `backend/.env`. При деплое на сервер добавьте реверс-прокси (например, nginx) для TLS и rate limiting.

### requirements.txt
Основные зависимости backend указаны в `backend/requirements.txt` с фиксированными версиями, чтобы соблюсти требование хакатона:
- `fastapi`, `starlette`, `uvicorn` - HTTP стек.
- `SQLAlchemy`, `asyncpg`, `fastapi-sqlalchemy` - ORM и подключение к Postgres.
- `pydantic`, `pydantic-settings` - валидация схем и конфигурации.
- `aiohttp`, `maxapi`, `PyJWT` - интеграции с внешними API (MAX, Salute Jazz).
- `yoyo-migrations` - миграции БД.
Файл также содержит вспомогательные пакеты (`requests`, `aiofiles`, `python-dotenv`, `schedule` и др.) с точными версиями, чтобы можно было воспроизвести окружение внутри Docker-образа.

## Мониторинг и безопасность
Рекомендуется ограничить CORS только фронтовым доменом, подключить аутентификацию MAX WebApp и хранить токены расшаривания в хеше. Сервисные ручки (`/api/v1/reminder`) следует закрыть по API-ключу или вынести в закрытую сеть cron контейнера.
