#!/usr/bin/env node

/**
 * GitHub Branch Protection Validation Script
 * Checks if branch protection rules are properly configured
 */

const https = require('https');
const { spawn } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Command failed: ${output}`));
      }
    });
  });
};

const getBranchProtection = (repo, branch, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repo}/branches/${branch}/protection`,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NOHVEX-Validation-Script'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else if (res.statusCode === 404) {
          resolve(null); // No protection rules
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const validateBranchProtection = (branchName, protection, expectedConfig) => {
  log(`\n🔍 Validating ${branchName} branch protection...`, 'blue');
  
  if (!protection) {
    log(`❌ No protection rules found for ${branchName}`, 'red');
    return false;
  }

  let isValid = true;
  const issues = [];

  // Check required status checks
  if (expectedConfig.required_status_checks) {
    if (!protection.required_status_checks) {
      issues.push('No required status checks configured');
      isValid = false;
    } else {
      const expected = expectedConfig.required_status_checks.contexts;
      const actual = protection.required_status_checks.contexts || [];
      
      for (const check of expected) {
        if (!actual.includes(check)) {
          issues.push(`Missing required status check: ${check}`);
          isValid = false;
        }
      }
      
      if (protection.required_status_checks.strict !== expectedConfig.required_status_checks.strict) {
        issues.push('Strict status checks not configured correctly');
        isValid = false;
      }
    }
  }

  // Check pull request reviews
  if (expectedConfig.required_pull_request_reviews) {
    if (!protection.required_pull_request_reviews) {
      issues.push('No pull request review requirements configured');
      isValid = false;
    } else {
      const expected = expectedConfig.required_pull_request_reviews;
      const actual = protection.required_pull_request_reviews;
      
      if (actual.required_approving_review_count !== expected.required_approving_review_count) {
        issues.push(`Wrong number of required reviews: expected ${expected.required_approving_review_count}, got ${actual.required_approving_review_count}`);
        isValid = false;
      }
      
      if (actual.dismiss_stale_reviews !== expected.dismiss_stale_reviews) {
        issues.push('Dismiss stale reviews not configured correctly');
        isValid = false;
      }
      
      if (expected.require_code_owner_reviews && !actual.require_code_owner_reviews) {
        issues.push('Code owner reviews not required');
        isValid = false;
      }
    }
  }

  // Check force push and deletion restrictions
  if (protection.allow_force_pushes?.enabled !== false && expectedConfig.allow_force_pushes === false) {
    issues.push('Force pushes should be disabled');
    isValid = false;
  }

  if (protection.allow_deletions?.enabled !== false && expectedConfig.allow_deletions === false) {
    issues.push('Branch deletions should be disabled');
    isValid = false;
  }

  // Check conversation resolution requirement
  if (expectedConfig.required_conversation_resolution && !protection.required_conversation_resolution?.enabled) {
    issues.push('Conversation resolution should be required');
    isValid = false;
  }

  // Report results
  if (isValid) {
    log(`✅ ${branchName} branch protection is correctly configured`, 'green');
  } else {
    log(`❌ ${branchName} branch protection has issues:`, 'red');
    for (const issue of issues) {
      log(`  - ${issue}`, 'red');
    }
  }

  return isValid;
};

const main = async () => {
  log('🔍 NOHVEX Branch Protection Validation', 'cyan');
  log('====================================', 'cyan');
  log('', 'reset');

  try {
    // Get repository info and token
    let repoFullName;
    let githubToken;

    try {
      log('📍 Detecting repository...', 'blue');
      repoFullName = await runCommand('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
      log(`Repository: ${repoFullName}`, 'green');

      githubToken = await runCommand('gh', ['auth', 'token']);
      log('✅ GitHub token obtained', 'green');
      
    } catch (error) {
      githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        throw new Error('No GitHub token available. Run: gh auth login');
      }
      
      repoFullName = process.env.GITHUB_REPOSITORY || 'your-org/nohvex-nextjs-exchange';
      log(`Using repository: ${repoFullName}`, 'yellow');
    }

    // Expected configurations
    const expectedConfigs = {
      main: {
        required_status_checks: {
          strict: true,
          contexts: [
            "Code Quality",
            "Unit & Integration Tests",
            "Build Application",
            "Docker Build & Scan",
            "Security Analysis"
          ]
        },
        required_pull_request_reviews: {
          required_approving_review_count: 2,
          dismiss_stale_reviews: true,
          require_code_owner_reviews: true
        },
        required_conversation_resolution: true,
        allow_force_pushes: false,
        allow_deletions: false
      },
      develop: {
        required_status_checks: {
          strict: true,
          contexts: [
            "Code Quality", 
            "Unit & Integration Tests",
            "Build Application"
          ]
        },
        required_pull_request_reviews: {
          required_approving_review_count: 1,
          dismiss_stale_reviews: true,
          require_code_owner_reviews: false
        },
        allow_force_pushes: false,
        allow_deletions: false
      }
    };

    let allValid = true;

    // Validate each branch
    for (const [branchName, expectedConfig] of Object.entries(expectedConfigs)) {
      try {
        const protection = await getBranchProtection(repoFullName, branchName, githubToken);
        const isValid = validateBranchProtection(branchName, protection, expectedConfig);
        if (!isValid) {
          allValid = false;
        }
      } catch (error) {
        log(`❌ Error checking ${branchName} branch: ${error.message}`, 'red');
        allValid = false;
      }
    }

    // Check CODEOWNERS file
    log('\n📋 Checking CODEOWNERS configuration...', 'blue');
    try {
      await runCommand('test', ['-f', '.github/CODEOWNERS']);
      log('✅ CODEOWNERS file exists', 'green');
    } catch (error) {
      log('⚠️  CODEOWNERS file not found', 'yellow');
      log('   Consider creating .github/CODEOWNERS for automatic reviewer assignment', 'yellow');
    }

    // Generate report
    log('\n📊 Validation Summary', 'cyan');
    log('===================', 'cyan');
    
    if (allValid) {
      log('\n🎉 All branch protection rules are correctly configured!', 'green');
      log('\n✅ Your repository is properly secured with:', 'green');
      log('  - Required status checks', 'green');
      log('  - Pull request review requirements', 'green');
      log('  - Force push and deletion restrictions', 'green');
      log('  - Conversation resolution requirements', 'green');
      
      log('\n📝 Recommendations:', 'blue');
      log('  - Test the workflow with a sample pull request', 'blue');
      log('  - Train team members on the new process', 'blue');
      log('  - Review and update CODEOWNERS regularly', 'blue');
      
    } else {
      log('\n⚠️  Some branch protection rules need attention', 'yellow');
      log('\nTo fix issues:', 'yellow');
      log('  1. Review the issues listed above', 'yellow');
      log('  2. Update rules via GitHub web interface or API', 'yellow');
      log('  3. Run this validation script again', 'yellow');
      log('  4. Consider using the setup script: node scripts/setup-branch-protection.cjs', 'yellow');
    }

    log('\n🔗 GitHub Repository Settings:', 'blue');
    log(`https://github.com/${repoFullName}/settings/branches`, 'blue');

  } catch (error) {
    log('\n💥 Validation failed!', 'red');
    log(`❌ Error: ${error.message}`, 'red');
    
    log('\n🔧 Troubleshooting:', 'yellow');
    log('1. Ensure GitHub token has appropriate permissions', 'yellow');
    log('2. Verify repository name is correct', 'yellow');
    log('3. Check network connectivity', 'yellow');
    
    process.exit(1);
  }
};

// Run validation
main().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});