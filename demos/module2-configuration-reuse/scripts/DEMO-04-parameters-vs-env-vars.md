# Demo 4: Parameters vs Environment Variables

## Module 2, Clip 4 (5 minutes)

### Overview

Critical distinction: Parameters are resolved at CONFIG TIME (before jobs run), environment variables at RUNTIME (during job execution). Understanding this prevents subtle bugs.

---

## Demo Script

### 1. The Key Distinction (1 minute)

**DRAW/SHOW:**

```
┌─────────────────────────────────────────────────────────────┐
│                    PIPELINE LIFECYCLE                        │
├──────────────────────┬──────────────────────────────────────┤
│     CONFIG TIME      │           RUNTIME                    │
│   (Before jobs run)  │     (During job execution)           │
├──────────────────────┼──────────────────────────────────────┤
│  • Pipeline triggers │  • Executor starts                   │
│  • YAML is parsed    │  • Steps execute                     │
│  • Parameters        │  • Environment variables             │
│    evaluated         │    are available                     │
│  • Jobs selected     │  • Scripts run                       │
│  • Workflow built    │  • Commands execute                  │
└──────────────────────┴──────────────────────────────────────┘
```

**TALKING POINT:** "This is the most important concept in Module 2. Parameters control WHAT runs. Environment variables control HOW code runs."

### 2. Show the Failure Scenario (1.5 minutes)

```yaml
# THIS WILL NOT WORK!
jobs:
  deploy:
    docker:
      - image: cimg/base:current
    steps:
      - run:
          name: Set environment
          command: echo "export TARGET_ENV=production" >> $BASH_ENV
      # This FAILS because 'when' is evaluated at CONFIG TIME
      # before the job even starts!
      - when:
          condition:
            equal: [$TARGET_ENV, "production"]
          steps:
            - run: echo "Extra production checks..."
```

**TALKING POINT:** "This fails silently! The `when` clause is evaluated before the job starts, so `$TARGET_ENV` doesn't exist yet. It's always false."

### 3. The Correct Approach (1.5 minutes)

```yaml
# CORRECT: Use parameters for workflow control
parameters:
  target-env:
    type: enum
    enum: ["dev", "staging", "production"]
    default: "dev"

jobs:
  deploy:
    docker:
      - image: cimg/base:current
    environment:
      # Environment variable for scripts
      API_URL: https://api.<< pipeline.parameters.target-env >>.globomantics.com
    steps:
      # Config-time conditional
      - when:
          condition:
            equal: [<< pipeline.parameters.target-env >>, "production"]
          steps:
            - run: echo "Running production checks..."

      - run:
          name: Deploy
          command: |
            # Runtime: use environment variable
            echo "Deploying to $API_URL"
            curl -X POST $API_URL/deploy
```

**TALKING POINT:** "Parameters for the `when` condition, environment variable for the script. Each used where it makes sense."

### 4. Decision Framework (1 minute)

```
┌─────────────────────────────────────────────────────────────┐
│                 WHEN TO USE WHAT?                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Use PARAMETERS when:                                       │
│  ✓ Controlling job/step inclusion (when clauses)           │
│  ✓ Selecting executor images                                │
│  ✓ Choosing which jobs run in workflow                      │
│  ✓ Configuring at pipeline trigger time                     │
│                                                             │
│  Use ENVIRONMENT VARIABLES when:                            │
│  ✓ Passing values to scripts                                │
│  ✓ Storing secrets (via Contexts)                          │
│  ✓ Runtime configuration                                    │
│  ✓ Values that might change during execution                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5. Common Patterns (30 seconds)

```yaml
# Pattern: Parameter controls structure, env var for scripts
parameters:
  environment:
    type: string
    default: "dev"

jobs:
  deploy:
    environment:
      DEPLOY_TARGET: << pipeline.parameters.environment >>
    steps:
      - run:
          command: ./scripts/deploy.sh $DEPLOY_TARGET
```

**TALKING POINT:** "Notice how we convert the parameter to an environment variable? Best of both worlds—config-time control, runtime availability."

---

## Common Mistakes to Avoid

1. ❌ Using env vars in `when` conditions
2. ❌ Using parameters in shell scripts without conversion
3. ❌ Storing secrets as parameters (use Contexts!)
4. ❌ Expecting runtime values in config-time evaluation

---

## Key Takeaways

- Parameters: CONFIG TIME (before jobs)
- Environment variables: RUNTIME (during jobs)
- Parameters control pipeline structure
- Environment variables control script behavior
- Convert parameters to env vars when scripts need them

---

## Module 2 Summary

"We've covered the complete configuration reuse hierarchy: pipeline parameters for workflow control, job parameters for generalization, and commands for step reuse. You now have the tools to eliminate YAML duplication. Next, we'll take reuse to the ecosystem level with Orbs."
