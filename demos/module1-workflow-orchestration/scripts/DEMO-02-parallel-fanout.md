# Demo 2: Fan-Out Parallelism for Maximum Speed
## Module 1, Clip 3 (5 minutes)

### Overview
Transform the Globomantics pipeline to run tests in parallel (fan-out pattern), then converge to a single deploy job (fan-in pattern).

---

## Pre-Demo Setup
1. Have the sequential config from Demo 1 ready
2. Stopwatch or timer visible (to show time savings)
3. CircleCI dashboard open

---

## Demo Script

### 1. Show the Problem (30 seconds)

**TALKING POINT:** "Our sequential pipeline takes 15 minutes because we run three 5-minute test suites one after another. Let's fix that."

Draw or show the current flow:
```
build (2min) → test (15min) → deploy (1min) = 18 minutes total
```

### 2. Refactor to Parallel Tests (2 minutes)

**ACTION:** Modify config to split tests into parallel jobs:

```yaml
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
          paths:
            - node_modules
            - dist

  # THREE PARALLEL TEST JOBS
  unit-tests:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run: npm run test:unit

  integration-tests:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run: npm run test:integration

  security-scan:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run: npm audit
```

**TALKING POINT:** "Notice we're using workspaces to pass the build output to test jobs. This avoids rebuilding in each job."

### 3. Create Fan-Out Workflow (1 minute)

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build

      # FAN-OUT: All three run in parallel
      - unit-tests:
          requires:
            - build
      - integration-tests:
          requires:
            - build
      - security-scan:
          requires:
            - build

      # FAN-IN: Waits for ALL parallel jobs
      - deploy:
          requires:
            - unit-tests
            - integration-tests
            - security-scan
```

### 4. Visualize the Pattern (30 seconds)

**DRAW or SHOW:**
```
                 ┌─── unit-tests ───┐
                 │                  │
   build ────────┼─── integration ──┼───── deploy
                 │                  │
                 └─── security ─────┘
```

**TALKING POINT:** "Three 5-minute jobs now complete in 5 minutes instead of 15. That's a 66% time savings!"

### 5. Push and Show Dashboard (1 minute)

```bash
git add .
git commit -m "Implement fan-out parallel testing"
git push
```

**ACTION:** Show CircleCI dashboard

**POINT OUT:**
- Workflow graph shows parallel branches
- All three test jobs start simultaneously
- Deploy waits for all three
- Total time: ~7 minutes vs 18 minutes

---

## Time Comparison

| Pattern | Build | Tests | Deploy | Total |
|---------|-------|-------|--------|-------|
| Sequential | 2min | 15min | 1min | 18min |
| Parallel | 2min | 5min | 1min | 8min |

**SAVINGS: 55% faster, same coverage!**

---

## Key Takeaways
- Multiple jobs can `require` the same upstream job
- All requiring jobs start as soon as the upstream completes
- Fan-in happens when a job requires multiple upstream jobs
- Workspaces efficiently share build artifacts

---

## Transition
"Parallel execution is powerful, but sometimes we need even more control. Let's see how to use filters to control exactly when jobs run."
