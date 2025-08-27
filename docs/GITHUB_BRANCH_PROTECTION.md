# GitHub Branch Protection Rules Configuration

This guide explains how to configure branch protection rules for the NOHVEX project to ensure code quality and secure deployments.

## Overview

Branch protection rules prevent direct pushes to important branches and enforce quality checks before merging code. This ensures that all changes go through proper review and testing processes.

## Required Branch Protection Rules

### 1. Main Branch (Production)

The `main` branch should have the strictest protection rules as it represents the production code.

#### Protection Settings:

- ✅ **Require a pull request before merging**

  - Required number of approvals: **2**
  - Dismiss stale reviews when new commits are pushed: **Yes**
  - Require review from code owners: **Yes**
  - Restrict pushes that create files that change code owners: **Yes**

- ✅ **Require status checks to pass before merging**

  - Require branches to be up to date before merging: **Yes**
  - Required status checks:
    - `Code Quality` (ESLint + TypeScript)
    - `Unit & Integration Tests`
    - `Build Application`
    - `Docker Build & Scan`
    - `Security Analysis`

- ✅ **Require conversation resolution before merging**

  - All conversations must be resolved: **Yes**

- ✅ **Require signed commits**

  - Require signed commits: **Yes** (recommended for security)

- ✅ **Restrict pushes to matching branches**

  - Restrict pushes that create files: **Yes**
  - Who can push to matching branches: **Repository administrators only**

- ✅ **Force push restrictions**
  - Allow force pushes: **No**
  - Allow deletions: **No**

### 2. Develop Branch (Staging)

The `develop` branch has slightly relaxed rules for faster development iteration.

#### Protection Settings:

- ✅ **Require a pull request before merging**

  - Required number of approvals: **1**
  - Dismiss stale reviews when new commits are pushed: **Yes**
  - Require review from code owners: **No**

- ✅ **Require status checks to pass before merging**

  - Require branches to be up to date before merging: **Yes**
  - Required status checks:
    - `Code Quality` (ESLint + TypeScript)
    - `Unit & Integration Tests`
    - `Build Application`

- ✅ **Force push restrictions**
  - Allow force pushes: **No**
  - Allow deletions: **No**

### 3. Feature Branches

Feature branches (e.g., `feature/*`, `bugfix/*`, `hotfix/*`) should have minimal protection to allow rapid development.

#### Protection Settings:

- ✅ **Basic protection only**
  - Allow force pushes: **Yes** (for rebasing)
  - Allow deletions: **Yes** (for cleanup)
  - Require status checks: **Optional**

## Implementation Methods

### Method 1: GitHub Web Interface (Recommended for Initial Setup)

1. **Navigate to Repository Settings**

   - Go to your repository on GitHub
   - Click "Settings" → "Branches"

2. **Add Branch Protection Rule**

   - Click "Add rule"
   - Configure settings as described above
   - Save the rule

3. **Repeat for Each Branch**
   - Create separate rules for `main` and `develop`
   - Configure feature branch patterns if needed

### Method 2: GitHub CLI (Advanced Users)

Use the provided script in `scripts/setup-github.sh` or `scripts/setup-github.ps1`.

### Method 3: GitHub API (Automation)

For programmatic setup, use the GitHub REST API with the following endpoints:

```bash
# Create branch protection rule
curl -X PUT \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/branches/BRANCH/protection \
  -d @protection-config.json
```

## Protection Rule Templates

### Main Branch Protection (JSON)

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Code Quality",
      "Unit & Integration Tests",
      "Build Application",
      "Docker Build & Scan",
      "Security Analysis"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "dismissal_restrictions": {
      "users": [],
      "teams": []
    }
  },
  "restrictions": {
    "users": [],
    "teams": [],
    "apps": []
  },
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

### Develop Branch Protection (JSON)

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Code Quality",
      "Unit & Integration Tests",
      "Build Application"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

## CODEOWNERS Configuration

Create a `.github/CODEOWNERS` file to automatically assign reviewers:

```
# Global code owners
* @your-username @team-lead

# Frontend components
/src/components/ @frontend-team @your-username

# Backend API routes
/src/app/api/ @backend-team @your-username

# Infrastructure and deployment
/docker* @devops-team @your-username
/.github/ @devops-team @your-username
/scripts/ @devops-team @your-username

# Database and schema
/prisma/ @backend-team @database-admin @your-username

# Configuration files
*.config.* @devops-team @your-username
package*.json @your-username @team-lead

# Documentation
/docs/ @your-username @tech-writer
README.md @your-username @tech-writer
```

## Workflow Integration

### Status Check Configuration

Ensure your GitHub Actions workflows have the correct job names that match the required status checks:

```yaml
# .github/workflows/ci-cd.yml
jobs:
  lint-and-type-check:
    name: "Code Quality" # Must match status check name
    # ...

  test:
    name: "Unit & Integration Tests" # Must match status check name
    # ...

  build:
    name: "Build Application" # Must match status check name
    # ...

  docker-build:
    name: "Docker Build & Scan" # Must match status check name
    # ...

  security-scan:
    name: "Security Analysis" # Must match status check name
    # ...
```

## Testing Branch Protection

### 1. Test Pull Request Process

1. Create a test branch: `git checkout -b test/branch-protection`
2. Make a small change and push: `git push origin test/branch-protection`
3. Open a pull request to `develop` or `main`
4. Verify that status checks run and are required
5. Test that merge is blocked until requirements are met

### 2. Test Direct Push Blocking

1. Try to push directly to `main`: `git push origin main`
2. Should be rejected with protection rule message
3. Verify force push is blocked: `git push --force origin main`

### 3. Test Status Check Requirements

1. Create a PR with failing tests
2. Verify merge is blocked until tests pass
3. Fix tests and verify merge becomes available

## Troubleshooting

### Common Issues

1. **Status checks not running**

   - Verify workflow job names match required checks
   - Check that workflows trigger on pull requests
   - Ensure GitHub Actions is enabled

2. **Cannot merge despite passing checks**

   - Check if branch is up to date with base branch
   - Verify all required reviewers have approved
   - Ensure all conversations are resolved

3. **Admin override not working**
   - Check "Restrict pushes that create files" setting
   - Verify admin permissions in repository settings
   - Consider if "Include administrators" is enabled

### Getting Help

1. **Check GitHub Status**: https://githubstatus.com
2. **Review GitHub Docs**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches
3. **Contact Support**: If you have a GitHub Enterprise account

## Security Considerations

1. **Signed Commits**: Enable signed commit requirements for maximum security
2. **Branch Deletion**: Disable branch deletion for important branches
3. **Force Push**: Never allow force push to `main` or `develop`
4. **Admin Bypass**: Consider carefully before allowing admin bypass
5. **Review Requirements**: Ensure appropriate number of reviewers for code criticality

## Maintenance

### Regular Tasks

1. **Review Protection Rules**: Monthly review of rules and effectiveness
2. **Update Status Checks**: Add new checks as CI/CD pipeline evolves
3. **Audit Permissions**: Quarterly review of who can bypass protections
4. **Team Updates**: Update CODEOWNERS when team structure changes

### Monitoring

- Monitor failed merge attempts in repository insights
- Track bypass usage by administrators
- Review pull request metrics for bottlenecks

---

**Next Steps**: After configuring branch protection rules, test the complete workflow by creating test pull requests and ensuring all protections work as expected.
