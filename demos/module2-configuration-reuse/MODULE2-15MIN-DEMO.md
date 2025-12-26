# 15-Minute Demo: Configuration Reuse with Parameters (Module 2)

> **Breadcrumb:** Edge (CircleCI Pipelines + API tokens page) | VS Code (config + `demos/module2-configuration-reuse/scripts` side-by-side) | Terminal (git + curl)

## Learning Outcomes Covered

- Use pipeline parameters to steer workflows from the UI/API.
- Refactor deploy logic into parameterized jobs to eliminate YAML duplication.
- Explain when parameters beat environment variables for config-time decisions.

## 90-Second Prep

1. In VS Code, pin `.circleci/config.yml` and open `scripts/DEMO-01-pipeline-parameters.md` and `DEMO-02-job-parameters.md` for copy-ready snippets.
2. In Edge, open the CircleCI project **Trigger Pipeline** modal and the API docs page for triggering with parameters.
3. Terminal check: `circleci config validate` and export a short-lived API token for the demo (`export CCI_TOKEN=...`).

## Demo Flow (15 Minutes)

### Timing Breakdown

| Segment | Duration | Wall Clock | Key Actions |
|---------|----------|------------|-------------|
| Curiosity Hook | 1:00 | 0:00-1:00 | Show duplicate jobs, identify opportunity |
| Pipeline Parameters | 4:00 | 1:00-5:00 | Add params, trigger via UI, show skip_tests |
| Job Parameters | 6:00 | 5:00-11:00 | Refactor 5 jobs → 1, compare line counts |
| Params vs Env Vars | 3:00 | 11:00-14:00 | Demo `when` clause difference |
| Wrap and Challenge | 1:00 | 14:00-15:00 | Recap, assign challenge |

**Buffer:** API trigger ~5s, config validation ~2s

### 1) Curiosity Hook (1 min)

- Show two similar deploy jobs in the existing config. Ask: "Why are we copying YAML instead of teaching CircleCI to accept inputs?"

### 2) Pipeline Parameters in Action (4 min)

- Follow `DEMO-01-pipeline-parameters.md` to add `deploy_environment` (enum) and `skip_tests` (boolean) pipeline parameters.
- Validate and trigger via UI selecting `skip_tests: true`; show the workflow pruning with a `when` clause. CircleCI best practice: prefer parameters for config-time branching.
- Trigger again via API: `curl -X POST -u "$CCI_TOKEN:" -d '{"parameters":{"deploy_environment":"staging"}}' https://circleci.com/api/v2/project/.../pipeline`.

### 3) Parameterized Deploy Job (6 min)

- Use `DEMO-02-job-parameters.md` to collapse multiple deploy jobs into one `deploy` job with `environment`, `replicas`, and `notify_slack` parameters.
- Highlight fewer lines + clearer intent; run `circleci config pack` if needed to show modularity.
- Kick off a pipeline with `environment: prod` and `notify_slack: true`; point at the orb-style thinking: "we're defining inputs the way an orb would." Use VS Code problems pane to show YAML anchor warnings disappear.

### 4) Parameters vs. Env Vars (3 min)

- Short walkthrough of `DEMO-04-parameters-vs-env-vars.md`. Demonstrate a `when` condition that fails with env vars but works with parameters; remind that env vars resolve at runtime, so config parsing can't branch on them.
- CircleCI best practice: Config-time decisions use parameters; runtime secrets stay in contexts as env vars.

### 5) Wrap and Challenge (1 min)

- Recap: pipeline parameters = knobs, job parameters = reusable functions, env vars = runtime secrets.
- Challenge: extract repeated steps into a command (`setup-node`) and compare line counts before/after; tease Module 3 orb mindset.

## Notes for You

- Keep instructions in "You do / CircleCI does" pairs to support focus.
- narrate small wins: "Because we parameterized, we removed 30 lines of duplication." Reinforces Feynman clarity through contrast.
