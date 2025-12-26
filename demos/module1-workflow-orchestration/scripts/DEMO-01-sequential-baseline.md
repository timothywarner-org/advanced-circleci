# Demo 1: Building Sequential Dependencies with `requires`
## Module 1, Clip 2 (5 minutes)

### Overview
In this demo, we'll build a three-stage workflow: build → test → deploy, demonstrating how the `requires` keyword creates job dependencies.

---

## Pre-Demo Setup
1. Open VS Code with CircleCI extension installed
2. Have the GitHub repository open
3. Have CircleCI dashboard open in browser (app.circleci.com)
4. Terminal ready for git commands

---

## Demo Script

### 1. Show the Problem (30 seconds)
**TALKING POINT:** "Globomantics has a monolithic pipeline that runs jobs sequentially, but they're not enforcing dependencies properly. Let's fix that."

Open `.circleci/configs/01-sequential-baseline.yml`

```yaml
# Point out: No requires keywords initially
# Jobs would run in parallel without explicit dependencies!
```

### 2. Build the Sequential Workflow (2 minutes)

**ACTION:** Open a new config file and build step by step:

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
```

**TALKING POINT:** "First, our build job. Notice we're using CircleCI's convenience image for Node.js."

Add the test job:

```yaml
  test:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: npm ci
      - run: npm test
```

Add the deploy job:

```yaml
  deploy:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: echo "Deploying to production..."
```

### 3. Add the Workflow with Dependencies (1 minute)

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build
      - test:
          requires:
            - build      # <-- KEY POINT
      - deploy:
          requires:
            - test       # <-- KEY POINT
```

**TALKING POINT:** "The `requires` keyword is the foundation of workflow orchestration. Test requires build to complete first, and deploy requires test."

### 4. Push and Show CircleCI Dashboard (1 minute)

```bash
git add .circleci/config.yml
git commit -m "Add sequential workflow with requires"
git push
```

**ACTION:** Switch to CircleCI dashboard

**SHOW:**
- Workflow graph with dependency arrows
- Jobs running in sequence
- "Waiting" status on dependent jobs

### 5. Demonstrate Failure Propagation (30 seconds)

**TALKING POINT:** "Watch what happens when the build fails..."

**ACTION:** (If prepared) Show a failing build and point out:
- Downstream jobs show "Not Run"
- They're automatically skipped
- No wasted build minutes

---

## Key Takeaways
- `requires` creates explicit job dependencies
- Dependent jobs wait for upstream jobs to complete
- Failed jobs cause downstream jobs to be skipped
- This is the foundation for more complex patterns

---

## Transition to Next Demo
"Now that we have sequential execution, let's see how we can run multiple jobs in parallel to dramatically speed up our pipeline."
