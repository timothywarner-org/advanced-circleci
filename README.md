# CircleCI Advanced Configuration

> Pluralsight Course Repository: Globomantics Robot Fleet API

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/YOUR_ORG/advanced-circleci/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/YOUR_ORG/advanced-circleci/tree/main)

## Course Overview

This repository accompanies the Pluralsight course **CircleCI Advanced Configuration**, designed for DevOps engineers and IT professionals who need to scale CI/CD practices across teams.

### What You'll Learn

| Module | Topic | Key Concepts |
|--------|-------|--------------|
| 1 | Workflow Orchestration | Sequential/parallel jobs, fan-out/fan-in, filters, approvals |
| 2 | Configuration Reuse | Pipeline parameters, job parameters, commands, executors |
| 3 | Orbs & Integrations | Node.js orb, Slack notifications, Azure deployment |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/advanced-circleci.git
cd advanced-circleci

# Install dependencies
npm install

# Run the application
npm start

# Run tests
npm test
```

## Project Structure

```
advanced-circleci/
├── .circleci/
│   ├── config.yml              # Production CircleCI config
│   └── configs/                # Progressive demo configurations
│       ├── 01-sequential-baseline.yml
│       ├── 02-parallel-fanout.yml
│       ├── 03-branch-tag-filters.yml
│       └── ...
├── .github/
│   └── workflows/              # GitHub Actions comparison
├── .vscode/                    # VS Code settings for demos
├── src/                        # Node.js Express API
│   ├── index.js
│   ├── routes/
│   ├── services/
│   └── middleware/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── infra/                      # Azure Bicep templates
│   ├── main.bicep
│   ├── modules/
│   └── environments/
├── demos/                      # Demo scripts per module
│   ├── module1-workflow-orchestration/
│   ├── module2-configuration-reuse/
│   └── module3-orbs-azure/
└── docs/                       # Additional documentation
```

## The Application: Globomantics Robot Fleet API

A RESTful API for managing Globomantics' robot fleet, including:

- **GET /api/health** - Health checks and readiness probes
- **GET /api/robots** - List all robots with filtering
- **POST /api/robots** - Register a new robot
- **GET /api/metrics** - Fleet-wide operational metrics

### API Examples

```bash
# Health check
curl http://localhost:3000/api/health

# List active robots
curl http://localhost:3000/api/robots?status=active

# Create a robot
curl -X POST http://localhost:3000/api/robots \
  -H "Content-Type: application/json" \
  -d '{"name": "Atlas Prime", "type": "assembly", "location": "factory-a"}'
```

## CircleCI Configuration Progression

The `.circleci/configs/` directory contains configurations that build on each other:

### Module 1: Workflow Orchestration
1. `01-sequential-baseline.yml` - Basic sequential workflow
2. `02-parallel-fanout.yml` - Fan-out/fan-in pattern
3. `03-branch-tag-filters.yml` - Conditional execution
4. `04-approval-scheduled.yml` - Manual gates and schedules

### Module 2: Configuration Reuse
5. `05-pipeline-parameters.yml` - Workflow control
6. `06-job-parameters.yml` - Reusable job definitions
7. `07-commands-reuse.yml` - Step abstractions

### Module 3: Orbs & Integrations
8. `08-orbs-intro.yml` - Node.js orb basics
9. `09-slack-orb.yml` - Notifications
10. `10-azure-orb.yml` - Cloud deployment

## Demo Scripts

Each module has detailed demo scripts in `demos/`:

```bash
# Module 1 demos
demos/module1-workflow-orchestration/scripts/
  ├── DEMO-01-sequential-baseline.md
  ├── DEMO-02-parallel-fanout.md
  ├── DEMO-03-branch-tag-filters.md
  └── DEMO-04-approval-scheduled.md
```

## Azure Deployment

The `infra/` directory contains Bicep templates for Azure Container Apps:

```bash
# Deploy to dev environment
cd infra
./deploy.sh dev

# Deploy to production
./deploy.sh production
```

### Azure Resources Created
- Azure Container Registry
- Log Analytics Workspace
- Container Apps Environment
- Container App (robot-api)

## Prerequisites

- Node.js 18+
- Docker (for container builds)
- CircleCI account (Free tier works!)
- Azure subscription (for Module 3 demos)
- VS Code with CircleCI extension

## VS Code Setup

Open the project in VS Code and install recommended extensions:

```bash
code .
# Accept "Install Recommended Extensions" prompt
```

Key extensions:
- CircleCI (circleci.circleci)
- YAML (redhat.vscode-yaml)
- Azure Tools (ms-azuretools.vscode-bicep)
- GitHub Copilot (optional, for GenAI demos)

## Course Resources

- [CircleCI Documentation](https://circleci.com/docs/)
- [CircleCI Orb Registry](https://circleci.com/developer/orbs)
- [Azure Container Apps Docs](https://learn.microsoft.com/azure/container-apps/)
- [Course Companion Materials](./docs/)

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Author:** Tim Warner
**Course:** CircleCI Advanced Configuration
**Platform:** Pluralsight
