# Demo Troubleshooting Guide

Quick fixes for common issues during live demos.

## Table of Contents

- [CircleCI Issues](#circleci-issues)
- [Slack Integration Issues](#slack-integration-issues)
- [Azure/OIDC Issues](#azureoidc-issues)
- [Local Development Issues](#local-development-issues)
- [MCP Server Issues](#mcp-server-issues)
- [Network Issues](#network-issues)
- [Recovery Strategies](#recovery-strategies)

---

## CircleCI Issues

### Pipeline Not Triggering

**Symptoms:** Push to GitHub but no pipeline starts in CircleCI.

**Quick Fixes:**

1. **Check branch filters:**

   ```yaml
   # Your commit might be on a branch that's filtered out
   filters:
     branches:
       only: main  # Change to include your branch
   ```

2. **Verify webhook is configured:**
   - GitHub repo > Settings > Webhooks
   - CircleCI webhook should show recent deliveries

3. **Check config syntax:**

   ```bash
   circleci config validate .circleci/config.yml
   ```

4. **Force trigger via API:**

   ```bash
   curl -X POST "https://circleci.com/api/v2/project/github/YOUR_ORG/YOUR_REPO/pipeline" \
     -H "Circle-Token: $CIRCLECI_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"branch":"main"}'
   ```

**Demo Recovery:** "While that's running, let me show you the expected result from a previous successful run..."

---

### Pipeline Taking Too Long

**Symptoms:** Build is still running after 5+ minutes, eating into demo time.

**Quick Fixes:**

1. **Have a pre-recorded backup:**
   - Keep screenshots or video of successful runs
   - Say: "To save time, let me show you what the completed workflow looks like..."

2. **Use a simpler config:**

   ```bash
   # Swap to a minimal config for the demo
   cp .circleci/configs/01-sequential-baseline.yml .circleci/config.yml
   ```

3. **Skip to results:**
   - Open a previous successful build
   - Show artifacts and test results from that run

**Demo Recovery:** "Build times vary based on CircleCI's current load. Let's look at a completed example while this runs in the background."

---

### Job Failing Unexpectedly

**Symptoms:** A job that usually passes is now failing.

**Quick Fixes:**

1. **Check the error message:**
   - Click on failed job
   - Expand the failing step
   - Look for the actual error (not just "exit code 1")

2. **Common causes:**

   | Error | Likely Cause | Fix |
   |-------|-------------|-----|
   | `npm ci` fails | Lock file mismatch | Delete `node_modules`, run `npm install` |
   | Out of memory | Large test suite | Add `NODE_OPTIONS=--max_old_space_size=4096` |
   | Timeout | Slow tests | Increase job timeout |
   | Permission denied | Wrong Docker image | Check image has correct permissions |

3. **Re-run with SSH:**

   ```bash
   # From CircleCI UI: Rerun job with SSH
   # Then SSH in to debug
   ssh -p 54782 xx.xxx.xxx.xx
   ```

**Demo Recovery:** "This is actually a great teaching moment - let's debug this together and see how CircleCI's error reporting helps us identify the issue."

---

### Config Validation Error

**Symptoms:** Pipeline fails before any jobs run with "Configuration error."

**Quick Fixes:**

1. **Validate locally:**

   ```bash
   circleci config validate .circleci/config.yml
   ```

2. **Common syntax issues:**

   ```yaml
   # Wrong: Missing colon
   jobs
     build:

   # Right: With colon
   jobs:
     build:
   ```

   ```yaml
   # Wrong: Tab indentation
   jobs:
   	build:  # This is a tab!

   # Right: Space indentation
   jobs:
     build:  # Two spaces
   ```

3. **Process config to see expanded version:**

   ```bash
   circleci config process .circleci/config.yml
   ```

**Demo Recovery:** Have a known-good config ready to swap in.

---

## Slack Integration Issues

### Notifications Not Sending

**Symptoms:** Deployment completes but no Slack message appears.

**Quick Fixes:**

1. **Verify context is attached:**

   ```yaml
   workflows:
     build:
       jobs:
         - deploy:
             context:
               - slack-notifications  # Must be included!
   ```

2. **Check bot permissions:**
   - Go to Slack app settings
   - OAuth & Permissions > Bot Token Scopes
   - Must have: `chat:write`, `chat:write.public`

3. **Verify channel exists:**
   - The channel must exist before the bot can post
   - Bot must be invited to private channels

4. **Test webhook manually:**

   ```bash
   curl -X POST "https://slack.com/api/chat.postMessage" \
     -H "Authorization: Bearer $SLACK_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"channel":"deployments","text":"Test message"}'
   ```

**Demo Recovery:** "Slack notifications are asynchronous - they may appear shortly. Let's continue while we wait..."

---

### Wrong Channel or Malformed Message

**Symptoms:** Message appears but in wrong channel or looks broken.

**Quick Fixes:**

1. **Check channel name:**

   ```yaml
   - slack/notify:
       channel: deployments  # Must match exactly (no #)
   ```

2. **Validate JSON:**

   ```bash
   # Use jq to validate custom block format
   echo '{"blocks":[...]}' | jq .
   ```

3. **Use built-in template first:**

   ```yaml
   - slack/notify:
       event: pass
       template: success_tagged_deploy_1  # Use built-in template
   ```

---

## Azure/OIDC Issues

### OIDC Login Fails

**Symptoms:** `azure-cli/login-with-oidc` step fails.

**Error Messages and Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `AADSTS700016` | Wrong issuer URL | Check CircleCI org ID in federated credential |
| `AADSTS70021` | Subject mismatch | Update federated credential subject claim |
| `AADSTS50020` | Tenant mismatch | Verify AZURE_TENANT_ID in context |
| `No subscriptions found` | Missing permissions | Grant role on subscription |

**Quick Fixes:**

1. **Verify context variables:**

   ```bash
   # In CircleCI job, add debug step:
   - run:
       name: Debug Azure config
       command: |
         echo "Client ID: ${AZURE_CLIENT_ID:0:8}..."
         echo "Tenant ID: ${AZURE_TENANT_ID:0:8}..."
   ```

2. **Check federated credential:**

   ```bash
   # Subject should match this pattern:
   # org/YOUR_ORG_ID/project/YOUR_PROJECT_ID/user/*

   az ad app federated-credential list --id $APP_ID
   ```

3. **Verify CircleCI org/project IDs:**
   - Organization Settings > Overview > Organization ID
   - Project Settings > Overview > Project ID

**Demo Recovery:** "OIDC requires precise configuration. Let me show the correct setup..."

---

### Container Registry Push Fails

**Symptoms:** `az acr login` or `docker push` fails.

**Quick Fixes:**

1. **Check ACR permissions:**

   ```bash
   # Service principal needs AcrPush role
   az role assignment create \
     --assignee $APP_ID \
     --role "AcrPush" \
     --scope "/subscriptions/$SUB_ID/resourceGroups/globomantics-robots"
   ```

2. **Verify ACR exists:**

   ```bash
   az acr show --name $ACR_NAME
   ```

3. **Check login server URL:**

   ```bash
   # Should be: youracr.azurecr.io
   az acr show --name $ACR_NAME --query loginServer
   ```

---

### Container App Update Fails

**Symptoms:** `az containerapp update` returns error.

**Quick Fixes:**

1. **Check Container App exists:**

   ```bash
   az containerapp show \
     --name robot-api-dev \
     --resource-group globomantics-robots
   ```

2. **Verify resource group:**

   ```bash
   az group show --name globomantics-robots
   ```

3. **Check image reference:**

   ```bash
   # Image must be fully qualified:
   # myacr.azurecr.io/robot-api:tag
   ```

---

## Local Development Issues

### Tests Failing Locally

**Quick Fixes:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- tests/unit/robotService.test.js
```

### Port Already in Use

**Quick Fixes:**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 $(lsof -t -i :3000)

# Or use different port
PORT=3001 npm start
```

### Docker Build Fails Locally

**Quick Fixes:**

```bash
# Prune Docker system
docker system prune -af

# Build with no cache
docker build --no-cache -t robot-api .

# Check Dockerfile exists
ls -la Dockerfile
```

---

## MCP Server Issues

### MCP Server Won't Start

**Symptoms:** Error when running `npm start` in mcp-server directory.

**Quick Fixes:**

```bash
# Ensure you're in the correct directory
cd mcp-server

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (needs 18+)
node --version

# Try starting with verbose output
node src/index.js
```

### MCP Server Can't Connect to Robot API

**Symptoms:** MCP tools return connection errors.

**Quick Fixes:**

1. **Verify Robot API is running:**

   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check environment variable:**

   ```bash
   # Start with explicit API URL
   ROBOT_API_URL=http://localhost:3000 npm start
   ```

3. **Verify port 3000 is available:**

   ```bash
   lsof -i :3000
   ```

### MCP Port Already in Use

**Symptoms:** Error "EADDRINUSE" when starting MCP server.

**Quick Fixes:**

```bash
# Find what's using port 3001
lsof -i :3001

# Kill it
kill -9 $(lsof -t -i :3001)

# Or use different port
MCP_PORT=3002 npm start
```

### Claude Not Connecting to MCP Server

**Symptoms:** Claude can't see or use the robot management tools.

**Quick Fixes:**

1. **Verify MCP server is running:**

   ```bash
   curl http://localhost:3001/health
   ```

2. **Check Claude configuration:**

   ```json
   {
     "mcpServers": {
       "schematica": {
         "url": "http://localhost:3001/mcp"
       }
     }
   }
   ```

3. **Restart Claude after configuration changes**

### MCP Tools Returning Errors

**Symptoms:** Tools work but return error messages.

**Quick Fixes:**

1. **Check Robot API response:**

   ```bash
   # Test the underlying API directly
   curl http://localhost:3000/api/robots
   ```

2. **Check tool parameters:**
   - `get_robot`, `update_robot`, `delete_robot` require `id` parameter
   - `create_robot` requires `name` and `type` parameters

3. **Run MCP server tests:**

   ```bash
   cd mcp-server
   npm test
   ```

---

## Network Issues

### Behind Corporate Proxy

**Symptoms:** npm install, Docker pull, or API calls fail.

**Quick Fixes:**

```bash
# Set npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Set Docker proxy (in Docker Desktop settings)

# Or use VPN bypass for demo machines
```

### VPN Blocking CircleCI

**Symptoms:** GitHub webhook fails, CircleCI UI unreachable.

**Quick Fixes:**

1. Disconnect VPN temporarily
2. Use mobile hotspot for demo
3. Have local backup content ready

---

## Recovery Strategies

### The "Show Don't Tell" Recovery

When live demos fail, switch to showing completed examples:

```markdown
"While we troubleshoot this, let me show you what the successful
output looks like from a previous run..."

[Open browser tab with successful build]
```

### The "Teaching Moment" Recovery

Turn failures into learning opportunities:

```markdown
"This is actually a common issue teams encounter. Let's look at
how to diagnose it using CircleCI's debugging tools..."

[Show error logs, explain what they mean]
```

### The "Prepared Backup" Recovery

Always have these ready:

- [ ] Screenshots of successful workflow runs
- [ ] Pre-recorded video of critical demos (30 seconds each)
- [ ] Working config files that can be swapped in
- [ ] Browser tabs with completed builds already open

### Pre-Demo Checklist

Run 30 minutes before recording:

```bash
# Run verification script
./scripts/check-demo-ready.sh --module3

# Trigger a test build
git commit --allow-empty -m "Pre-demo test"
git push

# Verify it completes successfully before starting
```

---

## Quick Reference Card

Print this for quick access during demos:

```
╔═══════════════════════════════════════════════════════════════╗
║                    DEMO QUICK FIXES                           ║
╠═══════════════════════════════════════════════════════════════╣
║  Pipeline not starting  → Check branch filters                ║
║  Config error           → circleci config validate            ║
║  Slack not working      → Verify context attached             ║
║  OIDC fails             → Check org/project IDs               ║
║  Tests failing          → rm -rf node_modules && npm install  ║
║  Too slow               → Switch to pre-recorded backup       ║
║  MCP not connecting     → curl http://localhost:3001/health   ║
║  MCP tools failing      → Check Robot API on port 3000        ║
╚═══════════════════════════════════════════════════════════════╝
```
