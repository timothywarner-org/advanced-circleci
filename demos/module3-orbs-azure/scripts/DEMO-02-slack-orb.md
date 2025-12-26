# Demo 2: Slack Notifications Orb — Real-World Integration

## Module 3, Clip 3 (5 minutes)

### Overview

Add the circleci/slack orb for deployment notifications. Show custom message templates and on_success/on_failure triggers.

---

## Pre-Demo Setup

1. Slack workspace with a #deployments channel
2. Slack webhook URL ready (or mock for demo)
3. CircleCI Context created with SLACK_WEBHOOK
4. Have Slack visible to show notifications arriving

---

## Demo Script

### 1. Show the Manual Approach (30 seconds)

```yaml
# BEFORE: Manual Slack integration - 50+ lines!
jobs:
  deploy:
    steps:
      - run:
          name: Notify Slack on Success
          command: |
            if [ "$CIRCLE_JOB" = "deploy" ]; then
              curl -X POST $SLACK_WEBHOOK \
                -H 'Content-type: application/json' \
                -d "{
                  \"blocks\": [
                    {
                      \"type\": \"section\",
                      \"text\": {
                        \"type\": \"mrkdwn\",
                        \"text\": \"✅ Deployed ${CIRCLE_PROJECT_REPONAME}\"
                      }
                    }
                  ]
                }"
            fi
          when: on_success
      - run:
          name: Notify Slack on Failure
          command: |
            # Another 20+ lines for failure case...
          when: on_fail
```

**TALKING POINT:** "This is a maintenance nightmare. Every project has its own version, and nobody wants to debug JSON in bash."

### 2. Add the Slack Orb (1 minute)

```yaml
version: 2.1

orbs:
  node: circleci/node@5.2.0
  slack: circleci/slack@4.13.3  # Add Slack orb
```

**SHOW:** CircleCI Orb Registry - slack orb page, point out the available commands

### 3. Simple Notification (1 minute)

```yaml
jobs:
  deploy:
    executor: node/default
    steps:
      - checkout
      - run: echo "Deploying..."

      # One line for success notification!
      - slack/notify:
          event: pass
          channel: deployments

      # One line for failure notification!
      - slack/notify:
          event: fail
          channel: deployments
```

**TALKING POINT:** "Two lines replace 50. The orb handles JSON formatting, error handling, and Slack's Block Kit syntax."

### 4. Custom Message Template (1.5 minutes)

```yaml
- slack/notify:
    channel: deployments
    event: pass
    custom: |
      {
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "✅ Deployment Successful",
              "emoji": true
            }
          },
          {
            "type": "section",
            "fields": [
              {
                "type": "mrkdwn",
                "text": "*Project:*\nGlobomantics Robot API"
              },
              {
                "type": "mrkdwn",
                "text": "*Environment:*\nProduction"
              },
              {
                "type": "mrkdwn",
                "text": "*Branch:*\n${CIRCLE_BRANCH}"
              },
              {
                "type": "mrkdwn",
                "text": "*Commit:*\n${CIRCLE_SHA1:0:7}"
              }
            ]
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": { "type": "plain_text", "text": "View Build" },
                "url": "${CIRCLE_BUILD_URL}"
              }
            ]
          }
        ]
      }
```

**TALKING POINT:** "Custom templates let you use Slack's Block Kit. Notice how we use CircleCI environment variables right in the JSON."

### 5. Setup and Demonstration (1 minute)

**CircleCI Context Setup:**

1. Organization Settings → Contexts
2. Create "slack-notifications" context
3. Add SLACK_WEBHOOK environment variable

**Workflow with Context:**

```yaml
workflows:
  build-deploy:
    jobs:
      - deploy:
          context: slack-notifications
```

**ACTION:** Push code, show Slack notification arriving

---

## Slack Orb Events

| Event | Triggers |
| --- | --- |
| `pass` | Job succeeds |
| `fail` | Job fails |
| `always` | Every time |
| `on_hold` | Waiting for approval |

---

## Key Takeaways

- Slack orb: 2 lines vs 50+ lines of curl/JSON
- Use CircleCI Contexts for secrets
- Custom templates use Slack Block Kit
- Environment variables work in templates
- Both success and failure notifications

---

## Transition

"Notifications are great, but the real power is cloud deployments. Let's add Azure integration with OIDC authentication."
