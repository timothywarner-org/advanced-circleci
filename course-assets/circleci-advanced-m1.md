<!-- Slide number: 1 -->
CircleCI Advanced Configuration
Workflow Orchestration Mastery

![A person wearing glasses and a black jacket AI-generated content may be incorrect.](PicturePlaceholder10.jpg)
Tim Warner

![A blue and white circle with text and a black background Description automatically generated](Picture29.jpg)

![A blue and white rectangular sign with white text Description automatically generated](Picture30.jpg)

![A blue and white circle with text Description automatically generated](Picture28.jpg)
Principal Author  |  IT Ops  |  Pluralsight
TechTrainerTim.com

### Notes:
[FRAMER]
Welcome to Workflow Orchestration Mastery. I'm Tim Warner, Principal Author in the IT Ops domain here at Pluralsight. This module is where we transform you from someone who can run a basic CircleCI pipeline into someone who can architect sophisticated, parallel execution workflows that slash your build times.

[SLIDE CONTENT]
This is the second course in our CircleCI skill path, building directly on the foundation we laid in Getting Started with CircleCI.

Here's the thing about workflow orchestration: it's the difference between waiting 15 minutes for independent jobs to run sequentially, and watching them all complete in 4 minutes running in parallel. Same jobs, same tests, same deployment - just smarter execution.

By the end of this module, you'll know how to use the requires keyword to define job dependencies, implement fan-out and fan-in patterns for parallel execution, and apply branch and tag filters for conditional deployment control.

We'll be using our Globomantics Robotics Company scenario throughout - specifically their Schematica MCP Server project. Real code, real pipelines, real problems to solve.

[TRANSITION]
Let's dive into what's broken with Schematica's current pipeline...

<!-- Slide number: 2 -->

![](Graphic6.jpg)
Globomantics Scenario
# Our Schematica MCP Server pipeline runs every job one after another...even when jobs have no dependencies on each other.

### Notes:
[FRAMER]
We have an issue at Globomantics. Maya Chen, our DevOps lead, brought me this pipeline and said "Tim, every feature push takes forever to validate." She's right - let me show you why.

[SLIDE CONTENT]
Look at this Globomantics scenario. The Schematica MCP Server pipeline runs every job one after another, even when jobs have no dependencies on each other.

Think about that for a second. Unit tests waiting for the build to finish. Integration tests waiting for unit tests. Security scans waiting for everything else. And these jobs? They don't actually need each other's outputs.

This is what I call the "assembly line fallacy" - treating CI/CD like a car factory where each step MUST follow the previous one. But code validation isn't manufacturing. Your unit tests don't need your integration tests to finish first.

[TRANSITION]
Let me quantify exactly how much time and money this sequential approach is wasting...

<!-- Slide number: 3 -->
# The Pain Points
Unit tests wait for the build to finish
Integration tests wait for unit tests
Security scans wait for everything
Total time: 15+ minutes for independent jobs
Result: Wasted build credits and slow feedback loops

### Notes:
[FRAMER]
Real talk - these aren't theoretical problems. Maya's team is living this pain every single day. Let me walk you through each of these bullet points because they represent real debugging time, real frustration, and real money going down the drain.

[SLIDE CONTENT]
Unit tests wait for the build to finish. That's your first bottleneck. Even though your test suite is completely independent of the build artifacts - it just needs the source code - it sits there idle.

Integration tests wait for unit tests. Why? No technical reason. Just sequential thinking baked into the config.

Security scans wait for everything. SAST analysis, dependency vulnerability checks, secret detection - none of these require your tests to pass first. They're analyzing source code, not runtime behavior.

Total time: 15+ minutes for independent jobs. And here's the kicker - if you're running multiple feature branches, that's 15 minutes per push, per developer, per day.

Result: Wasted build credits and slow feedback loops. Your developers context-switch to other tasks while waiting. Then the build fails, and they have to reload all that context. Expensive in every dimension.

[TRANSITION]
Let me show you what this looks like visually - the sequential execution pattern we need to break...

<!-- Slide number: 4 -->

![A screenshot of a phone AI-generated content may be incorrect.](Picture9.jpg)

