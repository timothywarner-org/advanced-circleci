# ⚠️ PRE-FLIGHT CHECKLIST - MUST COMPLETE BEFORE PUSHING

## CRITICAL: Get Your Actual Slack Channel ID

The config currently has a **PLACEHOLDER** channel ID that you must replace.

### Step 1: Find Your Channel ID

**Method A: Slack Desktop/Web (Easiest)**
1. Open Slack → Navigate to `#circleci-builds` channel
2. Click channel name at top → "View channel details"
3. Scroll to bottom → Channel ID is listed
4. **Format:** Starts with `C` (e.g., `C08A48PLBH3`)

**Method B: Browser URL**
1. Open Slack in browser
2. Navigate to `#circleci-builds` channel
3. Look at URL: `https://app.slack.com/client/T00000000/C08A48PLBH3`
4. Channel ID is the last segment (starts with `C`)

### Step 2: Update Config File

**Find and replace in `.circleci/config.yml`:**

```yaml
# BEFORE (placeholder - won't work for you)
channel: C08A48PLBH3  # #circleci-builds channel ID

# AFTER (your actual channel ID)
channel: CYOURCHANNELID  # #circleci-builds channel ID
```

**Locations to update (3 places):**
1. Line ~94: Test job failure notification
2. Line ~127: Deploy job success notification (custom block)
3. Line ~198: slack/on-hold notification

**Search and replace (VS Code):**
```
Find: C08A48PLBH3
Replace: [YOUR_ACTUAL_CHANNEL_ID]
```

---

## Complete Pre-Flight Checklist

### ✅ Slack Configuration

- [ ] Slack webhook created at https://api.slack.com/apps
- [ ] Webhook URL copied (starts with `https://hooks.slack.com/services/...`)
- [ ] Channel `#circleci-builds` exists in workspace
- [ ] Webhook is configured to post to `#circleci-builds`

### ✅ CircleCI Context

- [ ] Context `slack-notifications` created in Organization Settings
- [ ] Variable `SLACK_WEBHOOK` added to context
- [ ] Variable value is your webhook URL (not channel ID)
- [ ] Context scope is set to Organization (not project-specific)

### ✅ Config File Updates

- [ ] **CRITICAL:** Replaced `C08A48PLBH3` with your actual channel ID (3 places)
- [ ] Config file is in `.circleci/config.yml` in repo root
- [ ] Config syntax validated (optional): `circleci config validate`

### ✅ Repository Setup

- [ ] GitHub repo exists: `robot-fleet-api` (or your actual repo name)
- [ ] Repo is connected to CircleCI project
- [ ] Main branch is set as default branch

---

## Validation Steps (Before Pushing)

### Step 1: Test Webhook Manually

```bash
# Replace with your actual webhook URL
WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"

# Test basic notification
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "✅ Pre-flight test: Webhook is working!"}'
```

**Expected result:** Message appears in `#circleci-builds` within 2 seconds

**If it doesn't appear:**
- Verify webhook URL is correct
- Verify webhook is configured for correct channel
- Check Slack app isn't disabled

### Step 2: Validate Config Syntax (Optional)

```bash
# If you have CircleCI CLI installed
circleci config validate .circleci/config.yml

# Expected output:
# Config file at .circleci/config.yml is valid.
```

**If validation fails:**
- Check YAML indentation (use spaces, not tabs)
- Verify no syntax errors in custom JSON blocks
- Ensure all required fields are present

---

## Post-Push Verification

After you push the config:

1. **Navigate:** CircleCI project page
2. **Check:** Pipeline starts automatically
3. **Watch:** Build and test jobs
4. **Switch to Slack:** Monitor `#circleci-builds` for notifications

