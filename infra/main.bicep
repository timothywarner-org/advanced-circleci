// Globomantics Robot Fleet API - Azure Infrastructure
// Main deployment template for Azure Container Apps
// Used in Module 3 demos for CircleCI Azure deployment

targetScope = 'resourceGroup'

@description('Environment name (staging or production)')
@allowed(['staging', 'production'])
param environment string = 'staging'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Container image to deploy')
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Number of container replicas')
@minValue(1)
@maxValue(10)
param replicaCount int = 1

@description('Container CPU cores')
@allowed([
  '0.25'
  '0.5'
  '0.75'
  '1'
  '1.25'
  '1.5'
  '2'
  '3'
  '4'
])
param cpuCores string = '0.25'

@description('Container memory')
@allowed([
  '0.5Gi'
  '1Gi'
  '1.5Gi'
  '2Gi'
  '3Gi'
  '4Gi'
  '8Gi'
  '16Gi'
])
param memory string = '0.5Gi'

@description('Tags applied to all resources')
param tags object = {
  environment: environment
}

// Variables
var appName = 'robot-api'
var uniqueSuffix = uniqueString(resourceGroup().id)
var acrName = 'globomanticsacr${uniqueSuffix}'
var logAnalyticsName = 'logs-${appName}-${environment}'
var containerAppEnvName = 'env-${appName}-${environment}'
var containerAppName = '${appName}-${environment}'
var standardTags = union({
  workload: appName
  deploymentSource: 'circleci'
}, tags)

// Log Analytics Workspace for Container Apps
module logAnalytics 'modules/log-analytics.bicep' = {
  name: 'logAnalytics'
  params: {
    name: logAnalyticsName
    location: location
    tags: standardTags
  }
}

// Azure Container Registry
module acr 'modules/container-registry.bicep' = {
  name: 'containerRegistry'
  params: {
    name: acrName
    location: location
    sku: environment == 'production' ? 'Premium' : 'Basic'
    adminUserEnabled: false
    tags: standardTags
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
    tags: standardTags
  }
}

// Container App
module containerApp 'modules/container-app.bicep' = {
  name: 'containerApp'
  params: {
    name: containerAppName
    location: location
    containerAppEnvId: containerAppEnv.outputs.environmentId
    registryServer: acr.outputs.loginServer
    registryIdentity: 'SystemAssigned'
    tags: standardTags
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

resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: acr
  name: guid(acr.outputs.id, containerApp.outputs.principalId, 'acrpull')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: containerApp.outputs.principalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output containerAppUrl string = 'https://${containerApp.outputs.fqdn}'
output acrLoginServer string = acr.outputs.loginServer
output acrName string = acr.outputs.name
output containerAppName string = containerApp.outputs.name
output resourceGroupName string = resourceGroup().name
