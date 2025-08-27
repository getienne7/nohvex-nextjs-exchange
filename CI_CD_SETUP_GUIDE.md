# Enhanced CI/CD Setup Guide

This guide walks you through setting up the complete CI/CD pipeline for NOHVEX using GitHub Actions and Vercel.

## 🎯 Overview

The enhanced CI/CD pipeline provides:

- **Comprehensive testing** (unit, integration, E2E)
- **Code quality checks** (TypeScript, ESLint, security audit)
- **Docker integration** with container scanning
- **Advanced security scanning** (CodeQL, Semgrep)
- **Performance monitoring** (Lighthouse, API load testing)
- **Automated dependency updates** (Dependabot)
- **Staging and production deployments**
- **Slack notifications** for deployment status
- **Artifact management** and build caching

## 📋 Prerequisites

1. **GitHub repository** with the NOHVEX code
2. **Vercel account** with project already deployed
3. **Vercel CLI** installed locally (optional but recommended)

## 🔧 Setup Steps

### 1. GitHub Repository Setup

1. **Create branches**:

   ```bash
   # Create develop branch from main
   git checkout -b develop
   git push -u origin develop

   # Set develop as default branch for PRs (in GitHub settings)
   ```

2. **Branch protection rules** (GitHub Settings → Branches):
   - **Protect `main`**: Require PR reviews, status checks
   - **Protect `develop`**: Require status checks

### 2. Vercel Integration

1. **Get Vercel tokens**:

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login and get project info
   vercel login
   vercel project ls
   ```

2. **Get required secrets**:
   - `VERCEL_TOKEN`: Personal access token from Vercel dashboard
   - `VERCEL_ORG_ID`: Organization ID (from vercel.json or CLI)
   - `VERCEL_PROJECT_ID`: Project ID (from vercel.json or CLI)

### 3. GitHub Secrets Configuration

Go to GitHub → Settings → Secrets and variables → Actions

Add these **Repository secrets**:

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

### 4. Environment Configuration

#### Staging Environment

1. **Create staging environment** in GitHub:
   - Go to Settings → Environments
   - Create `staging` environment
   - Add environment-specific secrets if needed

#### Production Environment

1. **Create production environment** in GitHub:
   - Create `production` environment
   - **Enable required reviewers** for production deployments
   - Add production-specific secrets

## 🔄 Workflow Overview

```mermaid
graph TB
    A[Developer Push] --> B[GitHub Actions]
    B --> C[Code Quality Checks]
    B --> D[Unit Tests]
    B --> E[Build Check]
    C --> F{All Checks Pass?}
    D --> F
    E --> F
    F -->|Yes| G[Security Scan]
    F -->|No| H[❌ Fail Build]
    G --> I{Branch?}
    I -->|develop| J[Deploy to Staging]
    I -->|main| K[Deploy to Production]
    J --> L[Staging URL]
    K --> M[Production URL]
```

## 📝 Branch Strategy

### Development Flow

```
feature/new-feature → develop → main
```

### Workflow:

1. **Feature development**: Create feature branch from `develop`
2. **Pull request**: Target `develop` branch
3. **Staging deployment**: Automatic when merged to `develop`
4. **Production release**: PR from `develop` to `main`
5. **Production deployment**: Automatic when merged to `main`

## 🚀 Using the CI/CD Pipeline

### For Feature Development

1. **Create feature branch**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop and test locally**:

   ```bash
   # Use Docker for consistent environment
   npm run docker:dev

   # Make your changes
   # Test locally
   ```

3. **Push and create PR**:

   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name

   # Create PR to develop branch on GitHub
   ```

4. **CI/CD automatically**:
   - Runs code quality checks
   - Runs tests
   - Builds application
   - Reports status on PR

### For Staging Release

1. **Merge to develop**:

   - PR gets approved and merged
   - GitHub Actions automatically deploys to staging
   - Get staging URL from deployment

