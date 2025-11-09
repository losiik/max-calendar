FROM python:3.12

WORKDIR /bot

COPY . /bot

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r backend/requirements.txt

ENV PYTHONPATH=/bot