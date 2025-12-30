<!-- Slide number: 1 -->
Mastering Orbs and Reusable Components

![A person wearing glasses and a black jacket AI-generated content may be incorrect.](PicturePlaceholder10.jpg)
Tim Warner

![A blue and white circle with text and a black background Description automatically generated](Picture29.jpg)

![A blue and white rectangular sign with white text Description automatically generated](Picture30.jpg)

![A blue and white circle with text Description automatically generated](Picture28.jpg)
Principal Author  |  IT Ops  |  Pluralsight
TechTrainerTim.com

### Notes:
[FRAMER]
Welcome to Mastering Orbs and Reusable Components. I'm Tim Warner, Principal Author in the IT Ops domain here at Pluralsight. This is the final module in our CircleCI Advanced Configuration course, and it's where everything we've learned comes together.

[SLIDE CONTENT]
Mastering Orbs and Reusable Components - this title represents the ecosystem layer of CircleCI configuration reuse.

In Module 1, we mastered workflow orchestration - fan-out, fan-in, job dependencies. In Module 2, we learned configuration reuse with parameters, commands, and executors. Now we're going to take those concepts and extend them beyond your repository to the entire CircleCI ecosystem.

Here's the thing about orbs: they're not just "someone else's config" - they're the culmination of everything we've learned, packaged for sharing. Commands become shareable. Executors become shareable. Jobs become shareable. And when you understand how to consume orbs intelligently, you'll cut your configuration time by 80% or more.

By the end of this module, you'll know how to evaluate and use orbs from the CircleCI registry, understand version pinning strategies for supply chain security, compare orbs to GitHub Actions for hybrid team decisions, and create private orbs for your organization.

We're concluding our Globomantics story. Maya's team has parallelized their workflows, eliminated duplication - now they're going to leverage the community and build their own reusable components.

[TRANSITION]
Let's start by defining what orbs actually are...

<!-- Slide number: 2 -->
# Thank you for your time!

![](PicturePlaceholder7.jpg)
Tim Warner   |   TechTrainerTim.com

### Notes:
[FRAMER]
And that brings us to the end of this course. You've come a long way from basic pipeline configuration to enterprise-grade CI/CD architecture.

[SLIDE CONTENT]
Thank you for your time! - I genuinely appreciate you investing your time with me.

You can find me at TechTrainerTim.com - that's where I share additional resources, blog posts, and course updates.

[COURSE RECAP]
Let's recap what you've accomplished across these three modules.

Module 1 gave you workflow orchestration mastery - requires, fan-out, fan-in, branch and tag filters. You can now design parallel execution patterns that cut build times dramatically.

Module 2 taught you configuration reuse - parameters for abstraction, commands for step sequences, executors for environments. You can now write DRY configurations that scale.

This module completed the picture with orbs - consuming ecosystem solutions, securing your supply chain with version pinning, and building private orbs for your organization.

[NEXT STEPS]
Practice with the Globomantics repository. Clone it, experiment with different orbs, create your own private orb structure. The hands-on experience cements these concepts.

Check the CircleCI Orb Registry regularly. New certified orbs appear frequently, and understanding what's available saves you from reinventing solutions.

[OUTRO]
Thanks for joining me. I'm Tim Warner, and this has been CircleCI Advanced Configuration. Keep building, keep automating, and I'll see you in the next course.

<!-- Slide number: 3 -->
What Are Orbs?
Orbs are shareable, versioned packages of CircleCI configuration containing commands, jobs, and executors
Think of orbs like npm packages or Python libraries for your CI/CD config. Import battle-tested solutions.
An orb can contain:
Commands — Reusable step sequences
Jobs — Complete job definitions
Executors — Runtime environments

### Notes:
[FRAMER]
Orbs are the abstraction that sits on top of everything we've learned. If commands are functions and executors are environments, orbs are packages - complete solutions you can import and use immediately.

[SLIDE CONTENT]
What Are Orbs? - let's get the definition right first.

The definition at the top: Orbs are shareable, versioned packages of CircleCI configuration containing commands, jobs, and executors. Every word matters here. Shareable - others can use them. Versioned - you control which version you get. Packages - bundled functionality.

