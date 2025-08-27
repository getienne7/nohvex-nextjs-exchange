# GitHub Repository Secrets Setup Guide

This guide explains how to set up the required GitHub repository secrets for the NOHVEX CI/CD pipeline.

## Required Secrets

### 1. Vercel Deployment Secrets

#### VERCEL_TOKEN

- **Description**: Vercel API token for deployment automation
- **How to get**:
  1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
  2. Click on your profile → Settings → Tokens
  3. Create a new token with appropriate scope
  4. Copy the token value

#### VERCEL_ORG_ID

- **Description**: Your Vercel organization/team ID
- **How to get**:
  1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
  2. Navigate to Settings → General
  3. Copy the "Team ID" or "Organization ID"

#### VERCEL_PROJECT_ID

- **Description**: Your specific project ID in Vercel
- **How to get**:
  1. Go to your project in Vercel Dashboard
  2. Navigate to Settings → General
  3. Copy the "Project ID"

### 2. Database Secrets

#### DATABASE_URL

- **Description**: Production PostgreSQL connection string
- **Format**: `postgresql://username:password@host:port/database?schema=public`
- **Example**: `postgresql://user:pass@db.example.com:5432/nohvex_prod?schema=public`

#### DIRECT_URL

- **Description**: Direct PostgreSQL connection string (for migrations)
- **Format**: Same as DATABASE_URL but with direct connection parameters
- **Note**: Some hosting providers require this for connection pooling

### 3. Application Secrets

#### NEXTAUTH_SECRET

- **Description**: Secret key for NextAuth.js session encryption
- **How to generate**:
  ```bash
  openssl rand -base64 32
  ```
- **Requirements**: Must be at least 32 characters long

#### NEXTAUTH_URL

- **Description**: Canonical URL of your application
- **Production**: `https://your-domain.com`
- **Staging**: `https://your-staging-domain.vercel.app`

### 4. External API Keys

#### NOWNODES_API_KEY

- **Description**: NOWNodes API key for blockchain data
- **How to get**:
  1. Sign up at [NOWNodes](https://nownodes.io/)
  2. Go to API Keys section
  3. Generate a new API key
  4. Copy the key value

#### AWS_ACCESS_KEY_ID (Optional)

- **Description**: AWS access key for SES email service
- **Required**: Only if using AWS SES for email notifications

#### AWS_SECRET_ACCESS_KEY (Optional)

- **Description**: AWS secret key for SES email service
- **Required**: Only if using AWS SES for email notifications

### 5. Notification Secrets (Optional)

#### SLACK_WEBHOOK_URL

- **Description**: Slack webhook URL for deployment notifications
- **How to get**:
  1. Go to your Slack workspace
  2. Navigate to Apps → Incoming Webhooks
  3. Create a new webhook
  4. Copy the webhook URL

## How to Add Secrets to GitHub

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"

### Step 2: Add Repository Secrets

1. Click "New repository secret"
2. Enter the secret name (exactly as listed above)
3. Paste the secret value
4. Click "Add secret"

### Step 3: Verify Secrets

Ensure all required secrets are added:

- ✅ VERCEL_TOKEN
- ✅ VERCEL_ORG_ID
- ✅ VERCEL_PROJECT_ID
- ✅ DATABASE_URL
- ✅ DIRECT_URL
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ NOWNODES_API_KEY
- ✅ SLACK_WEBHOOK_URL (optional)

## Environment-Specific Secrets

### Production Environment

All secrets should be set with production values.

### Staging Environment

You may want to create separate secrets for staging:

- `STAGING_DATABASE_URL`
- `STAGING_NEXTAUTH_URL`
- `STAGING_NOWNODES_API_KEY`

## Security Best Practices

1. **Rotate Secrets Regularly**: Change API keys and tokens periodically
2. **Use Least Privilege**: Give tokens only the minimum required permissions
3. **Monitor Usage**: Check for unusual API usage patterns
4. **Backup Secrets**: Keep encrypted backups of critical secrets
5. **Environment Separation**: Use different secrets for production/staging

## Troubleshooting

### Common Issues

1. **Vercel Deployment Fails**

   - Check VERCEL_TOKEN has correct permissions
   - Verify VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct

2. **Database Connection Errors**

   - Ensure DATABASE_URL format is correct
   - Check if database allows connections from GitHub Actions IPs

3. **API Rate Limits**
   - Verify NOWNODES_API_KEY is valid and has sufficient quota
   - Check if any API keys have expired

### Getting Help

If you encounter issues:

1. Check GitHub Actions logs for specific error messages
2. Verify secret names match exactly (case-sensitive)
3. Test API keys independently before adding to GitHub
4. Contact the team for assistance with sensitive production secrets

## Next Steps

After setting up secrets:

1. ✅ Test the CI/CD pipeline with a test commit
2. ✅ Configure branch protection rules
3. ✅ Set up monitoring and alerting
4. ✅ Document the deployment process
