# Azure Deployment Guide

This guide covers deploying the Globomantics Robot Fleet API to Azure using Azure Container Registry (ACR) and Azure Container Apps.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Initial Azure Setup](#initial-azure-setup)
- [CircleCI Configuration](#circleci-configuration)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Azure CLI** installed and configured (`az login`)
- **Azure Subscription** with permissions to create resources
- **CircleCI Account** connected to your GitHub repository
- **Docker** installed locally (for testing builds)

### Required Tools

```bash
# Install Azure CLI (macOS)
brew install azure-cli

# Install Azure CLI (Windows)
winget install Microsoft.AzureCLI

# Verify installation
az version
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CircleCI                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │
│  │  Build  │→ │  Test   │→ │  Push   │→ │  Deploy to Azure    │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Azure                                    │
│                                                                  │
│  ┌──────────────────────┐    ┌───────────────────────────────┐  │
│  │ Azure Container      │    │ Azure Container Apps          │  │
│  │ Registry (ACR)       │───▶│                               │  │
│  │                      │    │ ┌─────────┐ ┌─────────┐       │  │
│  │ globomantics.        │    │ │   Dev   │ │ Staging │       │  │
│  │   azurecr.io         │    │ └─────────┘ └─────────┘       │  │
│  │                      │    │      ┌─────────────┐          │  │
│  └──────────────────────┘    │      │ Production  │          │  │
│                              │      └─────────────┘          │  │
│  ┌──────────────────────┐    └───────────────────────────────┘  │
│  │ Log Analytics        │                                       │
│  │ Workspace            │◀── Logs & Metrics                     │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Purpose |
|-----------|---------|
| **Azure Container Registry** | Stores Docker images |
| **Azure Container Apps** | Runs containerized API (serverless) |
| **Container Apps Environment** | Shared environment for apps |
| **Log Analytics Workspace** | Centralized logging and monitoring |

---

## Initial Azure Setup

### Step 1: Login to Azure

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your Subscription Name"

# Verify
az account show
```

### Step 2: Deploy Infrastructure with Bicep

The infrastructure is defined in Bicep templates under `infra/`.

```bash
cd infra

# Deploy to dev environment
./deploy.sh dev

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production
```

This creates:
- Resource Group: `globomantics-robots-{environment}`
- Container Registry: `globomanticsacr{environment}`
- Container Apps Environment
- Container App: `robot-api-{environment}`
- Log Analytics Workspace

### Step 3: Get ACR Credentials

After deployment, retrieve your ACR credentials:

```bash
# Get ACR login server
az acr list --query "[].loginServer" -o tsv

# Get ACR credentials (admin user)
az acr credential show --name globomanticsacrdev --query "{username:username, password:passwords[0].value}"
```

**Save these values** - you'll need them for CircleCI.

---

## CircleCI Configuration

### Step 1: Set Up OIDC Authentication (Recommended)

OIDC provides secure, secretless authentication to Azure.

#### Create Azure AD App Registration

```bash
# Create app registration
az ad app create --display-name "CircleCI-Globomantics"

# Get the Application (client) ID
APP_ID=$(az ad app list --display-name "CircleCI-Globomantics" --query "[0].appId" -o tsv)
echo "App ID: $APP_ID"

# Create service principal
az ad sp create --id $APP_ID

# Get your CircleCI Organization ID from: https://app.circleci.com/settings/organization
CIRCLECI_ORG_ID="your-circleci-org-id"

# Add federated credential for CircleCI
az ad app federated-credential create --id $APP_ID --parameters '{
    "name": "CircleCI-OIDC",
    "issuer": "https://oidc.circleci.com/org/'$CIRCLECI_ORG_ID'",
    "subject": "org/'$CIRCLECI_ORG_ID'/project/<project-id>/user/<user-id>",
    "audiences": ["'$CIRCLECI_ORG_ID'"]
}'
```

#### Assign Azure Roles

```bash
# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Assign Contributor role to the resource group
az role assignment create \
    --assignee $APP_ID \
    --role "Contributor" \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/globomantics-robots-dev"

# Assign AcrPush role for container registry
az role assignment create \
    --assignee $APP_ID \
    --role "AcrPush" \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/globomantics-robots-dev"
```

### Step 2: Configure CircleCI Environment Variables

Go to **CircleCI > Project Settings > Environment Variables** and add:

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_CLIENT_ID` | Azure AD App ID | `12345678-1234-1234-1234-123456789012` |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | `87654321-4321-4321-4321-210987654321` |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | `abcdef12-3456-7890-abcd-ef1234567890` |
| `ACR_LOGIN_SERVER` | ACR URL | `globomanticsacrdev.azurecr.io` |
| `ACR_USERNAME` | ACR admin username | `globomanticsacrdev` |
| `ACR_PASSWORD` | ACR admin password | (from Azure portal) |
| `SLACK_ACCESS_TOKEN` | Slack bot token (optional) | `xoxb-...` |
| `SLACK_DEFAULT_CHANNEL` | Slack channel ID (optional) | `C01234567` |

### Step 3: Verify CircleCI Config

The pipeline is already configured in `.circleci/config.yml`:

```yaml
# Key sections:

# 1. Orbs (pre-built integrations)
orbs:
  node: circleci/node@5.2.0
  azure-cli: circleci/azure-cli@1.2.2
  slack: circleci/slack@4.13.3

# 2. Deploy command (builds and pushes to ACR)
commands:
  deploy-azure:
    steps:
      - run: docker build -t $ACR_LOGIN_SERVER/robot-api:${CIRCLE_SHA1} .
      - run: docker push $ACR_LOGIN_SERVER/robot-api:${CIRCLE_SHA1}
      - run: az containerapp update --image $ACR_LOGIN_SERVER/robot-api:${CIRCLE_SHA1}

# 3. Workflow (when deployments happen)
workflows:
  build-test-deploy:
    jobs:
      - deploy-dev       # feature/* and develop branches
      - deploy-staging   # main branch
      - deploy-production # main branch after approval
```

---

## Manual Deployment

For testing or emergency deployments, you can deploy manually:

### Build and Push Image

```bash
# Login to ACR
az acr login --name globomanticsacrdev

# Build image
docker build \
    --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
    --build-arg COMMIT_SHA=$(git rev-parse --short HEAD) \
    -t globomanticsacrdev.azurecr.io/robot-api:latest \
    .

# Push to ACR
docker push globomanticsacrdev.azurecr.io/robot-api:latest
```

### Deploy to Container Apps

```bash
# Update container app with new image
az containerapp update \
    --name robot-api-dev \
    --resource-group globomantics-robots-dev \
    --image globomanticsacrdev.azurecr.io/robot-api:latest
```

### Using the Makefile

For convenience, use the Makefile:

```bash
# Build locally
make docker-build-local

# Run locally
make docker-run-local

# View logs
make docker-logs

# Stop container
make docker-stop
```

---

## Environment Configuration

### Environment-Specific Settings

Each environment has its own Bicep parameter file:

| File | Environment | Purpose |
|------|-------------|---------|
| `infra/environments/dev.bicepparam` | Development | Testing new features |
| `infra/environments/staging.bicepparam` | Staging | Pre-production validation |
| `infra/environments/production.bicepparam` | Production | Live environment |

### Container App Settings

The Container Apps are configured with:

```bicep
// Scaling
minReplicas: 1        // Minimum instances
maxReplicas: 10       // Maximum instances (auto-scale)

// Resources
cpu: 0.5              // CPU cores
memory: '1Gi'         // Memory

// Health checks
healthProbes: [
  {
    type: 'liveness'
    path: '/api/health/live'
  },
  {
    type: 'readiness'
    path: '/api/health/ready'
  }
]
```

---

## Troubleshooting

### Common Issues

#### 1. ACR Login Fails

```bash
# Error: "unauthorized: authentication required"

# Solution: Re-authenticate
az acr login --name globomanticsacrdev

# Or check credentials
az acr credential show --name globomanticsacrdev
```

#### 2. Container App Not Starting

```bash
# Check logs
az containerapp logs show \
    --name robot-api-dev \
    --resource-group globomantics-robots-dev \
    --follow

# Check revision status
az containerapp revision list \
    --name robot-api-dev \
    --resource-group globomantics-robots-dev \
    -o table
```

#### 3. CircleCI OIDC Auth Fails

```bash
# Verify federated credential
az ad app federated-credential list --id $APP_ID

# Check role assignments
az role assignment list --assignee $APP_ID -o table
```

#### 4. Image Pull Errors

```bash
# Verify image exists in ACR
az acr repository show-tags --name globomanticsacrdev --repository robot-api

# Check Container App can access ACR
az containerapp show \
    --name robot-api-dev \
    --resource-group globomantics-robots-dev \
    --query "properties.configuration.registries"
```

### Viewing Logs

```bash
# Real-time logs
az containerapp logs show \
    --name robot-api-dev \
    --resource-group globomantics-robots-dev \
    --follow

# Historical logs (via Log Analytics)
az monitor log-analytics query \
    --workspace globomantics-logs-dev \
    --analytics-query "ContainerAppConsoleLogs_CL | where ContainerAppName_s == 'robot-api-dev' | order by TimeGenerated desc | take 100"
```

### Health Check Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/health` | Overall health | `{ "status": "healthy" }` |
| `/api/health/live` | Liveness probe | `{ "status": "alive" }` |
| `/api/health/ready` | Readiness probe | `{ "status": "ready" }` |

---

## Security Best Practices

1. **Use OIDC** instead of service principal secrets
2. **Enable ACR admin** only for initial setup, then use managed identity
3. **Rotate credentials** regularly if using username/password
4. **Use private endpoints** for production (requires Premium ACR)
5. **Enable vulnerability scanning** in ACR

---

## Next Steps

- [ ] Set up Azure AD OIDC authentication
- [ ] Configure CircleCI environment variables
- [ ] Deploy infrastructure to dev environment
- [ ] Run first CI/CD pipeline
- [ ] Configure Slack notifications (optional)
- [ ] Set up production with approval gates
