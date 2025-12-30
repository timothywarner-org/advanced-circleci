<!-- Slide number: 1 -->
Configuration Reusewith Parameters

![A person wearing glasses and a black jacket AI-generated content may be incorrect.](PicturePlaceholder10.jpg)
Tim Warner

![A blue and white circle with text and a black background Description automatically generated](Picture29.jpg)

![A blue and white rectangular sign with white text Description automatically generated](Picture30.jpg)

![A blue and white circle with text Description automatically generated](Picture28.jpg)
Principal Author  |  IT Ops  |  Pluralsight
TechTrainerTim.com

### Notes:
[FRAMER]
Welcome to Configuration Reuse with Parameters. I'm Tim Warner, Principal Author in the IT Ops domain here at Pluralsight. In Module 1, we mastered workflow orchestration - fan-out, fan-in, and job dependencies. Now we're going to tackle something equally powerful: eliminating configuration duplication.

[SLIDE CONTENT]
Configuration Reuse with Parameters - this is the second module in our CircleCI Advanced Configuration course.

Here's the thing about CI/CD configuration: copy-paste is the enemy. Every time you duplicate a job to handle dev versus staging versus production, you're creating a maintenance nightmare. This module teaches you how to write configuration ONCE and invoke it many times with different inputs.

By the end of this module, you'll understand pipeline parameters for top-level configuration control, job parameters for reusable job definitions, reusable commands for step-sequence abstraction, and executors for environment standardization.

We're continuing with our Globomantics Robotics Company scenario. Maya Chen's team has solved their parallelization problems - now they're drowning in duplicate configuration across multiple environments.

[TRANSITION]
Let's see exactly how painful this duplication problem has become at Globomantics...

<!-- Slide number: 2 -->

![](Graphic8.jpg)
# The DRY Problem at Globomantics

The problem
The risk
Configuration duplication creates maintenance nightmares
deploy-dev (20 lines)
deploy-staging (20 lines)
deploy-prod (20 lines)
60+ lines of identical YAML
Pattern repeated across 5 repos
Bug fix = triple work (Update 3 jobs manually)
Configuration drift (Jobs diverge over time silently)
Debugging nightmare (Which version has the issue?)
Solution: Parameters (One job, three invocations)

### Notes:
[FRAMER]
Real talk - this slide represents pain that every DevOps team experiences. Maya's team brought me their configs and said "Tim, we're spending more time maintaining CI than writing features." When I looked at their YAML, I understood why.

[SLIDE CONTENT]
Look at this DRY problem at Globomantics. On the left, we see The problem - configuration duplication creating maintenance nightmares. They've got deploy-dev at 20 lines, deploy-staging at 20 lines, deploy-prod at 20 lines. That's 60+ lines of identical YAML, and this pattern repeated across 5 repos.

Now look at The risk column. Bug fix = triple work - you update one job, forget another, and suddenly your environments are inconsistent. Configuration drift - jobs diverge over time silently. Debugging nightmare - which version has the issue?

The Solution at the bottom? Parameters. One job, three invocations. This is the DRY principle - Don't Repeat Yourself - applied to CI/CD configuration.

[PRO TIP]
When you see identical blocks of YAML differing only by environment names, URLs, or resource sizing - that's a parameter opportunity. The rule of thumb: if you change three places when you change one thing, you need parameters.

[TRANSITION]
Before we dive into parameters, let's understand where they fit in the overall configuration reuse hierarchy...

<!-- Slide number: 3 -->
# The Configuration Reuse Hierarchy

### Notes:
[FRAMER]
This is your mental model for configuration reuse in CircleCI. Think of this as a toolkit - you'll use different tools for different jobs. Understanding which level of abstraction to use is half the battle.

[SLIDE CONTENT]
Study The Configuration Reuse Hierarchy diagram. This shows the layers of abstraction available to you, from simplest to most powerful.

At the base, you have Pipeline Parameters - top-level values that control workflow behavior. These are set when triggering the pipeline, either via API or the CircleCI UI.