Look at that analogy: Think of orbs like npm packages or Python libraries for your CI/CD config. Import battle-tested solutions. This is exactly right. Just like you wouldn't write your own HTTP client from scratch, you shouldn't write Slack notification logic from scratch.

The bottom section shows An orb can contain three things. Commands are reusable step sequences - the same commands we learned in Module 2, but published for anyone to use. Jobs are complete job definitions with all their steps and configuration. Executors are runtime environments - Docker images, resource classes, environment variables bundled together.

Most orbs combine all three. The Slack orb gives you commands for sending messages, jobs for common notification workflows, and executors configured with the right dependencies.

[PRO TIP]
Before writing any CI/CD logic, search the Orb Registry. Someone has probably solved your problem already, and their solution has been tested by thousands of pipelines.

[TRANSITION]
Let me show you the dramatic difference orbs make with a before-and-after example...

<!-- Slide number: 4 -->
# Orbs: Before and After
config.yml
config.yml
# Before – Manual Slack
steps:
  - run:
      name: Send Slack
      command: |
        curl -X POST \
          -H "Content-type: application/json" \
          -H "Authorization: Bearer $SLACK_TOKEN" \
          --data '{
            "text": "Build finished",
            "channel": "#builds",
            "username": "circleci-bot"
          }' \
          https://slack.com/api/chat.postMessage

orbs:
  slack: circleci/slack@4.13.3

steps:
  - slack/notify:
      event: pass
      template: basic_success

### Notes:
[FRAMER]
This is the transformation that sells orbs to every DevOps team. Same functionality, fraction of the code, maintained by experts.

[SLIDE CONTENT]
Orbs: Before and After - two config.yml panels showing the contrast.

Look at the left side - Before - Manual Slack. Count those lines. We've got a run step with a name, then a multi-line curl command. The command includes the HTTP method, Content-type header, Authorization header with the SLACK_TOKEN, then a JSON payload with text, channel, and username fields, finally the Slack API URL.

That's 15+ lines of configuration you have to maintain. If Slack changes their API? You update it. If you need different message formatting? More complexity. If the token format changes? Debug time.

Now look at the right side - After with orbs. Three lines in the orbs section: slack: circleci/slack@4.13.3. Then in steps: slack/notify with event: pass and template: basic_success.

That's it. The orb handles authentication, API changes, message formatting, error handling, retry logic - everything. The circleci/slack orb is maintained by CircleCI's own team. When Slack updates their API, they update the orb. You just bump your version number.

The math is compelling: 15 lines becomes 5 lines. But the real value is maintenance burden - you're no longer responsible for that Slack integration code.

[TRANSITION]
But how do you know which orbs to trust? Let's look at the registry's trust levels...

<!-- Slide number: 5 -->
# The Orb Registry: Trust Levels
Browse orbs at circleci.com/developer/orbs — Three categories indicate trust:

![A screenshot of a computer error AI-generated content may be incorrect.](Picture11.jpg)

![A screenshot of a computer AI-generated content may be incorrect.](Picture13.jpg)

![A screenshot of a computer AI-generated content may be incorrect.](Picture15.jpg)
TO ENABLE: Organization Settings → Security → Allow Uncertified Orbs

### Notes:
[FRAMER]
Trust is everything in CI/CD. Orbs execute in your pipeline with access to your code and secrets. The registry's trust levels help you make informed decisions.

[SLIDE CONTENT]
The Orb Registry: Trust Levels - that URL at the top is important: Browse orbs at circleci.com/developer/orbs. Bookmark that.

The slide shows three categories. Let me walk through each one.

First screenshot shows Certified orbs - the blue checkmark. These are authored and maintained by CircleCI or CircleCI Technology Partners. They've been vetted, reviewed, and are actively maintained. Examples: circleci/node, circleci/docker, circleci/aws-cli. Use these with confidence.

Second screenshot shows Partner orbs - these come from technology partners who've integrated with CircleCI. Companies like HashiCorp, Datadog, Snyk. Still trustworthy, but maintained by external teams. Check their update frequency before depending on them.

Third screenshot shows Community orbs - these are from the open source community. Quality varies widely. Some are excellent, some are abandoned. Always review the source, check the last update date, look at the GitHub stars and issues.

That callout at the bottom is critical: TO ENABLE: Organization Settings → Security → Allow Uncertified Orbs. By default, CircleCI blocks uncertified orbs. This is a security feature. Only enable uncertified orbs when you've evaluated the source.

