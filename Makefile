.PHONY: gen oapi sqlc api runner clean backend

up:
	@echo [ starting all services... ]
	@docker compose -f docker-compose.dev.yml up

backend:
	@echo [ starting backend... ]
	@docker compose -f docker-compose.dev.yml up api runner --build

api:
	@echo [ starting api... ]
	@docker compose -f docker-compose.dev.yml up api

runner:
	@echo [ starting runner... ]
	@docker compose -f docker-compose.dev.yml up runner

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
	@docker run --rm -v $$(pwd)/backend:/src -w /src/sql/sqlc kjconroy/sqlc:latest generate

clean:
	@echo [ cleaning all services... ]
	@docker compose down
	@docker compose rm -f
	@docker volume rm supallm_supallm_data supallm_supallm_redis_data
