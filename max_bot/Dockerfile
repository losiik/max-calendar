FROM python:3.12

WORKDIR /max_bot

COPY . /max_bot

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r max_bot/requirements.txt

ENV PYTHONPATH=/max_bot