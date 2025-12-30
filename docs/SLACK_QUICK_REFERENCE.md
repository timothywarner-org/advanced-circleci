# Slack Notification Quick Reference

## Notification Patterns at a Glance

### 1️⃣ Test Failure (Immediate Alert)

**Trigger:** Test job fails  
**Channel:** #circleci-builds  
**Format:** Basic template

```
❌ Job Failed

Job: test
Branch: feature/add-robot-endpoint
Commit: abc1234

View Build →
```

**Action Required:** Fix failing tests immediately

---

### 2️⃣ Dev Deployment Success

**Trigger:** deploy-dev completes  
**Channel:** #circleci-builds  
**Format:** Custom block with details

```
🚀 Deployment Successful

Environment: dev          App: robot-api-dev
Branch: feature/xyz       Commit: abc1234

URL: https://robot-api-dev.azurecontainerapps.io

Pipeline #42 | View Build
```

**Action Required:** None (informational)

---

### 3️⃣ Staging Deployment Success

**Trigger:** deploy-staging completes (main branch only)  
**Channel:** #circleci-builds  
**Format:** Custom block

```
🚀 Deployment Successful

Environment: staging       App: robot-api-staging
Branch: main              Commit: def5678

URL: https://robot-api-staging.azurecontainerapps.io

Pipeline #43 | View Build
```

**Action Required:** Manual testing in staging environment

---

### 4️⃣ Approval Needed

**Trigger:** slack/on-hold job after staging  
**Channel:** #circleci-builds  
**Format:** On-hold template

```
⏸️ Workflow On Hold

Workflow: build-test-deploy
Pipeline: #43

Approve deployment to production

View Pipeline →
```

**Action Required:** Review staging, then approve in CircleCI UI

---

### 5️⃣ Production Deployment Success

**Trigger:** deploy-prod completes (after approval)  
**Channel:** #circleci-builds  
**Format:** Custom block

```
🚀 Deployment Successful

Environment: prod         App: robot-api-prod
Branch: main             Commit: def5678

URL: https://robot-api-prod.azurecontainerapps.io

Pipeline #43 | View Build
```

**Action Required:** Verify production deployment, monitor metrics

---

## Notification Decision Tree

```
Commit pushed
    ↓
Build job
    ↓
Test job
    ├──→ FAIL → 🔔 Slack alert (immediate)
    └──→ PASS → No notification (quiet success)
          ↓
          Deploy-dev (feature branches)
          └──→ SUCCESS → 🔔 Slack: Dev deployed
          
          Deploy-staging (main branch only)
          └──→ SUCCESS → 🔔 Slack: Staging deployed
                ↓
                Approval gate
                └──→ 🔔 Slack: Waiting for approval
                      ↓
                      [Human clicks Approve]
                      ↓
                      Deploy-prod
                      └──→ SUCCESS → 🔔 Slack: Prod deployed
```

---

## Expected Slack Volume

| Scenario | Notifications/Day | Volume |
|----------|------------------|--------|
| Normal development | 2-5 | Low ✅ |
| Active feature work | 5-15 | Medium |
| Incident response | 20-50 | High ⚠️ |

**Normal development:**
- Dev deployments: 2-3/day
- Staging deployments: 1-2/day
- Test failures: 0-2/day (should be rare)
- Production approvals: 0-1/day

---

## Silence Periods (Optional)

Add time-based filtering to reduce notification noise:

```yaml
# Only notify during business hours (9 AM - 6 PM EST)
- slack/notify:
    event: pass
    custom: |
      {
        "text": "Deployment successful",
        "blocks": [...]
      }
# Note: CircleCI doesn't have built-in time filtering
# Solution: Use Slack workflow automation to filter by time
```

**Alternative:** Configure Slack DND schedule
1. Slack Settings → Notifications
2. Set notification schedule (e.g., 9 AM - 6 PM)
3. Applies to all channels, including #circleci-builds

---

## Channel Strategy

### Single Channel (Current Setup)

```
#circleci-builds
├── Test failures
├── Dev deployments
├── Staging deployments
├── Approval needed
└── Prod deployments
```

**Pros:** Simple, one place to check  
**Cons:** Can get noisy with multiple teams

---

### Multi-Channel (Advanced)

