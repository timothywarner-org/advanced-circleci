# :rocket: Advanced CircleCI Configuration

<p align="center">
  <a href="https://github.com/timothywarner-org/advanced-circleci">
    <img src="https://img.shields.io/badge/📦_Course_Repository-GitHub-181717?style=for-the-badge&logo=github&logoColor=white&labelColor=181717" alt="Course Repository" />
  </a>
  <a href="https://circleci.com/docs/">
    <img src="https://img.shields.io/badge/CircleCI-Docs-343434?style=for-the-badge&logo=circleci&logoColor=white&labelColor=343434" alt="CircleCI Docs" />
  </a>
  <a href="https://www.pluralsight.com/">
    <img src="https://img.shields.io/badge/Pluralsight-Course-F15B2A?style=for-the-badge&logo=pluralsight&logoColor=white&labelColor=F15B2A" alt="Pluralsight" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Level-Intermediate-blue?style=flat-square" alt="Level: Intermediate" />
  <img src="https://img.shields.io/badge/Duration-90_minutes-green?style=flat-square" alt="Duration: 90 minutes" />
  <img src="https://img.shields.io/badge/Modules-3-purple?style=flat-square" alt="Modules: 3" />
</p>

---

## Course Resources & Documentation Guide

---

**Author:** Tim Warner ([tim-warner@pluralsight.com](mailto:tim-warner@pluralsight.com))
**Platform:** Pluralsight
**Duration:** 90 minutes
**Level:** Intermediate

---

### :book: Course Description

As CI/CD pipelines grow in complexity, engineers struggle with duplicated configuration, unreliable job sequencing, and difficulty maintaining consistency across repositories. In this course, you will gain the ability to design production-grade pipelines that scale with your organization.

You will explore multi-stage workflow orchestration using job dependencies, fan-out/fan-in patterns, and branch/tag filters. You will discover how to implement configuration reuse strategies using pipeline parameters, command definitions, and executor abstractions to eliminate YAML duplication. Finally, you will learn how to integrate certified Orbs from the CircleCI Registry to rapidly deploy common functions like Slack notifications and Azure deployments.

---

## :clipboard: Table of Contents

### Module 1: Workflow Orchestration Mastery (30 min)

