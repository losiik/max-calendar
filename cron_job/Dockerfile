FROM python:3.12

WORKDIR /cron

COPY . /cron

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r cron_job/requirements.txt

ENV PYTHONPATH=/cron