[PRO TIP]
Start with Certified orbs only. If you can't find a certified solution, check Partner orbs next. Only reach for Community orbs when you've evaluated their source code and maintenance status.

[TRANSITION]
Once you've chosen an orb, how you reference its version matters enormously for security...

<!-- Slide number: 6 -->
# Version Pinning: Protecting Your Pipelines
| Strategy | Example | Risk | Use case |
| --- | --- | --- | --- |
| Exact | @5.2.0 | Lowest | Production |

### Notes:
[FRAMER]
Version pinning is your supply chain security. This table builds progressively to show you the risk spectrum.

[SLIDE CONTENT]
Version Pinning: Protecting Your Pipelines - this table has four columns: Strategy, Example, Risk, and Use case.

Let's start with the first row. Strategy: Exact. Example: @5.2.0. Risk: Lowest. Use case: Production.

Exact pinning locks your pipeline to a specific release. Version 5.2.0 today is version 5.2.0 forever. No surprises, no unexpected changes, complete determinism. This is what you want for production pipelines.

When the orb maintainers release 5.2.1 with a bug fix, you don't get it automatically. That's intentional. You evaluate the changelog, test in development, then explicitly update your production config.

The tradeoff is maintenance - you need to actively track orb updates and apply them manually. But for production systems, that control is worth the effort.

[TRANSITION]
The next row introduces minor version flexibility...

<!-- Slide number: 7 -->
# Version Pinning: Protecting Your Pipelines
| Strategy | Example | Risk | Use case |
| --- | --- | --- | --- |
| Exact | @5.2.0 | Lowest | Production |
| Minor | @5.2 | Medium | Development |

### Notes:
[FRAMER]
Minor version pinning adds the second row to our table. This is where you accept patch updates automatically.

[SLIDE CONTENT]
Same table, new row. Strategy: Minor. Example: @5.2. Risk: Medium. Use case: Development.

Minor pinning - @5.2 without the patch number - locks to major 5, minor 2, but accepts any patch release. You'll get 5.2.1, 5.2.2, 5.2.3 automatically as they're released.

Semantic versioning says patch releases should be backward-compatible bug fixes. No new features, no breaking changes, just fixes. In theory, this is safe. In practice, not everyone follows semver perfectly.

For development environments, this is a reasonable tradeoff. You get bug fixes quickly without manual updates. If a bad patch breaks something, it's development - you catch it before production.

I use minor pinning in my dev and staging branches, exact pinning in production. That gives me the best of both worlds.

[TRANSITION]
Major version pinning increases the flexibility further...

<!-- Slide number: 8 -->
# Version Pinning: Protecting Your Pipelines
| Strategy | Example | Risk | Use case |
| --- | --- | --- | --- |
| Exact | @5.2.0 | Lowest | Production |
| Minor | @5.2 | Medium | Development |
| Major | @5 | Higher | Experimentation |

### Notes:
[FRAMER]
Major version pinning is the third row. Now we're accepting minor releases automatically - new features, not just fixes.

[SLIDE CONTENT]
Third row added. Strategy: Major. Example: @5. Risk: Higher. Use case: Experimentation.

Major pinning - just @5 - locks only the major version. You'll get 5.1, 5.2, 5.3, and all their patches automatically. New features arrive without any action from you.

Semantic versioning says minor releases add backward-compatible functionality. The orb should still work the same way, just with additional capabilities. But new features mean new code paths, new potential bugs, new behaviors to understand.

I only use major pinning in experimental branches where I'm actively exploring orb capabilities. It's great for learning - you always have the latest features. But it's not what you want when stability matters.

The risk isn't just bugs - it's unexpected behavior changes. A new feature might change default values or add required parameters. Your pipeline might start behaving differently without any change to your config.

[TRANSITION]
The final row is the danger zone...

<!-- Slide number: 9 -->
# Version Pinning: Protecting Your Pipelines
| Strategy | Example | Risk | Use case |
| --- | --- | --- | --- |
| Exact | @5.2.0 | Lowest | Production |
| Minor | @5.2 | Medium | Development |
| Major | @5 | Higher | Experimentation |
| Volatile | @volatile | Highest | NEVER prod |
SECURITY PRINCIPLE: Orbs are third-party code. Unpinned versions introduce supply chain risk.
PRO TIP: Enterprises can pin to SHA hash for maximum security.

