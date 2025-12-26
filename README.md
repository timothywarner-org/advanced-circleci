# Globomantics Robot Fleet API

> CircleCI Advanced Configuration - Pluralsight Course Repository

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/timothywarner-org/advanced-circleci/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/timothywarner-org/advanced-circleci/tree/main)
[![GitHub Actions](https://github.com/timothywarner-org/advanced-circleci/actions/workflows/comparison-build.yml/badge.svg)](https://github.com/timothywarner-org/advanced-circleci/actions/workflows/comparison-build.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A RESTful API for managing Globomantics' robot fleet, built as a practical example for learning advanced CircleCI CI/CD patterns.

## Quick Start

```bash
# Clone and install
git clone https://github.com/timothywarner-org/advanced-circleci.git
cd advanced-circleci
npm install

# Start development server
npm run dev

# Open the dashboard
open http://localhost:3000
```

### What You'll See

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Robot Fleet Dashboard |
| `http://localhost:3000/api-docs.html` | Interactive API Documentation |
| `http://localhost:3000/api/health` | Health Check Endpoint |

## Course Overview

This repository accompanies the Pluralsight course **CircleCI Advanced Configuration**, designed for DevOps engineers and IT professionals who need to scale CI/CD practices across teams.

### What You'll Learn

| Module | Topic | Key Concepts |
|--------|-------|--------------|
| 1 | Workflow Orchestration | Sequential/parallel jobs, fan-out/fan-in, filters, approvals |
| 2 | Configuration Reuse | Pipeline parameters, job parameters, commands, executors |
| 3 | Orbs & Integrations | Node.js orb, Slack notifications, Azure deployment |

## The Application

The Globomantics Robot Fleet API manages a fleet of industrial robots with these features:

- **Dashboard UI** - Visual overview of all robots with status indicators
- **REST API** - Full CRUD operations for robot management
- **Health Checks** - Kubernetes-ready liveness/readiness probes
- **Metrics** - Fleet-wide operational statistics

### API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# List all robots
curl http://localhost:3000/api/robots

# Filter by status
curl http://localhost:3000/api/robots?status=active

# Create a robot
curl -X POST http://localhost:3000/api/robots \
  -H "Content-Type: application/json" \
  -d '{"name": "Atlas Prime", "type": "assembly", "location": "factory-floor-a"}'

# Update robot
curl -X PUT http://localhost:3000/api/robots/rb-001 \
  -H "Content-Type: application/json" \
  -d '{"status": "maintenance"}'
```

## Development

### Using npm Scripts

```bash
npm run dev          # Start with hot reload
npm start            # Production mode
npm test             # Run all tests
npm run lint         # Check code style
```

### Using Makefile

```bash
make help            # Show all commands
make check           # Lint + test
make docker-build-local   # Build Docker image
make docker-run-local     # Run container
```

See [LOCAL-DEVELOPMENT.md](docs/LOCAL-DEVELOPMENT.md) for the complete development guide.

## Project Structure

```
advanced-circleci/
├── src/                        # Node.js Express API
│   ├── index.js                # App entry point
│   ├── routes/                 # API route handlers
│   ├── services/               # Business logic
│   └── middleware/             # Express middleware
├── public/                     # Frontend dashboard
│   ├── index.html              # Dashboard UI
│   ├── api-docs.html           # Interactive API docs
│   ├── css/                    # Globomantics styling
│   └── js/                     # Dashboard JavaScript
├── tests/                      # Test suites
│   ├── unit/                   # Unit tests
│   ├── integration/            # API tests
│   └── e2e/                    # End-to-end tests
├── .circleci/
│   ├── config.yml              # Production config
│   └── configs/                # Progressive demo configs
├── orb-source/                 # Custom Globomantics orb
├── infra/                      # Azure Bicep templates
│   ├── main.bicep              # Main template
│   ├── modules/                # Infrastructure modules
│   └── environments/           # Environment parameters
├── demos/                      # Demo scripts per module
├── docs/                       # Documentation
├── Dockerfile                  # Container build
└── Makefile                    # Development commands
```

## CircleCI Configuration Progression

The `.circleci/configs/` directory contains configurations that build on each other:

### Module 1: Workflow Orchestration

1. `01-sequential-baseline.yml` - Basic sequential workflow
2. `02-parallel-fanout.yml` - Fan-out/fan-in pattern
3. `03-branch-tag-filters.yml` - Conditional execution
4. `04-approval-scheduled.yml` - Manual gates and schedules

### Module 2: Configuration Reuse

1. `05-pipeline-parameters.yml` - Workflow control
2. `06-job-parameters.yml` - Reusable job definitions
3. `07-commands-reuse.yml` - Step abstractions

### Module 3: Orbs & Integrations

1. `08-orbs-intro.yml` - Node.js orb basics
2. `09-slack-orb.yml` - Notifications
3. `10-azure-orb.yml` - Cloud deployment

## Azure Deployment

Deploy to Azure Container Apps:

```bash
cd infra
./deploy.sh dev        # Deploy to dev
./deploy.sh staging    # Deploy to staging
./deploy.sh production # Deploy to production
```

See [AZURE-DEPLOYMENT.md](docs/AZURE-DEPLOYMENT.md) for the complete deployment guide.

### Azure Resources Created

| Resource | Purpose |
|----------|---------|
| Container Registry | Docker image storage |
| Container Apps Environment | Hosting environment |
| Container App | The running API |
| Log Analytics | Logging and monitoring |

## Documentation

| Document | Description |
|----------|-------------|
| [LOCAL-DEVELOPMENT.md](docs/LOCAL-DEVELOPMENT.md) | Local setup and development guide |
| [AZURE-DEPLOYMENT.md](docs/AZURE-DEPLOYMENT.md) | Azure deployment and CI/CD setup |
| [COURSE_OUTLINE.md](COURSE_OUTLINE.md) | Course structure and learning objectives |
| [LEARNING-OBJECTIVES.md](docs/LEARNING-OBJECTIVES.md) | Detailed learning objectives |

## Prerequisites

| Tool | Version | Required For |
|------|---------|--------------|
| Node.js | 18+ | Running the app |
| Docker | 20+ | Container builds |
| Azure CLI | 2.50+ | Azure deployment |
| CircleCI Account | Free tier | CI/CD pipeline |

## VS Code Setup

Install recommended extensions:

```bash
code .
# Accept "Install Recommended Extensions" prompt
```

Key extensions:
- CircleCI (`circleci.circleci`)
- YAML (`redhat.vscode-yaml`)
- Azure Bicep (`ms-azuretools.vscode-bicep`)
- ESLint (`dbaeumer.vscode-eslint`)

## Resources

- [CircleCI Documentation](https://circleci.com/docs/)
- [CircleCI Orb Registry](https://circleci.com/developer/orbs)
- [Azure Container Apps Docs](https://learn.microsoft.com/azure/container-apps/)
- [Course Companion Materials](./docs/)

## Maintainer

- **Author:** Tim Warner
- **Email:** tim@techtrainertim.com
- **Website:** https://TechTrainerTim.com

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Course:** CircleCI Advanced Configuration
**Platform:** Pluralsight
