// Container Apps Environment Module
// Shared environment for Container Apps with logging

@description('Name of the Container Apps environment')
param name string

@description('Location for the environment')
param location string

@description('Log Analytics workspace ID')
param logAnalyticsWorkspaceId string

@description('Log Analytics workspace key')
@secure()
param logAnalyticsWorkspaceKey string

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: name
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2022-10-01').customerId
        sharedKey: logAnalyticsWorkspaceKey
      }
    }
    zoneRedundant: false
  }
}

output environmentId string = containerAppEnv.id
output environmentName string = containerAppEnv.name
output defaultDomain string = containerAppEnv.properties.defaultDomain
