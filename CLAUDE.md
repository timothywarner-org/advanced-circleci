# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pluralsight training course repository: "Advanced CircleCI Configuration" (90 minutes). Teaches DevOps engineers advanced CI/CD patterns through a fictional Globomantics Robot Fleet API built with Node.js/Express.

## Common Commands

```bash
# Development
npm run dev              # Start with nodemon auto-reload
npm start                # Start server (production)

# Testing
npm test                 # All tests with coverage
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # E2E tests only

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format JS with Prettier
npm run format:check     # Check JS formatting
npm run lint:md          # Lint markdown files
npm run lint:md:fix      # Auto-fix markdown issues
npm run security         # npm audit for vulnerabilities

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run container locally
```

## Architecture

### Course Structure

The course progresses through 10 demo configurations in `.circleci/configs/`:

- **01-04**: Workflow orchestration (sequential, fan-out/fan-in, filters, approvals)
- **05-07**: Configuration reuse (pipeline params, job params, commands)
- **08-10**: Orbs integration (Node.js, Slack, Azure)

The final production config is `.circleci/config.yml` which combines all patterns.

### API Structure

```
src/
├── index.js           # Express app entry point (port 3000)
├── routes/            # API endpoints
│   ├── health.js      # Health/liveness/readiness probes
│   ├── robots.js      # Robot CRUD operations
│   └── metrics.js     # Fleet metrics
├── services/          # Business logic (robotService.js)
├── middleware/        # Error handling
└── utils/             # Logging
```

### Key API Endpoints

- `GET /api/health`, `/api/health/live`, `/api/health/ready` - Health probes
- `GET|POST /api/robots` - List/create robots
- `GET|PUT|DELETE /api/robots/:id` - Robot operations
- `POST /api/robots/:id/maintenance` - Schedule maintenance
- `GET /api/metrics` - Fleet-wide metrics

### Infrastructure

- **Docker**: Multi-stage Dockerfile with non-root user, Alpine base
- **Azure**: Bicep templates in `infra/` deploy to Azure Container Apps
- **Environments**: dev/staging/production with different scaling configs

## CircleCI Configuration Patterns

The production config (`.circleci/config.yml`) demonstrates:

**Orbs**: `circleci/node@5.2.0`, `circleci/slack@4.13.3`, `circleci/azure-cli@1.2.2`

**Pipeline Parameters**:

- `skip-tests` (boolean) - Skip test jobs
- `deploy-environment` (enum: dev/staging/production)
- `node-version` (string, default "20")

**Workflows**:

1. `build-test-deploy` - Main CI/CD with fan-out tests and sequential deploys
2. `nightly-build` - Cron schedule `0 2 * * *`
3. `release` - Tag-triggered releases

**Key Patterns**:

- Fan-out: 1 build job → 4 parallel test jobs (unit, integration, e2e, security)
- Fan-in: Tests → dev deploy → staging deploy → approval → production deploy
- Branch filters: main, develop, feature/*
- Approval gates before production

## Testing

- **Framework**: Jest with SuperTest
- **Coverage threshold**: 70% minimum (branches, functions, lines, statements)
- **Test files**: `tests/**/*.test.js`
- **Timeout**: 10 seconds per test
- **Output**: JUnit XML for CircleCI test results

## Environment Variables

See `.env.example` for required variables:

- `NODE_ENV`, `PORT`, `LOG_LEVEL` - App config
- `AZURE_*` - Azure deployment settings
- `SLACK_*` - Notification config

## Schematica MCP Server

The `mcp-server/` directory contains **Schematica**, an MCP (Model Context Protocol) server that enables AI assistants to manage the robot fleet inventory via the Robot API.

### Purpose

Schematica provides a bridge between AI assistants (like Claude) and the Globomantics Robot Fleet API, allowing natural language interactions for robot management operations.

### Architecture

```
mcp-server/
├── src/
│   ├── index.js       # MCP server entry point (port 3001)
│   ├── tools.js       # Tool definitions and API handlers
│   └── tools.test.js  # Tool tests
├── package.json       # Dependencies (@modelcontextprotocol/sdk)
└── jest.config.js     # Test configuration
```

### Available Tools

| Tool | Description |
|------|-------------|
| `list_robots` | List all robots with optional status/location filters |
| `get_robot` | Get details of a specific robot by ID |
| `create_robot` | Create a new robot in the fleet |
| `update_robot` | Update robot properties (name, status, location, battery) |
| `delete_robot` | Decommission a robot from the fleet |
| `schedule_maintenance` | Schedule maintenance for a robot |

### Commands

```bash
# From mcp-server/ directory
npm install            # Install dependencies
npm start              # Start MCP server (requires Robot API on port 3000)
npm test               # Run tests with coverage
```

### Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `MCP_PORT` | `3001` | Port for the MCP server |
| `ROBOT_API_URL` | `http://localhost:3000` | Robot API base URL |

### Endpoints

- `POST /mcp` - MCP protocol endpoint (Streamable HTTP transport)
- `GET /health` - Health check

### Usage with Claude

Add to your Claude configuration:

```json
{
  "mcpServers": {
    "schematica": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

### Running Both Servers

```bash
# Terminal 1: Start the Robot API
npm run dev

# Terminal 2: Start the MCP server
cd mcp-server && npm start
```

## Course Documentation

- `COURSE_OUTLINE.md` - Full curriculum structure
- `docs/LEARNING-OBJECTIVES.md` - Learning outcomes mapped to demos
- `docs/COURSE-SETUP.md` - Prerequisites and setup instructions
- `RESOURCES.md` - External reference links
