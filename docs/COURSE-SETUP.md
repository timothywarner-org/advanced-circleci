# Course Setup Guide

## Prerequisites Checklist

Before starting the course demos, ensure you have:

### Required

- [ ] GitHub account with repository access
- [ ] CircleCI account (free tier is sufficient)
- [ ] Node.js 18 or higher installed
- [ ] VS Code with extensions installed
- [ ] Git configured with SSH keys

### For Module 3 (Azure Deployment)

- [ ] Azure subscription (free tier works)
- [ ] Azure CLI installed
- [ ] Docker installed locally

## CircleCI Setup

### 1. Connect Repository

1. Log in to [CircleCI](https://app.circleci.com)
2. Click **Projects** → **Set Up Project**
3. Select this repository
4. Choose "Fastest" option to use existing config

### 2. Create Contexts

Navigate to **Organization Settings** → **Contexts**:

#### slack-notifications

- `SLACK_WEBHOOK` - Your Slack webhook URL

#### azure-oidc (Module 3)

- `AZURE_CLIENT_ID` - App registration client ID
- `AZURE_TENANT_ID` - Azure AD tenant ID
- `AZURE_SUBSCRIPTION_ID` - Target subscription
- `ACR_NAME` - Container registry name
- `ACR_LOGIN_SERVER` - e.g., myacr.azurecr.io
- `AZURE_RESOURCE_GROUP` - Resource group name

## Azure OIDC Setup

### 1. Create App Registration

```bash
# Create the app registration
az ad app create --display-name "CircleCI-OIDC-Demo"

# Note the appId from output
APP_ID=$(az ad app list --display-name "CircleCI-OIDC-Demo" --query "[0].appId" -o tsv)

# Create service principal
az ad sp create --id $APP_ID
```

### 2. Add Federated Credential

In Azure Portal:

1. Go to **Azure Active Directory** → **App registrations**
2. Select your app → **Certificates & secrets**
3. **Federated credentials** → **Add credential**
4. Select "Other issuer"
5. Configure:
   - **Issuer:** `https://oidc.circleci.com/org/<YOUR_ORG_ID>`
   - **Subject:** `org/<ORG_ID>/project/<PROJECT_ID>/user/<USER_ID>`
   - **Name:** `circleci-main-branch`

### 3. Grant Azure Permissions

```bash
# Get subscription ID
SUB_ID=$(az account show --query id -o tsv)

# Assign Contributor role
az role assignment create \
  --assignee $APP_ID \
  --role "Contributor" \
  --scope /subscriptions/$SUB_ID/resourceGroups/globomantics-robots
```

## Slack Webhook Setup

1. Go to [Slack API](https://api.slack.com/apps)
2. Create new app → "From scratch"
3. Add **Incoming Webhooks** feature
4. Activate and add webhook to #deployments channel
5. Copy webhook URL to CircleCI Context

## Verifying Setup

Run these checks before demos:

```bash
# Verify Node.js
node --version  # Should be 18+

# Verify npm
npm --version

# Verify Azure CLI
az --version

# Verify Docker
docker --version

# Test application locally
npm install
npm start
# In another terminal:
curl http://localhost:3000/api/health

# Test MCP server (optional)
cd mcp-server
npm install
npm start
# In another terminal:
curl http://localhost:3001/health
```

## Demo Environment Prep

Before each recording session:

1. Clear terminal history: `history -c`
2. Reset VS Code zoom: Cmd/Ctrl + 0
3. Close unnecessary tabs
4. Disable notifications
5. Test CircleCI pipeline with a dummy commit
6. Verify Slack webhook is working
7. Check Azure resources are deployed

## Branch Strategy for Demos

### Recommended Branches

Use these branches during demos to demonstrate different workflow behaviors:

| Branch | Purpose | Triggers |
|--------|---------|----------|
| `main` | Production deployments | Full pipeline with approval gates |
| `develop` | Integration testing | Deploy to dev/staging without approval |
| `feature/*` | Feature development | Build and test only, deploy to dev |
| `demo/*` | Recording sessions | Temporary branches for demos |

### Demo Session Workflow

```bash
# Before each demo session
git checkout main
git pull origin main
git checkout -b demo/module1-$(date +%Y%m%d)

# Make changes during demo...
git add .
git commit -m "Demo: sequential workflow"
git push -u origin demo/module1-$(date +%Y%m%d)

# After demo session - clean up
git checkout main
git branch -D demo/module1-$(date +%Y%m%d)
git push origin --delete demo/module1-$(date +%Y%m%d)
```

### Branch Filter Examples

The following filters are used in the production config:

```yaml
# Only main branch (production deploys)
filters:
  branches:
    only: main

# Develop and feature branches (dev deploys)
filters:
  branches:
    only:
      - develop
      - /feature\/.*/

# Tags only (releases)
filters:
  tags:
    only: /^v.*/
  branches:
    ignore: /.*/
```

### Tips for Recording

1. **Create demo branches before recording** - Avoids pushing to main accidentally
2. **Use descriptive branch names** - `feature/add-robot-endpoint` shows filter matching
3. **Pre-push test branches** - Have `feature/test-filters` ready to show branch filtering
4. **Clean up after** - Delete demo branches to keep repo clean

---

## Troubleshooting

See [TROUBLESHOOTING-DEMOS.md](./TROUBLESHOOTING-DEMOS.md) for detailed troubleshooting during demos.

### CircleCI Pipeline Not Triggering

- Check `.circleci/config.yml` syntax
- Verify branch filters match current branch
- Check project settings in CircleCI

### Azure OIDC Failing

- Verify federated credential subject matches
- Check org/project IDs are correct
- Ensure service principal has required permissions

### Slack Notifications Not Working

- Verify webhook URL is correct
- Check Context is attached to workflow
- Test webhook with curl directly