Next level up: Job Parameters. These let you define a job template and invoke it with different values. Same job logic, different inputs.

Then Reusable Commands. Think of these like functions in programming - named sequences of steps you can call from any job.

Executors abstract your runtime environment. Define your Docker image, resource class, and environment variables once, reference them everywhere.

At the top: Orbs. Shareable packages of CircleCI configuration. We'll cover orbs deeply in Module 3.

[PRO TIP]
Start at the simplest level that solves your problem. Don't reach for orbs when job parameters will do. Complexity should be justified by reuse frequency.

[TRANSITION]
Let's start with pipeline parameters - the foundation of dynamic configuration...

<!-- Slide number: 4 -->
version: 2.1parameters:  skip-tests:    type: boolean    default: false
  deploy-env:    type: enum    enum: [dev, staging, prod]    default: devworkflows:  deploy:    when:      not: << pipeline.parameters.skip-tests >>

Types: string, Boolean, integer, enum

Default value for non-interactive runs

Workflow doesn’t run if skip-tests is true

### Notes:
[FRAMER]
Pipeline parameters are your first tool for eliminating duplication. They're declared at the top of your config.yml and influence everything below. Let me walk you through this syntax carefully.

[SLIDE CONTENT]
Look at this config.yml block. We start with version: 2.1 - remember, config reuse features require version 2.1 or higher.

Next, the parameters key at the top level. This declares pipeline parameters. We've got two examples here.

First: skip-tests with type: boolean and default: false. Boolean parameters are perfect for feature flags. Pass true when you want to skip tests for a quick deploy.

Second: deploy-env with type: enum and enum: [dev, staging, prod]. Enum parameters constrain values to a predefined list. No typos, no invalid environments.

Look at that default: dev - this is critical. Default values mean your pipeline runs without explicit parameters. Non-interactive API triggers need these defaults.

Now see the workflows section: when: not: << pipeline.parameters.skip-tests >>. This is conditional workflow execution - the entire workflow doesn't run if skip-tests is true.

The callout says Types: string, Boolean, integer, enum. Four types available. Choose the right type for your use case.

[TRANSITION]
Pipeline parameters control the whole config. Now let's see job parameters for targeted reuse...

<!-- Slide number: 5 -->
# Job Parameters: The Transformation
From 60+ lines of duplication to 25 lines of reusable config
config.yml
config.yml
deploy-dev:  docker: [image: node:20]  steps:    - checkout    - run: npm ci    - run: az webapp deploy --name globo-devdeploy-staging:  ...(same 20 lines)...deploy-prod:  ...(same 20 lines)...
deploy:  parameters:    env: {type: string}    app-name: {type: string}  docker: [image: node:20]  steps:    - checkout    - run: npm ci    - run: az webapp deploy        --name << parameters.app-name >>workflows:  jobs:    - deploy: {env: dev, app-name: globo-dev}    - deploy: {env: stg, app-name: globo-stg}    - deploy: {env: prod, app-name: globo-prod}

### Notes:
[FRAMER]
This is the transformation slide - the before and after that makes everything click. Watch how 60+ lines become 25 lines while gaining flexibility.

[SLIDE CONTENT]
Look at this Job Parameters: The Transformation slide. The subtitle says it all: From 60+ lines of duplication to 25 lines of reusable config.

On the left, the BEFORE code. We've got deploy-dev with its docker image, checkout, npm ci, and az webapp deploy with hardcoded --name globo-dev. Then deploy-staging - same 20 lines. Then deploy-prod - same again. Triple maintenance burden.

Now the right side - AFTER. One deploy job with a parameters section: env: {type: string} and app-name: {type: string}. The steps are identical, but look at that deploy command: --name << parameters.app-name >>. That double angle bracket syntax is parameter interpolation.

In the workflows section, we invoke this single job three times: deploy: {env: dev, app-name: globo-dev}, then staging, then prod. Same job template, different values.

That's the power of job parameters. Write once, invoke with variations. When Azure changes their CLI syntax, you update ONE place.

