# Azure Infrastructure as Code (IaC)

This guide explains how the Bicep templates in `infra/` deploy the Globomantics Robot Fleet API to Azure Container Apps. It is written for learners following the CircleCI course so you can see how the templates map to the demos and how to safely reuse them.

## Resource layout

The main template (`infra/main.bicep`) wires together four modules:

- **Log Analytics workspace** (`infra/modules/log-analytics.bicep`) – collects Container Apps logs and metrics.
- **Container Registry** (`infra/modules/container-registry.bicep`) – stores the API images built in CircleCI. The admin account is turned off by default for safer demos.
- **Container Apps Environment** (`infra/modules/container-app-env.bicep`) – provides the shared network and log pipeline for apps.
- **Container App** (`infra/modules/container-app.bicep`) – deploys the `robot-api` image with health probes and HTTP ingress.

> Teaching tip: the modules are intentionally small so you can open each file and connect parameters to the Azure resources they control.

## Environment toggles

We support two environments: `staging` and `production`. The `infra/environments/*.bicepparam` files feed values into the main template:

- **Registry SKU** – production uses `Premium`; staging uses `Basic`.
- **Scaling** – production starts with at least 2 replicas and allows up to 10; staging defaults to 1 replica unless overridden in the parameter file.
- **Tags** – every resource inherits standard tags that include the environment name for cost tracking.

You can adjust per-environment values by editing the corresponding `.bicepparam` file without touching the modules.

## Key parameters

The main template exposes a few inputs that show up in the demos:

- `environment` – selects `staging` or `production` and drives the scaling/registry toggles.
- `containerImage` – image to deploy (e.g., the tag produced by the CircleCI pipeline).
- `replicaCount`, `cpuCores`, `memory` – container sizing defaults that can be overridden in params.
- `tags` – merged with standard tags so you can add course- or team-specific metadata.

Outputs include the Container App URL, registry login server, app name, and resource group to make validation easier at the end of each deployment.

## How to deploy locally

1. Sign in and select your subscription: `az login` then `az account set --subscription <id>`.
2. From the `infra/` folder run `./deploy.sh <environment>` (default is `staging`). The script validates the environment name, creates a resource group, and deploys `main.bicep` with the matching parameter file.
3. Review the printed outputs for the URL and ACR details. If you need to redeploy with a new image tag, rerun the command with `--parameters containerImage=<tag>`.

## Pipeline secrets to provide

CircleCI needs an Azure service principal that can deploy resources and assign the `AcrPull` role. Add these to your CircleCI project settings:

- `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_CLIENT_SECRET`
- `AZURE_RESOURCE_GROUP` (optional override if you do not want the script to create one)
- `CONTAINER_IMAGE` pointing at the built image tag you want to release

These values map directly to the parameters and role assignment in `infra/main.bicep`, so the same IaC works in both local and CI runs.
