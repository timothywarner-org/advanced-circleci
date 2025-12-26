# Demo 1: Pipeline Parameters for Workflow Control

## Module 2, Clip 2 (5 minutes)

### Overview

Introduce pipeline-level parameters that control workflow execution at trigger time. Show how to create boolean, string, and enum parameters.

---

## Pre-Demo Setup

1. VS Code with CircleCI extension
2. CircleCI dashboard open
3. Terminal for API trigger example
4. CIRCLECI_TOKEN environment variable set

---

## Demo Script

### 1. Explain Pipeline Parameters (30 seconds)

**TALKING POINT:** "Globomantics needs to skip tests for emergency hotfixes and choose deployment targets without editing config. Pipeline parameters solve this—they're set when the pipeline starts, before any jobs run."

### 2. Add Pipeline Parameters (2 minutes)

```yaml
version: 2.1

# Pipeline parameters - set at trigger time
parameters:
  # Boolean: toggle functionality
  skip-tests:
    type: boolean
    default: false
    description: "Skip test jobs for emergency hotfixes"

  # Enum: constrained choices
  deploy-environment:
    type: enum
    enum: ["dev", "staging", "production"]
    default: "dev"
    description: "Target deployment environment"

  # String: flexible input
  node-version:
    type: string
    default: "20"
    description: "Node.js version for builds"

  # Integer: numeric values
  test-retries:
    type: integer
    default: 2
    description: "Number of test retry attempts"
```

**TALKING POINT:** "Four parameter types: boolean for flags, enum for constrained choices, string for flexible values, and integer for numbers."

### 3. Use Parameters in Jobs (1 minute)

```yaml
jobs:
  build:
    docker:
      # Parameter in executor image
      - image: cimg/node:<< pipeline.parameters.node-version >>
    steps:
      - checkout
      - run: npm ci
      - run: npm run build

  test:
    docker:
      - image: cimg/node:<< pipeline.parameters.node-version >>
    steps:
      - checkout
      - run: npm ci
      - run:
          name: Run tests with retries
          command: |
            for i in $(seq 1 << pipeline.parameters.test-retries >>); do
              npm test && break
              echo "Attempt $i failed, retrying..."
            done
```

**TALKING POINT:** "Use double angle brackets to reference parameters. This is resolved at CONFIG time, before jobs start."

### 4. Conditional Workflow with `when` (1 minute)

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build
      # Conditional execution!
      - test:
          requires:
            - build
          when:
            not: << pipeline.parameters.skip-tests >>
      - deploy:
          requires:
            - build
            - test
```

**TALKING POINT:** "The `when` clause uses config-time logic. If skip-tests is true, the test job doesn't even start—it's completely excluded from the workflow."

### 5. Trigger with Custom Parameters (30 seconds)

**Via API:**

```bash
curl -X POST \
  https://circleci.com/api/v2/project/github/ORG/REPO/pipeline \
  -H "Circle-Token: $CIRCLECI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "main",
    "parameters": {
      "skip-tests": true,
      "deploy-environment": "production",
      "node-version": "18"
    }
  }'
```

**SHOW:** CircleCI UI → Trigger Pipeline → Parameter form

---

## Key Takeaways

- Pipeline parameters are set at trigger time
- Four types: boolean, enum, string, integer
- Accessed with `<< pipeline.parameters.name >>`
- `when` clauses enable conditional job execution
- Parameters are CONFIG-TIME, not runtime

---

## Transition

"Pipeline parameters control workflows. Now let's see how job parameters let us create reusable job definitions."
