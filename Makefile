.PHONY: up down build restart logs ps down-prod run-prod

up:
	docker compose up -d

build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

logs:
	docker compose logs -f

ps:
	docker compose ps

down-prod:
	sudo docker compose down

run-prod:
	sudo docker compose up -d --build
