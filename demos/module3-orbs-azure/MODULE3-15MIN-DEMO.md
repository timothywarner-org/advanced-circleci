# 15-Minute Demo: Orbs + Azure Integration (Module 3)

> **Breadcrumb:** Edge (CircleCI dashboard + Azure Portal tabs) | VS Code (config + `demos/module3-orbs-azure/scripts` open) | Terminal (git + az CLI available via orb)

## Learning Outcomes Covered

- Install and pin certified orbs from the CircleCI Registry.
- Use `circleci/node` and `circleci/slack` orbs for common pipeline tasks with minimal YAML.
- Deploy to Azure with the `circleci/azure-cli` orb following CAF/WAF guardrails and CircleCI best practices.

## 90-Second Prep

1. In Edge, open CircleCI Orb Registry pages for `circleci/node`, `circleci/slack`, and `circleci/azure-cli` for quick links.
2. In Azure Portal, keep the target resource group visible and note the managed identity/OIDC configuration to align with Azure CAF.
3. Terminal: ensure `circleci config validate` passes; have a context ready with Azure credentials or OIDC settings (no secrets on screen).

## Demo Flow (15 Minutes)

### Timing Breakdown

| Segment | Duration | Wall Clock | Key Actions |
|---------|----------|------------|-------------|
| Curiosity Hook | 1:00 | 0:00-1:00 | Show verbose manual config |
| Node Orb Quick Win | 4:00 | 1:00-5:00 | Add orb, replace npm/cache steps, run pipeline |
| Slack Orb Signal | 3:00 | 5:00-8:00 | Add notifications, show Slack message |
| Azure Orb + OIDC | 5:00 | 8:00-13:00 | OIDC login, deploy to Container Apps |
| Wrap and Capstone | 2:00 | 13:00-15:00 | Recap, point to capstone |

**Buffer:** Docker build ~60-90s (use DLC), Azure deploy ~30s

### 1) Curiosity Hook (1 min)

- Show a verbose handwritten job that installs Node, posts Slack, and runs Azure CLI manually. Ask: "What if we could import this expertise instead of retyping it every sprint?"

### 2) Node Orb Quick Win (4 min)

- Use `scripts/DEMO-01-node-orb.md` to add `orbs: { node: circleci/node@5 }` with semantic pinning (patch-float).
- Replace manual `npm ci` + cache steps with `node/install-packages` and `node/test`. Validate config and point out built-in caching as a CircleCI best practice.
- Run pipeline; in UI, highlight fewer lines and automatic cache restoration.

### 3) Slack Orb Signal (3 min)

- Follow `scripts/DEMO-02-slack-orb.md` to add `slack/notify` on success/failure; keep webhook in a CircleCI context for least-privilege hygiene.
- Trigger a fast build; show Slack message (or mock). Connect to industry practice: consistent incident communication.

### 4) Azure Orb with CAF/WAF Alignment (5 min)

- From `scripts/DEMO-03-azure-orb.md`, add `azure-cli` orb pinned (e.g., `circleci/azure-cli@2`). Configure OIDC login using Azure AD workload identity (CAF recommendation) instead of storing client secrets.
- Deploy to Azure App Service using orb command (e.g., `azure-cli/run` with `az webapp up`). Mention WAF by validating the endpoint through the existing front door/app gateway; show the orb keeps deploy commands idempotent.
- Highlight safety: use `requires` to gate deploy after tests and add branch filters to protect production.

### 5) Wrap and Capstone Pointer (2 min)

- Recap: Registry → pin → minimal YAML → secure contexts/OIDC → observable notifications.
- Point to `scripts/DEMO-04-capstone.md` for the end-to-end pipeline combining node + slack + azure; invite viewers to swap Azure command for their service with the same orb skeleton.

## Notes for You

- Keep the Azure tab open to show the resource change; narrate "inputs → effect" for Feynman clarity.
- Call out credit savings when reusing orb caching and avoiding reruns with branch filters.
- Remind that orbs are versioned products—pin majors, float patches; aligns with both CircleCI guidance and general DevOps hygiene.