[PRO TIP]
Always provide a default value for parameters that have a sensible default. Only require explicit values when there's no reasonable fallback.

[TRANSITION]
Now here's where people get confused - parameters versus environment variables. They look similar but behave completely differently...

<!-- Slide number: 6 -->
# Parameters vs. Environment Variables
| Property | Parameters | Environment variables |
| --- | --- | --- |
| Resolution | Compile time | Runtime |

### Notes:
[FRAMER]
This comparison table builds progressively. I want you to understand each row before we add the next. Let's start with the most fundamental difference.

[SLIDE CONTENT]
Parameters vs. Environment Variables - this distinction trips up so many developers.

The first row shows Property: Resolution. Parameters resolve at Compile time. Environment variables resolve at Runtime.

What does that mean? When CircleCI processes your config.yml, it evaluates all parameter expressions BEFORE any container spins up. The << parameters.whatever >> syntax is replaced with actual values during config processing.

Environment variables, on the other hand, exist only when your jobs execute. The shell process reads them at runtime. Your config.yml can't make structural decisions based on environment variable values because those values don't exist yet when the config is being processed.

This single difference explains why parameters can conditionally include or exclude entire job steps, while environment variables cannot. Parameters influence WHAT gets built. Environment variables influence HOW it runs.

[TRANSITION]
Let's add the next key difference...

<!-- Slide number: 7 -->
# Parameters vs. Environment Variables
| Property | Parameters | Environment variables |
| --- | --- | --- |
| Resolution | Compile time | Runtime |
| Typing | Strong (string, bool, int, enum) | Weak (string only) |

### Notes:
[FRAMER]
The second row adds type safety - something environment variables completely lack.

[SLIDE CONTENT]
Same table, new row. Typing: Parameters have Strong (string, bool, int, enum). Environment variables have Weak (string only).

When you declare a parameter as type: boolean, CircleCI validates that you pass true or false. Pass "yes" and you get an error at config processing time - before your pipeline wastes any compute.

Enum parameters go further. If your deploy-env enum is [dev, staging, prod], passing "production" fails immediately. Typo caught before any jobs run.

Environment variables? Everything is a string. Your $DEPLOY_ENV could be "dev", "DEV", "development", or "potato" - the shell doesn't care. You won't discover the mistake until your deploy script fails at runtime, after you've burned credits on all prior jobs.

Type safety catches errors early. That's why parameters are better for configuration values.

[TRANSITION]
The third row explains WHAT versus HOW...

<!-- Slide number: 8 -->
# Parameters vs. Environment Variables
| Property | Parameters | Environment variables |
| --- | --- | --- |
| Resolution | Compile time | Runtime |
| Typing | Strong (string, bool, int, enum) | Weak (string only) |
| Scope | Config structure (WHAT code runs) | Shell context (HOW code runs) |

### Notes:
[FRAMER]
This row captures the fundamental architectural difference. Parameters control structure. Environment variables control execution.

[SLIDE CONTENT]
Third row: Scope. Parameters operate in Config structure (WHAT code runs). Environment variables operate in Shell context (HOW code runs).

Think about it this way. Parameters can determine whether a step exists at all - using when/unless conditions, you can include or exclude entire steps based on parameter values. That's structural control.

Environment variables are passed INTO steps. Your shell script reads them and behaves accordingly. But the step itself always runs. You can't conditionally remove steps based on environment variables because they don't exist during config processing.

This is why you use parameters to choose which jobs run in a workflow, and environment variables to pass secrets to those jobs.

[TRANSITION]
Final row - the practical use case summary...

<!-- Slide number: 9 -->
# Parameters vs. Environment Variables
| Property | Parameters | Environment variables |
| --- | --- | --- |
| Resolution | Compile time | Runtime |
| Typing | Strong (string, bool, int, enum) | Weak (string only) |
| Scope | Config structure (WHAT code runs) | Shell context (HOW code runs) |
| Use Case | Conditional logic, image tags | API keys, secrets |

### Notes:
[FRAMER]
Now we see the complete picture. Four properties, two tools, completely different purposes.

