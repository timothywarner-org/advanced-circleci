#!/usr/bin/env bash
# ============================================================================
# Demo Readiness Check Script
# ============================================================================
#
# This script verifies all prerequisites are in place before demo recordings.
# Run this before each recording session to catch issues early.
#
# Usage:
#   ./scripts/check-demo-ready.sh           # Run all checks
#   ./scripts/check-demo-ready.sh --quick   # Skip network checks
#   ./scripts/check-demo-ready.sh --module3 # Include Azure checks
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Parse arguments
QUICK_MODE=false
CHECK_AZURE=false

for arg in "$@"; do
    case $arg in
        --quick)
            QUICK_MODE=true
            ;;
        --module3)
            CHECK_AZURE=true
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --quick    Skip network checks (faster)"
            echo "  --module3  Include Azure-specific checks"
            echo "  --help     Show this help message"
            exit 0
            ;;
    esac
done

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_pass() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}[✗]${NC} $1"
    echo -e "    ${RED}→ $2${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
    echo -e "    ${YELLOW}→ $2${NC}"
    ((WARNINGS++))
}

check_skip() {
    echo -e "${BLUE}[–]${NC} $1 (skipped)"
}

# ============================================================================
# System Checks
# ============================================================================

print_header "SYSTEM REQUIREMENTS"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        check_pass "Node.js $NODE_VERSION installed"
    else
        check_fail "Node.js $NODE_VERSION is too old" "Upgrade to Node.js 18 or higher"
    fi
else
    check_fail "Node.js not installed" "Install from https://nodejs.org/"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm $NPM_VERSION available"
else
    check_fail "npm not installed" "Install Node.js which includes npm"
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | sed 's/git version //')
    check_pass "Git $GIT_VERSION installed"

    # Check git config
    if git config user.email &> /dev/null; then
        check_pass "Git user configured: $(git config user.name)"
    else
        check_warn "Git user not configured" "Run: git config --global user.name 'Your Name'"
    fi
else
    check_fail "Git not installed" "Install Git from https://git-scm.com/"
fi

# Docker
if command -v docker &> /dev/null; then
    if docker info &> /dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version | sed 's/Docker version //' | cut -d, -f1)
        check_pass "Docker $DOCKER_VERSION running"
    else
        check_warn "Docker installed but not running" "Start Docker Desktop"
    fi
else
    check_warn "Docker not installed" "Required for Module 3 Azure demos"
fi

# ============================================================================
# Project Checks
# ============================================================================

print_header "PROJECT STATUS"

# Check we're in the right directory
if [ -f "package.json" ] && [ -d ".circleci" ]; then
    check_pass "In correct project directory"
else
    check_fail "Not in project root" "cd to the advanced-circleci directory"
    exit 1
fi

# Check node_modules
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed (node_modules exists)"
else
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    check_pass "Dependencies installed"
fi

# Check if tests pass
echo -e "${BLUE}Running tests (this may take a moment)...${NC}"
if npm test &> /dev/null; then
    check_pass "All tests pass"
else
    check_fail "Tests are failing" "Run 'npm test' to see errors"
fi

# Check if app starts
echo -e "${BLUE}Testing application startup...${NC}"
npm start &> /dev/null &
APP_PID=$!
sleep 3

if curl -sf http://localhost:3000/api/health &> /dev/null; then
    check_pass "Application starts successfully"
else
    check_fail "Application failed to start" "Check for port conflicts or errors"
fi

# Clean up
kill $APP_PID 2>/dev/null || true
wait $APP_PID 2>/dev/null || true

# ============================================================================
# CircleCI Checks
# ============================================================================

print_header "CIRCLECI CONFIGURATION"

# CircleCI config exists
if [ -f ".circleci/config.yml" ]; then
    check_pass "CircleCI config exists"
else
    check_fail "CircleCI config missing" "Create .circleci/config.yml"
fi

# CircleCI CLI
if command -v circleci &> /dev/null; then
    CIRCLECI_VERSION=$(circleci version 2>/dev/null | head -1)
    check_pass "CircleCI CLI installed: $CIRCLECI_VERSION"

    # Validate config
    if circleci config validate .circleci/config.yml &> /dev/null; then
        check_pass "CircleCI config is valid"
    else
        check_fail "CircleCI config is invalid" "Run 'circleci config validate' for details"
    fi
