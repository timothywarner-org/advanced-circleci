#!/bin/bash
# Setup script for repository metadata, topics, and labels
# Reads GitHub token from .env file instead of system environment variables

set -e

# Load environment variables from .env file
if [ -f ".env" ]; then
  echo "=== Loading environment variables from .env file ==="
  # Export variables from .env, ignoring comments and empty lines
  set -a
  source <(grep -v '^#' .env | grep -v '^$' | sed 's/\r$//')
  set +a
  echo "Environment variables loaded from .env"
else
  echo "ERROR: .env file not found!"
  echo "Please copy .env.example to .env and set GITHUB_TOKEN"
  exit 1
fi

# Verify GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN is not set in .env file!"
  echo "Please add GITHUB_TOKEN to your .env file"
  exit 1
fi

export GH_TOKEN="$GITHUB_TOKEN"
echo "Using GitHub token from .env file"

REPO="timothywarner-org/advanced-circleci"

echo "=== Updating repository description ==="
gh repo edit "$REPO" \
  --description "Pluralsight course: Advanced CircleCI Configuration - Master CI/CD workflows, orbs, pipeline parameters, and Azure deployment with a Node.js Robot Fleet API demo project"

echo "=== Adding repository topics ==="
gh repo edit "$REPO" \
  --add-topic circleci \
  --add-topic ci-cd \
  --add-topic devops \
  --add-topic nodejs \
  --add-topic azure \
  --add-topic docker \
  --add-topic pluralsight \
  --add-topic orbs \
  --add-topic pipeline \
  --add-topic continuous-integration

echo "=== Creating CircleCI/DevOps labels ==="
gh label create "circleci-config" --color "343434" --description "CircleCI configuration changes" --force -R "$REPO"
gh label create "orb" --color "6e5494" --description "Orb-related changes" --force -R "$REPO"
gh label create "pipeline" --color "0052CC" --description "Pipeline workflow changes" --force -R "$REPO"
gh label create "docker" --color "2496ED" --description "Docker/container changes" --force -R "$REPO"
gh label create "azure" --color "0078D4" --description "Azure deployment related" --force -R "$REPO"

echo "=== Creating course content labels ==="
gh label create "demo" --color "FBCA04" --description "Course demo content" --force -R "$REPO"
gh label create "course-content" --color "C2E0C6" --description "Affects course materials" --force -R "$REPO"

echo "=== Creating priority labels ==="
gh label create "priority: high" --color "B60205" --description "High priority" --force -R "$REPO"
gh label create "priority: medium" --color "FBCA04" --description "Medium priority" --force -R "$REPO"
gh label create "priority: low" --color "0E8A16" --description "Low priority" --force -R "$REPO"

echo "=== Creating type labels ==="
gh label create "security" --color "D93F0B" --description "Security-related" --force -R "$REPO"
gh label create "testing" --color "BFD4F2" --description "Test-related changes" --force -R "$REPO"
gh label create "api" --color "1D76DB" --description "API endpoint changes" --force -R "$REPO"
gh label create "infrastructure" --color "5319E7" --description "Infrastructure/Bicep changes" --force -R "$REPO"

echo ""
echo "=== Done! ==="
echo "Repository metadata, topics, and labels have been configured."
