// Production Environment Parameters
// Used for live production workloads

using '../main.bicep'

param environment = 'production'
param location = 'eastus'
param replicaCount = 3
param cpuCores = '1'
param memory = '2Gi'
