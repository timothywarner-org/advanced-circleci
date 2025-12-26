# 15-Minute Demo: Workflow Orchestration Mastery (Module 1)

> **Breadcrumb:** Edge on Win11 (CircleCI dashboard tab) | VS Code (repo open, `.circleci/config.yml` pinned) | Terminal (Git + CircleCI CLI)

## Learning Outcomes Covered

- Design multi-stage workflows with explicit `requires` dependencies.
- Run safe fan-out/fan-in parallelism to shorten cycle time without skipping quality gates.
- Apply branch and tag filters to keep deployments intentional.

## 90-Second Prep

1. Open `.circleci/config.yml` in VS Code and split view with `demos/module1-workflow-orchestration/scripts` for copy/paste snippets.
2. In Edge, open the CircleCI project dashboard and the **Pipelines** page in separate tabs for quick toggling.
3. Start a terminal in the repo root: `git status` (clean) and `circleci config validate` to show linting discipline.

## Demo Flow (15 Minutes)

### 1) Curiosity Hook (1 min)

- Show a failing pipeline graph where deploy ran before tests. Ask: "What single keyword lets us teach CircleCI the order we expect?"
- Highlight absence of `requires` in the old config.

### 2) Sequential Backbone (4 min)

- Create `.circleci/configs/01-sequential-baseline.yml` from `scripts/DEMO-01-sequential-baseline.md`.
- Narrate Feynman-style: "If build is the prerequisite fact, test is the consequence." Add `requires` for `test` → `build`, `deploy` → `test`.
- Validate with `circleci config validate .circleci/configs/01-sequential-baseline.yml`.
- Push branch, watch CircleCI show "Not Run" on blocked jobs when you intentionally fail the build once (skip rerun to save credits).

### 3) Fan-Out / Fan-In (5 min)

- Open `scripts/DEMO-02-parallel-fanout.md`. Paste the three parallel jobs: `unit-tests`, `integration-tests`, `security-scan` requiring `build`.
- Add a `deploy` job that requires all three. Call out CircleCI best practice: parallelize read-only work first to maximize cache hits.
- Trigger a pipeline; in the UI, trace the DAG arrows to show concurrency. Ask viewers to predict which job finishes first and why (image size, cache).

### 4) Intentional Filters (3 min)

- From `scripts/DEMO-03-branch-tag-filters.md`, apply filters so deploy runs only on `main` and release packaging only on tags `v*`.
- In Edge, show one run on a feature branch where deploy is **Skipped**—explain this is safety via configuration, not tribal memory.
- Emphasize devops practice: production gates should be config-driven and observable.

### 5) Wrap and Challenge (2 min)

- Summarize key moves: `requires` for truth order, fan-out for speed, filters for intent.
- Offer 60-second challenge: add an approval job before deploy and schedule a nightly security-scan; hint at `scripts/DEMO-04-approval-scheduled.md`.

## Notes for You

- Keep the CircleCI UI zoomed to 110% for clarity in screencast.
- Narrate cause/effect: "Because we declared X, CircleCI shows Y." This keeps the Feynman curiosity loop active.
- Mention credit efficiency when highlighting parallelism.