Sequential Build Pipeline

![pipeline](Picture2.jpg)

### Notes:
[FRAMER]
Here's the visual representation of Maya's pain. This is an actual pipeline execution graph adapted from CircleCI's UI, and I want you to see how each job waits unnecessarily for the previous one.

[SLIDE CONTENT]
Look at this sequential build pipeline diagram. Each box represents a job. Each arrow shows a dependency. And notice how it's a straight line from start to finish.

Build completes, then testsstart. Unit and integration tests complete, then security scan starts. Security scan completes, then deploy starts. Every single job is blocked on the previous job's completion.

Now, here's what I want you to notice in the CircleCI UI screenshot. See those timestamps? See that total duration? That's wall-clock time your developers are waiting. That's context-switching time. That's CI credits burned on idle compute.

The pipeline visualizer in CircleCI is incredibly useful for diagnosing these bottlenecks. If your graph looks like a straight line when it should look like a diamond or a tree, you've got optimization opportunities.

[TRANSITION]
Now let's look at the three core workflow patterns that will transform this sequential disaster into a parallel execution masterpiece...

<!-- Slide number: 5 -->

![](Graphic8.jpg)
# Three Core Workflow Patterns

![A screenshot of a computer AI-generated content may be incorrect.](Picture2.jpg)

![A screenshot of a computer AI-generated content may be incorrect.](Picture4.jpg)

![A screenshot of a computer AI-generated content may be incorrect.](Picture6.jpg)

### Notes:
[FRAMER]
These three patterns are your workflow orchestration toolkit. Master these, and you can design any CI/CD workflow imaginable. They're like the three primary colors of pipeline architecture - everything else is just combinations.

[SLIDE CONTENT]
We've got three core workflow patterns here, each shown with its visual representation.

First: Sequential with Dependencies. Jobs that genuinely DO depend on each other. Your deploy job needs test to pass. Your test job needs build artifacts. This is the requires keyword at work.

Second: Fan-Out Parallelism. One job completes, multiple jobs start simultaneously. Your build finishes, and boom - unit tests, integration tests, and security scans all fire at once. No waiting.

Third: Fan-In Convergence. Multiple parallel jobs complete, and then ONE job runs. All your tests pass, all your scans complete, and only then does deploy execute. This is how you gate deployments on multiple quality checks.

Real pipelines use all three patterns together. You might fan-out after build, run parallel validation, fan-in to a staging deploy, then fan-out again for smoke tests, then fan-in to production.

[PRO TIP]
When designing workflows, sketch them on paper first. Draw the dependency graph before you write the YAML. It's much easier to visualize parallelization opportunities on a whiteboard than in a config file.

[TRANSITION]
Let's look at the syntax that makes all this possible - the requires keyword...

<!-- Slide number: 6 -->
config.yml
workflows:
  build-test-deploy:
    jobs:
      - build
      - test:
          requires: [build]
      - deploy:
          requires: [test]

# If a required job fails in a sequential pipeline, downstream jobs are automatically skipped. No wasted credits on doomed deployments.

# CircleCI uses requires at workflow level. GitHub Actions uses needs at job level. Same concept, different syntax.

# The requires Keyword

![inclusion-2](Picture2.jpg)

### Notes:
[FRAMER]
The requires keyword is your foundation. Every workflow pattern we just discussed - sequential, fan-out, fan-in - they all use requires. Once you understand this syntax, the rest is just creative application.

[SLIDE CONTENT]
Look at this config.yml. We've got a workflows section with a workflow named build-test-deploy containing three jobs: build, test, and deploy.

Here's the critical syntax. Test has requires: [build]. Deploy has requires: [test]. This creates a sequential chain. Build runs first, test waits for build, deploy waits for test.

Notice the square brackets in requires: [build]. That's YAML list syntax. You can have multiple requirements - and that's how you'll implement fan-in patterns later.

Now check out this callout: If a required job fails in a sequential pipeline, downstream jobs are automatically skipped. No wasted credits on doomed deployments. CircleCI is smart enough to know that if test fails, there's no point running deploy.

