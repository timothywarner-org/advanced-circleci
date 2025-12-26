# Demo 3: Commands — Reusable Step Sequences
## Module 2, Clip 5 (5 minutes)

### Overview
Extract repeated step sequences into commands—think of them as "functions" you can call from multiple jobs.

---

## Pre-Demo Setup
1. Show jobs with repeated step patterns (checkout, restore_cache, npm install, save_cache)
2. Highlight the duplication visually

---

## Demo Script

### 1. Identify Repeated Patterns (30 seconds)

**ACTION:** Show the duplication across jobs:

```yaml
# Same 8 lines in EVERY job!
jobs:
  build:
    steps:
      - checkout
      - restore_cache:
          keys:
            - deps-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      # ... actual build steps

  test:
    steps:
      - checkout
      - restore_cache:
          keys:
            - deps-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      # ... actual test steps
```

**TALKING POINT:** "These 8 lines appear in every single job. If we need to change the cache key format, we'd have to update it everywhere."

### 2. Create Commands (2 minutes)

```yaml
# Commands block - define reusable step sequences
commands:
  setup-node:
    description: "Set up Node.js environment with caching"
    parameters:
      node-version:
        type: string
        default: "20"
    steps:
      - checkout
      - restore_cache:
          keys:
            - node-deps-v1-{{ checksum "package-lock.json" }}
            - node-deps-v1-
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          key: node-deps-v1-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules

  run-tests-with-reporting:
    description: "Execute tests and store results"
    parameters:
      test-type:
        type: string
        default: "unit"
    steps:
      - run:
          name: Run << parameters.test-type >> tests
          command: npm run test:<< parameters.test-type >>
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage
          destination: coverage-<< parameters.test-type >>

  deploy-azure:
    description: "Deploy to Azure Container Apps"
    parameters:
      environment:
        type: string
      resource-group:
        type: string
    steps:
      - run:
          name: Deploy to << parameters.environment >>
          command: |
            az containerapp update \
              --name robot-api-<< parameters.environment >> \
              --resource-group << parameters.resource-group >>
```

**TALKING POINT:** "Commands are like functions. They have a name, description, optional parameters, and a sequence of steps."

### 3. Use Commands in Jobs (1 minute)

```yaml
jobs:
  build:
    docker:
      - image: cimg/node:20.0
    steps:
      # Just call the command!
      - setup-node:
          node-version: "20"
      - run: npm run build
      - run: npm run lint

  unit-tests:
    docker:
      - image: cimg/node:20.0
    steps:
      - setup-node
      - run-tests-with-reporting:
          test-type: unit

  integration-tests:
    docker:
      - image: cimg/node:20.0
    steps:
      - setup-node
      - run-tests-with-reporting:
          test-type: integration

  deploy:
    parameters:
      environment:
        type: string
    docker:
      - image: cimg/base:current
    steps:
      - deploy-azure:
          environment: << parameters.environment >>
          resource-group: globomantics-robots
```

**TALKING POINT:** "Look how clean these jobs are now! Each job focuses on what it does, not how to set up the environment."

### 4. Show the Hierarchy (30 seconds)

```
┌─────────────────────────────────────────────────┐
│                  config.yml                     │
├─────────────────────────────────────────────────┤
│  Pipeline Parameters  │  Control workflow       │
│  (pipeline level)     │  at trigger time        │
├───────────────────────┼─────────────────────────┤
│  Commands             │  Reusable step          │
│  (reuse across jobs)  │  sequences              │
├───────────────────────┼─────────────────────────┤
│  Job Parameters       │  Generalize job         │
│  (within jobs)        │  definitions            │
├───────────────────────┼─────────────────────────┤
│  Executors            │  Reusable execution     │
│  (environment)        │  environments           │
└───────────────────────┴─────────────────────────┘
```

### 5. Before/After Comparison (30 seconds)

| Metric | Before | After |
|--------|--------|-------|
| Setup code per job | 8 lines | 1 line |
| Total config lines | 120+ | 60 |
| Change locations | Every job | One command |

---

## Key Takeaways
- Commands are reusable step sequences
- Think of them as "functions" for your CI config
- Commands can have parameters just like jobs
- Call commands with `- command-name:` syntax
- Massive reduction in duplication

---

## Transition
"We've mastered configuration reuse within a single repository. But what about sharing across repositories? That's where Orbs come in—and that's Module 3."
