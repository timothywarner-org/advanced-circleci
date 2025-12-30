#!/usr/bin/env bash
# Simple, commented examples for triggering this CircleCI pipeline via API v2.
# Requires CIRCLECI_API_TOKEN set in your environment (no defaults baked in).

set -euo pipefail

# Bash guard pattern to ensure required env var is set
: "${CIRCLECI_API_TOKEN:?CIRCLECI_API_TOKEN env var required}"

project_slug="gh/timothywarner-org/advanced-circleci"

api_endpoint="https://circleci.com/api/v2/project/${project_slug}/pipeline"

# Example 1: Run the approval-gated workflow and echo a greeting.
# - require-approval=true keeps the manual approval step
# - hello-message selects one of the enum values defined in .circleci/config.yml
curl -u "${CIRCLECI_API_TOKEN}:" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "require-approval": true,
      "hello-message": "hello-world"
    }
  }' \
  "${api_endpoint}"

# Example 2: Auto-deploy path (skips approval) with a different greeting.
# - require-approval=false flips to the auto workflow
# - hello-message must still match the enum list (hello-world|hola-mundo|hi-there)
curl -u "${CIRCLECI_API_TOKEN}:" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "require-approval": false,
      "hello-message": "hi-there"
    }
  }' \
  "${api_endpoint}"
