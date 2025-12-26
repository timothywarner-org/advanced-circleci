# CircleCI Advanced Configuration

## Course Overview

- **Approved Date:** YYYY-MM-DD
- **Course Title:** CircleCI Advanced Configuration
- **Author:** Tim Warner
- **Opportunity ID:** 08b176c1-6326-49cf-949f-49497068f09a
- **Course Slug:** circleci-advanced-config
- **Skill Path:** CircleCI (Path Placement: 2)
- **Job Roles:** System Administrator, Systems Engineer, DevOps Engineer, Cloud Engineer
- **Content Level:** Intermediate
- **Length:** 90 minutes
- **Content Tags:** IT Ops, DevOps, Continuous integration, Continuous delivery, Configuration and deployment, CircleCI
- **Style:** Video Course | Standard Course

### Learner Profile

The learner profile is **The Orchestrator**: an engineer who must manage simultaneous builds, enforce testing dependencies (e.g., ensuring a service starts before integration tests run), and create maintainable, standardized pipeline components across multiple repositories.

### Learner Prerequisites

- Completion of "Getting Started with CircleCI" or equivalent hands-on experience with CircleCI pipelines
- Working knowledge of `.circleci/config.yml` (version 2.1), jobs, steps, executors, and basic workflows
- Familiarity with Git version control and GitHub Enterprise Cloud (or similar VCS platforms)
- Experience with at least one programming language (Node.js used for examples, but concepts are transferable)
- Understanding of core CI/CD concepts: automated builds, testing, and deployment

### Purpose

As development teams scale, CI/CD configurations become unwieldy. The fictional Globomantics robotics company has grown from one Node.js application to a fleet of microservices, and their `config.yml` files are bloated with duplicated YAML across repositories. Build times are unpredictable because workflow dependencies are not orchestrated—sometimes deployments run before tests complete. This course teaches engineers to master workflow orchestration patterns, abstract repeated configuration into reusable parameters and commands, and leverage the CircleCI Orbs ecosystem to standardize pipelines across the organization.

### Author Notes

- GitHub repository: `globomantics-advanced-circleci` (extends existing Globomantics scenarios from Course 1)
- All demos use CircleCI Free Plan (30,000 credits/month); no paid tier features required
- VS Code with CircleCI extension for config validation and development
- GenAI integration: GitHub Copilot and CircleCI MCP server for config generation and troubleshooting
- Comparison to GitHub Actions (Orbs vs. Actions)
- Azure deployment examples in Module 3 capstone

### Descriptions

- **Short Description:** Complex pipelines require sophisticated orchestration. This course will teach you to design multi-stage workflows, implement configuration reuse with parameters, and leverage CircleCI Orbs for scalable, maintainable CI/CD.
- **Long Description:** As CI/CD pipelines grow in complexity, engineers struggle with duplicated configuration, unreliable job sequencing, and difficulty maintaining consistency across repositories. In this course, **CircleCI Advanced Configuration**, you'll gain the ability to design production-grade pipelines that scale with your organization. First, you'll explore multi-stage workflow orchestration using job dependencies, fan-out/fan-in patterns, and branch/tag filters. Next, you'll discover how to implement configuration reuse strategies using pipeline parameters, command definitions, and executor abstractions to eliminate YAML duplication. Finally, you'll learn how to integrate certified Orbs from the CircleCI Registry to rapidly deploy common functions like Slack notifications, AWS deployments, and Azure integrations—while understanding the path to creating custom Orbs for your organization. When you're finished with this course, you'll have the skills and knowledge of advanced CircleCI configuration needed to architect maintainable, scalable CI/CD pipelines for enterprise development teams.

## Learning Objectives

### Terminal Objective 1

**Design and implement multi-stage workflows utilizing complex job dependencies and execution patterns.**

- Define sequential workflows using the `requires` keyword to enforce dependency order.
- Configure parallel jobs using fan-out workflows to execute independent tasks simultaneously.
- Utilize filters (branches, tags) to control which commits trigger specific workflow executions.

### Terminal Objective 2

**Implement configuration reuse strategies using parameters to abstract variable data in jobs and workflows.**

- Create and reference parameters within job definitions to generalize functions.
- Pass configuration parameters between jobs in a workflow using mapping.
- Identify scenarios where custom parameters are superior to using environment variables for configuration.

### Terminal Objective 3

**Integrate and utilize certified Orbs to rapidly deploy common functions and third-party integrations.**

- Locate and install partner and certified orbs from the CircleCI Registry.
- Invoke pre-built commands and jobs from a community Orb (e.g., Slack notifications).
- Analyze existing pipeline configuration to identify repetitive code suitable for extraction into a reusable component, upholding the config reuse best practice.
- Review the configuration reference documentation to understand custom orb development requirements.

## Course Organization

### Module 1 — Workflow Orchestration Mastery (30 mins)

**Terminal Objective:** Design and implement multi-stage workflows utilizing complex job dependencies and execution patterns.