[SLIDE CONTENT]
The complete table shows Use Case: Parameters for Conditional logic, image tags. Environment variables for API keys, secrets.

Parameters excel at: choosing which workflow runs, selecting Docker image versions, enabling or disabling job steps, setting parallelism levels. All of these are structural decisions made BEFORE jobs execute.

Environment variables excel at: passing API credentials, database connection strings, feature flags that your application reads at runtime, any secret value that shouldn't be visible in your config.yml.

The mnemonic I use: Parameters are for the PIPELINE. Environment variables are for the PROCESS running inside the pipeline.

[PRO TIP]
Never put secrets in parameters. Parameter values are visible in the CircleCI UI and logs. Use environment variables from CircleCI Contexts for sensitive values.

[TRANSITION]
Let's crystallize this distinction with one key insight...

<!-- Slide number: 10 -->
Key Insight:
# Parameters control pipeline structure. Environment variables cannot influence structure - only process execution.

### Notes:

<!-- Slide number: 11 -->
Reusable Commands
Extract repeated step sequences into named, reusable units
Think of commands as functions in your CircleCI pipeline config
Process:
Identify repeated command sequences
Define command once, call many times
Update in one place
This is the DRY principle applied to CI/CD

![command-console](Picture2.jpg)

### Notes:

<!-- Slide number: 12 -->
# Reusable Commands: Before and After
The DRY principle applied to CI/CD pipelines
config.yml
config.yml
# BEFORE (DRY violation)jobs:  build-dev:    steps:      - checkout      - run: npm install      - run: npm test        build-prod:    steps:      - checkout      # 🔴 Repeated!      - run: npm install      - run: npm test
# AFTER (with commands)commands:  build-app:    steps:      - checkout      - run: npm install      - run: npm testjobs:  build-dev:    steps:      - build-app  build-prod:    steps:      - build-app

### Notes:

<!-- Slide number: 13 -->
# Commands with Parameters
# Make commands flexible by accepting parameter arguments

commands:  deploy-app:    parameters:      api-url:        type: string      timeout:        type: integer        default: 300    steps:      - run: curl << parameters.api-url >>      - run: wait << parameters.timeout >>s# CALLING THE COMMANDjobs:  deploy-dev:    steps:      - deploy-app:          api-url: https://api.dev          timeout: 60  deploy-prod:    steps:      - deploy-app:          api-url: https://api.prod          timeout: 300

### Notes:

<!-- Slide number: 14 -->
# Executors: Environment Abstraction
# Named runtime configurations for consistency

executors:  node-builder:    docker:      - image: cimg/node:18.0.0    resource_class: medium    working_directory: ~/src  node-large:    docker:      - image: cimg/node:18.0.0    resource_class: large  docker-builder:    machine: true    image: ubuntu-2204:2023.04# USAGE ACROSS JOBSjobs:  lint:    executor: node-builder  test-parallel:    executor: node-large  # More RAM  build-image:    executor: docker-builder

### Notes:

<!-- Slide number: 15 -->
# Conditional Logic: when/unless
parameters:  deploy-env:    type: enum    enum: [dev, staging, prod]    default: devworkflows:  deploy-pipeline:    jobs:      - build            - test:          requires: [build]            - deploy-staging:          requires: [test]          when:            equal: [staging,              << pipeline.parameters.deploy-env >>]            - deploy-prod:          requires: [test]          when:            equal: [prod,              << pipeline.parameters.deploy-env >>]# RESULT:# dev → build → test → (stop)# staging → build → test → deploy-staging# prod → build → test → deploy-prod

### Notes:

<!-- Slide number: 16 -->
# Key Takeaways
Parameters abstract differences: Extract what varies into parameters. What stays the same becomes the template.

![key-stars](Picture2.jpg)
Parameters ≠ env vars: Config-time vs runtime. Parameters = WHAT runs. Env vars = HOW code behaves.

![key-stars](Picture4.jpg)
Commands = functions: Extract repeated step sequences into named commands. Update once, apply everywhere.

![key-stars](Picture6.jpg)

### Notes:
