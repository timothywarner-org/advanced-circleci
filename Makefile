# Globomantics Robot Fleet API - Makefile
# Docker build and management commands

# =============================================================================
# Configuration
# =============================================================================
APP_NAME := globomantics-robot-api
REGISTRY := ghcr.io/timothywarner-org
VERSION := $(shell node -p "require('./package.json').version")
COMMIT_SHA := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

# Docker image tags
IMAGE_NAME := $(REGISTRY)/$(APP_NAME)
IMAGE_TAG := $(IMAGE_NAME):$(VERSION)
IMAGE_LATEST := $(IMAGE_NAME):latest
IMAGE_SHA := $(IMAGE_NAME):$(COMMIT_SHA)

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# =============================================================================
# Help
# =============================================================================
.PHONY: help
help: ## Show this help message
	@echo "$(GREEN)Globomantics Robot Fleet API - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Current Configuration:$(NC)"
	@echo "  Image:   $(IMAGE_TAG)"
	@echo "  Commit:  $(COMMIT_SHA)"
	@echo "  Date:    $(BUILD_DATE)"

# =============================================================================
# Development
# =============================================================================
.PHONY: install
install: ## Install dependencies
	npm ci

.PHONY: dev
dev: ## Start development server with hot reload
	npm run dev

.PHONY: start
start: ## Start production server locally
	npm start

# =============================================================================
# Testing
# =============================================================================
.PHONY: test
test: ## Run all tests with coverage
	npm test

.PHONY: test-unit
test-unit: ## Run unit tests only
	npm run test:unit

.PHONY: test-integration
test-integration: ## Run integration tests only
	npm run test:integration

.PHONY: test-e2e
test-e2e: ## Run e2e tests only
	npm run test:e2e

.PHONY: lint
lint: ## Run ESLint
	npm run lint

.PHONY: lint-fix
lint-fix: ## Run ESLint with auto-fix
	npm run lint:fix

.PHONY: check
check: lint test ## Run all checks (lint + test)

# =============================================================================
# Docker Build
# =============================================================================
.PHONY: docker-build
docker-build: ## Build Docker image with version tag
	@echo "$(GREEN)Building Docker image: $(IMAGE_TAG)$(NC)"
	docker build \
		--build-arg BUILD_DATE=$(BUILD_DATE) \
		--build-arg COMMIT_SHA=$(COMMIT_SHA) \
		--build-arg VERSION=$(VERSION) \
		-t $(IMAGE_TAG) \
		-t $(IMAGE_LATEST) \
		-t $(IMAGE_SHA) \
		.
	@echo "$(GREEN)Successfully built: $(IMAGE_TAG)$(NC)"

.PHONY: docker-build-local
docker-build-local: ## Build Docker image for local testing (no registry prefix)
	@echo "$(GREEN)Building local Docker image: $(APP_NAME):local$(NC)"
	docker build \
		--build-arg BUILD_DATE=$(BUILD_DATE) \
		--build-arg COMMIT_SHA=$(COMMIT_SHA) \
		--build-arg VERSION=$(VERSION) \
		-t $(APP_NAME):local \
		-t $(APP_NAME):latest \
		.
	@echo "$(GREEN)Successfully built: $(APP_NAME):local$(NC)"

.PHONY: docker-build-no-cache
docker-build-no-cache: ## Build Docker image without cache
	@echo "$(YELLOW)Building Docker image without cache$(NC)"
	docker build --no-cache \
		--build-arg BUILD_DATE=$(BUILD_DATE) \
		--build-arg COMMIT_SHA=$(COMMIT_SHA) \
		--build-arg VERSION=$(VERSION) \
		-t $(IMAGE_TAG) \
		-t $(IMAGE_LATEST) \
		.

# =============================================================================
# Docker Run
# =============================================================================
.PHONY: docker-run
docker-run: ## Run Docker container (detached)
	@echo "$(GREEN)Starting container: $(APP_NAME)$(NC)"
	docker run -d \
		--name $(APP_NAME) \
		-p 3000:3000 \
		-e NODE_ENV=production \
		$(IMAGE_LATEST)
	@echo "$(GREEN)Container running at http://localhost:3000$(NC)"

