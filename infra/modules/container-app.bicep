// Container App Module
// Deploys the Globomantics Robot API as a Container App

@description('Name of the container app')
param name string

@description('Location for the container app')
param location string

@description('Container Apps Environment ID')
param containerAppEnvId string

@description('Container image to deploy')
param containerImage string

@description('Container port')
param containerPort int = 3000

@description('CPU cores for the container')
param cpuCores string = '0.25'

@description('Memory for the container')
param memory string = '0.5Gi'

@description('Minimum number of replicas')
@minValue(0)
@maxValue(30)
param minReplicas int = 1

@description('Maximum number of replicas')
@minValue(1)
@maxValue(30)
param maxReplicas int = 10

@description('Environment variables for the container')
param environmentVariables array = []

@description('Registry server for pulling images (set when using ACR)')
param registryServer string = ''

@description('Identity to use for registry authentication (SystemAssigned or resource ID)')
param registryIdentity string = ''

@description('Tags to apply to the container app')
param tags object = {}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: name
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnvId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: containerPort
        transport: 'http'
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: empty(registryServer) ? [] : [
        {
          server: registryServer
          identity: registryIdentity
        }
      ]
      secrets: []
    }
    template: {
      containers: [
        {
          name: name
          image: containerImage
          resources: {
            cpu: json(cpuCores)
            memory: memory
          }
          env: environmentVariables
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health/live'
                port: containerPort
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health/ready'
                port: containerPort
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scale'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  tags: tags
}

output id string = containerApp.id
output name string = containerApp.name
output fqdn string = containerApp.properties.configuration.ingress.fqdn
output latestRevisionName string = containerApp.properties.latestRevisionName
output principalId string = containerApp.identity.principalId
