// Globomantics Robot Fleet API - Azure Infrastructure
// Main deployment template for Azure Container Apps
// Used in Module 3 demos for CircleCI Azure deployment

@description('Environment name (dev, staging, production)')
@allowed(['dev', 'staging', 'production'])
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Container image to deploy')
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Number of container replicas')
@minValue(1)
@maxValue(10)
param replicaCount int = 1

@description('Container CPU cores')
param cpuCores string = '0.25'

@description('Container memory')
param memory string = '0.5Gi'

// Variables
var appName = 'robot-api'
var uniqueSuffix = uniqueString(resourceGroup().id)
var acrName = 'globomanticsacr${uniqueSuffix}'
var logAnalyticsName = 'logs-${appName}-${environment}'
var containerAppEnvName = 'env-${appName}-${environment}'
var containerAppName = '${appName}-${environment}'

// Log Analytics Workspace for Container Apps
module logAnalytics 'modules/log-analytics.bicep' = {
  name: 'logAnalytics'
  params: {
    name: logAnalyticsName
    location: location
  }
}

// Azure Container Registry
module acr 'modules/container-registry.bicep' = {
  name: 'containerRegistry'
  params: {
    name: acrName
    location: location
    sku: environment == 'production' ? 'Premium' : 'Basic'
  }
}

// Container Apps Environment
module containerAppEnv 'modules/container-app-env.bicep' = {
  name: 'containerAppEnv'
  params: {
    name: containerAppEnvName
    location: location
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
    logAnalyticsWorkspaceKey: logAnalytics.outputs.workspaceKey
  }
}

// Container App
module containerApp 'modules/container-app.bicep' = {
  name: 'containerApp'
  params: {
    name: containerAppName
    location: location
    containerAppEnvId: containerAppEnv.outputs.environmentId
    containerImage: containerImage
    containerPort: 3000
    cpuCores: cpuCores
    memory: memory
    minReplicas: environment == 'production' ? 2 : 1
    maxReplicas: environment == 'production' ? 10 : replicaCount
    environmentVariables: [
      {
        name: 'NODE_ENV'
        value: environment
      }
      {
        name: 'PORT'
        value: '3000'
      }
    ]
  }
}

// Outputs
output containerAppUrl string = 'https://${containerApp.outputs.fqdn}'
output acrLoginServer string = acr.outputs.loginServer
output acrName string = acr.outputs.name
output containerAppName string = containerApp.outputs.name
output resourceGroupName string = resourceGroup().name