And for those of you coming from GitHub Actions: CircleCI uses requires at workflow level. GitHub Actions uses needs at job level. Same concept, different syntax. If you're migrating pipelines, this is the translation you need.

[TRANSITION]
Now let's see how we transform this sequential approach into fan-out parallelism...

<!-- Slide number: 7 -->
config.yml
workflows:
  schematica-pipeline:
    jobs:
      - build
      # These three run in parallel!
      - unit-tests:
          requires: [build]
      - integration-tests:
          requires: [build]
      - security-scan:
          requires: [build]
# Fan-out Parallelism for Maximum Speed

### Notes:
[FRAMER]
Here's where the magic happens. Same jobs, same validation, but watch what happens when we restructure the dependencies. This single change - giving three jobs the same requirement - slashes Maya's build time from 15 minutes to under 5.

[SLIDE CONTENT]
Look at this config.yml for the schematica-pipeline workflow. Build runs first - that hasn't changed. But now look at what requires [build].

Unit-tests requires build. Integration-tests requires build. Security-scan requires build. All three point to the same parent job.

See that comment? "These three run in parallel!" That's the entire secret. When multiple jobs share the same requirement, CircleCI executes them simultaneously. They all start the moment build completes.

Think about what this means mathematically. If each of those three jobs takes 3 minutes, and they run sequentially, that's 9 minutes. Run them in parallel? 3 minutes total. You just saved 6 minutes on every single pipeline run.

Multiply that by the number of pushes your team makes per day. Multiply by days per sprint. That's hours of developer time recovered. That's hundreds of dollars in CI credits saved.

[TRANSITION]
Now, I know what you're thinking - parallel execution must cost more credits, right? Let me address that directly...

<!-- Slide number: 8 -->
Pro Tip
# Credit consumption stays the same: you pay for compute time, not wall time. Parallel execution costs the same but delivers faster feedback.

### Notes:
[FRAMER]
This is the question I get in literally every CircleCI workshop I teach. "Tim, if I run more jobs at once, won't that burn through my credits faster?" Let me set the record straight.

[SLIDE CONTENT]
Pro Tip: Credit consumption stays the same. You pay for compute time, not wall time. Parallel execution costs the same but delivers faster feedback.

Here's the thing about CircleCI's billing model. Credits are based on how long your jobs actually run on compute. Three parallel jobs running for 3 minutes each consume the same credits as three sequential jobs running for 3 minutes each. Nine compute-minutes either way.

What changes is YOUR waiting time. Your developers get feedback in 3 minutes instead of 9. The CI bill? Identical.

In fact, parallel execution often REDUCES costs. Why? Because you're using smaller executor instances for shorter periods. And because faster feedback means failed builds get caught sooner, before more pipeline stages run.

The only scenario where parallelism costs more is if you're on a concurrent job limit and parallel execution pushes work into a queue. But for most teams, the speed benefit far outweighs any edge cases.

[TRANSITION]
Alright, we've fanned out. Now we need to converge everything back together for deployment...

<!-- Slide number: 9 -->
# Fan-in: Converging to Deployment
config.yml

deploy:
  requires:
    - unit-tests
    - integration-tests
    - security-scan

![A screenshot of a computer program AI-generated content may be incorrect.](Picture10.jpg)

### Notes:
[FRAMER]
Fan-in is the complement to fan-out. We split work across parallel jobs - now we need to join them back together before proceeding. This is how you gate deployments on multiple quality signals.

[SLIDE CONTENT]
Look at this deploy job configuration. The requires section now has THREE entries: unit-tests, integration-tests, and security-scan.

This is fan-in. Deploy will not start until ALL THREE of those jobs complete successfully. Not one. Not two. All three.

Check out the pipeline visualization beside the code. See how the three parallel jobs - those branches in the diagram - all converge on that single deploy node? That's your fan-in visually represented.

Here's why this matters for Globomantics. Maya doesn't want to deploy code that passes unit tests but fails the security scan. She doesn't want code that's secure but has integration failures. Deploy only runs when every quality gate passes.

