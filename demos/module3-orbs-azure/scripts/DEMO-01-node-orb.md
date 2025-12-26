# Demo 1: Installing and Using Your First Orb

## Module 3, Clip 2 (5 minutes)

### Overview

Add the circleci/node orb to replace manual npm install and caching steps. Show the dramatic reduction in config complexity.

---

## Pre-Demo Setup

1. VS Code with CircleCI extension
2. CircleCI Orb Registry open: <https://circleci.com/developer/orbs>
3. Before/after configs ready

---

## Demo Script

### 1. Tour the Orb Registry (1 minute)

**ACTION:** Open <https://circleci.com/developer/orbs>

**SHOW:**

- Search for "node"
- Categories: Certified, Partner, Community
- Click circleci/node orb
- Point out: commands, jobs, executors tabs
- Version history and usage stats

**TALKING POINT:** "The Orb Registry is like npm for CI/CD configuration. Certified orbs are maintained by CircleCI, Partner orbs by vendors, Community by developers like you."

### 2. Show the Before State (30 seconds)

```yaml
# BEFORE: Manual Node.js setup - 15+ lines per job
jobs:
  build:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - node-deps-{{ checksum "package-lock.json" }}
            - node-deps-
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          key: node-deps-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
      - run: npm run build
```

**TALKING POINT:** "We've been writing this same caching logic in every project. The node orb does it better, automatically."

### 3. Add the Node Orb (2 minutes)

```yaml
version: 2.1

# Declare orbs at the top of config
orbs:
  # namespace/name@version
  node: circleci/node@5.2.0
```

**TALKING POINT:** "Version pinning is important. `@5.2.0` locks to that specific version. You could also use `@5` for latest 5.x or `@volatile` for latest—but that's risky in production."

### 4. Use Orb Commands (1 minute)

```yaml
# AFTER: Using node orb - 5 lines!
jobs:
  build:
    executor: node/default  # Orb provides the executor!
    steps:
      - checkout
      - node/install-packages  # Handles caching automatically!
      - run: npm run build
      - run: npm run lint

  test:
    executor:
      name: node/default
      tag: "20"  # Specify Node version
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm  # Explicit package manager
      - run: npm test
```

**TALKING POINT:** "One line replaces restore_cache, npm ci, and save_cache. The orb handles cache keys, cache paths, and even detects yarn vs npm automatically."

### 5. Show Expanded Steps in Dashboard (30 seconds)

**ACTION:** Push and show CircleCI dashboard

**SHOW:**

- Expand the "install-packages" step
- Point out: restore_cache, npm ci, save_cache all happening
- "Best practices built in, not written by hand"

---

## Orb Version Strategies

| Strategy | Example | Use Case |
|----------|---------|----------|
| Exact | `@5.2.0` | Production (stable) |
| Minor | `@5.2` | Auto-patch updates |
| Major | `@5` | Auto-minor updates |
| Volatile | `@volatile` | Dev only (risky!) |

---

## What Orbs Provide

```
┌─────────────────────────────────────────┐
│              circleci/node              │
├─────────────────────────────────────────┤
│  Executors:                             │
│  • node/default - Node.js Docker image  │
│                                         │
│  Commands:                              │
│  • node/install-packages - npm/yarn     │
│  • node/install - Install Node.js       │
│                                         │
│  Jobs:                                  │
│  • node/test - Full test job            │
│  • node/run - Run npm script            │
└─────────────────────────────────────────┘
```

---

## Key Takeaways

- Orbs are declared in the `orbs:` block
- Use `namespace/name@version` format
- Orbs provide executors, commands, and jobs
- `node/install-packages` handles caching automatically
- Always pin versions in production

---

## Transition

"The node orb simplified our build. Now let's add Slack notifications—this is where orbs really shine for integrations."
