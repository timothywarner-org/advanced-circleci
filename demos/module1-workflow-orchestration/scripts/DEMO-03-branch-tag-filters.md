# Demo 3: Conditional Execution with Branch and Tag Filters
## Module 1, Clip 4 (5 minutes)

### Overview
Control which commits trigger which jobs using the `filters` key. Build real-world scenarios for branch and tag-based deployments.

---

## Pre-Demo Setup
1. Create test branches: `feature/demo`, `develop`, `main`
2. Have a version tag ready to push (v1.0.0)
3. CircleCI dashboard open

---

## Demo Script

### 1. Explain the Need (30 seconds)

**TALKING POINT:** "Globomantics doesn't want integration tests running on every commit to feature branches—that wastes credits. And they only want production deployments from the main branch. Filters solve this."

### 2. Add Branch Filters (2 minutes)

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      # Runs on ALL branches
      - build

      # Unit tests on all branches
      - unit-tests:
          requires:
            - build

      # Integration tests ONLY on main and develop
      - integration-tests:
          requires:
            - build
          filters:
            branches:
              only:
                - main
                - develop

      # E2E tests ONLY on main
      - e2e-tests:
          requires:
            - build
          filters:
            branches:
              only: main

      # Deploy to staging ONLY from develop
      - deploy-staging:
          requires:
            - unit-tests
          filters:
            branches:
              only: develop

      # Deploy to production ONLY from main
      - deploy-production:
          requires:
            - unit-tests
            - integration-tests
            - e2e-tests
          filters:
            branches:
              only: main
```

### 3. Demonstrate Feature Branch (1 minute)

```bash
git checkout -b feature/test-filters
# Make a small change
git commit -m "Test filter behavior"
git push -u origin feature/test-filters
```

**SHOW in CircleCI:**
- build runs ✓
- unit-tests runs ✓
- integration-tests SKIPPED
- e2e-tests SKIPPED
- deploy-staging SKIPPED
- deploy-production SKIPPED

**TALKING POINT:** "On feature branches, we only run fast unit tests. Integration and E2E are skipped, saving time and credits."

### 4. Add Tag Filters (1 minute)

```yaml
  # Separate workflow for releases
  release:
    jobs:
      - release-build:
          filters:
            tags:
              only: /^v[0-9]+\.[0-9]+\.[0-9]+$/
            branches:
              ignore: /.*/
```

**TALKING POINT:** "For releases, we use a separate workflow triggered only by semantic version tags. The `branches: ignore: /.*/` is required—CircleCI needs this to know the workflow is tag-only."

### 5. Demonstrate Tag Trigger (30 seconds)

```bash
git tag v1.0.0
git push origin v1.0.0
```

**SHOW in CircleCI:**
- New pipeline appears
- release-build job runs
- Only tag-filtered workflow executed

---

## Filter Syntax Quick Reference

```yaml
# Branch patterns
filters:
  branches:
    only:
      - main                    # Exact match
      - develop
      - /feature\/.*/          # Regex pattern
    ignore:
      - /docs\/.*/             # Ignore docs branches

# Tag patterns
filters:
  tags:
    only: /^v[0-9]+\.[0-9]+\.[0-9]+$/  # v1.0.0, v2.1.3, etc.
  branches:
    ignore: /.*/  # Required for tag-only workflows!
```

---

## Key Takeaways
- `filters.branches.only` restricts jobs to specific branches
- `filters.branches.ignore` excludes branches
- Regex patterns enable flexible matching
- Tag workflows require `branches: ignore: /.*/`
- Skipped jobs show as "Not Run" in dashboard

---

## Transition
"We've covered the three core workflow patterns. Let's look at two advanced patterns: approval gates and scheduled workflows."
