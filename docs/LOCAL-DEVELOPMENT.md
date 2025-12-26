# Local Development Guide

This guide covers setting up and running the Globomantics Robot Fleet API locally for development and testing.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker Development](#docker-development)
- [API Reference](#api-reference)
- [Debugging](#debugging)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/timothywarner-org/advanced-circleci.git
cd advanced-circleci

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Open in browser
open http://localhost:3000
```

---

## Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| Node.js | 18+ (20 recommended) | Runtime |
| npm | 9+ | Package manager |
| Docker | 20+ | Container builds (optional) |
| Git | 2.30+ | Version control |

### Install Node.js

```bash
# macOS (using Homebrew)
brew install node@20

# Windows (using winget)
winget install OpenJS.NodeJS.LTS

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

---

## Project Structure

```
advanced-circleci/
├── src/                      # Source code
│   ├── index.js              # Express app entry point
│   ├── routes/               # API route handlers
│   │   ├── robots.js         # Robot CRUD endpoints
│   │   ├── health.js         # Health check endpoints
│   │   └── metrics.js        # Metrics endpoints
│   ├── services/             # Business logic
│   │   └── robotService.js   # Robot data operations
│   ├── middleware/           # Express middleware
│   │   └── errorHandler.js   # Global error handler
│   └── utils/                # Utility functions
│       └── logger.js         # Logging utilities
├── public/                   # Static frontend files
│   ├── index.html            # Dashboard UI
│   ├── api-docs.html         # Interactive API docs
│   ├── css/style.css         # Globomantics styling
│   └── js/app.js             # Dashboard JavaScript
├── tests/                    # Test suites
│   ├── unit/                 # Unit tests
│   ├── integration/          # API tests
│   └── e2e/                  # End-to-end tests
├── infra/                    # Azure infrastructure (Bicep)
├── .circleci/                # CircleCI configuration
├── Dockerfile                # Container build
├── Makefile                  # Development commands
└── package.json              # Dependencies & scripts
```

---

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

This uses `nodemon` to automatically restart when files change.

### Production Mode

```bash
npm start
```

### Environment Variables

Create a `.env` file for local configuration:

```bash
# .env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Logging verbosity |

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e
```

### Test Coverage

Coverage reports are generated in `coverage/`:

```bash
npm test
open coverage/lcov-report/index.html
```

**Coverage Thresholds:**

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Using the Makefile

```bash
# Run all checks (lint + test)
make check

# Run lint only
make lint

# Auto-fix lint issues
make lint-fix
```

---

## Docker Development

### Build Local Image

```bash
make docker-build-local
```

This creates `globomantics-robot-api:local`.

### Run Container

```bash
# Start container (detached)
make docker-run-local

# View logs
make docker-logs

# Stop container
make docker-stop
```

### Interactive Mode

```bash
make docker-run-interactive
```

Press `Ctrl+C` to stop.

### Shell into Container

```bash
# Start container first
make docker-run-local

# Open shell
make docker-shell
```

### Health Check

```bash
# Check if container is responding
make health
```

---

## API Reference

### Base URL

```
http://localhost:3000
```

### Dashboard & Docs

| Path | Description |
| --- | --- |
| `/` | Robot Fleet Dashboard |
| `/api-docs.html` | Interactive API Documentation |

### Health Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Overall health status |
| GET | `/api/health/live` | Liveness probe |
| GET | `/api/health/ready` | Readiness probe |
| GET | `/api/health/version` | Version information |

### Robot Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/robots` | List all robots |
| GET | `/api/robots?status=active` | Filter by status |
| GET | `/api/robots/:id` | Get robot by ID |
| POST | `/api/robots` | Create new robot |
| PUT | `/api/robots/:id` | Update robot |
| DELETE | `/api/robots/:id` | Delete robot |
| POST | `/api/robots/:id/maintenance` | Schedule maintenance |

### Metrics Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/metrics` | Fleet metrics |
| GET | `/api/metrics/performance` | Performance stats |
| GET | `/api/metrics/uptime` | Uptime statistics |

### Example Requests

```bash
# List all robots
curl http://localhost:3000/api/robots

# Get specific robot
curl http://localhost:3000/api/robots/rb-001

# Create robot
curl -X POST http://localhost:3000/api/robots \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Bot", "type": "assembly", "location": "factory-floor-a"}'

# Update robot status
curl -X PUT http://localhost:3000/api/robots/rb-001 \
  -H "Content-Type: application/json" \
  -d '{"status": "maintenance", "batteryLevel": 50}'

# Delete robot
curl -X DELETE http://localhost:3000/api/robots/rb-001
```

---

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.js",
      "env": {
        "NODE_ENV": "development",
        "PORT": "3000"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Debug Logging

Enable verbose logging:

```bash
LOG_LEVEL=debug npm run dev
```

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### Module Not Found

```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Test Timeouts

```bash
# Increase timeout (in jest.config.js or command line)
npm test -- --testTimeout=30000
```

---

## Makefile Commands Reference

| Command | Description |
| --- | --- |
| `make help` | Show all available commands |
| `make install` | Install dependencies |
| `make dev` | Start dev server |
| `make start` | Start production server |
| `make test` | Run all tests |
| `make test-unit` | Run unit tests |
| `make test-integration` | Run integration tests |
| `make lint` | Run ESLint |
| `make lint-fix` | Fix lint issues |
| `make check` | Lint + test |
| `make docker-build-local` | Build Docker image |
| `make docker-run-local` | Run container |
| `make docker-stop` | Stop container |
| `make docker-logs` | View container logs |
| `make docker-shell` | Shell into container |
| `make health` | Check container health |
| `make version` | Show version info |

---

## Next Steps

1. Run `npm run dev` to start the server
2. Visit `http://localhost:3000` to see the dashboard
3. Explore the API at `http://localhost:3000/api-docs.html`
4. Make changes and watch hot reload
5. Run `make check` before committing
