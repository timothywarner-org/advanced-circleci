# Slack Orb Integration Demo - Setup Guide

## Overview

This config demonstrates production-ready CircleCI patterns using the official Slack orb for notifications on a real Robot Fleet API project.

**What This Demo Shows:**
- ✅ Test failure notifications (immediate alerts)
- ✅ Deployment success notifications (confirmation)
- ✅ Approval gate workflow (production safety)
- ✅ Simulated Azure deployments (no cloud costs)
- ✅ Branch-based deployment strategy

---

## Prerequisites Checklist

- [x] Slack webhook created
- [x] CircleCI context `slack-notifications` with `SLACK_WEBHOOK` variable
- [x] Channel `#circleci-builds` exists in workspace
- [ ] Config file in `.circleci/config.yml` in your repo
- [ ] GitHub repo connected to CircleCI project

---

## Quick Start

### Step 1: Add Config to Your Repo

```bash
# Clone your robot-fleet-api repo
cd robot-fleet-api

# Create .circleci directory
mkdir -p .circleci

# Copy the config.yml to .circleci/config.yml
# (Use the config.yml file provided)

# Commit and push
git add .circleci/config.yml
git commit -m "Add CircleCI config with Slack notifications"
git push origin main
```

### Step 2: Verify CircleCI Project

1. **Navigate:** CircleCI Web App → Projects
2. **Find:** Your `robot-fleet-api` project
3. **Click:** "Set Up Project" (if not already connected)
4. **Select:** "Use existing config" (since you just pushed config.yml)
5. **Click:** "Start Building"

### Step 3: Verify Context Assignment

1. **Navigate:** Organization Settings → Contexts
2. **Find:** `slack-notifications` context
3. **Verify:** Contains `SLACK_WEBHOOK` variable
4. **Important:** Context is automatically available to any job that specifies `context: slack-notifications`

---

## Demo Scenarios

### Scenario A: Test Success (Feature Branch)

**Goal:** Show successful build → test → dev deployment

```bash
# Create feature branch
git checkout -b feature/add-robot-endpoint

# Make a trivial change
echo "// New feature" >> src/index.js

# Push to trigger pipeline
git add .
git commit -m "Add new robot endpoint"
git push origin feature/add-robot-endpoint
```

**Expected Flow:**
1. Build job runs → Caches dependencies
2. Test job runs → Tests pass (no Slack notification)
3. Deploy-dev job runs → Simulates Azure deployment
4. **Slack notification appears** in #circleci-builds with deployment success

**Slack Message Contents:**
```
🚀 Deployment Successful

Environment: dev
App: robot-api-dev
Branch: feature/add-robot-endpoint
Commit: abc1234

URL: https://robot-api-dev.azurecontainerapps.io

Pipeline #42 | View Build
```

---

### Scenario B: Test Failure (Immediate Alert)

**Goal:** Show fail-fast notification when tests break

```bash
# On feature branch, intentionally break a test
# Edit test file to cause failure
nano test/robot.test.js  # Add expect(true).toBe(false)

git add .
git commit -m "Break tests intentionally for demo"
git push origin feature/add-robot-endpoint
```

**Expected Flow:**
1. Build job runs → Succeeds
2. Test job runs → **FAILS**
3. **Slack notification fires immediately** with failure details
4. Pipeline stops (no deployment jobs run)

**Slack Message Contents:**
```
❌ Job Failed

Job: test
Branch: feature/add-robot-endpoint
Commit: def5678

View Build [link to CircleCI]
```

---

### Scenario C: Production Approval Gate (Main Branch)

**Goal:** Show approval workflow for production deployments

```bash
# Merge feature to main
git checkout main
git merge feature/add-robot-endpoint
git push origin main
```

**Expected Flow:**
1. Build job runs → Succeeds
2. Test job runs → Succeeds (no notification)
3. Deploy-staging job runs → **Slack notification: Staging success**
4. `slack/on-hold` job runs → **Slack notification: "Waiting for approval"**
5. `hold-for-production` job → **Pipeline PAUSES**
6. Human approval required in CircleCI UI
7. After approval → Deploy-prod runs → **Slack notification: Prod success**

