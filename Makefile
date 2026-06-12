.PHONY: help up down build logs clean restart db-migrate frontend-dev backend-dev

help: ## Показати довідку по командам
	@echo "Доступні команди:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Підняти всі сервіси
	docker-compose up -d

down: ## Зупинити всі сервіси
	docker-compose down

build: ## Зібрати образи
	docker-compose build

logs: ## Перегляд логів всіх сервісів
	docker-compose logs -f

logs-frontend: ## Перегляд логів фронтенду
	docker-compose logs -f frontend

logs-backend: ## Перегляд логів бекенду
	docker-compose logs -f backend

logs-db: ## Перегляд логів бази даних
	docker-compose logs -f db

clean: ## Очищення (volumes, images, containers)
	docker-compose down -v
	docker-compose rm -f
	docker system prune -f

clean-db: ## Очистити тільки базу даних (видалити volume)
	docker-compose down
	docker volume rm fullstack-template_db-data 2>/dev/null || true
	docker-compose up -d db

restart: ## Перезапуск сервісів
	docker-compose restart

db-migrate: ## Виконати міграції бази даних
	docker-compose exec backend npm run migration:run

db: ## Підключитися до бази даних
	docker-compose exec db psql -U app_user -d app_db

frontend-dev: ## Запуск фронтенду в dev режимі (локально)
	cd frontend && npm run dev

backend-dev: ## Запуск бекенду в dev режимі (локально)
	cd backend && npm run start:dev

install: ## Встановити залежності для фронтенду та бекенду
	cd frontend && npm install
	cd backend && npm install
