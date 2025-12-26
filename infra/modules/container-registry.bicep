// Azure Container Registry Module
// Stores Docker images for Container Apps deployment

@description('Name of the container registry')
param name string

@description('Location for the registry')
param location string

@description('SKU for the registry')
@allowed(['Basic', 'Standard', 'Premium'])
param sku string = 'Basic'

@description('Whether the admin user is enabled (prefer disabled in production)')
param adminUserEnabled bool = true

@description('Tags to apply to the registry')
param tags object = {}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: name
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: adminUserEnabled
  }
  tags: tags
}

output id string = acr.id
output name string = acr.name
output loginServer string = acr.properties.loginServer