**First notification should appear:**
- When test job completes (if you're on a feature branch → dev deployment success)
- When test job fails (if tests are broken → failure notification)

---

## Common First-Run Issues

### Issue 1: "Context not found"

```
Error: context 'slack-notifications' not found
```

**Fix:**
1. Go to Organization Settings → Contexts
2. Verify context name is exactly `slack-notifications` (case-sensitive, no typos)
3. Verify context contains `SLACK_WEBHOOK` variable
4. Re-run pipeline

### Issue 2: "Invalid channel ID"

```
Slack API error: channel_not_found
```

**Fix:**
1. Verify channel ID in config matches your actual channel ID
2. Channel ID should start with `C` and be alphanumeric
3. Don't confuse channel ID with channel name (`#circleci-builds` vs `C08A48PLBH3`)

### Issue 3: Webhook 404 error

```
HTTP 404: Not Found
```

**Fix:**
1. Webhook URL is invalid or app was deleted
2. Recreate Slack app and generate new webhook
3. Update `SLACK_WEBHOOK` in CircleCI context
4. Re-run pipeline

### Issue 4: No notifications appearing (but no errors)

```
Pipeline succeeds, but no Slack messages
```

**Fix:**
1. Check job has `context: slack-notifications` specified
2. Verify notification code is in correct job (test, deploy, etc.)
3. Check Slack channel mute settings
4. Verify you're watching the correct channel

---

## Environment-Specific Notes

### Feature Branches

**Expected flow:**
```
git checkout -b feature/test-slack
git push origin feature/test-slack
```

**Jobs that run:**
- build
- test (with failure notification enabled)
- deploy-dev (with success notification)

**Notifications you'll see:**
- Dev deployment success (always)
- Test failure (only if tests fail)

### Main Branch

**Expected flow:**
```
git checkout main
git push origin main
```

**Jobs that run:**
- build
- test (with failure notification enabled)
- deploy-staging (with success notification)
- slack/on-hold (approval needed notification)
- hold-for-production (manual approval required)
- deploy-prod (with success notification, after approval)

**Notifications you'll see:**
- Staging deployment success
- Approval needed
- Production deployment success (after you approve)

---

## Quick Test Procedure

**5-minute verification after setup:**

1. **Create test branch**
   ```bash
   git checkout -b test-slack-integration
   echo "// Test" >> README.md
   git add README.md
   git commit -m "Test Slack notifications"
   git push origin test-slack-integration
   ```

2. **Watch CircleCI**
   - Pipeline should start immediately
   - Build job → Green
   - Test job → Green (assuming tests pass)
   - Deploy-dev job → Green

3. **Check Slack**
   - Open `#circleci-builds` channel
   - You should see: **"🚀 Deployment Successful"** message
   - Verify environment shows "dev"
   - Click "View Build" link → Should open CircleCI pipeline

4. **Break a test (intentional)**
   ```bash
   # Edit a test file to fail
   echo "test('should fail', () => { expect(true).toBe(false); });" >> test/sample.test.js
   git add test/sample.test.js
   git commit -m "Break test intentionally"
   git push origin test-slack-integration
   ```

5. **Watch CircleCI**
   - Pipeline should start
   - Build job → Green
   - Test job → **RED** (fails)
   - Deploy-dev job → Skipped (doesn't run)

6. **Check Slack**
   - You should see: **"❌ Job Failed"** message
   - Verify job name shows "test"
   - This proves failure notification works

---

## Final Checklist Before Demo Recording

- [ ] Test notifications verified (both success and failure)
- [ ] Channel ID replaced in all 3 locations
- [ ] Context and webhook working
- [ ] Feature branch flow tested (build → test → dev)
- [ ] Main branch flow tested (includes staging + approval)
- [ ] Approval gate tested (manual approval in CircleCI UI)
- [ ] Production deployment notification verified

---

## Support Resources

- **CircleCI Slack Orb:** https://circleci.com/developer/orbs/orb/circleci/slack
- **Slack Block Kit Builder:** https://app.slack.com/block-kit-builder
- **CircleCI Contexts:** https://circleci.com/docs/contexts/
- **Webhook Testing:** https://api.slack.com/messaging/webhooks#posting_with_webhooks

---

**After completing this checklist, you're ready to push the config and record your demo.**

**Estimated setup time:** 10 minutes  
**Estimated first successful pipeline:** 15 minutes
