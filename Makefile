.PHONY: up down build logs logs-api migrate seed test shell-api shell-db monitoring clean restart-api ps help

COMPOSE=docker compose -f docker-compose.yml

up:
	$(COMPOSE) up -d

up-dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

build:
	$(COMPOSE) build --no-cache

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

logs-api:
	$(COMPOSE) logs -f api worker

migrate:
	$(COMPOSE) exec api npx prisma migrate deploy

seed:
	$(COMPOSE) exec api node prisma/seed.js

test:
	$(COMPOSE) exec api npm test

shell-api:
	$(COMPOSE) exec api sh

shell-db:
	$(COMPOSE) exec postgres psql -U whatsapp -d whatsapp_monitor

monitoring:
	$(COMPOSE) -f docker-compose.yml -f docker-compose.monitoring.yml --profile monitoring up -d

clean:
	$(COMPOSE) down -v --remove-orphans

restart-api:
	$(COMPOSE) restart api worker

ps:
	$(COMPOSE) ps

help:
	@echo "Available targets:"
	@echo "  up           - Start all services"
	@echo "  down         - Stop all services"
	@echo "  build        - Rebuild all images"
	@echo "  logs         - Follow all logs"
	@echo "  logs-api     - Follow api+worker logs"
	@echo "  migrate      - Run Prisma migrations"
	@echo "  seed         - Seed demo data"
	@echo "  test         - Run tests"
	@echo "  shell-api    - Shell into api container"
	@echo "  shell-db     - Postgres psql session"
	@echo "  monitoring   - Start with Prometheus + Grafana"
	@echo "  clean        - Remove containers and volumes"
