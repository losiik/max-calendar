.PHONY: down run down-prod run-prod

down:
	docker compose down -v

run:
	docker compose up -d --build


down-prod:
	sudo docker compose down -v

run-prod:
	sudo docker compose up -d --build