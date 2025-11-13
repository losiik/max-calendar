import os
from dotenv import load_dotenv

if os.path.exists('.env'):
    load_dotenv('.env')

import schedule
import time
import requests
import logging

from settings import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


def job_send_reminder():
    url = settings.reminder_alert_url
    response = requests.post(url)

    if response.status_code == 200:
        logging.info(f"Уведомления отправлены успешно: {response.json()}")
    else:
        logging.error(f"Ошибка при выполнении запроса: {response.status_code}")


def job_daily_reminder():
    url = settings.reminder_daily_url
    response = requests.post(url)

    if response.status_code == 200:
        logging.info(f"Дневные уведомления отправлены успешно: {response.json()}")
    else:
        logging.error(f"Ошибка при выполнении запроса: {response.status_code}")


schedule.every(1).minutes.do(job_send_reminder)
schedule.every(1).minutes.do(job_daily_reminder)

while True:
    schedule.run_pending()
    time.sleep(1)
