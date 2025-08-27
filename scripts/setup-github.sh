#!/bin/bash

# GitHub Repository Setup Script
# This script helps configure GitHub repository settings for the NOHVEX CI/CD pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="nohvex-defi-platform-next"
MAIN_BRANCH="main"
DEVELOP_BRANCH="develop"

echo -e "${BLUE}🚀 NOHVEX GitHub Repository Setup${NC}"
echo "================================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    echo ""
    echo "Installation commands:"
    echo "  macOS: brew install gh"
    echo "  Windows: winget install --id GitHub.cli"
    echo "  Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is installed and authenticated${NC}"
echo ""

# Get repository information
echo -e "${BLUE}📂 Repository Information${NC}"
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login' 2>/dev/null || echo "")
REPO_FULL_NAME=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || echo "")

if [ -z "$REPO_FULL_NAME" ]; then
    echo -e "${RED}❌ Could not detect repository. Make sure you're in the correct directory.${NC}"
    exit 1
fi

echo "Repository: $REPO_FULL_NAME"
echo ""

# Function to create environment
create_environment() {
    local env_name=$1
    local protection_rules=$2
    
    echo -e "${BLUE}🌍 Creating environment: $env_name${NC}"
    
    # Note: Environment creation via CLI is limited, showing manual steps
    echo "To create the '$env_name' environment:"
    echo "1. Go to: https://github.com/$REPO_FULL_NAME/settings/environments"
    echo "2. Click 'New environment'"
    echo "3. Name: $env_name"
    if [ "$protection_rules" = "true" ]; then
        echo "4. Enable 'Required reviewers' (add at least 1 reviewer)"
        echo "5. Enable 'Wait timer' (set to 0 minutes for staging, 5 minutes for production)"
    fi
    echo ""
}

# Function to set up branch protection
setup_branch_protection() {
    local branch=$1
    
    echo -e "${BLUE}🛡️  Setting up branch protection for: $branch${NC}"
    
    # Check if branch exists
    if ! gh api "repos/$REPO_FULL_NAME/branches/$branch" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Branch '$branch' does not exist yet${NC}"
        echo "Create the branch first, then run this script again"
        return
    fi
    
    # Set up branch protection rules
    gh api -X PUT "repos/$REPO_FULL_NAME/branches/$branch/protection" \
        --field required_status_checks='{"strict":true,"contexts":["Code Quality","Unit & Integration Tests","Build Application","Docker Build & Scan"]}' \
        --field enforce_admins=false \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        2>/dev/null && echo -e "${GREEN}✅ Branch protection enabled for $branch${NC}" || echo -e "${YELLOW}⚠️  Could not set branch protection for $branch (may need admin access)${NC}"
}

# Main setup process
echo -e "${BLUE}🔧 Starting setup process...${NC}"
echo ""

# 1. Create environments
echo -e "${BLUE}Step 1: Environment Setup${NC}"
create_environment "staging" "false"
create_environment "production" "true"

# 2. Set up branch protection
echo -e "${BLUE}Step 2: Branch Protection${NC}"
setup_branch_protection "$MAIN_BRANCH"
setup_branch_protection "$DEVELOP_BRANCH"

# 3. Display secrets setup information
echo -e "${BLUE}Step 3: Repository Secrets${NC}"
echo "You need to add the following secrets manually:"
echo "Go to: https://github.com/$REPO_FULL_NAME/settings/secrets/actions"
echo ""
echo "Required secrets:"
echo "- VERCEL_TOKEN"
echo "- VERCEL_ORG_ID"
echo "- VERCEL_PROJECT_ID"
echo "- DATABASE_URL"
echo "- DIRECT_URL"
echo "- NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL"
echo "- NOWNODES_API_KEY"
echo ""
echo "Optional secrets:"
echo "- SLACK_WEBHOOK_URL"
echo "- AWS_ACCESS_KEY_ID"
echo "- AWS_SECRET_ACCESS_KEY"
echo "- SEMGREP_APP_TOKEN"
echo ""
echo "For detailed instructions, see: docs/GITHUB_SECRETS_SETUP.md"
echo ""

# 4. Validate workflow files
echo -e "${BLUE}Step 4: Workflow Validation${NC}"
echo "Validating GitHub Actions workflow files..."

WORKFLOW_DIR=".github/workflows"
if [ -d "$WORKFLOW_DIR" ]; then
    WORKFLOW_COUNT=$(find "$WORKFLOW_DIR" -name "*.yml" -o -name "*.yaml" | wc -l)
    echo -e "${GREEN}✅ Found $WORKFLOW_COUNT workflow file(s)${NC}"
    
    # List workflow files
    find "$WORKFLOW_DIR" -name "*.yml" -o -name "*.yaml" | while read -r file; do
        echo "  - $(basename "$file")"
    done
else
    echo -e "${RED}❌ No .github/workflows directory found${NC}"
fi
echo ""

# 5. Generate summary
echo -e "${BLUE}📋 Setup Summary${NC}"
echo "=================="
echo ""
echo -e "${GREEN}✅ Completed steps:${NC}"
echo "  - GitHub CLI validation"
echo "  - Repository detection"
echo "  - Environment setup instructions"
echo "  - Branch protection configuration"
echo "  - Workflow validation"
echo ""
echo -e "${YELLOW}📝 Manual steps required:${NC}"
echo "  1. Create staging and production environments"
echo "  2. Add repository secrets"
echo "  3. Verify branch protection rules"
echo "  4. Test the CI/CD pipeline"
echo ""
echo -e "${BLUE}🔗 Useful links:${NC}"
echo "  - Repository settings: https://github.com/$REPO_FULL_NAME/settings"
echo "  - Actions: https://github.com/$REPO_FULL_NAME/actions"
echo "  - Environments: https://github.com/$REPO_FULL_NAME/settings/environments"
echo "  - Secrets: https://github.com/$REPO_FULL_NAME/settings/secrets/actions"
echo ""
echo -e "${GREEN}🎉 Setup guide completed!${NC}"
echo "Next: Add the required secrets and test your CI/CD pipeline"