### Notes:
[FRAMER]
Volatile - this is the row that should make your security team nervous. Let me explain why it exists and why you should almost never use it.

[SLIDE CONTENT]
Final row. Strategy: Volatile. Example: @volatile. Risk: Highest. Use case: NEVER prod.

The @volatile tag always pulls the absolute latest version - whatever was published most recently. No version locking at all. If someone publishes 6.0.0 with breaking changes, your pipeline gets it immediately.

This exists for orb development and testing only. When you're building an orb and want to test the latest dev release, volatile makes sense. For any actual workload, it's dangerous.

Look at that callout: SECURITY PRINCIPLE: Orbs are third-party code. Unpinned versions introduce supply chain risk.

This is real. If an orb maintainer's account is compromised, an attacker could publish a malicious version. With volatile pinning, your pipeline runs that malicious code automatically. With exact pinning, you're protected until you explicitly upgrade.

The PRO TIP at the bottom: Enterprises can pin to SHA hash for maximum security. CircleCI supports pinning to the exact commit hash of an orb version. This protects even against tag manipulation attacks.

[TRANSITION]
Before we go deeper into orbs, let's compare them to the other major ecosystem - GitHub Actions...

<!-- Slide number: 10 -->
# Orbs vs. GitHub Actions

Orbs
GitHub Actions
Pure YAML configuration packages — no executable code
Compiled into your config at pipeline start — becomes native CircleCI config
Declarative reuse — config templating with parameters
Runs in your executor — no separate runtime

Executable code — Docker containers or JavaScript
Downloaded and executed at runtime — separate process
Code-based reuse — programmatic extensibility
Separate container/runtime — more isolation, more attack surface

Orbs = config templating   Actions = code execution

### Notes:

<!-- Slide number: 11 -->
jobs:
  deploy-to-azure:
    executor: azure-cli/azure-docker
    steps:
      - checkout
      - azure-cli/login-with-oidc:
          azure-app-id: $AZURE_APP_ID
          azure-tenant-id: $AZURE_TENANT_ID
          azure-sub-id: $AZURE_SUB_ID
      - run: az webapp deploy --src-path dist/

workflows:
  deploy:
    jobs:
      - deploy-to-azure
# Azure CLI Orb: OIDC Authentication
The security upgrade: Move from static credentials to OpenID Connect. No secrets to rotate or leak.

### Notes:

<!-- Slide number: 12 -->
# Extraction Decision Tree
Repeated in one config? → Use commands
Analyze configs for repetitive patterns that signal extraction opportunities.
Repeated across repos? → Private orb
Common vendor task? → Check Registry
Org-specific logic? → Private orb essential

### Notes:

<!-- Slide number: 13 -->
# Private Orb Structure

orb-directory.txt
commands/deploy.yml
description: Deploy to Azure Web App

parameters:
  app-name:
    type: string
  environment:
    type: enum
    enum: [dev, staging, prod]

steps:
  - run:
      name: Deploy << parameters.app-name >>
      command: |
        az webapp deploy \
          --name "<< parameters.app-name >>" \
          --resource-group "rg-<< parameters.env >>” \          --src-path dist/
globomantics-deploy/
├── @orb.yml             # root orb metadata
├── commands/
│   └── deploy.yml       # reusable deploy command
├── jobs/
│   └── deploy-app.yml   # job using the command
├── executors/
│   └── node.yml         # runtime environment
└── src/                 # optional helper scripts

### Notes:

<!-- Slide number: 14 -->
Important Note:
# Private orbs require a CircleCI paid plan.

### Notes:

<!-- Slide number: 15 -->
# Orb Development Workflow

![A diagram of a software development process AI-generated content may be incorrect.](Picture7.jpg)

![A white background with black and white clouds AI-generated content may be incorrect.](Picture9.jpg)

![A white background with black and white clouds AI-generated content may be incorrect.](Picture10.jpg)

![A white background with black and white clouds AI-generated content may be incorrect.](Picture11.jpg)

![A white background with black and white clouds AI-generated content may be incorrect.](Picture12.jpg)

### Notes:
