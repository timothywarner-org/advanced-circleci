// Container Apps Environment Module
// Shared environment for Container Apps with optional logging

@description('Name of the Container Apps environment')
param name string

@description('Location for the environment')
param location string

@description('Log Analytics workspace customer ID (optional - leave empty for Azure managed logs)')
param logAnalyticsCustomerId string = ''

@description('Log Analytics workspace key (optional)')
@secure()
param logAnalyticsWorkspaceKey string = ''

@description('Tags to apply to the Container Apps environment')
param tags object = {}

// Use custom Log Analytics if provided, otherwise Azure manages logs automatically
var useCustomLogs = !empty(logAnalyticsCustomerId) && !empty(logAnalyticsWorkspaceKey)

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: name
  location: location
  properties: {
    appLogsConfiguration: useCustomLogs ? {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsCustomerId
        sharedKey: logAnalyticsWorkspaceKey
      }
    } : {
      destination: 'azure-monitor'
    }
    zoneRedundant: false
  }
  tags: tags
}

output environmentId string = containerAppEnv.id
output environmentName string = containerAppEnv.name
output defaultDomain string = containerAppEnv.properties.defaultDomain