1. [Lesson 1.1: Introduction & Sequential Workflows](#lesson-11-introduction--sequential-workflows)
2. [Lesson 1.2: Fan-out/Fan-in Patterns](#lesson-12-fan-outfan-in-patterns)
3. [Lesson 1.3: Branch and Tag Filters](#lesson-13-branch-and-tag-filters)
4. [Lesson 1.4: Approval Gates & Scheduled Workflows](#lesson-14-approval-gates--scheduled-workflows)

### Module 2: Configuration Reuse with Parameters (30 min)

1. [Lesson 2.1: Pipeline Parameters](#lesson-21-pipeline-parameters)
2. [Lesson 2.2: Job Parameters](#lesson-22-job-parameters)
3. [Lesson 2.3: Reusable Commands & Executors](#lesson-23-reusable-commands--executors)

### Module 3: Mastering Orbs and Reusable Components (30 min)

1. [Lesson 3.1: The CircleCI Orbs Ecosystem & Node.js Orb](#lesson-31-the-circleci-orbs-ecosystem--nodejs-orb)
2. [Lesson 3.2: Slack Notifications Orb](#lesson-32-slack-notifications-orb)
3. [Lesson 3.3: Azure CLI Orb & Deployment](#lesson-33-azure-cli-orb--deployment)

### Supplemental Materials

1. [Additional Resources](#additional-resources)
2. [Troubleshooting Resources](#troubleshooting-resources)
3. [Course Completion Next Steps](#course-completion-next-steps)
4. [Glossary of Terms](#glossary-of-terms)

---

## Module 1: Workflow Orchestration Mastery

**Duration:** 30 minutes | **Terminal Objective:** Design and implement multi-stage workflows utilizing complex job dependencies and execution patterns.

---

## Lesson 1.1: Introduction & Sequential Workflows

### :dart: Learning Objective

Define sequential workflows using the `requires` keyword to create job dependencies that execute in a specific order.

### Key Concepts

- Jobs execute in **parallel by default** in CircleCI
- Use `requires:` to create dependencies between jobs
- Dependencies form a Directed Acyclic Graph (DAG)
- Each job runs in a fresh, isolated container

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Workflows Overview](https://circleci.com/docs/workflows/) | Complete guide to orchestrating jobs with workflows |
| [Jobs and Steps](https://circleci.com/docs/jobs-steps/) | Understanding jobs, steps, and how they execute |
| [Configuration Introduction](https://circleci.com/docs/config-intro/) | Getting started with CircleCI configuration |
| [Configuration Reference](https://circleci.com/docs/configuration-reference/) | Complete YAML syntax reference for config.yml |
| [Executors and Images](https://circleci.com/docs/executor-intro/) | Understanding Docker, machine, and macOS executors |

### :bulb: Best Practices

- Always specify explicit job dependencies with `requires`
- Use workspaces to share data between jobs (avoid redundant installs)
- Monitor workflow execution time in the CircleCI UI
- Consider job execution order for optimal resource utilization

---

## Lesson 1.2: Fan-out/Fan-in Patterns

### :dart: Learning Objective

Configure parallel jobs using fan-out workflows to dramatically reduce pipeline execution time.

### Key Concepts

- **Fan-out:** Multiple jobs depending on the same upstream job (parallel execution)
- **Fan-in:** Single job depending on multiple upstream jobs (synchronization point)
- **Workspaces:** Share files between jobs using `persist_to_workspace` and `attach_workspace`
- Parallel execution reduces wall-clock time significantly

### Workflow Visualization

```
                  +---- unit-tests ----+
                  |                    |
  build ----+-----+-- integration -----+------ deploy
                  |                    |
                  +--- security-scan --+
```

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Workflows - Fan-Out/Fan-In](https://circleci.com/docs/workflows/#fan-outfan-in-workflow-example) | Official fan-out/fan-in workflow examples |
| [Using Workspaces to Share Data](https://circleci.com/docs/workspaces/) | Persisting data between jobs |
| [Caching Dependencies](https://circleci.com/docs/caching/) | Speed up builds with dependency caching |
| [Parallelism and Test Splitting](https://circleci.com/docs/parallelism-faster-jobs/) | Running tests in parallel for faster feedback |
| [Storing Test Results](https://circleci.com/docs/collect-test-data/) | Test metadata collection for insights |
| [Storing Artifacts](https://circleci.com/docs/artifacts/) | Persisting build outputs and reports |

### :bulb: Best Practices

- Use workspaces to avoid reinstalling dependencies in every job
- Keep parallel jobs similar in duration for optimal resource use
- Place the slowest parallel job in critical path calculations
- Store test results for CircleCI Test Insights

---

## Lesson 1.3: Branch and Tag Filters

### :dart: Learning Objective

Configure conditional job execution using branch and tag filters to control which commits trigger which jobs in your pipeline.

### Key Concepts

- `filters.branches.only` - Only run on specified branches
- `filters.branches.ignore` - Run on all branches EXCEPT specified
- `filters.tags.only` - Run only when tags match pattern
- Regular expressions for flexible branch/tag matching

### Filter Pattern Examples

| Pattern | Description |
|---------|-------------|
| `main` | Exact match for "main" branch |
| `/feature\/.*/` | Any branch starting with "feature/" |
| `/^v[0-9]+\.[0-9]+\.[0-9]+$/` | Semantic version tags (v1.2.3) |
| `/pull\/.*/` | GitHub PR branches (pull/123) |
| `/(feature\|hotfix)\/.*/` | Feature or hotfix branches |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Workflows - Branch Filtering](https://circleci.com/docs/workflows/#branch-level-job-execution) | Control job execution with branch filters |
| [Workflows - Using Filters](https://circleci.com/docs/workflows/#using-filters-in-your-workflows) | Complete guide to workflow filters |
| [Workflows - Tag Filtering](https://circleci.com/docs/workflows/#executing-workflows-for-a-git-tag) | Triggering workflows on Git tags |
| [Using Regex Filters](https://circleci.com/docs/configuration-reference/#filters) | Regular expression patterns in filters |
| [Pipeline Values and Parameters](https://circleci.com/docs/pipeline-variables/) | Built-in pipeline values like CIRCLE_BRANCH |

### :warning: Common Mistakes to Avoid

- Forgetting `branches: ignore: /.*/` in tag-only workflows
- Applying filters at workflow level instead of job level
- Not escaping regex special characters (use `\/` for `/`)
- Using `only` vs `ignore` inconsistently

### :bulb: Best Practices

- Use `only` filters for critical jobs (explicit allowlist is safer)
- Run fast tests on all branches for quick feedback
- Reserve expensive tests for integration branches
- Always test tag regex patterns before first release

---

## Lesson 1.4: Approval Gates & Scheduled Workflows

### :dart: Learning Objective

Implement manual approval gates for production deployments and configure scheduled workflows for automated maintenance tasks.

### Key Concepts

- `type: approval` - Creates a manual hold point in the workflow
- `triggers.schedule` - Run workflows on a cron schedule
- Approval jobs pause workflows until human intervention
- Scheduled workflows run independently of code changes

### Cron Syntax Reference

```
 +-------------- minute (0 - 59)
 |  +----------- hour (0 - 23)
 |  |  +-------- day of the month (1 - 31)
 |  |  |  +----- month (1 - 12)
 |  |  |  |  +-- day of the week (0 - 6) (Sunday to Saturday)
 |  |  |  |  |
 *  *  *  *  *
```

| Example | Schedule |
|---------|----------|
| `0 2 * * *` | 2:00 AM UTC daily |
| `0 9 * * 1` | 9:00 AM UTC every Monday |
| `30 8 * * 1-5` | 8:30 AM UTC weekdays |
| `0 0 1 * *` | Midnight on 1st of each month |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Workflows - Approval Jobs](https://circleci.com/docs/workflows/#holding-a-workflow-for-a-manual-approval) | Manual approval gates in workflows |
| [Schedule Triggers](https://circleci.com/docs/guides/orchestrate/schedule-triggers/) | Modern scheduled pipeline configuration |
| [Workflows - Scheduling](https://circleci.com/docs/workflows/#scheduling-a-workflow) | Legacy workflow scheduling with triggers |
| [Contexts and Security](https://circleci.com/docs/contexts/) | Secure environment variable management |
| [Web App and Project Settings](https://circleci.com/docs/introduction-to-the-circleci-web-app) | Configuring project-level options |

### :bulb: Best Practices

- Use approval gates for production deployments
- Schedule security scans daily to catch new CVEs
- Schedule dependency update checks weekly
- Set up notifications for scheduled workflow failures
- Document approval policies and authorized approvers

---

## Module 2: Configuration Reuse with Parameters

**Duration:** 30 minutes | **Terminal Objective:** Implement configuration reuse strategies using parameters to abstract variable data in jobs and workflows.

---

## Lesson 2.1: Pipeline Parameters

### :dart: Learning Objective

Use pipeline parameters to create dynamic, configurable pipelines that can be customized at trigger time via the API or UI.

### Key Concepts

- Pipeline parameters are resolved at **config time** (before jobs run)
- Parameters are set when the pipeline is triggered
- Four types: `string`, `boolean`, `integer`, `enum`
- Access with: `<< pipeline.parameters.PARAM_NAME >>`
- Use `when` conditions for config-time logic

### Parameter Types

| Type | Description | Use Case |
|------|-------------|----------|
| `string` | Free-form text | Version numbers, branch names |
| `boolean` | true/false flags | skip-tests, enable-debug |
| `integer` | Numeric values | Retry counts, parallelism level |
| `enum` | Constrained choice list | Environment selection (dev/staging/prod) |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Pipeline Parameters](https://circleci.com/docs/pipeline-variables/#pipeline-parameters) | Complete guide to pipeline parameters |
| [Reusing Config](https://circleci.com/docs/reusing-config/) | Configuration reuse strategies |
| [Conditional Steps](https://circleci.com/docs/configuration-reference/#the-when-step) | Using when/unless for conditional logic |
| [Triggering Pipelines API](https://circleci.com/docs/api/v2/index.html#operation/triggerPipeline) | API reference for triggering with parameters |
| [Dynamic Configuration](https://circleci.com/docs/dynamic-config/) | Advanced dynamic configuration patterns |
| [Commands (Reusable Steps)](https://circleci.com/docs/reusing-config/#authoring-reusable-commands) | Creating reusable command definitions |

### API Trigger Example

```bash
curl -X POST \
  "https://circleci.com/api/v2/project/github/ORG/REPO/pipeline" \
  -H "Circle-Token: $CIRCLECI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "main",
    "parameters": {
      "skip-tests": false,
      "deploy-environment": "production",
      "node-version": "20",
      "enable-debug": true
    }
  }'
```

### :bulb: Best Practices

- Always provide sensible default values
- Use `enum` for constrained choices to prevent typos
- Document parameters with the `description` field
- Use boolean `skip-*` parameters sparingly
- Test pipelines with different parameter combinations

---

## Lesson 2.2: Job Parameters

### :dart: Learning Objective

Define parameterized jobs to eliminate duplication and create reusable job definitions that can be called multiple times with different values.

### Key Concepts

- **Job parameters** are set when a job is called in the workflow (different from pipeline parameters set at trigger time)
- DRY principle: Don't Repeat Yourself - one parameterized job replaces multiple similar jobs
- Parameter types: `string`, `boolean`, `integer`, `enum`
- Access job parameters with: `<< parameters.PARAM_NAME >>` (note: no "job." prefix)
- The `name` key in workflows creates unique job instances

### Job Parameters vs Pipeline Parameters

| Feature | Pipeline Parameters | Job Parameters |
|---------|---------------------|----------------|
| Set when? | Trigger time (API/UI) | Workflow definition |
| Scope | Entire pipeline | Single job invocation |
| Access syntax | `<< pipeline.parameters.X >>` | `<< parameters.X >>` |
| Can skip jobs? | Yes (with `when`) | No (job always exists) |
| Set via API? | Yes | No |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Reusing Config - Job Parameters](https://circleci.com/docs/reusing-config/#using-the-parameters-declaration) | Complete guide to job parameter definitions |
| [Configuration Reference - Parameters](https://circleci.com/docs/configuration-reference/#parameters) | Parameter syntax and types reference |
| [Reusing Config - Authoring Parameterized Jobs](https://circleci.com/docs/reusing-config/#authoring-parameterized-jobs) | Creating parameterized job definitions |
| [Conditional Steps](https://circleci.com/docs/configuration-reference/#the-when-step) | Using `when` with parameters for conditional logic |
| [Workflow Job Invocation](https://circleci.com/docs/workflows/#using-parameters-in-jobs) | Passing parameters when invoking jobs in workflows |

### :bulb: Best Practices

- Use required parameters (no default) for essential values
- Use defaults for optional configuration
- Give each job instance a meaningful `name` in workflows
- Use `when` conditions for conditional steps within jobs
- Document parameters with the `description` field
- Job parameters can reference pipeline parameters: `environment: << pipeline.parameters.env >>`

---

## Lesson 2.3: Reusable Commands & Executors

### :dart: Learning Objective

Create reusable commands (step sequences) and executors (environments) to eliminate duplication and ensure consistency across jobs.

### Key Concepts

- **Commands**: Reusable sequences of steps (like functions in programming)
- **Executors**: Reusable execution environments (Docker, machine, macOS)
- Both support parameters for flexibility
- Commands are called inside jobs; parameterized jobs are called in workflows
- Can reduce YAML duplication by 60-80%

### Reuse Hierarchy

| Level | Component | Description |
|-------|-----------|-------------|
| 1 | Steps | Basic building blocks (run, checkout, etc.) |
| 2 | Commands | Reusable step sequences |
| 3 | Jobs | Reusable job definitions with parameters |
| 4 | Orbs | Shareable packages of all the above |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Reusing Config - Commands](https://circleci.com/docs/reusing-config/#authoring-reusable-commands) | Creating reusable command definitions |
| [Reusing Config - Executors](https://circleci.com/docs/reusing-config/#authoring-reusable-executors) | Creating reusable execution environments |
| [Configuration Reference - Commands](https://circleci.com/docs/configuration-reference/#commands) | Command syntax reference |
| [Configuration Reference - Executors](https://circleci.com/docs/configuration-reference/#executors) | Executor syntax reference |
| [Reusing Config Overview](https://circleci.com/docs/reusing-config/) | Complete guide to configuration reuse strategies |
| [Executor Introduction](https://circleci.com/docs/executor-intro/) | Understanding executors and images |

### When to Use Commands vs Parameterized Jobs

| Use Commands When... | Use Parameterized Jobs When... |
|---------------------|-------------------------------|
| Same steps repeat in different jobs | Entire job structure repeats |
| Need step-level reuse | Need job-level reuse |
| Steps vary within consistent job structure | Same job runs multiple times with different values |

### :bulb: Best Practices

- Extract repeated 3+ step sequences into commands
- Use descriptive command names (verb-noun pattern)
- Provide sensible defaults for optional parameters
- Document commands with the `description` field
- Use executors for environment consistency across jobs
- Commands can call other commands (enables composition)

---

## Module 3: Mastering Orbs and Reusable Components

**Duration:** 30 minutes | **Terminal Objective:** Integrate and utilize certified Orbs to rapidly deploy common functions and third-party integrations.

---

## Lesson 3.1: The CircleCI Orbs Ecosystem & Node.js Orb

### :dart: Learning Objective

Understand what orbs are and how to use the official CircleCI Node.js orb to dramatically simplify your configuration while following best practices.

### Key Concepts

- **Orbs** are shareable, reusable configuration packages
- They bundle executors, commands, and jobs together
- Semantic versioning: `major.minor.patch`
- `@volatile` for always-latest (not recommended for production)
- Orbs can reduce configuration by 60% or more

### What Orbs Provide

| Component | Examples | Description |
|-----------|----------|-------------|
| Executors | `node/default`, `node/browsers` | Pre-configured environments |
| Commands | `node/install-packages` | Reusable step sequences |
| Jobs | `node/test`, `node/run` | Complete job definitions |

### Version Strategies

| Format | Description | Use Case |
|--------|-------------|----------|
| `@5.2.0` | Exact version | Production (recommended) |
| `@5.2` | Latest patch of 5.2.x | Minor updates OK |
| `@5` | Latest minor.patch of 5.x.x | Major version lock |
| `@volatile` | Always latest | Development only (NOT recommended) |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Orbs Introduction](https://circleci.com/docs/orb-intro/) | What orbs are and how they work |
| [Using Orbs](https://circleci.com/docs/orb-concepts/) | Core orb concepts and usage patterns |
| [Node.js Orb - Registry](https://circleci.com/developer/orbs/orb/circleci/node) | Official Node.js orb documentation |
| [Node.js Orb - Source](https://github.com/CircleCI-Public/node-orb) | Node.js orb GitHub repository |
| [Orb Registry](https://circleci.com/developer/orbs) | Browse and search all available orbs |
| [CircleCI CLI - Orb Commands](https://circleci.com/docs/local-cli/#orb-commands) | Local CLI commands for working with orbs |

### Node.js Orb Key Features

| Command/Job | Description |
|-------------|-------------|
| `node/install-packages` | Auto-detects package manager, handles caching |
| `node/test` | Complete test job with results storage |
| `node/run` | Run any npm/yarn command with setup |

### :bulb: Best Practices

- Always pin orb versions in production configs
- Use orb commands for flexibility, orb jobs for simplicity
- Check orb documentation for all available parameters
- Keep orbs updated for security patches
- Prefer official CircleCI orbs when available
- Review orb source code before using third-party orbs

---

## Lesson 3.2: Slack Notifications Orb

### :dart: Learning Objective

Integrate Slack notifications into your CI/CD pipeline using the official Slack orb to keep your team informed of build and deployment status.

### Key Concepts

- CircleCI **Contexts** for secure secret management
- Slack **Block Kit** for rich message formatting
- Event-based notifications: `pass`, `fail`, `always`, `on_hold`
- Custom message templates with environment variables

### Notification Events

| Event | Triggers When |
|-------|--------------|
| `pass` | Job succeeds |
| `fail` | Job fails |
| `always` | Regardless of job status |
| `on_hold` | Workflow waiting for approval |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Slack Orb - Registry](https://circleci.com/developer/orbs/orb/circleci/slack) | Official Slack orb documentation |
| [Slack Orb - Source](https://github.com/CircleCI-Public/slack-orb) | Slack orb GitHub repository |
| [Contexts](https://circleci.com/docs/contexts/) | Secure environment variable management |
| [Environment Variables](https://circleci.com/docs/env-vars/) | Built-in and custom environment variables |

### :link: Slack Developer Resources

| Resource | Description |
|----------|-------------|
| [Slack Block Kit Builder](https://app.slack.com/block-kit-builder) | Design custom message layouts |
| [Slack API - Creating Apps](https://api.slack.com/apps) | Create and configure Slack apps |
| [Slack Block Kit Reference](https://docs.slack.dev/reference/block-kit) | Block Kit element documentation |

### Slack Orb Setup Requirements

| Step | Action |
|------|--------|
| 1 | Create Slack App at api.slack.com/apps |
| 2 | Add OAuth scopes: `chat:write`, `chat:write.public` |
| 3 | Install app to workspace and copy Bot Token |
| 4 | Create CircleCI Context with `SLACK_ACCESS_TOKEN` |
| 5 | Apply context to jobs using Slack notifications |

### Built-in Templates

| Template | Description |
|----------|-------------|
| `basic_success_1` | Simple success message |
| `basic_fail_1` | Simple failure message |
| `success_tagged_deploy_1` | Deployment success with tags |
| `basic_on_hold_1` | Waiting for approval notification |

### :bulb: Best Practices

- Use different Slack channels for different notification types
- Keep messages concise but informative
- Include action buttons for quick access to builds
- Use templates for consistency across projects
- Avoid over-notification (causes notification fatigue)
- Use Contexts for secure token storage (not project env vars)

---

## Lesson 3.3: Azure CLI Orb & Deployment

### :dart: Learning Objective

Deploy to Azure Container Apps using the Azure CLI orb with secure, passwordless OIDC (OpenID Connect) authentication.

### Key Concepts

- **OIDC**: Secure, tokenless authentication to cloud providers
- **Azure CLI Orb**: Install and configure Azure CLI automatically
- **Docker layer caching**: Speed up image builds in CircleCI
- **Azure Container Apps**: Serverless container platform
- **Federated Credentials**: No secrets stored in CI/CD

### Why OIDC Instead of Service Principal Secrets?

| Old Way (Secrets) | New Way (OIDC) |
|-------------------|----------------|
| Secrets stored in CircleCI | No secrets stored anywhere |
| Secrets can be leaked in logs | Token issued per-job, expires immediately |
| Secrets expire and need rotation | Cannot be copied or reused |
| Can be copied to other systems | Scoped to specific CircleCI org/project |

### :link: CircleCI Official Documentation

| Resource | Description |
|----------|-------------|
| [Azure CLI Orb - Registry](https://circleci.com/developer/orbs/orb/circleci/azure-cli) | Official Azure CLI orb documentation |
| [Azure CLI Orb - Source](https://github.com/CircleCI-Public/azure-cli-orb) | Azure CLI orb GitHub repository |
| [OIDC Token Authentication](https://circleci.com/docs/openid-connect-tokens/) | CircleCI OIDC integration guide |
| [Docker Layer Caching](https://circleci.com/docs/docker-layer-caching/) | Speed up Docker builds with caching |
| [Using Docker in Jobs](https://circleci.com/docs/building-docker-images/) | Building and pushing Docker images |

### :link: Azure Official Documentation

| Resource | Description |
|----------|-------------|
| [Workload Identity Federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation) | Azure OIDC concepts |
| [Configure App for OIDC](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust) | Creating federated credentials |
| [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/) | Container Apps documentation |
| [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/) | ACR documentation |

### Azure OIDC Setup Overview

| Step | Action |
|------|--------|
| 1 | Create Azure AD App Registration |
| 2 | Create Service Principal |
| 3 | Get CircleCI Organization ID |
| 4 | Add Federated Credential with CircleCI issuer |
| 5 | Grant Azure role assignments (Contributor, AcrPush) |
| 6 | Create CircleCI Context with Azure IDs |

### Required Context Variables

| Variable | Description |
|----------|-------------|
| `AZURE_CLIENT_ID` | Azure AD App Registration ID |
| `AZURE_TENANT_ID` | Azure AD Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID |
| `ACR_NAME` | Container Registry name |
| `ACR_LOGIN_SERVER` | Registry URL (e.g., myacr.azurecr.io) |

### :warning: Common OIDC Troubleshooting

| Error | Solution |
|-------|----------|
| `AADSTS700016` | Check federated credential issuer URL |
| `AADSTS70021` | Verify subject claim matches exactly |
| `AuthorizationFailed` | Check role assignments on Azure resources |
| ACR login fails | Ensure AcrPush role is assigned |

### :bulb: Best Practices

- Use separate Azure subscriptions for production
- Limit federated credential scope (use project ID, not wildcard)
- Enable Azure AD sign-in logs for audit trail
- Use separate contexts for dev vs production credentials
- Use managed identity for Container Apps runtime authentication

---

## Additional Resources

### :books: CircleCI Documentation Hub

| Resource | Description |
|----------|-------------|
| [CircleCI Documentation Home](https://circleci.com/docs/) | Main documentation portal |
| [Configuration Reference](https://circleci.com/docs/configuration-reference/) | Complete YAML reference |
| [CircleCI Orbs Registry](https://circleci.com/developer/orbs) | Browse and search available orbs |
| [CircleCI CLI](https://circleci.com/docs/local-cli/) | Local testing and config validation |
| [Troubleshooting Guide](https://circleci.com/docs/reference/troubleshoot/) | Common issues and solutions |

### :package: Recommended Orbs

| Orb | Description |
|-----|-------------|
| [circleci/node](https://circleci.com/developer/orbs/orb/circleci/node) | Node.js installation and caching |
| [circleci/slack](https://circleci.com/developer/orbs/orb/circleci/slack) | Slack notifications |
| [circleci/azure-cli](https://circleci.com/developer/orbs/orb/circleci/azure-cli) | Azure CLI integration |
| [circleci/docker](https://circleci.com/developer/orbs/orb/circleci/docker) | Docker build and publish |
| [circleci/aws-cli](https://circleci.com/developer/orbs/orb/circleci/aws-cli) | AWS CLI integration |

### :mortar_board: Learning Resources

| Resource | Description |
|----------|-------------|
| [CircleCI Support Center](https://support.circleci.com/hc/en-us) | Official training and support resources |
| [CircleCI Blog](https://circleci.com/blog/) | Engineering articles and best practices |
| [CircleCI Resources Hub](https://circleci.com/resources/) | Video tutorials, webinars, and guides |
| [CircleCI Discuss Forum](https://discuss.circleci.com/) | Community Q&A and support |

---

## Troubleshooting Resources

### :wrench: Common Issues and Solutions

| Issue | Documentation |
|-------|---------------|
| [Troubleshooting Common Issues](https://circleci.com/docs/reference/troubleshoot/) | General troubleshooting guide |
| [Debugging with SSH](https://circleci.com/docs/ssh-access-jobs/) | SSH into failed jobs for debugging |
| [Test Insights](https://circleci.com/docs/insights-tests/) | Analyze flaky and slow tests |
| [Build Processing Issues](https://circleci.com/docs/troubleshoot/) | Pipeline and workflow problems |
| [Orb Troubleshooting](https://circleci.com/docs/orbs-faq/) | Orb-specific issues and FAQ |

### :mag: Debugging Tools

| Tool | Description |
|------|-------------|
| [CircleCI CLI](https://circleci.com/docs/local-cli/) | Validate configs locally with `circleci config validate` |
| [Config Processing](https://circleci.com/docs/local-cli/#processing-a-config) | Process and expand config with `circleci config process` |
| [Local Job Execution](https://circleci.com/docs/local-cli/#run-a-job-in-a-container-on-your-machine) | Run jobs locally with `circleci local execute` |
| [SSH Debugging](https://circleci.com/docs/ssh-access-jobs/) | Re-run failed jobs with SSH access |

### :chart_with_upwards_trend: Performance Optimization

| Resource | Description |
|----------|-------------|
| [Optimization Overview](https://circleci.com/docs/optimizations/) | General optimization strategies |
| [Caching Best Practices](https://circleci.com/docs/caching-strategy/) | Effective caching strategies |
| [Test Splitting](https://circleci.com/docs/parallelism-faster-jobs/) | Parallel test execution |
| [Resource Classes](https://circleci.com/docs/resource-class-overview/) | Right-sizing job resources |
| [Docker Layer Caching](https://circleci.com/docs/docker-layer-caching/) | Speed up Docker builds |

### :shield: Security Resources

| Resource | Description |
|----------|-------------|
| [Security Overview](https://circleci.com/docs/security/) | CircleCI security practices |
| [Using Contexts](https://circleci.com/docs/contexts/) | Secure secret management |
| [OIDC Tokens](https://circleci.com/docs/openid-connect-tokens/) | Passwordless cloud authentication |
| [IP Ranges](https://circleci.com/docs/ip-ranges/) | IP allowlisting for firewalls |

---

## Course Completion Next Steps

### :rocket: Continue Your Learning

After completing this course, consider these paths to deepen your CircleCI expertise:

### Immediate Actions

1. **Apply to a Real Project**: Take the patterns learned and implement them in your organization's pipelines
2. **Create Reusable Components**: Build a library of commands and executors specific to your tech stack
3. **Document Your Patterns**: Create team-specific documentation for your CI/CD conventions

### Advanced Topics to Explore

| Topic | Resource |
|-------|----------|
| [Dynamic Configuration](https://circleci.com/docs/dynamic-config/) | Generate config based on changed files |
| [Private Orbs](https://circleci.com/docs/orb-intro/) | Create organization-specific orbs |
| [Orb Development](https://circleci.com/docs/orb-author/) | Build and publish your own orbs |
| [API Integration](https://circleci.com/docs/api-intro/) | Automate CircleCI with the API |
| [Insights API](https://circleci.com/docs/insights/) | Pipeline analytics and metrics |
| [Runner Self-Hosted](https://circleci.com/docs/runner-overview/) | Run jobs on your own infrastructure |

### Certification Path

| Certification | Description |
|---------------|-------------|
| [CircleCI Foundations](https://support.circleci.com/hc/en-us/articles/17262861842971-CircleCI-Associate-Developer-Certificate) | Entry-level certification |
| [CircleCI Developer](https://support.circleci.com/hc/en-us/articles/17262861842971-CircleCI-Associate-Developer-Certificate) | Intermediate certification |

### Community Engagement

| Activity | Link |
|----------|------|
| Join the Discuss Forum | [discuss.circleci.com](https://discuss.circleci.com/) |
| Follow CircleCI Blog | [circleci.com/blog](https://circleci.com/blog/) |
| Explore Resources Hub | [circleci.com/resources](https://circleci.com/resources/) |
| Contribute to Orbs | [github.com/CircleCI-Public](https://github.com/CircleCI-Public) |

### Related Pluralsight Courses

| Course | Description |
|--------|-------------|
| Docker Deep Dive | Container fundamentals for CI/CD |
| Kubernetes for Developers | Container orchestration |
| Azure DevOps | Microsoft cloud CI/CD |
| Infrastructure as Code | IaC patterns with Terraform/Bicep |

---

## Glossary of Terms

| Term | Definition |
|------|------------|
| **Workflow** | A set of rules for defining a collection of jobs and their run order |
| **Job** | A collection of steps that run commands in an executor |
| **Step** | An individual action within a job (run, checkout, etc.) |
| **Executor** | The environment in which jobs run (Docker, machine, macOS) |
| **Orb** | Shareable packages of CircleCI configuration |
| **Pipeline** | A full set of workflows triggered by a commit |
| **Workspace** | Temporary storage for passing data between jobs |
| **Context** | Secure, organization-scoped environment variables |
| **Approval** | A manual gate requiring human intervention |
| **Filter** | Conditions controlling when jobs execute |
| **Parameter** | Configurable values set at pipeline trigger time |
| **Fan-out** | Pattern where multiple jobs run in parallel |
| **Fan-in** | Pattern where one job waits for multiple jobs |
| **Command** | A reusable sequence of steps that can be called from jobs |
| **Job Parameter** | A configurable value set when invoking a job in a workflow |
| **Pipeline Parameter** | A configurable value set when triggering a pipeline |
| **OIDC** | OpenID Connect - secure authentication without stored secrets |
| **Federated Credential** | Azure AD trust relationship for OIDC authentication |
| **Block Kit** | Slack's framework for building rich, interactive messages |
| **Docker Layer Caching** | CircleCI feature to cache Docker image layers between builds |
| **ACR** | Azure Container Registry - managed Docker registry service |
| **Container Apps** | Azure's serverless container hosting platform |

---

## :question: Getting Help

- **CircleCI Support:** [support.circleci.com](https://support.circleci.com/)
- **Community Forum:** [discuss.circleci.com](https://discuss.circleci.com/)
- **Status Page:** [status.circleci.com](https://status.circleci.com/)
- **GitHub Issues:** Report bugs in official orbs via their GitHub repositories

---

_This resource guide accompanies the Pluralsight course "Advanced CircleCI Configuration" by Tim Warner. All documentation links verified as of the course publication date._
