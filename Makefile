.PHONY: down run

down:
	docker-compose down -v

run:
	docker-compose up -d --build