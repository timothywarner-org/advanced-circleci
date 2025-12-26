// Staging Environment Parameters
// Used for pre-production testing and validation

using '../main.bicep'

param environment = 'staging'
param location = 'eastus'
param replicaCount = 2
param cpuCores = '0.5'
param memory = '1Gi'
