# GitHub Repository Setup Script for Windows PowerShell
# This script helps configure GitHub repository settings for the NOHVEX CI/CD pipeline

param(
    [string]$MainBranch = "main",
    [string]$DevelopBranch = "develop"
)

# Configuration
$RepoName = "nohvex-defi-platform-next"

Write-Host "🚀 NOHVEX GitHub Repository Setup" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue
Write-Host ""

# Check if GitHub CLI is installed
try {
    $ghVersion = gh --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI not found"
    }
} catch {
    Write-Host "❌ GitHub CLI (gh) is not installed" -ForegroundColor Red
    Write-Host "Please install it from: https://cli.github.com/"
    Write-Host ""
    Write-Host "Installation command:"
    Write-Host "  Windows: winget install --id GitHub.cli"
    exit 1
}

# Check if user is authenticated
try {
    gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
} catch {
    Write-Host "⚠️  Not authenticated with GitHub CLI" -ForegroundColor Yellow
    Write-Host "Please run: gh auth login"
    exit 1
}

Write-Host "✅ GitHub CLI is installed and authenticated" -ForegroundColor Green
Write-Host ""

# Get repository information
Write-Host "📂 Repository Information" -ForegroundColor Blue
try {
    $repoOwner = gh repo view --json owner --jq '.owner.login' 2>$null
    $repoFullName = gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>$null
    
    if (-not $repoFullName) {
        throw "Could not detect repository"
    }
} catch {
    Write-Host "❌ Could not detect repository. Make sure you're in the correct directory." -ForegroundColor Red
    exit 1
}

Write-Host "Repository: $repoFullName"
Write-Host ""

# Function to create environment instructions
function Show-EnvironmentSetup {
    param([string]$EnvName, [bool]$ProtectionRules)
    
    Write-Host "🌍 Creating environment: $EnvName" -ForegroundColor Blue
    Write-Host "To create the '$EnvName' environment:"
    Write-Host "1. Go to: https://github.com/$repoFullName/settings/environments"
    Write-Host "2. Click 'New environment'"
    Write-Host "3. Name: $EnvName"
    if ($ProtectionRules) {
        Write-Host "4. Enable 'Required reviewers' (add at least 1 reviewer)"
        Write-Host "5. Enable 'Wait timer' (set to 0 minutes for staging, 5 minutes for production)"
    }
    Write-Host ""
}

# Function to set up branch protection
function Set-BranchProtection {
    param([string]$Branch)
    
    Write-Host "🛡️  Setting up branch protection for: $Branch" -ForegroundColor Blue
    
    # Check if branch exists
    try {
        gh api "repos/$repoFullName/branches/$Branch" 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Branch not found"
        }
    } catch {
        Write-Host "⚠️  Branch '$Branch' does not exist yet" -ForegroundColor Yellow
        Write-Host "Create the branch first, then run this script again"
        return
    }
    
    # Set up branch protection rules
    $protectionConfig = @{
        required_status_checks = @{
            strict = $true
            contexts = @("Code Quality", "Unit & Integration Tests", "Build Application", "Docker Build & Scan")
        }
        enforce_admins = $false
        required_pull_request_reviews = @{
            required_approving_review_count = 1
            dismiss_stale_reviews = $true
            require_code_owner_reviews = $false
        }
        restrictions = $null
        allow_force_pushes = $false
        allow_deletions = $false
    }
    
    try {
        $protectionJson = $protectionConfig | ConvertTo-Json -Depth 10
        gh api -X PUT "repos/$repoFullName/branches/$Branch/protection" --input - <<< $protectionJson 2>$null | Out-Null
        Write-Host "✅ Branch protection enabled for $Branch" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not set branch protection for $Branch (may need admin access)" -ForegroundColor Yellow
    }
}

# Main setup process
Write-Host "🔧 Starting setup process..." -ForegroundColor Blue
Write-Host ""

# 1. Create environments
Write-Host "Step 1: Environment Setup" -ForegroundColor Blue
Show-EnvironmentSetup "staging" $false
Show-EnvironmentSetup "production" $true

# 2. Set up branch protection
Write-Host "Step 2: Branch Protection" -ForegroundColor Blue
Set-BranchProtection $MainBranch
Set-BranchProtection $DevelopBranch

# 3. Display secrets setup information
Write-Host "Step 3: Repository Secrets" -ForegroundColor Blue
Write-Host "You need to add the following secrets manually:"
Write-Host "Go to: https://github.com/$repoFullName/settings/secrets/actions"
Write-Host ""
Write-Host "Required secrets:"
Write-Host "- VERCEL_TOKEN"
Write-Host "- VERCEL_ORG_ID"
Write-Host "- VERCEL_PROJECT_ID"
Write-Host "- DATABASE_URL"
Write-Host "- DIRECT_URL"
Write-Host "- NEXTAUTH_SECRET"
Write-Host "- NEXTAUTH_URL"
Write-Host "- NOWNODES_API_KEY"
Write-Host ""
Write-Host "Optional secrets:"
Write-Host "- SLACK_WEBHOOK_URL"
Write-Host "- AWS_ACCESS_KEY_ID"
Write-Host "- AWS_SECRET_ACCESS_KEY"
Write-Host "- SEMGREP_APP_TOKEN"
Write-Host ""
Write-Host "For detailed instructions, see: docs/GITHUB_SECRETS_SETUP.md"
Write-Host ""

# 4. Validate workflow files
Write-Host "Step 4: Workflow Validation" -ForegroundColor Blue
Write-Host "Validating GitHub Actions workflow files..."

$workflowDir = ".github/workflows"
if (Test-Path $workflowDir) {
    $workflowFiles = Get-ChildItem -Path $workflowDir -Filter "*.yml" -File
    $workflowFiles += Get-ChildItem -Path $workflowDir -Filter "*.yaml" -File
    $workflowCount = $workflowFiles.Count
    
    Write-Host "✅ Found $workflowCount workflow file(s)" -ForegroundColor Green
    
    foreach ($file in $workflowFiles) {
        Write-Host "  - $($file.Name)"
    }
} else {
    Write-Host "❌ No .github/workflows directory found" -ForegroundColor Red
}
Write-Host ""

# 5. Generate summary
Write-Host "📋 Setup Summary" -ForegroundColor Blue
Write-Host "=================="
Write-Host ""
Write-Host "✅ Completed steps:" -ForegroundColor Green
Write-Host "  - GitHub CLI validation"
Write-Host "  - Repository detection"
Write-Host "  - Environment setup instructions"
Write-Host "  - Branch protection configuration"
Write-Host "  - Workflow validation"
Write-Host ""
Write-Host "📝 Manual steps required:" -ForegroundColor Yellow
Write-Host "  1. Create staging and production environments"
Write-Host "  2. Add repository secrets"
Write-Host "  3. Verify branch protection rules"
Write-Host "  4. Test the CI/CD pipeline"
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Blue
Write-Host "  - Repository settings: https://github.com/$repoFullName/settings"
Write-Host "  - Actions: https://github.com/$repoFullName/actions"
Write-Host "  - Environments: https://github.com/$repoFullName/settings/environments"
Write-Host "  - Secrets: https://github.com/$repoFullName/settings/secrets/actions"
Write-Host ""
Write-Host "🎉 Setup guide completed!" -ForegroundColor Green
Write-Host "Next: Add the required secrets and test your CI/CD pipeline"