# Azure Setup Checklist for CircleCI Deployment

Deploy Globomantics Robot API to Azure Container Apps with OIDC authentication.

**Time required:** ~30 minutes

---

## Prerequisites

- [ ] Azure CLI installed (`az --version`)
- [ ] Logged into Azure (`az login`)
- [ ] CircleCI account with project connected

---

## Step 1: Create Azure Resources

### 1.1 Set Variables

```bash
# Edit these values
RESOURCE_GROUP="globomantics-robots"
ACR_NAME="globomanticsacr"          # Must be globally unique, lowercase, no dashes
LOCATION="eastus"
APP_NAME="robot-api"
```

### 1.2 Create Resource Group

```bash
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### 1.3 Create Azure Container Registry

```bash
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled false
```

### 1.4 Create Container Apps Environment

```bash
az containerapp env create \
  --name "${APP_NAME}-env" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 1.5 Create Container App (placeholder)

```bash
az containerapp create \
  --name "${APP_NAME}-dev" \
  --resource-group $RESOURCE_GROUP \
  --environment "${APP_NAME}-env" \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3000 \
  --ingress external
```

---

## Step 2: Configure OIDC Authentication

### 2.1 Get Your CircleCI Organization ID

1. Go to: https://app.circleci.com/settings/organization
2. Copy the **Organization ID** (UUID format)

```bash
# Save it
CIRCLECI_ORG_ID="your-org-id-here"
```

### 2.2 Get Your CircleCI Project ID

1. Go to your project in CircleCI
2. Click **Project Settings** > **Overview**
3. Copy the **Project ID**

```bash
CIRCLECI_PROJECT_ID="your-project-id-here"
```

### 2.3 Create Azure AD App Registration

```bash
az ad app create --display-name "CircleCI-Globomantics"
APP_ID=$(az ad app list --display-name "CircleCI-Globomantics" --query "[0].appId" -o tsv)
echo "APP_ID: $APP_ID"
```

### 2.4 Create Service Principal

```bash
az ad sp create --id $APP_ID
```

### 2.5 Add Federated Credential

```bash
az ad app federated-credential create --id $APP_ID --parameters "{
  \"name\": \"CircleCI-OIDC\",
  \"issuer\": \"https://oidc.circleci.com/org/${CIRCLECI_ORG_ID}\",
  \"subject\": \"org/${CIRCLECI_ORG_ID}/project/${CIRCLECI_PROJECT_ID}/user/*\",
  \"audiences\": [\"${CIRCLECI_ORG_ID}\"]
}"
```

### 2.6 Grant Permissions

```bash
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Contributor on resource group
az role assignment create \
  --assignee $APP_ID \
  --role "Contributor" \
  --scope "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}"

# AcrPush on container registry
az role assignment create \
  --assignee $APP_ID \
  --role "AcrPush" \
  --scope "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.ContainerRegistry/registries/${ACR_NAME}"
```

---

## Step 3: Create CircleCI Context

1. Go to: **CircleCI** > **Organization Settings** > **Contexts**
2. Create context: `azure-oidc`
3. Add these variables:

| Variable | Value | How to Get It |
|----------|-------|---------------|
| `AZURE_CLIENT_ID` | App Registration ID | `az ad app list --display-name "CircleCI-Globomantics" --query "[0].appId" -o tsv` |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | `az account show --query tenantId -o tsv` |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | `az account show --query id -o tsv` |
| `ACR_NAME` | Registry name | e.g., `globomanticsacr` |
| `ACR_LOGIN_SERVER` | Registry URL | `az acr show --name $ACR_NAME --query loginServer -o tsv` |

### Quick Copy Commands

```bash
echo "AZURE_CLIENT_ID: $(az ad app list --display-name 'CircleCI-Globomantics' --query '[0].appId' -o tsv)"
echo "AZURE_TENANT_ID: $(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID: $(az account show --query id -o tsv)"
echo "ACR_NAME: $ACR_NAME"
echo "ACR_LOGIN_SERVER: $(az acr show --name $ACR_NAME --query loginServer -o tsv)"
```

---

## Step 4: (Optional) Slack Notifications

Create a second context `slack-notifications` with:

| Variable | Value |
|----------|-------|
| `SLACK_ACCESS_TOKEN` | Bot OAuth token from Slack App |
| `SLACK_DEFAULT_CHANNEL` | `#deployments` |

---

## Verification Checklist

### Azure Resources

```bash
# Verify resource group
az group show --name $RESOURCE_GROUP --query name -o tsv

# Verify ACR
az acr show --name $ACR_NAME --query loginServer -o tsv

# Verify Container App
az containerapp show --name "${APP_NAME}-dev" --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv

# Verify OIDC setup
az ad app federated-credential list --id $APP_ID --query "[].name" -o tsv
```

### CircleCI Context

- [ ] Context `azure-oidc` exists
- [ ] `AZURE_CLIENT_ID` is set
- [ ] `AZURE_TENANT_ID` is set
- [ ] `AZURE_SUBSCRIPTION_ID` is set
- [ ] `ACR_NAME` is set
- [ ] `ACR_LOGIN_SERVER` is set

### Test Deployment

Push to a `feature/*` or `develop` branch and watch the pipeline.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `AADSTS700016` | Wrong issuer URL - check `CIRCLECI_ORG_ID` |
| `AADSTS70021` | Wrong subject claim - check federated credential |
| `AuthorizationFailed` | Missing role assignment on resource group |
| `ACR login failed` | Missing `AcrPush` role on registry |

---

## Reference

- CircleCI Azure CLI Orb: https://circleci.com/developer/orbs/orb/circleci/azure-cli
- Azure OIDC docs: https://learn.microsoft.com/en-us/azure/active-directory/workload-identities/workload-identity-federation
- Container Apps docs: https://learn.microsoft.com/en-us/azure/container-apps/
