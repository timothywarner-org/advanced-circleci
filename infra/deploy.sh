#!/bin/bash
# Globomantics Robot API - Azure Deployment Script
# Usage: ./deploy.sh <environment>

set -e

ENVIRONMENT=${1:-staging}
RESOURCE_GROUP="globomantics-robots-${ENVIRONMENT}"
LOCATION="eastus"
DEPLOYMENT_NAME="main"

echo "=========================================="
echo "Globomantics Robot API - Azure Deployment"
echo "=========================================="
echo "Environment: ${ENVIRONMENT}"
echo "Resource Group: ${RESOURCE_GROUP}"
echo "Location: ${LOCATION}"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    echo "Error: Invalid environment. Use: dev, staging, or production"
    exit 1
fi

# Check if logged in to Azure
echo "Checking Azure login status..."
az account show > /dev/null 2>&1 || {
    echo "Error: Not logged in to Azure. Run 'az login' first."
    exit 1
}

# Create resource group if it doesn't exist
echo "Creating resource group if needed..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output none

# Deploy Bicep template
echo "Deploying infrastructure..."
az deployment group create \
    --name "$DEPLOYMENT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --template-file main.bicep \
    --parameters "environments/${ENVIRONMENT}.bicepparam" \
    --output table

# Get deployment outputs
echo ""
echo "Deployment complete! Getting outputs..."
OUTPUTS=$(az deployment group show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DEPLOYMENT_NAME" \
    --query properties.outputs \
    --output json)

echo ""
echo "=========================================="
echo "Deployment Outputs"
echo "=========================================="
echo "$OUTPUTS" | jq -r 'to_entries[] | "\(.key): \(.value.value)"'

echo ""
echo "Done! Your API is available at:"
echo "$OUTPUTS" | jq -r '.containerAppUrl.value'
