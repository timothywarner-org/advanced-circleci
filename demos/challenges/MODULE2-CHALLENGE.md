# Module 2 Challenge: Configuration Reuse

## Overview

In this challenge, you'll apply the configuration reuse patterns learned in Module 2 to refactor a messy CircleCI configuration into a clean, maintainable solution.

**Time Estimate:** 20-30 minutes

**Skills Tested:**

- Pipeline parameters
- Job parameters
- Commands
- Executors
- Conditional logic with `when`

---

## The Problem

You've inherited this CircleCI configuration with **5 nearly-identical deploy jobs**:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: npm ci
      - run: npm run build
      - persist_to_workspace:
          root: .
          paths: [node_modules, dist]

  deploy-dev:
    docker:
      - image: cimg/base:current
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Login to Azure
          command: |
            echo "az login --service-principal..."
      - run:
          name: Deploy to dev
          command: |
            echo "Deploying to dev environment"
            echo "az containerapp update --name robot-api-dev --resource-group globomantics-robots"
      - run:
          name: Health check
          command: |
            echo "Checking health at https://robot-api-dev.azurecontainerapps.io/api/health"
      - run:
          name: Notify Slack
          command: |
            echo "Sending Slack notification for dev deployment"

  deploy-qa:
    docker:
      - image: cimg/base:current
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Login to Azure
          command: |
            echo "az login --service-principal..."
      - run:
          name: Deploy to qa
          command: |
            echo "Deploying to qa environment"
            echo "az containerapp update --name robot-api-qa --resource-group globomantics-robots"
      - run:
          name: Health check
          command: |
            echo "Checking health at https://robot-api-qa.azurecontainerapps.io/api/health"
      - run:
          name: Notify Slack
          command: |
            echo "Sending Slack notification for qa deployment"

  deploy-staging:
    docker:
      - image: cimg/base:current
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Login to Azure
          command: |
            echo "az login --service-principal..."
      - run:
          name: Deploy to staging
          command: |
            echo "Deploying to staging environment"
            echo "az containerapp update --name robot-api-staging --resource-group globomantics-robots"
      - run:
          name: Health check
          command: |
            echo "Checking health at https://robot-api-staging.azurecontainerapps.io/api/health"
      - run:
          name: Notify Slack
          command: |
            echo "Sending Slack notification for staging deployment"

  deploy-uat:
    docker:
      - image: cimg/base:current
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Login to Azure
          command: |
            echo "az login --service-principal..."
      - run:
          name: Deploy to uat
          command: |
            echo "Deploying to uat environment"
            echo "az containerapp update --name robot-api-uat --resource-group globomantics-robots"
      - run:
          name: Health check
          command: |
            echo "Checking health at https://robot-api-uat.azurecontainerapps.io/api/health"
      - run:
          name: Notify Slack
          command: |
            echo "Sending Slack notification for uat deployment"

  deploy-production:
    docker:
      - image: cimg/base:current
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Login to Azure
          command: |
            echo "az login --service-principal..."
      - run:
          name: Deploy to production
          command: |
            echo "Deploying to production environment"
            echo "az containerapp update --name robot-api-production --resource-group globomantics-prod"
      - run:
          name: Health check
          command: |
            echo "Checking health at https://robot-api-production.azurecontainerapps.io/api/health"
      - run:
          name: Notify Slack
          command: |
            echo "Sending Slack notification for production deployment"

workflows:
  deploy-all:
    jobs:
      - build
      - deploy-dev:
          requires: [build]
      - deploy-qa:
          requires: [deploy-dev]
      - deploy-staging:
          requires: [deploy-qa]
      - deploy-uat:
          requires: [deploy-staging]
      - approve-prod:
          type: approval
          requires: [deploy-uat]
      - deploy-production:
          requires: [approve-prod]
```

**Problems with this configuration:**

1. 5 deploy jobs that are 95% identical
2. Changing deployment logic requires editing 5 places
3. No way to skip environments or deploy to specific ones
4. Inconsistent - production uses different resource group but it's hidden
5. ~150 lines of duplicated YAML

---

## Your Challenge

Refactor this configuration to use:

### 1. One Parameterized Deploy Job

Create a single `deploy` job with parameters for:

- `environment` (string, required)
- `resource-group` (string, with default)
- `notify` (boolean, with default)

### 2. Reusable Commands

Extract common step sequences into commands:

- `azure-login` - Handle Azure authentication
- `deploy-to-environment` - The actual deployment logic
- `verify-deployment` - Health check logic

### 3. Pipeline Parameters

Add pipeline-level parameters to:

- Skip the build/test phase (for hotfix deployments)
- Target a specific environment via API trigger

### 4. An Executor

Create a reusable executor for deployment jobs.

---

## Requirements

Your refactored configuration should:

- [ ] Have only ONE deploy job definition (not 5)
- [ ] Use at least 2 commands for step reuse
- [ ] Include at least 2 pipeline parameters
- [ ] Use an executor for the deploy job
- [ ] Support the same workflow (dev → qa → staging → uat → approval → prod)
- [ ] Reduce total line count by at least 40%

---

## Hints

<details>
<summary>Hint 1: Job Parameters Structure</summary>

```yaml
jobs:
  deploy:
    parameters:
      environment:
        type: string
        description: "Target environment"
      resource-group:
        type: string
        default: "globomantics-robots"
    # ...
```

</details>

<details>
<summary>Hint 2: Command with Parameters</summary>

```yaml
commands:
  deploy-to-environment:
    parameters:
      env-name:
        type: string
    steps:
      - run:
          name: Deploy to << parameters.env-name >>
          command: echo "Deploying..."
```

</details>

<details>
<summary>Hint 3: Calling Parameterized Job in Workflow</summary>

```yaml
workflows:
  deploy:
    jobs:
      - deploy:
          name: deploy-dev      # Unique name for this instance
          environment: dev      # Parameter value
          requires: [build]
```

</details>

<details>
<summary>Hint 4: Pipeline Parameters</summary>

```yaml
parameters:
  skip-tests:
    type: boolean
    default: false

  target-environment:
    type: enum
    enum: ["all", "dev", "staging", "production"]
    default: "all"
```

</details>

---

## Validation

Test your refactored config:

```bash
# Validate syntax
circleci config validate .circleci/config.yml

# Process to see expanded version
circleci config process .circleci/config.yml

# Count lines (should be < 90 lines)
wc -l .circleci/config.yml
```

---

## Bonus Challenges

1. **Conditional Notifications:** Only send Slack notifications for staging and production, not dev/qa.

2. **Environment-Specific Replicas:** Add a `replicas` parameter with different defaults per environment.

3. **Targeted Deployment Workflow:** Create a second workflow that deploys to only the environment specified in `target-environment` pipeline parameter.

---

## Solution

When you're ready to check your work, see the solution at:

```
demos/module2-configuration-reuse/configs/module2-challenge-solution.yml
```

Compare your approach - there's often more than one correct solution!

---

## Key Takeaways

After completing this challenge, you should understand:

1. **Job parameters** eliminate duplicate job definitions
2. **Commands** extract and reuse step sequences
3. **Pipeline parameters** enable runtime configuration
4. **Executors** ensure consistent execution environments
5. The DRY principle dramatically improves maintainability
