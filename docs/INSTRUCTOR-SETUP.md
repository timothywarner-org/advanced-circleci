# Instructor Setup Guide

Step-by-step guide for instructors setting up this course for the first time.

## Quick Start Checklist

Complete these steps **before your first recording session**:

- [ ] Fork the repository to your GitHub account
- [ ] Connect repository to CircleCI
- [ ] Create CircleCI contexts with credentials
- [ ] Set up Slack webhook for notifications
- [ ] Configure Azure OIDC (for Module 3)
- [ ] Run verification script
- [ ] Test a complete pipeline run

**Estimated setup time:** 45-60 minutes (first time), 10 minutes (subsequent)

---

## Step 1: Fork and Clone Repository

```bash
# Fork via GitHub UI, then clone your fork
git clone https://github.com/YOUR_USERNAME/advanced-circleci.git
cd advanced-circleci

# Verify the project runs locally
npm install
npm test
npm start &
curl http://localhost:3000/api/health
# Should return: {"status":"healthy",...}
```

---

## Step 2: Connect to CircleCI

### 2.1 Link Repository

1. Log in to [CircleCI](https://app.circleci.com)
2. Click **Projects** in left sidebar
3. Find your forked repository
4. Click **Set Up Project**
5. Choose **Fastest: Use existing config**
6. Click **Set Up Project**

### 2.2 Note Your Organization and Project IDs

You'll need these for Azure OIDC setup:

```bash
# Find in CircleCI URL or Organization Settings
# Example URL: https://app.circleci.com/pipelines/github/YOUR_ORG/advanced-circleci
#
# Organization ID: Found in Organization Settings > Overview
# Project ID: Found in Project Settings > Overview
```

**Save these values:**

- Organization ID: `_________________________________`
- Project ID: `_________________________________`

---

## Step 3: Create CircleCI Contexts

Navigate to **Organization Settings** > **Contexts**

### 3.1 Create `slack-notifications` Context

| Variable | Value | Notes |
|----------|-------|-------|
| `SLACK_ACCESS_TOKEN` | `xoxb-...` | Bot token from Slack app |
| `SLACK_DEFAULT_CHANNEL` | `deployments` | Default channel for notifications |

### 3.2 Create `azure-oidc` Context (for Module 3)

| Variable | Value | Notes |
|----------|-------|-------|
| `AZURE_CLIENT_ID` | `xxxxxxxx-xxxx-...` | App Registration client ID |
| `AZURE_TENANT_ID` | `xxxxxxxx-xxxx-...` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | `xxxxxxxx-xxxx-...` | Target subscription |
| `ACR_NAME` | `globomanticsacr` | Container registry name |
| `ACR_LOGIN_SERVER` | `globomanticsacr.azurecr.io` | Registry URL |
| `AZURE_RESOURCE_GROUP` | `globomantics-robots` | Resource group name |

---

## Step 4: Set Up Slack App

### 4.1 Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** > **From scratch**
3. Name: `CircleCI Notifications`
4. Select your workspace
5. Click **Create App**

### 4.2 Configure Permissions

1. Go to **OAuth & Permissions**
2. Under **Scopes** > **Bot Token Scopes**, add:
   - `chat:write`
   - `chat:write.public`
3. Click **Install to Workspace**
4. Copy the **Bot User OAuth Token** (`xoxb-...`)

### 4.3 Create Notification Channel

1. In Slack, create channel `#deployments`
2. Invite the bot: `/invite @CircleCI Notifications`

### 4.4 Test Webhook

```bash
curl -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer xoxb-YOUR-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"deployments","text":"CircleCI test notification!"}'
```

---

## Step 5: Set Up Azure OIDC (Module 3 Only)

### 5.1 Create App Registration

```bash
# Login to Azure
az login

# Create app registration
az ad app create --display-name "CircleCI-CourseDemo"

# Get the app ID
APP_ID=$(az ad app list --display-name "CircleCI-CourseDemo" --query "[0].appId" -o tsv)
echo "App ID: $APP_ID"

# Create service principal
az ad sp create --id $APP_ID
```

### 5.2 Add Federated Credential

```bash
# Replace with your CircleCI org ID
CIRCLECI_ORG_ID="your-org-id-here"

# Create federated credential
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"CircleCI-OIDC\",
    \"issuer\": \"https://oidc.circleci.com/org/${CIRCLECI_ORG_ID}\",
    \"subject\": \"org/${CIRCLECI_ORG_ID}/project/*/user/*\",
    \"audiences\": [\"${CIRCLECI_ORG_ID}\"]
  }"
```

### 5.3 Grant Azure Permissions

```bash
# Get subscription ID
SUB_ID=$(az account show --query id -o tsv)

# Create resource group
az group create --name globomantics-robots --location eastus

# Grant Contributor role
az role assignment create \
  --assignee $APP_ID \
  --role "Contributor" \
  --scope "/subscriptions/$SUB_ID/resourceGroups/globomantics-robots"
```

### 5.4 Create Azure Container Registry

```bash
# Create ACR (name must be globally unique)
az acr create \
  --name globomanticsacr$(date +%s) \
  --resource-group globomantics-robots \
  --sku Basic

# Grant AcrPush role
ACR_ID=$(az acr show --name globomanticsacr --query id -o tsv)
az role assignment create \
  --assignee $APP_ID \
  --role "AcrPush" \
  --scope $ACR_ID
```

---

## Step 6: Run Verification Script

```bash
# Make the script executable
chmod +x scripts/check-demo-ready.sh

# Run pre-demo verification
./scripts/check-demo-ready.sh
```

Expected output:

```
╔════════════════════════════════════════════════════════════╗
║     DEMO READINESS CHECK                                   ║
╚════════════════════════════════════════════════════════════╝

[✓] Node.js 20.x installed
[✓] npm available
[✓] Git configured
[✓] Application starts successfully
[✓] Tests pass
[✓] CircleCI CLI available
[✓] Azure CLI available
[✓] Docker available

All checks passed! Ready for demos.
```

---

## Step 7: Test Complete Pipeline

```bash
# Create a test branch and push
git checkout -b test-setup
echo "# Test" >> README.md
git add .
git commit -m "Test pipeline setup"
git push -u origin test-setup
```

**Verify in CircleCI:**

1. Pipeline triggers automatically
2. Build job completes successfully
3. Test jobs pass
4. (If configured) Slack notification received

**Clean up:**

```bash
git checkout main
git branch -d test-setup
git push origin --delete test-setup
```

---

## Pre-Recording Session Checklist

Run through this checklist before each recording:

### Environment

- [ ] Close unnecessary applications
- [ ] Disable notifications (Slack, email, system)
- [ ] Set terminal font to 16pt+ for visibility
- [ ] Clear terminal history: `history -c && clear`
- [ ] Reset VS Code zoom: `Cmd/Ctrl + 0`

### CircleCI

- [ ] Log in to CircleCI dashboard
- [ ] Verify no pending builds
- [ ] Check contexts are accessible
- [ ] Clear any failed builds from view

### Local

- [ ] Pull latest from main: `git pull origin main`
- [ ] Run `npm install` (ensure dependencies current)
- [ ] Run `npm test` (verify tests pass)
- [ ] Start local server: `npm start`
- [ ] Verify health: `curl localhost:3000/api/health`

### Demo-Specific

- [ ] Review demo script for current module
- [ ] Open relevant config files in VS Code
- [ ] Prepare any tabs/windows needed
- [ ] Have backup demo video ready (just in case)

---

## Branch Strategy for Demos

### Recommended Approach

Use dedicated demo branches to avoid polluting main:

```bash
# Before each demo session
git checkout main
git pull origin main
git checkout -b demo/module1-$(date +%Y%m%d)

# After demo session
git checkout main
git branch -D demo/module1-$(date +%Y%m%d)
```

### Branch Naming Convention

| Branch Pattern | Purpose |
|---------------|---------|
| `main` | Production-ready config |
| `develop` | Integration branch for demos |
| `demo/module1-*` | Module 1 demo recordings |
| `demo/module2-*` | Module 2 demo recordings |
| `demo/module3-*` | Module 3 demo recordings |
| `feature/*` | Demonstrate feature branch filters |

### Preparing Feature Branch Demo

```bash
# For demonstrating branch filters
git checkout -b feature/add-robots
# Make changes, push, show filter in action
git push -u origin feature/add-robots
```

---

## Timing Guide

### Module 1: Workflow Orchestration (15 minutes)

| Segment | Duration | Content |
|---------|----------|---------|
| Intro | 1 min | Problem statement, objectives |
| Demo 1 | 3 min | Sequential workflows |
| Demo 2 | 3 min | Parallel fan-out |
| Demo 3 | 3 min | Branch/tag filters |
| Demo 4 | 3 min | Approvals and scheduling |
| Summary | 2 min | Key takeaways |

### Module 2: Configuration Reuse (15 minutes)

| Segment | Duration | Content |
|---------|----------|---------|
| Intro | 1 min | DRY principle, objectives |
| Demo 1 | 3 min | Pipeline parameters |
| Demo 2 | 4 min | Job parameters |
| Demo 3 | 4 min | Commands and executors |
| Demo 4 | 2 min | Parameters vs env vars |
| Summary | 1 min | Key takeaways |

### Module 3: Orbs and Azure (15 minutes)

| Segment | Duration | Content |
|---------|----------|---------|
| Intro | 1 min | What are orbs, objectives |
| Demo 1 | 3 min | Node.js orb |
| Demo 2 | 3 min | Slack orb |
| Demo 3 | 5 min | Azure orb with OIDC |
| Demo 4 | 2 min | Capstone review |
| Summary | 1 min | Course wrap-up |

---

## Troubleshooting Common Issues

See [TROUBLESHOOTING-DEMOS.md](./TROUBLESHOOTING-DEMOS.md) for detailed solutions to common problems during demos.

### Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Pipeline not triggering | Check branch filters, verify `.circleci/config.yml` exists |
| Slack not working | Verify bot token, check channel permissions |
| Azure login fails | Check federated credential subject claim |
| Tests failing | Run `npm install` and try again |
| Docker build fails | Check `setup_remote_docker` is included |

---

## Support Resources

- **CircleCI Documentation:** https://circleci.com/docs/
- **Slack API:** https://api.slack.com/
- **Azure CLI Reference:** https://learn.microsoft.com/en-us/cli/azure/
- **Course Issues:** Contact Pluralsight author support
