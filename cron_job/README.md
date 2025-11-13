# Cron Job

## Назначение
Небольшой сервис запускает напоминания о встречах. 
Каждую минуту он обращается к backend ручке `/api/v1/reminder/` и `/api/v1/reminder/daily_reminder/`, которые проверяет предстоящие таймслоты и отправляет нотификации пользователям о встречах на сегодня или предстоящих встречах.

## Архитектура
`main.py` использует `schedule` для планирования задач и `requests` для HTTP вызова. В файле `settings.py` переменная окружения читается через Pydantic Settings. Логирование настроено на stdout, поэтому контейнер легко мониторить через `docker compose logs cron`.

## Переменные окружения
BACKEND_URL - абсолютная ссылка на ручку напоминаний (например https://api.example.com/api/v1/reminder/). Значение задаётся в `cron_job/.env`.

## Локальный запуск
1. Установите зависимости: `pip install -r cron_job/requirements.txt`.  
2. Создайте `.env` с переменными `REMINDER_ALERT_URL` и `REMINDER_DAILY_URL`, пример в .env.tmpl.  
3. Выполните `python cron_job/main.py`. Скрипт будет бесконечно выполнять `schedule.run_pending()`.

## Docker
`cron_job/Dockerfile` формируется из python:3.12, копирует репозиторий в `/cron` и ставит зависимости из `cron_job/requirements.txt`. В docker-compose сервис запускается с задержкой и командой `python -u cron_job/main.py`. Контейнер стоит держать в той же сети, что и backend, чтобы вызывать приватный адрес (`http://backend:9090/api/v1/reminder/`) без публичного экспонирования.
