.PHONY: gen oapi sqlc api runner clean backend frontend new-migration

up:
	@echo [ starting all services... ]
	@docker compose -f docker-compose.dev.yml up

upb:
	@echo [ starting all services... ]
	@docker compose -f docker-compose.dev.yml up --build

backend:
	@echo [ starting backend... ]
	@docker compose -f docker-compose.dev.yml up supallm_api supallm_runner

bb:
	@echo [ starting backend... ]
	@docker compose -f docker-compose.dev.yml up supallm_api supallm_runner --build

api:
	@echo [ starting api... ]
	@docker compose -f docker-compose.dev.yml up supallm_api

runner:
	@echo [ starting runner... ]
	@docker compose -f docker-compose.dev.yml up supallm_runner --build

frontend:
	@echo [ starting frontend... ]
	@docker compose -f docker-compose.dev.yml up supallm_frontend --build

## Generate all code from specs | eq: sqlc + oapi
gen: oapi sqlc

oapi:
	@rm -fr ./backend/internal/infra/http/**/*.gen.go
	DOCKER_BUILDKIT=1 docker build -f Dockerfile.generate --target oapi --output ./backend/internal/infra/http .

oapi-frontend:
	@rm -fr ./frontend/src/lib/services/gen-api
	DOCKER_BUILDKIT=1 docker build -f Dockerfile.generate --target oapi-frontend --output ./frontend/src/lib/services/gen-api .

## Generate golang source go from sqlc spec
sqlc:
	@echo [ generating sqlc code... ]
	@docker run --rm -v $$(pwd)/backend:/src -w /src/sql kjconroy/sqlc:latest generate

## Generate a new migration
.PHONY: new-migration
new-migration:
	@read -p "Enter migration name: " name; \
	docker run --rm -v $$(pwd)/backend:/src -w /src/sql \
		migrate/migrate create -ext sql -dir migrations "$$name" && \
	echo "Migration '$$name' created in backend/sql/migrations/"

clean:
	@echo [ cleaning all services... ]
	@docker compose down
	@docker compose rm -f
	@docker volume rm supallm_supallm_data supallm_supallm_redis_data







