# Demo 3: Cloud Deployment Orbs — Azure Integration

## Module 3, Clip 4 (5 minutes)

### Overview

Add circleci/azure-cli orb with OIDC authentication for passwordless, secure Azure deployments. Deploy to Azure Container Apps.

---

## Pre-Demo Setup

1. Azure subscription with Container Apps configured
2. Azure AD app registration with federated credentials
3. CircleCI Context "azure-oidc" with required variables
4. infra/main.bicep deployed

---

## Demo Script

### 1. Why OIDC? (30 seconds)

**TALKING POINT:** "Traditional Azure auth uses service principal secrets—passwords that expire and can leak. OIDC uses short-lived tokens that CircleCI exchanges directly with Azure. No stored secrets!"

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  CircleCI   │──OIDC──▶│  Azure AD   │──Token─▶│   Azure     │
│   Pipeline  │  Token  │             │         │  Resources  │
└─────────────┘         └─────────────┘         └─────────────┘
```

### 2. Add Azure CLI Orb (1 minute)

```yaml
version: 2.1

orbs:
  node: circleci/node@5.2.0
  slack: circleci/slack@4.13.3
  azure-cli: circleci/azure-cli@1.2.2  # Azure integration
```

### 3. Configure OIDC Login (1.5 minutes)

```yaml
jobs:
  deploy-azure:
    docker:
      - image: cimg/base:current
    steps:
      # Install Azure CLI
      - azure-cli/install

      # OIDC login - no secrets stored!
      - azure-cli/login-with-oidc

      # Now we can use az commands
      - run:
          name: Verify Azure Connection
          command: |
            az account show
            az group list --output table
```

**TALKING POINT:** "The orb handles OIDC token exchange. We just need the right environment variables in our Context."

### 4. Full Deployment Job (1.5 minutes)

```yaml
jobs:
  deploy-azure:
    parameters:
      environment:
        type: string
    docker:
      - image: cimg/base:current
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true

      - azure-cli/install
      - azure-cli/login-with-oidc

      # Build Docker image
      - run:
          name: Build Docker image
          command: |
            docker build \
              --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
              --build-arg COMMIT_SHA=${CIRCLE_SHA1} \
              -t ${ACR_LOGIN_SERVER}/robot-api:${CIRCLE_SHA1} \
              -t ${ACR_LOGIN_SERVER}/robot-api:latest .

      # Push to Azure Container Registry
      - run:
          name: Push to ACR
          command: |
            az acr login --name ${ACR_NAME}
            docker push ${ACR_LOGIN_SERVER}/robot-api:${CIRCLE_SHA1}
            docker push ${ACR_LOGIN_SERVER}/robot-api:latest

      # Deploy to Container Apps
      - run:
          name: Deploy to << parameters.environment >>
          command: |
            az containerapp update \
              --name robot-api-<< parameters.environment >> \
              --resource-group ${AZURE_RESOURCE_GROUP} \
              --image ${ACR_LOGIN_SERVER}/robot-api:${CIRCLE_SHA1}

      # Verify deployment
      - run:
          name: Health Check
          command: |
            APP_URL=$(az containerapp show \
              --name robot-api-<< parameters.environment >> \
              --resource-group ${AZURE_RESOURCE_GROUP} \
              --query properties.configuration.ingress.fqdn -o tsv)

            curl -f https://${APP_URL}/api/health || exit 1
            echo "✅ Health check passed!"
```

### 5. Workflow with Contexts (30 seconds)

```yaml
workflows:
  deploy:
    jobs:
      - deploy-azure:
          name: deploy-production
          environment: production
          context:
            - azure-oidc        # Azure credentials
            - slack-notifications  # Slack webhook
          filters:
            branches:
              only: main
```

---

## Azure OIDC Setup Checklist

1. **Azure AD App Registration**

   ```bash
   az ad app create --display-name "CircleCI-OIDC"
   ```

2. **Add Federated Credential**
   - Issuer: `https://oidc.circleci.com/org/<ORG_ID>`
   - Subject: `org/<ORG_ID>/project/<PROJECT_ID>/user/<USER_ID>`

3. **CircleCI Context Variables**
   - `AZURE_CLIENT_ID` - App registration client ID
   - `AZURE_TENANT_ID` - Azure AD tenant ID
   - `AZURE_SUBSCRIPTION_ID` - Target subscription
   - `ACR_NAME` - Container registry name
   - `ACR_LOGIN_SERVER` - e.g., myacr.azurecr.io

---

## Key Takeaways

- OIDC = passwordless Azure auth
- No secrets to rotate or leak
- azure-cli orb handles token exchange
- Container Apps are perfect for microservices
- Combine with Slack orb for full visibility

---

## Transition

"We've built a production-ready pipeline with orbs. Let's step back and analyze how to identify orb opportunities in existing configs."
