# Demo 4: Capstone — Complete Globomantics Pipeline

## Module 3, Clip 6 (5 minutes)

### Overview

Synthesize all three modules into the final production pipeline. Show the complete workflow graph and compare efficiency gains.

---

## Demo Script

### 1. Review the Journey (30 seconds)

**TALKING POINT:** "We started with a 200-line config that had duplicate code everywhere and sequential jobs. Let's see the final result."

### 2. The Complete Config (2 minutes)

```yaml
version: 2.1

# ORBS - Package ecosystem (Module 3)
orbs:
  node: circleci/node@5.2.0
  slack: circleci/slack@4.13.3
  azure-cli: circleci/azure-cli@1.2.2

# PIPELINE PARAMETERS - Workflow control (Module 2)
parameters:
  deploy-environment:
    type: enum
    enum: ["dev", "staging", "production"]
    default: "dev"

# COMMANDS - Reusable steps (Module 2)
commands:
  deploy-azure:
    parameters:
      environment:
        type: string
    steps:
      - azure-cli/login-with-oidc
      - run:
          name: Deploy to << parameters.environment >>
          command: |
            az containerapp update \
              --name robot-api-<< parameters.environment >> \
              --resource-group ${AZURE_RESOURCE_GROUP} \
              --image ${ACR_LOGIN_SERVER}/robot-api:${CIRCLE_SHA1}

# JOBS - Parameterized definitions (Module 2)
jobs:
  build:
    executor: node/default
    steps:
      - checkout
      - node/install-packages
      - run: npm run build
      - run: npm run lint
      - persist_to_workspace:
          root: .
          paths: [dist, node_modules]

  test:
    parameters:
      test-type:
        type: string
    executor: node/default
    steps:
      - checkout
      - node/install-packages
      - run: npm run test:<< parameters.test-type >>
      - store_test_results:
          path: test-results

  deploy:
    parameters:
      environment:
        type: string
    docker:
      - image: cimg/base:current
    steps:
      - attach_workspace:
          at: .
      - setup_remote_docker
      - azure-cli/install
      - deploy-azure:
          environment: << parameters.environment >>
      - slack/notify:
          event: pass
          channel: deployments

# WORKFLOWS - Orchestration (Module 1)
workflows:
  build-test-deploy:
    jobs:
      # Build once
      - build

      # Fan-out: Parallel tests
      - test:
          name: unit-tests
          test-type: unit
          requires: [build]
      - test:
          name: integration-tests
          test-type: integration
          requires: [build]
      - test:
          name: e2e-tests
          test-type: e2e
          requires: [build]

      # Fan-in: Deploy after all tests
      - deploy:
          name: deploy-dev
          environment: dev
          context: [azure-oidc, slack-notifications]
          requires: [unit-tests, integration-tests, e2e-tests]
          filters:
            branches:
              only: develop

      - deploy:
          name: deploy-staging
          environment: staging
          context: [azure-oidc, slack-notifications]
          requires: [unit-tests, integration-tests, e2e-tests]
          filters:
            branches:
              only: main

      - hold-production:
          type: approval
          requires: [deploy-staging]
          filters:
            branches:
              only: main

      - deploy:
          name: deploy-production
          environment: production
          context: [azure-oidc-prod, slack-notifications]
          requires: [hold-production]
          filters:
            branches:
              only: main
```

### 3. Visualize the Workflow (1 minute)

**SHOW:** CircleCI dashboard with the workflow graph:

```
                        ┌── unit-tests ──┐
                        │                │
build ──────────────────┼── integration ─┼── deploy-dev (develop)
                        │                │
                        └── e2e-tests ───┘
                               │
                               ├── deploy-staging (main)
                               │
                               ├── hold-production ⏸️
                               │
                               └── deploy-production ✅
```

### 4. Efficiency Comparison (1 minute)

**SHOW TABLE:**

| Metric | Before | After | Improvement |
| --- | --- | --- | --- |
| Config lines | 200+ | 80 | 60% reduction |
| Build time | 25 min | 10 min | 60% faster |
| Jobs to maintain | 9 | 4 | 55% fewer |
| Duplicate code | High | Zero | 100% eliminated |
| CI credits/month | ~30,000 | ~18,000 | 40% savings |

### 5. Key Concepts Recap (30 seconds)

```
┌─────────────────────────────────────────────────────────────┐
│                  COURSE SUMMARY                             │
├─────────────────────────────────────────────────────────────┤
│  MODULE 1: Workflow Orchestration                           │
│  • requires keyword for dependencies                        │
│  • Fan-out/fan-in for parallel execution                    │
│  • Filters for branch/tag control                           │
│  • Approval gates for manual control                        │
├─────────────────────────────────────────────────────────────┤
│  MODULE 2: Configuration Reuse                              │
│  • Pipeline parameters for workflow control                 │
│  • Job parameters for generalization                        │
│  • Commands for step reuse                                  │
│  • Parameters vs environment variables                      │
├─────────────────────────────────────────────────────────────┤
│  MODULE 3: Orbs Ecosystem                                   │
│  • Certified/Partner/Community orbs                         │
│  • node orb for builds                                      │
│  • slack orb for notifications                              │
│  • azure-cli orb for cloud deployment                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Final Demonstration

**ACTION:**

1. Make a small code change
2. Push to main branch
3. Watch the complete pipeline execute
4. Show Slack notification
5. Show deployed app in Azure

---

## Key Takeaways

- Combine all three modules for maximum efficiency
- Orbs + Parameters + Commands = Zero duplication
- Fan-out testing with fan-in deployment
- Production-ready with approval gates
- Full observability with Slack integration

---

## Course Conclusion

"You now have the skills to architect maintainable, scalable CI/CD pipelines for enterprise development teams. Go forth and eliminate that YAML duplication!"