The combination of fan-out and fan-in is your standard CI/CD diamond pattern. Build fans out to parallel validation. Validation fans in to deploy. Fast execution with comprehensive quality checks.

[TRANSITION]
Now let's add conditional logic - because not every job should run on every branch...

<!-- Slide number: 10 -->
# Conditional Execution: Branch Filters
config.yml
branch_filter_patterns.md
# Deploy only to main branch

deploy-production:
  requires:
    - test
  filters:
    branches:
      only: main
only:main (production deploys)
only: [main, dev] (mult branches)
only: /feature/.*/ (regex match)
ignore: main (run all except main)

### Notes:
[FRAMER]
Branch filters are how you say "this job only runs when certain conditions are met." Deploy to production on main branch only. Run expensive integration tests only on develop. Skip certain jobs entirely for feature branches.

[SLIDE CONTENT]
Look at this config.yml. We've got a deploy-production job that requires test - nothing new there. But now we have a filters section with branches and only: main.

This means deploy-production ONLY executes when the pipeline is triggered by a push to the main branch. Push to a feature branch? Test runs, but deploy-production is skipped entirely.

Check out the branch_filter_patterns reference. These are your pattern options:

only: main - single branch, production deploys
only: [main, dev] - multiple specific branches
only: /feature/.*/ - regex pattern matching, any branch starting with feature/
ignore: main - inverted logic, run on everything EXCEPT main

That regex syntax is powerful. You can match feature branches, release branches, hotfix branches - any naming convention your team uses.

[PRO TIP]
Start with only patterns rather than ignore. It's safer to explicitly whitelist deployment targets than to blacklist everything else. New branch created with an unexpected name? With ignore, it might accidentally deploy. With only, it definitely won't.

[TRANSITION]
Branches are commit-triggered. But what about release workflows based on Git tags?

<!-- Slide number: 11 -->
# Conditional Execution: Tag Filters
config.yml
schematica_release_flow.md
# Release build on semantic version tags

release-build:
  filters:
    tags:
      only: /^v[0-9]+\.[0-9]+\.[0-9]+$/
    branches:
      ignore:/.*/
Push v1.2.0 tag
Triggers release-build
Publishes to GHCR
Deploys to Azure Container Apps

### Notes:
[FRAMER]
Tag filters are how you implement release automation. Push a semantic version tag, trigger a release build. This is GitOps at its finest - your Git tags become your deployment manifest.

[SLIDE CONTENT]
Look at this config.yml for release-build. See that filters section? We've got tags with only: /^v[0-9]+\.[0-9]+\.[0-9]+$/ and branches with ignore: /.*/.

Let me decode that regex. The caret means "starts with". Then v followed by one or more digits, a literal dot, more digits, another dot, more digits, and the dollar sign meaning "ends with". That's semantic versioning: v1.2.0, v2.0.0, v0.1.0 - all match.

The branches ignore: /.*/ is critical. Without it, this job would also run on branch pushes. The combination means ONLY tag pushes matching the semver pattern trigger this job.

Look at the Schematica release flow beside the code. Push v1.2.0 tag, triggers release-build, publishes to GitHub Container Registry, deploys to Azure Container Apps. That's the entire release pipeline activated by a single Git tag.

[PRO TIP]
Always test your tag filter regex before relying on it for production releases. Push a test tag like v0.0.0-test and verify the workflow triggers. Then delete the tag. Better to catch regex mistakes in testing than on release day.

[TRANSITION]
We've covered on-demand triggers. Now let's add scheduled automation and human approval gates...

<!-- Slide number: 12 -->
# Advanced Patterns: Schedules and Approvals
config.yml
config.yml
workflows:
  nightly-security:
    triggers:
      schedule:
        - cron "0 2 * * *“
    jobs:
      - your-security-job

# Nightly security scans
# Weekly dependency updates
# Scheduled performance tests
jobs:
  deploy-staging:
    requires: [test]

  hold-for-approval:
    type: approval
    requires:
      - deploy-staging

  deploy-production:
    requires:
      - hold-for-approval

### Notes:
[FRAMER]
These are your advanced patterns - scheduled workflows for recurring automation, and approval gates for human-in-the-loop deployments. Every mature CI/CD implementation uses both.

