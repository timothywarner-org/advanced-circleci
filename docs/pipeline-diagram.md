# CircleCI Pipeline Architecture

## Workflow Diagram

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1a365d', 'primaryTextColor': '#fff', 'primaryBorderColor': '#2c5282', 'lineColor': '#4a5568', 'secondaryColor': '#2d3748', 'fontFamily': 'Arial'}}}%%
flowchart TB
    subgraph TRIGGER["📥 TRIGGER"]
        PUSH[/"Git Push"/]
    end

    subgraph ORBS["📦 ORBS"]
        NODE_ORB["circleci/node@7.2.1"]
        CUSTOM_ORB["robot-fleet<br/>custom orb"]
    end

    subgraph BUILD_STAGE["🔨 BUILD"]
        BUILD["<b>build</b><br/>checkout → install → build<br/>→ persist workspace"]
    end

    subgraph TEST_STAGE["🧪 TEST"]
        TEST["<b>test</b><br/>npm test<br/>→ store results<br/>→ notify on fail ❌"]
    end

    subgraph DEPLOY_DEV["🚀 DEV - feature/develop branches"]
        DEV["<b>deploy-dev</b><br/>Azure deploy<br/>→ health-check<br/>→ validate<br/>→ notify ✅"]
    end

    subgraph DEPLOY_MAIN["🚀 MAIN BRANCH ONLY"]
        STAGING["<b>deploy-staging</b><br/>Azure deploy<br/>→ health-check<br/>→ validate<br/>→ notify ✅"]

        NOTIFY_AWAIT["⏳ <b>notify-awaiting-approval</b><br/>Slack notification"]

        APPROVAL{{"⏸️ <b>hold-for-production</b><br/>MANUAL APPROVAL"}}

        PROD["<b>deploy-prod</b><br/>Azure deploy<br/>→ health-check<br/>→ validate<br/>→ notify ✅"]
    end

    %% Main flow
    PUSH --> BUILD
    BUILD --> TEST
    TEST -->|"feature/* develop"| DEV
    TEST -->|"main"| STAGING
    STAGING --> NOTIFY_AWAIT
    NOTIFY_AWAIT --> APPROVAL
    APPROVAL -->|"Approved ✓"| PROD

    %% Orb connections
    NODE_ORB -.->|"install-packages"| BUILD
    CUSTOM_ORB -.->|"health-check validate"| DEV
    CUSTOM_ORB -.->|"health-check validate"| STAGING
    CUSTOM_ORB -.->|"health-check validate"| PROD

    %% Styling
    classDef trigger fill:#1e3a5f,stroke:#2c5282,color:#fff,stroke-width:2px
    classDef orb fill:#553c9a,stroke:#805ad5,color:#fff,stroke-width:2px
    classDef build fill:#22543d,stroke:#276749,color:#fff,stroke-width:2px
    classDef test fill:#1e40af,stroke:#3b82f6,color:#fff,stroke-width:2px
    classDef deploy fill:#9a3412,stroke:#ea580c,color:#fff,stroke-width:2px
    classDef approval fill:#d97706,stroke:#f59e0b,color:#000,stroke-width:3px
    classDef prod fill:#991b1b,stroke:#dc2626,color:#fff,stroke-width:2px

    class PUSH trigger
    class NODE_ORB,CUSTOM_ORB orb
    class BUILD build
    class TEST test
    class DEV,STAGING deploy
    class APPROVAL approval
    class PROD prod
```

## Pipeline Flow Summary

### Branch: `feature/*` or `develop`
```
build → test → deploy-dev → ✅ Slack Success
                    ↓
              If test fails → ❌ Slack Failure (pipeline stops)
```

### Branch: `main`
```
build → test → deploy-staging → notify-awaiting-approval → ⏸️ APPROVAL → deploy-prod
                     ↓                    ↓                                    ↓
               ✅ Slack Success    ⏳ Slack "Awaiting"              ✅ Slack Success
```

## Orb Integration

| Orb | Source | Usage |
|-----|--------|-------|
| `circleci/node@7.2.1` | CircleCI Registry | `node/install-packages` in build job |
| `robot-fleet` (inline) | `orb-source/` | `health-check`, `validate-deployment` in deploy jobs |

## Contexts

| Context | Environment Variable | Purpose |
|---------|---------------------|---------|
| `slack-notifications` | `SLACK_WEBHOOK` | Slack webhook URL for notifications |

## Notifications

| Event | Color | Message |
|-------|-------|---------|
| Test Failure | 🔴 Red | "❌ Build Failed - Robot Fleet API" |
| Deploy Success | 🟢 Green | "✅ Deployed to {env} - Robot Fleet API" |
| Awaiting Approval | 🟡 Yellow | "⏳ Awaiting Production Approval" |
