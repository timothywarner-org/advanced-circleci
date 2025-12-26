# Learning Objectives Reference

## Terminal Objective 1
**Design and implement multi-stage workflows utilizing complex job dependencies and execution patterns.**

### Enabling Objectives

| Objective | Demo | Config File |
|-----------|------|-------------|
| Define sequential workflows using `requires` keyword | Demo 1 | `01-sequential-baseline.yml` |
| Configure parallel jobs using fan-out workflows | Demo 2 | `02-parallel-fanout.yml` |
| Utilize filters (branches, tags) for conditional execution | Demo 3 | `03-branch-tag-filters.yml` |

### Key Concepts
- `requires:` creates job dependencies
- Fan-out: multiple jobs requiring same upstream job
- Fan-in: single job requiring multiple upstream jobs
- `filters.branches.only/ignore` for branch control
- `filters.tags.only` for release workflows
- `type: approval` for manual gates
- `triggers.schedule` for cron-based execution

---

## Terminal Objective 2
**Implement configuration reuse strategies using parameters to abstract variable data in jobs and workflows.**

### Enabling Objectives

| Objective | Demo | Config File |
|-----------|------|-------------|
| Create and reference parameters within job definitions | Demo 2 | `06-job-parameters.yml` |
| Pass configuration parameters between jobs | Demo 1 | `05-pipeline-parameters.yml` |
| Identify when parameters beat environment variables | Demo 4 | N/A (conceptual) |

### Key Concepts
- Pipeline parameters: `<< pipeline.parameters.name >>`
- Job parameters: `<< parameters.name >>`
- Parameter types: boolean, string, enum, integer
- `when:` clauses for conditional steps
- Commands for step-level reuse
- Config-time vs runtime evaluation

---

## Terminal Objective 3
**Integrate and utilize certified Orbs to rapidly deploy common functions and third-party integrations.**

### Enabling Objectives

| Objective | Demo | Config File |
|-----------|------|-------------|
| Locate and install orbs from CircleCI Registry | Demo 1 | `08-orbs-intro.yml` |
| Invoke pre-built commands from community Orbs | Demo 2 | `09-slack-orb.yml` |
| Analyze config for orb extraction opportunities | Demo 4 | Capstone |
| Review custom orb development requirements | Lecture | N/A |

### Key Concepts
- Orb declaration: `orbs: name: namespace/orb@version`
- Version pinning strategies
- Using orb executors, commands, and jobs
- Certified vs Partner vs Community orbs
- OIDC authentication for cloud providers
- Comparing Orbs to GitHub Actions

---

## Assessment Criteria

After completing this course, learners should be able to:

1. **Workflow Design**
   - Draw a workflow graph for a given scenario
   - Identify appropriate use of sequential vs parallel patterns
   - Configure branch and tag filters correctly

2. **Configuration Reuse**
   - Refactor duplicate jobs into parameterized versions
   - Extract common steps into commands
   - Choose correctly between parameters and env vars

3. **Orb Integration**
   - Find and evaluate orbs in the registry
   - Implement node, slack, and cloud provider orbs
   - Explain when to create a custom orb

---

## Practice Challenges

### Module 1 Challenge
Design a workflow that:
- Builds once
- Tests in parallel (unit, integration, e2e)
- Deploys to staging on `develop` branch
- Deploys to production on `main` with approval

**Solution:** `demos/module1-workflow-orchestration/configs/module1-challenge-solution.yml`

### Module 2 Challenge
Refactor a pipeline with 5 nearly-identical deploy jobs into:
- One parameterized job
- Reusable commands for common steps
- Pipeline parameters for environment selection

### Module 3 Challenge
Integrate the following orbs:
- `circleci/node` for build optimization
- `circleci/slack` for deployment notifications
- `circleci/azure-cli` for cloud deployment

Compare line count and maintainability with manual implementation.