**Approval Step (Manual):**
1. **Navigate:** CircleCI pipeline for this build
2. **Find:** `hold-for-production` job (yellow "On Hold" status)
3. **Click:** "Approve" button
4. **Result:** Production deployment job starts

---

## Slack Notification Details

### Notification Strategy

| Event | Job | When | Template | Why |
|-------|-----|------|----------|-----|
| **Failure** | test | Always on fail | `basic_fail_1` | Immediate alert on broken tests |
| **Success** | deploy (dev) | Always on pass | Custom block | Confirm dev deployment |
| **Success** | deploy (staging) | Always on pass | Custom block | Confirm staging deployment |
| **Hold** | slack/on-hold | After staging | `basic_on_hold_1` | Alert team approval needed |
| **Success** | deploy (prod) | Always on pass | Custom block | Confirm production deployment |

### Custom Block Format

The deployment notifications use Slack's Block Kit for rich formatting:
- **Header:** Deployment status
- **Fields:** Environment, App, Branch, Commit
- **Link:** Deployment URL
- **Context:** Pipeline number and link

### Channel Configuration

**Channel:** `#circleci-builds`  
**Workspace:** "Tech Trainer Tim Community"  
**Webhook:** Stored in `slack-notifications` context

---

## Workflow Branch Strategy

```
feature/* branches:
├── build
├── test
└── deploy-dev

develop branch:
├── build
├── test
└── deploy-dev

main branch:
├── build
├── test
├── deploy-staging
├── [APPROVAL GATE]
└── deploy-prod
```

---

## Troubleshooting

### Issue: No Slack notifications appearing

**Check 1:** Verify webhook URL
```bash
# In CircleCI, go to Organization Settings → Contexts
# Find: slack-notifications
# Verify: SLACK_WEBHOOK variable exists and is correct
```

**Check 2:** Verify context assignment
```yaml
# In config.yml, ensure job has context
jobs:
  test:
    context: slack-notifications  # <-- Required
```

**Check 3:** Test webhook manually
```bash
curl -X POST $SLACK_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{"text": "Test notification from command line"}'
```

### Issue: "Context not found" error

**Solution:** Context must exist before pipeline runs
1. Create context in Organization Settings → Contexts
2. Add `SLACK_WEBHOOK` variable to context
3. Re-run pipeline

### Issue: Slack app not posting to channel

**Solution:** Verify app permissions
1. Go to https://api.slack.com/apps
2. Select your "CircleCI Robot Fleet" app
3. Click "OAuth & Permissions"
4. Verify: `incoming-webhook` scope is enabled
5. Verify: Webhook is configured for correct channel

### Issue: Approval gate not appearing

**Solution:** Check branch filters
```yaml
# Approval gate only runs on main branch
hold-for-production:
  type: approval
  filters:
    branches:
      only: main  # <-- Must be on main branch
```

---

## Teaching Points

### 1. Why Notify on Test Failure Only?

**Anti-pattern:** Notify on every test success  
**Problem:** Noise overwhelms the channel (100+ notifications/day)

**Best practice:** Notify on failure only  
**Benefit:** Channel stays quiet until something breaks (signal vs. noise)

### 2. Why Custom Blocks vs. Templates?

**Templates** (`basic_fail_1`, `success_tagged_deploy_1`):
- Pre-built by CircleCI
- Simple, one-line usage
- Limited customization

**Custom Blocks** (JSON structure):
- Full control over formatting
- Rich media (buttons, images, fields)
- Brand-specific styling

**When to use which:**
- Failures: Use templates (speed matters)
- Deployments: Use custom blocks (branding/detail matters)

### 3. Why Separate Dev/Staging/Prod Contexts?

**Anti-pattern:** One context for all environments
```yaml
context: azure-credentials  # Bad - same creds everywhere
```

**Best practice:** Environment-specific contexts
```yaml
context:
  - slack-notifications      # Shared (read-only webhook)
  - azure-oidc-dev          # Dev credentials only
  - azure-oidc-staging      # Staging credentials only
  - azure-oidc-prod         # Production credentials only
```

