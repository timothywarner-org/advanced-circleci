# Schematica MCP Server

An MCP (Model Context Protocol) server for the Globomantics Robot Fleet API.

## Overview

This MCP server provides AI assistants with tools to manage the robot fleet inventory via the Robot API. It uses the Anthropic MCP specification with streamable HTTP transport.

## Features

- **Streamable HTTP Transport**: No authentication required
- **CRUD Operations**: Full create, read, update, delete support for robots
- **Maintenance Scheduling**: Schedule maintenance tasks for robots

## Available Tools

| Tool | Description |
|------|-------------|
| `list_robots` | List all robots with optional status/location filters |
| `get_robot` | Get details of a specific robot by ID |
| `create_robot` | Create a new robot in the fleet |
| `update_robot` | Update robot properties (name, status, location, battery) |
| `delete_robot` | Decommission a robot from the fleet |
| `schedule_maintenance` | Schedule maintenance for a robot |

## Quick Start

```bash
# Install dependencies
npm install

# Start the MCP server (requires Robot API running on port 3000)
npm start

# Run tests
npm test
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `MCP_PORT` | 3001 | Port for the MCP server |
| `ROBOT_API_URL` | http://localhost:3000 | Robot API base URL |

## Endpoints

- `POST /mcp` - MCP protocol endpoint
- `GET /health` - Health check

## Usage with Claude

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
