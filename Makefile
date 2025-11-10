.PHONY: down run down-prod run-prod

down:
	docker compose down

run:
	docker compose up -d --build


down-prod:
	sudo docker compose down

run-prod:
	sudo docker compose up -d --build