1. **Clip 1: Beyond Sequential — Understanding Workflow Patterns (5 min)**  
   _Lecture (PPT):_ Introduce the workflow orchestration problem at Globomantics. Define sequential, parallel, and fan-out/fan-in patterns; show workflow graphs; emphasize `requires` as dependency foundation; compare to GitHub Actions matrix builds.
2. **Clip 2: Building Sequential Dependencies with `requires` (5 min)**  
   _Demo (Screencast):_ Build a three-stage workflow (build → test → deploy) with dependency graph in CircleCI UI; show skipped downstream jobs on failure; demonstrate Copilot-assisted job configuration.
3. **Clip 3: Fan-Out Parallelism for Maximum Speed (5 min)**  
   _Demo (Screencast):_ Run unit-tests, integration-tests, and security-scan in parallel after build; add deploy job requiring all three (fan-in); highlight time savings and workflow DAG visualization.
4. **Clip 4: Conditional Execution with Branch and Tag Filters (5 min)**  
   _Lecture + Demo:_ Use filters to control job triggers (deploy on `main`, integration-tests on PRs, release-build on version tags); show CircleCI "Skipped" status for filtered jobs.
5. **Clip 5: Advanced Patterns — Matrix and Scheduled Workflows (5 min)**  
   _Lecture + Demo:_ Introduce matrix-style testing with workflow parameters; scheduled workflows using triggers; approval jobs for manual gates; demonstrate CircleCI UI scheduling.
6. **Clip 6: Module 1 Summary and Practice Challenge (5 min)**  
   _Lecture:_ Recap patterns and filter types; present Globomantics challenge with multi-branch deployment strategy; show solution `config.yml`; segue to Module 2 on configuration reuse.

### Module 2 — Configuration Reuse with Parameters (30 mins)

**Terminal Objective:** Implement configuration reuse strategies using parameters to abstract variable data in jobs and workflows.

1. **Clip 1: The DRY Principle in CI/CD Configuration (5 min)**  
   _Lecture (PPT):_ Connect DRY to CI/CD; map reuse hierarchy (Parameters → Commands → Executors → Orbs).
2. **Clip 2: Pipeline Parameters for Workflow Control (5 min)**  
   _Demo (Screencast):_ Add pipeline parameters (e.g., `skip-tests`, `deploy-environment`); trigger pipelines via UI and API; demonstrate conditional workflow execution with `when`.
3. **Clip 3: Job Parameters for Reusable Job Definitions (5 min)**  
   _Demo (Screencast):_ Refactor multiple deploy jobs into one parameterized job (`environment`, `replicas`, `notify-slack`); show workflow reuse and line-count reduction.
4. **Clip 4: Parameters vs. Environment Variables — When to Use Which (5 min)**  
   _Lecture + Demo:_ Explain config-time vs. runtime evaluation; provide decision framework; illustrate failure of using environment variables in `when` conditions.
5. **Clip 5: Commands — Reusable Step Sequences (5 min)**  
   _Demo (Screencast):_ Create `setup-node` and `deploy-azure` commands; show invocation across jobs and benefits as function-like abstractions.
6. **Clip 6: Module 2 Summary and Practice Challenge (5 min)**  
   _Lecture:_ Recap reuse hierarchy; present matrix testing challenge across Node 18/20/22 using parameterized job; provide solution.

### Module 3 — Mastering Orbs and Reusable Components (30 mins)

**Terminal Objective:** Integrate and utilize certified Orbs to rapidly deploy common functions and third-party integrations.

1. **Clip 1: The CircleCI Orbs Ecosystem (5 min)**  
   _Lecture (PPT):_ Define orbs, tour registry categories, highlight key orbs, and explain semantic versioning plus pinning strategies; compare Orbs to GitHub Actions.
2. **Clip 2: Installing and Using Your First Orb (5 min)**  
   _Demo (Screencast):_ Add `circleci/node` orb; use `node/install-packages` command and `node/default` executor; show built-in caching and config validation.
3. **Clip 3: Slack Notifications Orb — Real-World Integration (5 min)**  
   _Demo (Screencast):_ Add `circleci/slack` orb with `SLACK_WEBHOOK` in contexts; use `slack/notify` for success/failure events; show notifications.
4. **Clip 4: Cloud Deployment Orbs — Azure Integration (5 min)**  
   _Demo (Screencast):_ Add `circleci/azure-cli` orb; configure OIDC authentication; deploy to Azure App Service with orb commands; contrast with manual scripting.
5. **Clip 5: Analyzing Config for Orb Extraction Opportunities (5 min)**  
   _Lecture + Demo:_ Identify duplicated deployment logic across repos; outline refactoring to commands or private orb; walk through orb development docs, `orb.yml`, validation, and publishing workflow.
6. **Clip 6: Capstone — Complete Globomantics Pipeline (5 min)**  
   _Demo (Screencast):_ Combine fan-out workflow, parameterized jobs, and orb integrations (node, slack, azure-cli); review workflow graph and credit savings compared to baseline pipeline.