**Why:** Principle of least privilege (dev deploy can't touch prod)

---

## Config Optimization Notes

### Orb Version Pinning

```yaml
node: circleci/node@6.1.0   # Minor version (gets 6.1.x patches)
slack: circleci/slack@4.14.0 # Exact version (maximum stability)
```

**Why different strategies?**
- Node orb: Actively maintained, patches fix bugs → Minor version OK
- Slack orb: Stable API, rarely changes → Exact version for determinism

### Workspace Persistence

```yaml
# Build job
- persist_to_workspace:
    root: .
    paths:
      - node_modules
      - dist

# Deploy job
- attach_workspace:
    at: .
```

**Why:** Avoids rebuilding in every job
- Faster pipelines (build once, use many times)
- Consistent artifacts (same build in dev/staging/prod)
- Cost savings (fewer compute minutes)

### Simulated Deployments

**Why simulate instead of real Azure deployments?**
1. **Cost:** No Azure resources consumed during demo
2. **Speed:** Instant "deployment" (no cloud provisioning wait)
3. **Repeatability:** No state to clean up between demo runs
4. **Safety:** Can't accidentally deploy broken code to real infrastructure

**For production:** Replace `simulate-azure-deployment` command with actual Azure CLI commands (see `m3-06-orbs-integrated.yml` for real Azure deployment example).

---

## Next Steps

After this demo works:

1. **Add custom orb** (Part 2 of demo) - Build your Globomantics orb
2. **Real Azure deployment** - Replace simulation with actual `az containerapp update`
3. **Multiple Slack channels** - Route different notifications to different channels
4. **Conditional deployments** - Add more sophisticated branch/tag filtering
5. **Parallel testing** - Split tests across multiple containers

---

## Demo Script (for Recording)

**Opening:**
> "Today we're integrating CircleCI with Slack using the official Slack orb. This is production-grade notification strategy - fail fast on tests, confirm deployments, and always require approval before production."

**Scene 1: Test Failure (2 min)**
1. Show config.yml highlighting `slack/notify` on test job
2. Push commit with broken test
3. Watch CircleCI pipeline fail at test job
4. **Switch to Slack** - Show failure notification in #circleci-builds
5. Click "View Build" link in Slack → Goes to CircleCI

**Scene 2: Deployment Success (3 min)**
1. Fix the broken test
2. Push to feature branch
3. Watch pipeline: build → test → deploy-dev
4. **Switch to Slack** - Show deployment success with environment details
5. Explain custom block format (fields, links, context)

**Scene 3: Approval Gate (3 min)**
1. Merge feature to main
2. Watch pipeline: build → test → deploy-staging
3. **Switch to Slack** - Show staging success notification
4. **Show CircleCI UI** - Approval gate appears (yellow "On Hold")
5. **Switch to Slack again** - "Waiting for approval" notification
6. **Click Approve** in CircleCI
7. Watch deploy-prod run
8. **Switch to Slack** - Production deployment success

**Closing:**
> "Three key takeaways: One, orbs eliminate boilerplate - we went from 25 lines of curl to 3 lines of slack/notify. Two, notification strategy matters - we only alert on failures and deployments, not every successful test. Three, approval gates give you production safety with full audit trail. Next video, we'll build a custom orb for the Globomantics Robot Fleet."

---

## File Locations

```
robot-fleet-api/
├── .circleci/
│   └── config.yml          # This config file
├── src/
│   └── index.js            # API source code
├── test/
│   └── robot.test.js       # Test suite
├── package.json
└── README.md
```

---

## Resources

- [Slack Orb Documentation](https://circleci.com/developer/orbs/orb/circleci/slack)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder) - Design custom notifications
- [CircleCI Contexts](https://circleci.com/docs/contexts/) - Manage secrets
- [Approval Jobs](https://circleci.com/docs/workflows/#holding-a-workflow-for-a-manual-approval) - Production gates

---

**Last Updated:** December 30, 2024  
**Config Version:** 2.1  
**Orb Versions:** node@6.1.0, slack@4.14.0
