.PHONY: gen oapi sqlc api

up:
	@echo [ starting all services... ]
	@docker compose up

api:
	@echo [ starting api... ]
	@docker compose up api

## Generate all code from specs | eq: sqlc + transport
gen: transport sqlc

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