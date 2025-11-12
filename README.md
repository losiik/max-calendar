# Max Calendar

## Общее описание

Max Calendar - решение, которое соединяет личный календарь MAX пользователя, гостевые слоты и уведомления. Проект состоит из четырёх сервисов в одном репозитории: фронтенд на React (работает как MAX WebApp, деплой на GitHub Pages), backend на FastAPI, бот на MAX API и cron сервис, который запускает напоминания. Все сервисы общаются через REST API и используют PostgreSQL как основную БД.

## Архитектура

Пользователь взаимодействует с фронтом или через WebApp (открывается прямо из MAX) или через ссылку из бота. Фронт обращается к REST ручкам вида `/api/v1/*`, backend обрабатывает запросы, сохраняет данные в Postgres и, при необходимости, обращается к внешним API (например, Salute Jazz). Бот регистрирует пользователя и выдаёт ссылку на гостевой календарь. Cron сервис дергает backend, чтобы тот отправил напоминания. Архитектура backend построена слоями API - Facade - Service - Repository, что позволяет переиспользовать доменную логику между HTTP, ботом и cron.

### Backend архитектура
- FastAPI + async SQLAlchemy поверх PostgreSQL 16, миграции выполняются yoyo, а `database.py` даёт общее подключение и middleware для сессий.
- Слои `api` → `facade` → `services` → `repository` разделяют транспорт, координацию и работу с БД; сигналы (`signals.py`) позволяют реагировать на события (регистрация пользователя, создание слота) и переиспользовать сценарии cron/бота без дублирования.
- Интеграции с внешними системами вынесены в `client/` (например, Salute Jazz), а в `backend/README.md` описаны все зависимости (`requirements.txt`) и детальная схема.

### Frontend архитектура
- React + TypeScript + Vite, структура feature-sliced: `entities` (типизация и API), `features` (сценарии вроде бронирования и управления доступностью), `widgets`, `pages`, `providers`, `shared`.
- Zustand хранит локальные состояния, TanStack Query управляет запросами и кэшом, Tailwind и Max UI отвечают за визуал. `shared/lib/max-web-app.ts` инкапсулирует Telegram MAX WebApp (initData, haptics, закрытие), поэтому фронт безопасно работает внутри мессенджера.
- Детали запуска, переменные окружения и скрипты описаны в `frontend/README.md`.

## Docker и оркестрация

`docker-compose.yml` описывает четыре сервиса и Postgres:

- backend: собирается из `backend/Dockerfile`, запускает `uvicorn backend.main:app --host 0.0.0.0 --port 9090`.
- bot: образ из `max_bot/Dockerfile`, стартует `python -u max_bot/main.py`.
- cron: образ из `cron_job/Dockerfile`, каждую минуту вызывает `/api/v1/reminder/`.
- db: postgres:16 с volume `postgres_data`.

Данны еиз БД находятсяв в вольюме `postgres_data`, который примонтирован к `/var/lib/postgresql/data`. При необходимости сбросить базу достаточно удалить том `docker volume rm max-calendar_postgres_data` перед повторным `make build`.

Каждый сервис получает свою `.env`, указанную в `env_file`. Dockerfile всех python сервисов построены одинаково: базовый python:3.12, копирование репозитория, установка зависимостей из соответствующего `requirements.txt`, установка `PYTHONPATH`.

## Переменные окружения

Backend (`backend/.env`):  
DB_HOST, DB_PORT, DB_MAIN_DATABASE, DB_USER, DB_PASSWORD - настройки Postgres.  
MAX_API_KEY - токен бота, нужен для интеграции с MAX API.  
SBER_API_KEY - ключ для Salute Jazz.  
PORT - опциональный порт FastAPI (по умолчанию 9000).

Frontend (`frontend/.env.developmenе` или любой env для Vite):  
VITE_API_BASE_URL - адрес backend, обычно https://<домен>/api/v1. (string) 
VITE_MAX_USER_ID - опциональная заглушка для запуска вне Max (number).
VITE_USE_MOCKS - использовать заглушки вместо запросов к бекенду (true/false).

Bot (`max_bot/.env`):  
MAX_API_KEY - токен MAX.  
BACKEND_URL - базовый URL backend, например `https://max.expalingpt.ru/`.  
BOT_URL - публичная ссылка на WebApp, чтобы собрать кнопку «Поделиться».

Cron (`cron_job/.env`):  
BACKEND_URL - полный URL до `/api/v1/reminder/`.

## Makefile

- `make up` - поднять compose в фоне.  
- `make build` - пересобрать образы и запустить.  
- `make down` - остановить и удалить контейнеры.  
- `make restart` - перезапустить стек.  
- `make logs` - посмотреть логи всех сервисов.  
- `make ps` - вывести состояние контейнеров.  

## Локальный запуск через Docker (В ПРОДЕ НЕ БУДЕТ РАБОТАТЬ, так как сейчас все задеплоено на сервере)

1. Создайте файлы `.env` в `backend`, `max_bot`, `cron_job` с переменными из раздела выше.  
2. Заполните `postgres` значения в `docker-compose.yml`.  
3. Выполните `make build`. Compose скачает зависимости, применит миграции и поднимет все контейнеры.  
4. Backend будет доступен на `http://localhost:9090`, Swagger на `http://localhost:9090/docs`.  
5. Фронтенд можно запустить отдельно (`npm run dev`) и направить `VITE_API_BASE_URL` на `http://localhost:9090/api/v1` или продовый урл `https://max.expalingpt.ru/api/v1`.

## Запуск на сервере

Минимальная конфигурация - любой Linux с docker и docker compose plugin. Шаги:

1. Склонировать репозиторий на сервер.
2. Создать `.env` файлы и заполнить секреты.  
3. Выполнить `make build` или `docker compose up -d --build`.  
Фронтенд разворачивается отдельно как статика: `npm run build`, содержимое `frontend/dist` копируется в любой CDN или gh-pages или vercel.

## Деплой фронтенда

Рекомендуемый способ - GitHub Pages. Процесс: `npm install`, `npm run deploy`, задать кастомный домен в настройках Pages и указать его в сообщении для проверяющих. При деплое на другой хост достаточно раздать содержимое `frontend/dist`. Проверять результат можно по домену, указанному в Pages, или прямо в MAX WebApp с `bot_url` (для этого необходимо подключить к боту ссылку на статику).

## Документация по сервисам

- `backend/README.md` - устройство API, зависимости и запуск.  
- `frontend/README.md` - структура WebApp и инструкция по сборке.  
- `max_bot/README.md` - MAX бот и его конфигурация.  
- `cron_job/README.md` - сервис напоминаний.  
