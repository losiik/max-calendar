FROM python:3.12

WORKDIR /cron

COPY . /cron

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r backend/requirements.txt

ENV PYTHONPATH=/cron