2. **Test on staging**:
   - Verify features work correctly
   - Test with production-like environment
   - Check for any integration issues

### For Production Release

1. **Create production PR**:

   ```bash
   git checkout main
   git pull origin main
   git checkout develop
   git pull origin develop

   # Create PR from develop to main
   ```

2. **Production deployment**:
   - PR requires approval (if environment protection enabled)
   - Automatic deployment to production after merge
   - Monitor deployment and application health

## 🔍 Monitoring and Debugging

### GitHub Actions

1. **View workflow runs**:

   - Go to Actions tab in GitHub
   - Click on specific workflow run
   - View logs for each job

2. **Common failure points**:
   - **TypeScript errors**: Fix compilation issues
   - **ESLint errors**: Fix linting issues
   - **Build failures**: Check environment variables
   - **Test failures**: Fix failing tests

### Vercel Deployments

1. **View deployments**:

   - Vercel dashboard shows all deployments
   - Click deployment for logs and details
   - Check function logs for API issues

2. **Environment variables**:
   - Ensure all required env vars are set in Vercel
   - Check staging vs production configurations

## 🛠️ Customizing the Pipeline

### Adding Tests

When you implement tests, update `.github/workflows/ci-cd.yml`:

```yaml
- name: Run Tests
  run: npm test # or your test command
  env:
    DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
    NEXTAUTH_SECRET: test-secret-key
```

### Adding Build Steps

For additional build steps:

```yaml
- name: Custom Build Step
  run: npm run your-custom-script
```

### Environment-Specific Configuration

Add environment-specific secrets in GitHub:

1. Go to Settings → Environments
2. Select environment (staging/production)
3. Add environment secrets
4. Reference in workflow: `${{ secrets.ENV_SPECIFIC_SECRET }}`

## 🔒 Security Considerations

### Secrets Management

- Never commit secrets to repository
- Use environment-specific secrets when needed
- Rotate tokens regularly

### Production Safety

- Require PR reviews for main branch
- Use environment protection for production
- Monitor deployment notifications

### Security Scanning

- Trivy scans for vulnerabilities
- npm audit runs on every build
- Review security alerts promptly

## 📈 Best Practices

### Commit Messages

```
feat: add new portfolio feature
fix: resolve wallet connection issue
docs: update API documentation
test: add unit tests for trading logic
```

### PR Guidelines

- Clear description of changes
- Link to related issues
- Test coverage information
- Breaking change notifications

### Deployment Strategy

- **Staging first**: Always test in staging
- **Small releases**: Frequent, smaller deployments
- **Monitor closely**: Watch for issues after deployment
- **Quick rollback**: Use git revert if needed

## 🚨 Troubleshooting

### Common Issues

1. **Vercel deployment fails**:

   - Check environment variables
   - Verify build succeeds locally
   - Review Vercel function logs

2. **GitHub Actions fails**:

   - Check workflow syntax
   - Verify secrets are set
   - Review action logs

3. **TypeScript errors in CI**:

   - Ensure `ignoreBuildErrors: false` in next.config.ts
   - Fix all TypeScript errors locally first

4. **Database migrations in staging**:
   - Ensure DATABASE_URL is correct for staging
   - Run migrations as part of deployment

### Getting Help

1. **Check logs**: GitHub Actions and Vercel provide detailed logs
2. **Local testing**: Use Docker to replicate CI environment
3. **Documentation**: Refer to GitHub Actions and Vercel docs
4. **Community**: GitHub Discussions or relevant forums

## 🎉 Success Metrics

Monitor these metrics to ensure CI/CD effectiveness:

- **Build success rate**: Should be >95%
- **Deployment frequency**: Aim for daily deployments
- **Lead time**: Time from commit to production
- **Mean time to recovery**: How quickly issues are resolved
- **Test coverage**: Gradually increase coverage

This CI/CD pipeline provides a robust foundation for developing and deploying the NOHVEX platform safely and efficiently.
