// Development Environment Parameters
// Used for quick iteration and feature testing

using '../main.bicep'

param environment = 'dev'
param location = 'eastus'
param replicaCount = 1
param cpuCores = '0.25'
param memory = '0.5Gi'
