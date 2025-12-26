# Demo 2: Job Parameters for Reusable Job Definitions
## Module 2, Clip 3 (5 minutes)

### Overview
Transform three nearly-identical deploy jobs into one parameterized job. Show the before/after comparison with line count reduction.

---

## Pre-Demo Setup
1. Have "before" config with duplicate jobs ready
2. Line counter visible (VS Code shows lines in status bar)

---

## Demo Script

### 1. Show the Problem - Duplicate Jobs (1 minute)

**ACTION:** Open/display the "before" state:

```yaml
# BEFORE: Three duplicate jobs - 60+ lines of YAML!

jobs:
  deploy-dev:
    docker:
      - image: cimg/base:current
    steps:
      - run: az login --service-principal...
      - run: az containerapp update --name robot-api-dev...
      - run: |
          curl -X POST $SLACK_WEBHOOK \
            -d '{"text": "Deployed to DEV"}'

  deploy-staging:
    docker:
      - image: cimg/base:current
    steps:
      - run: az login --service-principal...
      - run: az containerapp update --name robot-api-staging...
      - run: |
          curl -X POST $SLACK_WEBHOOK \
            -d '{"text": "Deployed to STAGING"}'

  deploy-production:
    docker:
      - image: cimg/base:current
    steps:
      - run: az login --service-principal...
      - run: az containerapp update --name robot-api-production...
      - run: |
          curl -X POST $SLACK_WEBHOOK \
            -d '{"text": "Deployed to PRODUCTION"}'
```

**TALKING POINT:** "Look at this duplication! The only differences are the environment name and notification message. This is a maintenance nightmare."

### 2. Create Parameterized Job (2 minutes)

```yaml
# AFTER: One parameterized job - ~25 lines!

jobs:
  deploy:
    # Job parameters defined here
    parameters:
      environment:
        type: string
        description: "Target environment"
      replicas:
        type: integer
        default: 1
      notify-slack:
        type: boolean
        default: true
      resource-group:
        type: string
        default: "globomantics-robots"

    docker:
      - image: cimg/base:current
    steps:
      - run:
          name: Deploy to << parameters.environment >>
          command: |
            az containerapp update \
              --name robot-api-<< parameters.environment >> \
              --resource-group << parameters.resource-group >> \
              --replica-count << parameters.replicas >>

      # Conditional step using parameter
      - when:
          condition: << parameters.notify-slack >>
          steps:
            - run:
                name: Notify Slack
                command: |
                  curl -X POST $SLACK_WEBHOOK \
                    -d '{"text": "Deployed to << parameters.environment >>"}'
```

**TALKING POINT:** "One job, four parameters. The `when` condition even makes Slack notifications optional!"

### 3. Use in Workflow (1 minute)

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build
      - test:
          requires:
            - build

      # Same job, three different configurations!
      - deploy:
          name: deploy-dev
          environment: dev
          replicas: 1
          notify-slack: false
          requires:
            - test
          filters:
            branches:
              only: develop

      - deploy:
          name: deploy-staging
          environment: staging
          replicas: 2
          notify-slack: true
          requires:
            - test
          filters:
            branches:
              only: main

      - deploy:
          name: deploy-production
          environment: production
          replicas: 3
          resource-group: "globomantics-prod"
          notify-slack: true
          requires:
            - deploy-staging
          filters:
            branches:
              only: main
```

**TALKING POINT:** "Notice the `name` key—it gives each instance a unique identifier in the workflow graph."

### 4. Show Line Count Comparison (30 seconds)

| Metric | Before | After |
|--------|--------|-------|
| Lines of YAML | 60+ | 25 |
| Jobs to maintain | 3 | 1 |
| Bug fix locations | 3 | 1 |

**TALKING POINT:** "When we need to add a feature or fix a bug, we change one job instead of three. This is the DRY principle in action."

### 5. Quick Demonstration (30 seconds)

```bash
git add .
git commit -m "Refactor to parameterized deploy job"
git push
```

**SHOW:** CircleCI dashboard with three deploy-* job instances, all using the same underlying job definition.

---

## Key Takeaways
- Job parameters go inside the `parameters:` block within a job
- Reference with `<< parameters.name >>`
- `name:` in workflow gives unique job instance names
- `when:` enables conditional steps within jobs
- Massive reduction in duplicate code

---

## Transition
"Job parameters handle job-level reuse. But what about reusing step sequences? That's where commands come in."