[SLIDE CONTENT]
Look at the left side first. We've got a workflows section with triggers containing a schedule block. That cron expression - "0 2 * * *" - means 2 AM daily. Every night at 2 AM, this workflow fires automatically.

Use cases: Nightly security scans that take too long for regular CI. Weekly dependency update checks. Scheduled performance tests against staging. Any automation that should run on a calendar rather than on push.

Now look at the right side. We've got three jobs in sequence: deploy-staging requires test, hold-for-approval is type: approval requiring deploy-staging, and deploy-production requires hold-for-approval.

That type: approval is the key. When the pipeline reaches hold-for-approval, it STOPS. A human must go into the CircleCI UI and click Approve. Only then does deploy-production proceed.

This is your compliance pattern. SOC 2 auditors love this. Segregation of duties, documented approvals, complete audit trail. The approval is logged with timestamp and approver identity.

[PRO TIP]
Set up Slack or Teams notifications on approval holds. Otherwise, your pipeline sits waiting while the approver has no idea they're blocking a deployment. CircleCI's Slack orb makes this trivial.

[TRANSITION]
Let's see all these patterns working together in Schematica's complete pipeline...

<!-- Slide number: 13 -->
# Complete Schematica Pipeline

![A screenshot of a computer AI-generated content may be incorrect.](Picture9.jpg)

d

### Notes:
[FRAMER]
This is the payoff slide. Everything we've covered - requires, fan-out, fan-in, branch filters, tag filters, approvals - all combined into a production-grade pipeline. This is what Maya's refactored workflow looks like.

[SLIDE CONTENT]
Study this complete Schematica pipeline diagram. Follow the execution flow from left to right.

Build runs first. Then it fans out to three parallel validation jobs - see those three branches? Unit tests, integration tests, and security scan all execute simultaneously.

Then fan-in. All three validation jobs must complete before deploy-staging triggers. That's your quality gate.

After staging, we hit the approval gate. Pipeline pauses, human reviews, clicks approve.

Then deploy-production. But notice - this only happens on the main branch, enforced by branch filters we configured earlier.

The numbers tell the story. Maya's original sequential pipeline: 15+ minutes. This parallelized version: under 5 minutes for the validation phase. Same tests, same coverage, same security analysis. Just smarter orchestration.

This is what workflow mastery looks like in practice. You understand every node in this diagram because you understand the patterns that compose it.

[TRANSITION]
Let's lock in the key concepts before we wrap up...

<!-- Slide number: 14 -->
# Key Takeaways
Requires is the foundation: Every workflow pattern builds on job dependencies

![key-ownership](Picture2.jpg)
Parallel execution saves time, not credits: Fan-out reduces wall-clock time dramatically

![key-ownership](Picture4.jpg)
Filters control execution context: Branch and tag filters prevent unwanted deployments

![key-ownership](Picture6.jpg)

### Notes:
[FRAMER]
Three takeaways. If you remember nothing else from this module, remember these. They're the foundation for everything you'll build in CircleCI going forward.

[SLIDE CONTENT]
First: requires is the foundation. Every workflow pattern we covered builds on job dependencies. Sequential chains, fan-out parallelism, fan-in convergence - all requires keyword syntax. Master this, master everything else.

Second: Parallel execution saves time, not credits. Fan-out patterns reduce wall-clock time dramatically without increasing CI costs. Your developers get faster feedback. Your bills stay the same. Pure win.

Third: Filters control execution context. Branch and tag filters prevent unwanted deployments. Main branch deploys to production. Feature branches run tests only. Semantic version tags trigger releases. Conditional logic keeps your pipelines safe and predictable.

[NEXT STEPS]
Practice with the Schematica repository. Clone it, modify the workflow, push changes, watch the pipeline execute. There's no substitute for hands-on experience.

In Module 2, we'll take this further with configuration reuse. You'll learn parameters, contexts, and pipeline values - the tools that let you template these patterns for reuse across projects.

[OUTRO]
Thanks for joining me. I'm Tim Warner, and this has been Workflow Orchestration Mastery. See you in the next module.
