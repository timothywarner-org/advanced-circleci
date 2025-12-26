// Log Analytics Workspace Module
// Required for Container Apps monitoring and logging

@description('Name of the Log Analytics workspace')
param name string

@description('Location for the workspace')
param location string

@description('Retention period in days')
@minValue(30)
@maxValue(730)
param retentionDays int = 30

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: name
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: retentionDays
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: 1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

output workspaceId string = logAnalytics.id
output workspaceName string = logAnalytics.name
output workspaceKey string = logAnalytics.listKeys().primarySharedKey
output customerId string = logAnalytics.properties.customerId