.PHONY: docker-run-local
docker-run-local: ## Run locally built container
	@echo "$(GREEN)Starting local container: $(APP_NAME)$(NC)"
	docker run -d \
		--name $(APP_NAME) \
		-p 3000:3000 \
		-e NODE_ENV=production \
		$(APP_NAME):local
	@echo "$(GREEN)Container running at http://localhost:3000$(NC)"

.PHONY: docker-run-interactive
docker-run-interactive: ## Run container interactively (foreground)
	docker run --rm \
		--name $(APP_NAME) \
		-p 3000:3000 \
		-e NODE_ENV=production \
		$(APP_NAME):local

.PHONY: docker-stop
docker-stop: ## Stop and remove container
	@echo "$(YELLOW)Stopping container: $(APP_NAME)$(NC)"
	-docker stop $(APP_NAME) 2>/dev/null || true
	-docker rm $(APP_NAME) 2>/dev/null || true
	@echo "$(GREEN)Container stopped$(NC)"

.PHONY: docker-restart
docker-restart: docker-stop docker-run ## Restart container

.PHONY: docker-logs
docker-logs: ## View container logs
	docker logs -f $(APP_NAME)

.PHONY: docker-shell
docker-shell: ## Open shell in running container
	docker exec -it $(APP_NAME) /bin/sh

# =============================================================================
# Docker Registry
# =============================================================================
.PHONY: docker-push
docker-push: ## Push image to registry
	@echo "$(GREEN)Pushing to registry: $(IMAGE_TAG)$(NC)"
	docker push $(IMAGE_TAG)
	docker push $(IMAGE_LATEST)
	docker push $(IMAGE_SHA)
	@echo "$(GREEN)Successfully pushed$(NC)"

.PHONY: docker-pull
docker-pull: ## Pull latest image from registry
	docker pull $(IMAGE_LATEST)

# =============================================================================
# Docker Cleanup
# =============================================================================
.PHONY: docker-clean
docker-clean: docker-stop ## Remove container and images
	@echo "$(YELLOW)Cleaning up Docker images$(NC)"
	-docker rmi $(IMAGE_TAG) 2>/dev/null || true
	-docker rmi $(IMAGE_LATEST) 2>/dev/null || true
	-docker rmi $(APP_NAME):local 2>/dev/null || true
	@echo "$(GREEN)Cleanup complete$(NC)"

.PHONY: docker-prune
docker-prune: ## Prune unused Docker resources
	@echo "$(YELLOW)Pruning unused Docker resources$(NC)"
	docker system prune -f
	docker image prune -f

# =============================================================================
# Docker Compose (for local development with dependencies)
# =============================================================================
.PHONY: compose-up
compose-up: ## Start with docker-compose
	docker-compose up -d

.PHONY: compose-down
compose-down: ## Stop docker-compose services
	docker-compose down

.PHONY: compose-logs
compose-logs: ## View docker-compose logs
	docker-compose logs -f

# =============================================================================
# CI/CD Helpers
# =============================================================================
.PHONY: ci-build
ci-build: check docker-build ## Full CI build (test + docker)
	@echo "$(GREEN)CI build complete$(NC)"

.PHONY: ci-test
ci-test: ## Run tests for CI (with JUnit output)
	npm test -- --ci --reporters=default --reporters=jest-junit

.PHONY: version
version: ## Show current version info
	@echo "App:     $(APP_NAME)"
	@echo "Version: $(VERSION)"
	@echo "Commit:  $(COMMIT_SHA)"
	@echo "Image:   $(IMAGE_TAG)"

# =============================================================================
# Health Check
# =============================================================================
.PHONY: health
health: ## Check if the running container is healthy
	@curl -sf http://localhost:3000/api/health/live > /dev/null && \
		echo "$(GREEN)Container is healthy$(NC)" || \
		echo "$(RED)Container is not responding$(NC)"

# Default target
.DEFAULT_GOAL := help
