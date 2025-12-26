# Module 3 Challenge: Orbs Integration

## Overview

In this challenge, you'll replace manual implementations with CircleCI orbs, measuring the reduction in configuration complexity and improved maintainability.

**Time Estimate:** 25-35 minutes

**Skills Tested:**

- Finding and evaluating orbs in the registry
- Using orb commands, jobs, and executors
- Configuring orb parameters
- Comparing orb vs manual implementations

---

## The Problem

You have a working CircleCI configuration that manually implements:

1. Node.js setup with dependency caching
2. Slack notifications for deployments
3. Azure CLI installation and authentication

Here's the current "manual" implementation:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:20.0
    working_directory: ~/project
    steps:
      - checkout

      # Manual cache restore - 12 lines
      - restore_cache:
          keys:
            - v1-deps-{{ checksum "package-lock.json" }}
            - v1-deps-

      - run:
          name: Install dependencies
          command: npm ci

      # Manual cache save - 6 lines
      - save_cache:
          key: v1-deps-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules

      - run:
          name: Run tests
          command: npm test

      - run:
          name: Build application
          command: npm run build

      - persist_to_workspace:
          root: .
          paths: [node_modules, dist, package.json, Dockerfile]

  deploy:
    docker:
      - image: cimg/base:current
    steps:
      - attach_workspace:
          at: .

      - setup_remote_docker

      # Manual Azure CLI installation - 15 lines
      - run:
          name: Install Azure CLI
          command: |
            curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

      # Manual OIDC authentication - 20 lines
      - run:
          name: Authenticate with Azure (OIDC)
          command: |
            echo "Getting OIDC token from CircleCI..."
            OIDC_TOKEN=$(curl -s -H "Circle-Token: $CIRCLE_OIDC_TOKEN" \
              "https://oidc.circleci.com/org/$CIRCLE_ORGANIZATION_ID")

            echo "Exchanging for Azure token..."
            az login --service-principal \
              --username $AZURE_CLIENT_ID \
              --tenant $AZURE_TENANT_ID \
              --federated-token "$OIDC_TOKEN"

      - run:
          name: Build and push Docker image
          command: |
            az acr login --name $ACR_NAME
            docker build -t $ACR_LOGIN_SERVER/robot-api:$CIRCLE_SHA1 .
            docker push $ACR_LOGIN_SERVER/robot-api:$CIRCLE_SHA1

      - run:
          name: Deploy to Azure Container Apps
          command: |
            az containerapp update \
              --name robot-api-staging \
              --resource-group globomantics-robots \
              --image $ACR_LOGIN_SERVER/robot-api:$CIRCLE_SHA1

      # Manual Slack notification - 25 lines
      - run:
          name: Send Slack notification
          command: |
            curl -X POST "$SLACK_WEBHOOK_URL" \
              -H "Content-Type: application/json" \
              -d '{
                "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": "Deployment to staging complete!\nCommit: '"$CIRCLE_SHA1"'"
                    }
                  }
                ]
              }'
          when: on_success

      - run:
          name: Send failure notification
          command: |
            curl -X POST "$SLACK_WEBHOOK_URL" \
              -H "Content-Type: application/json" \
              -d '{"text": "Deployment FAILED! Check build: '"$CIRCLE_BUILD_URL"'"}'
          when: on_fail

workflows:
  build-and-deploy:
    jobs:
      - build
      - deploy:
          requires: [build]
          filters:
            branches:
              only: main
```

**Current line count:** ~100 lines

**Problems:**

1. Manual caching logic is error-prone and verbose
2. Azure CLI installation needs updating when new versions release
3. OIDC token exchange is complex and hard to debug
4. Slack notifications require JSON formatting knowledge
5. No automatic updates or community improvements

---

## Your Challenge

Refactor this configuration to use these orbs:

| Orb | Purpose |
|-----|---------|
| `circleci/node@5.2.0` | Node.js setup and caching |
| `circleci/slack@4.13.3` | Slack notifications |
| `circleci/azure-cli@1.2.2` | Azure CLI and OIDC auth |

---

## Requirements

### Part 1: Replace Node.js Setup

Replace the manual cache restore/save with the `node` orb:

- [ ] Use `node/default` executor (or specify tag)
- [ ] Use `node/install-packages` command
- [ ] Remove manual `restore_cache` and `save_cache` steps

**Target:** Replace ~20 lines with ~3 lines

### Part 2: Replace Azure CLI Setup

Replace manual Azure CLI installation and OIDC login:

- [ ] Use `azure-cli/install` command
- [ ] Use `azure-cli/login-with-oidc` command
- [ ] Remove manual curl and az login commands

**Target:** Replace ~35 lines with ~2 lines

### Part 3: Replace Slack Notifications

Replace manual webhook calls with the `slack` orb:

- [ ] Use `slack/notify` command for success
- [ ] Use `slack/notify` command for failure
- [ ] Use custom block format or built-in template

**Target:** Replace ~30 lines with ~15 lines (more features, less code)

### Part 4: Measure the Improvement

After refactoring, calculate:

1. Total line reduction percentage
2. Number of manual implementations removed
3. Features gained (that would require more code to implement manually)

---

## Step-by-Step Guide

### Step 1: Declare the Orbs

Add the orbs section at the top of your config:

```yaml
version: 2.1