else
    check_warn "CircleCI CLI not installed" "Install from https://circleci.com/docs/local-cli/"
fi

# Demo configs exist
DEMO_CONFIGS=$(ls -1 .circleci/configs/*.yml 2>/dev/null | wc -l)
if [ "$DEMO_CONFIGS" -ge 10 ]; then
    check_pass "All $DEMO_CONFIGS demo configs present"
else
    check_warn "Only $DEMO_CONFIGS demo configs found" "Expected 10 configs in .circleci/configs/"
fi

# ============================================================================
# Network Checks (skip in quick mode)
# ============================================================================

if [ "$QUICK_MODE" = false ]; then
    print_header "NETWORK CONNECTIVITY"

    # GitHub
    if curl -sf https://github.com &> /dev/null; then
        check_pass "GitHub accessible"
    else
        check_fail "Cannot reach GitHub" "Check internet connection"
    fi

    # CircleCI
    if curl -sf https://circleci.com &> /dev/null; then
        check_pass "CircleCI accessible"
    else
        check_fail "Cannot reach CircleCI" "Check internet connection or VPN"
    fi

    # npm registry
    if curl -sf https://registry.npmjs.org &> /dev/null; then
        check_pass "npm registry accessible"
    else
        check_warn "Cannot reach npm registry" "May have issues installing packages"
    fi
else
    print_header "NETWORK CHECKS (SKIPPED)"
    check_skip "Network connectivity checks"
fi

# ============================================================================
# Azure Checks (Module 3 only)
# ============================================================================

if [ "$CHECK_AZURE" = true ]; then
    print_header "AZURE CONFIGURATION (MODULE 3)"

    # Azure CLI
    if command -v az &> /dev/null; then
        AZ_VERSION=$(az version --query '"azure-cli"' -o tsv 2>/dev/null)
        check_pass "Azure CLI $AZ_VERSION installed"

        # Check if logged in
        if az account show &> /dev/null 2>&1; then
            AZURE_ACCOUNT=$(az account show --query name -o tsv)
            check_pass "Logged into Azure: $AZURE_ACCOUNT"
        else
            check_warn "Not logged into Azure" "Run 'az login' before Module 3 demos"
        fi
    else
        check_fail "Azure CLI not installed" "Install from https://docs.microsoft.com/cli/azure/install-azure-cli"
    fi

    # Check for required environment variables
    if [ -n "$AZURE_CLIENT_ID" ]; then
        check_pass "AZURE_CLIENT_ID is set"
    else
        check_warn "AZURE_CLIENT_ID not set" "Set in CircleCI context for OIDC"
    fi
else
    echo ""
    echo -e "${BLUE}Tip: Run with --module3 to include Azure checks${NC}"
fi

# ============================================================================
# Demo Scripts Check
# ============================================================================

print_header "DEMO MATERIALS"

# Check demo scripts exist
DEMO_SCRIPTS=$(find demos -name "DEMO-*.md" 2>/dev/null | wc -l)
if [ "$DEMO_SCRIPTS" -ge 12 ]; then
    check_pass "All $DEMO_SCRIPTS demo scripts present"
else
    check_warn "Only $DEMO_SCRIPTS demo scripts found" "Expected 12 scripts"
fi

# Check module overview files
for module in 1 2 3; do
    if ls demos/*/MODULE${module}-15MIN-DEMO.md &> /dev/null 2>&1; then
        check_pass "Module $module overview guide exists"
    else
        check_warn "Module $module overview missing" "Check demos/ directory"
    fi
done

# ============================================================================
# Summary
# ============================================================================

print_header "SUMMARY"

echo -e "Passed:   ${GREEN}$PASSED${NC}"
echo -e "Failed:   ${RED}$FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}All checks passed! Ready for demos.${NC}"
    else
        echo -e "${YELLOW}Ready for demos, but review warnings above.${NC}"
    fi
    exit 0
else
    echo -e "${RED}Some checks failed. Please fix the issues above before proceeding.${NC}"
    exit 1
fi
