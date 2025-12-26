# Demo 4: Approval Gates and Scheduled Workflows
## Module 1, Clip 5 (5 minutes)

### Overview
Implement manual approval gates for production deployments and scheduled workflows for nightly builds and dependency checks.

---

## Pre-Demo Setup
1. Have deploy-staging job configured
2. CircleCI dashboard open
3. Be prepared to click "Approve" in UI

---

## Demo Script

### 1. Explain Approval Gates (30 seconds)

**TALKING POINT:** "Globomantics requires manager sign-off before production deployments. CircleCI's approval jobs pause the workflow until someone manually approves."

### 2. Add Approval Job (1.5 minutes)

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build
      - test:
          requires:
            - build
      - deploy-staging:
          requires:
            - test
          filters:
            branches:
              only: main

      # APPROVAL JOB - Pauses workflow
      - hold-for-approval:
          type: approval
          requires:
            - deploy-staging
          filters:
            branches:
              only: main

      # Only runs AFTER manual approval
      - deploy-production:
          requires:
            - hold-for-approval
          filters:
            branches:
              only: main
```

**TALKING POINT:** "The `type: approval` is special—it creates a hold step that requires human intervention. No code runs; it just waits."

### 3. Show Approval in Dashboard (1 minute)

**ACTION:** Push code and show dashboard

**SHOW:**
- Workflow pauses at "hold-for-approval"
- Button appears: "Approve"
- Click approve → deploy-production starts
- Optional: Show "On Hold" email notification

**TALKING POINT:** "Team leads can approve from the dashboard, mobile app, or even via API for integration with ticketing systems."

### 4. Add Scheduled Workflows (1.5 minutes)

```yaml
  # Nightly security scan
  nightly-security-scan:
    triggers:
      - schedule:
          cron: "0 2 * * *"  # 2:00 AM UTC daily
          filters:
            branches:
              only: main
    jobs:
      - build
      - security-scan:
          requires:
            - build

  # Weekly dependency check
  weekly-dependency-check:
    triggers:
      - schedule:
          cron: "0 9 * * 1"  # 9:00 AM UTC on Mondays
          filters:
            branches:
              only: main
    jobs:
      - dependency-update-check
```

**TALKING POINT:** "Scheduled workflows use cron syntax. These run automatically—no commits needed. Great for security scans, dependency updates, and performance benchmarks."

### 5. Quick Cron Syntax Review (30 seconds)

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6, Sun = 0)
│ │ │ │ │
* * * * *

Examples:
"0 2 * * *"     = 2:00 AM every day
"0 9 * * 1"     = 9:00 AM every Monday
"0 0 1 * *"     = Midnight on the 1st of each month
"0 */6 * * *"   = Every 6 hours
```

---

## CircleCI UI: Scheduled Triggers

**SHOW:** Project Settings → Triggers → Add Scheduled Trigger

- Easier than writing cron syntax
- Visual time picker
- Timezone selection
- Can be managed without code changes

---

## Key Takeaways
- `type: approval` creates manual gates in workflows
- Great for production releases requiring sign-off
- Scheduled triggers use cron syntax
- Schedule config in YAML or via UI
- Nightly/weekly jobs save CI credits vs. running on every commit

---

## Module 1 Summary Transition
"We've covered all the workflow patterns Globomantics needs: sequential dependencies, parallel fan-out, conditional filters, approval gates, and scheduled builds. Now let's tackle the configuration sprawl problem with parameters and commands."