orbs:
  node: circleci/node@5.2.0
  slack: circleci/slack@4.13.3
  azure-cli: circleci/azure-cli@1.2.2
```

### Step 2: Research Each Orb

Before using an orb, explore it in the registry:

1. Go to https://circleci.com/developer/orbs
2. Search for "circleci/node"
3. Review:
   - Available commands
   - Available executors
   - Available jobs
   - Parameters and defaults

### Step 3: Refactor the Build Job

<details>
<summary>Hint: Node Orb Usage</summary>

```yaml
jobs:
  build:
    executor:
      name: node/default
      tag: "20"
    steps:
      - checkout
      - node/install-packages  # Replaces restore, npm ci, save!
      - run: npm test
      - run: npm run build
```

</details>

### Step 4: Refactor Azure Authentication

<details>
<summary>Hint: Azure CLI Orb Usage</summary>

```yaml
- azure-cli/install
- azure-cli/login-with-oidc
# That's it! Token exchange is handled automatically
```

</details>

### Step 5: Refactor Slack Notifications

<details>
<summary>Hint: Slack Orb Usage</summary>

```yaml
- slack/notify:
    event: pass
    channel: deployments
    custom: |
      {
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deployment Successful* to staging"
            }
          }
        ]
      }

- slack/notify:
    event: fail
    template: basic_fail_1
```

</details>

---

## Bonus Challenges

### 1. Use the Node Orb's Built-in Test Job

The node orb includes a pre-built `node/test` job. Try using it:

```yaml
workflows:
  build-and-deploy:
    jobs:
      - node/test  # Built-in job!
      - deploy:
          requires: [node/test]
```

### 2. Add a Nightly Security Scan

Use the node orb's caching with a scheduled workflow:

```yaml
workflows:
  nightly:
    triggers:
      - schedule:
          cron: "0 2 * * *"
          filters:
            branches:
              only: main
    jobs:
      - build
      - security-scan:
          requires: [build]
```

### 3. Parallel Test Execution

The node orb works well with CircleCI's test splitting:

```yaml
test:
  parallelism: 4
  executor: node/default
  steps:
    - checkout
    - node/install-packages
    - run:
        command: |
          TESTFILES=$(circleci tests glob "tests/**/*.test.js" | circleci tests split)
          npm test -- $TESTFILES
```

---

## Validation

### Syntax Check

```bash
circleci config validate .circleci/config.yml
```

### Process and Review

```bash
# See expanded config (orbs are expanded to their implementation)
circleci config process .circleci/config.yml | head -100
```

### Line Count Comparison

```bash
# Original: ~100 lines
# Target: <50 lines (50%+ reduction)
wc -l .circleci/config.yml
```

---

## Comparison Table

Fill in this table after completing your refactor:

| Component | Manual Lines | Orb Lines | Reduction |
|-----------|-------------|-----------|-----------|
| Node.js + Caching | ~20 | ? | ?% |
| Azure CLI Install | ~15 | ? | ?% |
| Azure OIDC Login | ~20 | ? | ?% |
| Slack Success | ~15 | ? | ?% |
| Slack Failure | ~15 | ? | ?% |
| **Total** | ~85 | ? | ?% |

---

## Solution

When you're ready to check your work:

```
demos/module3-orbs-azure/configs/module3-challenge-solution.yml
```

---

## Key Takeaways

After completing this challenge, you should understand:

1. **Orbs provide tested, maintained implementations** of common tasks
2. **The orb registry** is the source of truth for available orbs
3. **Orb commands** replace complex step sequences
4. **Orb executors** provide pre-configured environments
5. **Version pinning** ensures reproducible builds
6. The trade-off between **flexibility** (manual) and **maintainability** (orbs)

---

## When to Use Orbs vs Custom Implementation

### Use Orbs When

- Standard tooling (Node.js, Python, Docker)
- Common integrations (Slack, Jira, cloud CLIs)
- You want automatic updates and improvements
- The orb is certified or from a trusted partner

### Use Custom Implementation When

- Highly specialized internal tooling
- Strict security requirements (must audit all code)
- The orb doesn't support your specific configuration
- You need features the orb doesn't provide