```
#circleci-failures
└── Test failures only (urgent)

#circleci-deployments
├── Dev deployments
├── Staging deployments
└── Prod deployments

#circleci-approvals
├── Approval needed
└── Approval granted/denied
```

**Pros:** Granular control, better signal/noise  
**Cons:** More setup, need multiple webhooks

**Setup:** Create separate Slack apps with different webhooks, store in different CircleCI contexts.

---

## Notification Customization

### Change Channel Per Environment

```yaml
# Dev deployments → #dev-deployments
- slack/notify:
    event: pass
    channel: C0DEV12345  # Dev channel ID

# Prod deployments → #production-alerts
- slack/notify:
    event: pass
    channel: C0PROD6789  # Prod channel ID
```

### Add @mentions for Critical Events

```yaml
# Mention SRE team on production deployments
- slack/notify:
    event: pass
    custom: |
      {
        "text": "<!subteam^S0SRE1234> Production deployment complete",
        "blocks": [...]
      }
```

**User Group IDs:** Get from Slack → Settings → User Groups → Copy ID

---

## Testing Notifications

### Test Webhook Without Pipeline

```bash
# Replace with your actual webhook URL
WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"

# Test basic message
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test notification from curl"}'

# Test custom block
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "blocks": [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "🔧 Test Notification"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "This is a *test* notification with _formatting_"
        }
      }
    ]
  }'
```

---

## Slack Block Kit Cheat Sheet

### Common Block Types

```json
// Header (large text)
{
  "type": "header",
  "text": {
    "type": "plain_text",
    "text": "🚀 Deployment Successful"
  }
}

// Section with fields (key-value pairs)
{
  "type": "section",
  "fields": [
    {
      "type": "mrkdwn",
      "text": "*Environment:*\ndev"
    },
    {
      "type": "mrkdwn",
      "text": "*Status:*\nRunning ✓"
    }
  ]
}

// Section with button
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "Deployment complete"
  },
  "accessory": {
    "type": "button",
    "text": {
      "type": "plain_text",
      "text": "View Logs"
    },
    "url": "https://circleci.com/...",
    "style": "primary"
  }
}

// Context (small gray text at bottom)
{
  "type": "context",
  "elements": [
    {
      "type": "mrkdwn",
      "text": "Pipeline #42 | Deployed by @timwarner"
    }
  ]
}
```

**Interactive Builder:** https://app.slack.com/block-kit-builder

---

## Environment Variable Reference

### Required in `slack-notifications` Context

```bash
SLACK_WEBHOOK="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"
```

### Optional (for custom notifications)

```bash
SLACK_CHANNEL_ID="C08A48PLBH3"  # Channel ID for overrides
SLACK_USER_GROUP_SRE="S0SRE1234"  # @mention SRE team
```

---

## Common Issues & Fixes

### Issue: Notification not appearing

**Fix 1:** Check webhook URL
```bash
# Verify webhook works
curl -X POST $SLACK_WEBHOOK -H "Content-Type: application/json" -d '{"text":"test"}'
```

**Fix 2:** Verify context assignment
```yaml
# Job must have context specified
test:
  context: slack-notifications  # <-- Required
```

### Issue: Wrong channel

**Fix:** Channel is set at webhook creation time
1. Delete existing webhook in Slack app settings
2. Create new webhook pointing to correct channel
3. Update `SLACK_WEBHOOK` in CircleCI context

### Issue: Duplicate notifications

**Cause:** Multiple jobs triggering same notification  
**Fix:** Add `when: on_fail` or `when: on_success` conditions

```yaml
- slack/notify:
    event: fail
    when: on_fail  # Only notify if THIS step fails
```

---

## Slack App Permissions Required

**Minimum permissions for incoming webhooks:**
- `incoming-webhook` - Post messages to channels

**No additional scopes needed** (webhook URL is pre-authorized for one channel)

---

## Metrics to Track

After implementing Slack notifications, monitor:

1. **Notification volume** - Should stay under 20/day
2. **Time to acknowledge** - How fast team responds to failures
3. **False positive rate** - Flaky tests causing noise
4. **Approval latency** - Time between staging success and prod approval

**Goal:** High signal-to-noise ratio (every notification is actionable)

---

**Tip:** Bookmark this file and the Block Kit Builder for quick reference during demos and development.
