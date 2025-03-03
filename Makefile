.PHONY: gen oapi sqlc api

api:
	@echo [ starting api... ]
	@docker compose up api

## Generate all code from specs | eq: sqlc + transport
gen: transport sqlc

oapi:
	@rm -fr ./backend/internal/interfaces/http/**/*.gen.go
	DOCKER_BUILDKIT=1 docker build -f Dockerfile.generate --target oapi --output ./backend/internal/interfaces/http .

## Generate golang source go from sqlc spec
sqlc:
	@echo [ generating sqlc code... ]
	@docker run --rm -v $$(pwd)/backend:/src -w /src/sql/sqlc kjconroy/sqlc:latest generate