# Demo 2B: Multi-Project Fan-Out/Fan-In with Approval Gates

## Module 1, Extended Demo (7-10 minutes)

### Overview

Demonstrate advanced fan-out/fan-in patterns by building and testing two independent services (Robot Fleet API + Schematica MCP Server) in parallel, with approval gates for production deployment.

---

## Pre-Demo Setup

1. Both projects should have passing tests:
   - `npm test` (Robot Fleet API)
   - `cd mcp-server && npm test` (Schematica MCP)
2. CircleCI dashboard open to project
3. Config file: `.circleci/configs/02-multi-project-fanout.yml`

---

## Demo Script

### 1. Set the Stage (1 minute)

**TALKING POINT:** "Real-world projects often have multiple services. Our Robot Fleet system now has two: the main API and the Schematica MCP server. Let's see how to build and test them efficiently."

**DRAW or SHOW the goal:**

```
┌─────────────────────────────────────────────────┐
│  What we're building:                           │
│                                                 │
│    Robot Fleet API ──┐                          │
│    (4 test suites)   ├──► Staging ──► Prod     │
│    MCP Server ───────┘                          │
│    (1 test suite)        (approval gate)        │
└─────────────────────────────────────────────────┘
```

### 2. Show the Multi-Project Build (2 minutes)

**ACTION:** Open the config and highlight the build jobs:

```yaml
jobs:
  # Both projects build in PARALLEL
  build-api:
    executor: node-executor
    steps:
      - setup-api
      - run: npm run build
      - run: npm run lint
      - persist_to_workspace:
          root: .
          paths: [node_modules, dist, public, src, tests, ...]

  build-mcp:
    executor: node-executor
    steps:
      - setup-mcp
      - run: cd mcp-server && npm --version
      - persist_to_workspace:
          root: .
          paths: [mcp-server]
```

**TALKING POINT:** "Key insight: these projects don't depend on each other, so they build simultaneously. That's our first fan-out."

### 3. Show Nested Fan-Out Pattern (2 minutes)

**ACTION:** Highlight the test jobs in the workflow:

```yaml
workflows:
  build-test-deploy:
    jobs:
      # STAGE 1: Build (parallel)
      - build-api:
          name: "Build Robot Fleet API"
      - build-mcp:
          name: "Build Schematica MCP"

      # STAGE 2: Tests (nested parallel)
      # API fans out to 4 test jobs
      - unit-tests-api:
          name: "API: Unit Tests"
          requires: ["Build Robot Fleet API"]
      - integration-tests-api:
          name: "API: Integration Tests"
          requires: ["Build Robot Fleet API"]
      - e2e-tests-api:
          name: "API: E2E Tests"
          requires: ["Build Robot Fleet API"]
      - security-scan-api:
          name: "API: Security Scan"
          requires: ["Build Robot Fleet API"]

      # MCP runs its test suite
      - test-mcp:
          name: "MCP: Full Test Suite"
          requires: ["Build Schematica MCP"]
```

**DRAW the pattern:**

```
             ┌── unit-tests-api ──────┐
             │                        │
build-api ───┼── integration-api ─────┼───┐
             │                        │   │
             ├── e2e-tests-api ───────┤   ├──► deploy-staging
             │                        │   │
             └── security-scan-api ───┘   │
                                          │
build-mcp ───── test-mcp ─────────────────┘
```

**TALKING POINT:** "This is nested fan-out! The API build fans out to 4 test jobs. All 5 test jobs run in parallel."

### 4. Show the Fan-In and Approval Gate (2 minutes)

**ACTION:** Highlight the deployment section:

```yaml
      # STAGE 3: Fan-In to Staging
      - deploy-staging:
          name: "Deploy to Staging"
          requires:
            - "API: Unit Tests"
            - "API: Integration Tests"
            - "API: E2E Tests"
            - "API: Security Scan"
            - "MCP: Full Test Suite"
          filters:
            branches:
              only: main

      # STAGE 4: Manual Approval
      - hold-for-production-approval:
          type: approval
          requires: ["Deploy to Staging"]
          filters:
            branches:
              only: main

      # STAGE 5: Production
      - deploy-production:
          name: "Deploy to Production"
          requires: [hold-for-production-approval]
          filters:
            branches:
              only: main
```

**TALKING POINT:** "Staging deploy requires ALL 5 test jobs to pass - that's the fan-in. Then we have an approval gate: the workflow pauses until someone clicks 'Approve' in the CircleCI UI."

### 5. Show Branch Behavior (1 minute)

**TALKING POINT:** "Notice the filters. Let me show you what runs on different branches:"

| Branch Type | What Runs |
| --- | --- |
| `feature/*` | Build + all tests (CI for PRs) |
| `develop` | Build + all tests (CI for PRs) |
| `main` | Build + tests + staging + approval + prod |

**KEY INSIGHT:** "Everyone gets CI feedback, but only main can deploy. This is PR-driven development with safety gates."

### 6. Time Savings Demo (1 minute)

**SHOW the math:**

```
┌─────────────────────────────────────────────────────────────────┐
│ SEQUENTIAL (old way):                                           │
│   build-api(2m) → unit(2m) → int(3m) → e2e(2m) → sec(1m)       │
│   → build-mcp(1m) → test-mcp(1m)                                │
│   = 12 MINUTES                                                  │
├─────────────────────────────────────────────────────────────────┤
│ PARALLEL (this config):                                         │
│   [build-api(2m) || build-mcp(1m)] → [all tests in parallel]   │
│   = 2m + 3m (slowest test) = 5 MINUTES                          │
├─────────────────────────────────────────────────────────────────┤
│ SAVINGS: 58% faster! (7 minutes per pipeline)                   │
└─────────────────────────────────────────────────────────────────┘
```

**TALKING POINT:** "If you run 10 pipelines a day, that's over an hour saved daily!"

---

## CircleCI UI Walkthrough

When showing the dashboard, point out:

1. **Workflow Graph**: Shows the diamond/tree shape of fan-out/fan-in
2. **Parallel Lanes**: Multiple jobs running simultaneously
3. **On Hold Status**: When waiting for approval
4. **Approve Button**: Click to continue to production
5. **Timeline View**: Shows actual parallel execution

---

## Key Takeaways

1. **Independent services should build in parallel** - no reason to wait
2. **Nested fan-out is powerful** - one build triggers multiple test suites
3. **Fan-in is your quality gate** - deploy only when ALL tests pass
4. **Approval gates prevent accidents** - manual step before production
5. **All branches get CI** - fast feedback for everyone
6. **Only main can deploy** - branch protection via config

---

## Discussion Questions

1. **Q: What if the MCP tests fail but all API tests pass?**
   A: Staging deploy never runs. ALL required jobs must pass.

2. **Q: Can someone skip the approval?**
   A: No. The workflow physically cannot proceed without clicking Approve.

3. **Q: Why run tests on feature branches if we don't deploy?**
   A: Fast feedback! Catch bugs before the PR is merged.

4. **Q: What happens if no one approves for 15 days?**
   A: Workflow times out and is marked failed.

---

## Transition to Demo 3

"We've seen how to run jobs in parallel and gate deployments. But what if we only want to run certain jobs on certain branches or tags? Let's explore filters..."
