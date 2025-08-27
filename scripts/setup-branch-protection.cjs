#!/usr/bin/env node

/**
 * GitHub Branch Protection Setup Script
 * Automatically configures branch protection rules for the NOHVEX project
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

// Branch protection configurations
const protectionConfigs = {
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
    enforce_admins: false,
    required_pull_request_reviews: {
      required_approving_review_count: 2,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      dismissal_restrictions: {
        users: [],
        teams: []
      }
    },
    restrictions: null,
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
    enforce_admins: false,
    required_pull_request_reviews: {
      required_approving_review_count: 1,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false
    },
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false
  }
};

const setBranchProtection = (repo, branch, config, token) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(config);
    
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repo}/branches/${branch}/protection`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'NOHVEX-Setup-Script'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          log(`✅ Branch protection set for ${branch}`, 'green');
          resolve(responseData);
        } else {
          log(`❌ Failed to set protection for ${branch}: ${res.statusCode}`, 'red');
          log(`Response: ${responseData}`, 'red');
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Request error: ${error.message}`, 'red');
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

const checkBranchExists = (repo, branch, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${repo}/branches/${branch}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NOHVEX-Setup-Script'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
};

const main = async () => {
  log('🛡️  NOHVEX Branch Protection Setup', 'cyan');
  log('=================================', 'cyan');
  log('', 'reset');

  try {
    // Check if GitHub CLI is available and get repository info
    let repoFullName;
    let githubToken;

    try {
      log('📍 Detecting repository...', 'blue');
      repoFullName = await runCommand('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
      log(`Repository: ${repoFullName}`, 'green');

      // Get GitHub token from CLI
      githubToken = await runCommand('gh', ['auth', 'token']);
      log('✅ GitHub token obtained', 'green');
      
    } catch (error) {
      log('❌ GitHub CLI not available or not authenticated', 'red');
      log('Please run: gh auth login', 'yellow');
      log('Or set GITHUB_TOKEN environment variable', 'yellow');
      
      // Try environment variable
      githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        throw new Error('No GitHub token available');
      }
      
      // Ask user for repository name
      log('Please ensure you are in the correct repository directory', 'yellow');
      repoFullName = process.env.GITHUB_REPOSITORY || 'your-org/nohvex-nextjs-exchange';
      log(`Using repository: ${repoFullName}`, 'yellow');
    }

    log('', 'reset');
    log('🔧 Setting up branch protection rules...', 'magenta');

    // Set up protection for each branch
    for (const [branchName, config] of Object.entries(protectionConfigs)) {
      log(`\n📋 Configuring ${branchName} branch protection...`, 'blue');
      
      // Check if branch exists
      const branchExists = await checkBranchExists(repoFullName, branchName, githubToken);
      
      if (!branchExists) {
        log(`⚠️  Branch '${branchName}' does not exist, skipping...`, 'yellow');
        log(`   Create the branch first: git checkout -b ${branchName}`, 'yellow');
        continue;
      }

      try {
        await setBranchProtection(repoFullName, branchName, config, githubToken);
      } catch (error) {
        log(`⚠️  Could not set protection for ${branchName}: ${error.message}`, 'yellow');
        log(`   This might be due to insufficient permissions`, 'yellow');
      }
    }

    log('', 'reset');
    log('✅ Branch protection setup completed!', 'green');
    log('', 'reset');
    
    log('📋 Summary of Protection Rules:', 'cyan');
    log('', 'reset');
    log('🔒 Main Branch:', 'magenta');
    log('  - Requires 2 approving reviews', 'blue');
    log('  - Requires code owner review', 'blue');
    log('  - Requires passing status checks', 'blue');
    log('  - Requires conversation resolution', 'blue');
    log('  - No force pushes allowed', 'blue');
    log('  - No deletions allowed', 'blue');
    log('', 'reset');
    
    log('🔒 Develop Branch:', 'magenta');
    log('  - Requires 1 approving review', 'blue');
    log('  - Requires passing status checks', 'blue');
    log('  - No force pushes allowed', 'blue');
    log('  - No deletions allowed', 'blue');
    log('', 'reset');

    log('📝 Next Steps:', 'cyan');
    log('1. Verify protection rules in GitHub repository settings', 'yellow');
    log('2. Test the workflow by creating a pull request', 'yellow');
    log('3. Update CODEOWNERS file with actual team members', 'yellow');
    log('4. Train team members on the new workflow', 'yellow');
    log('', 'reset');

    log('🔗 Repository Settings:', 'blue');
    log(`https://github.com/${repoFullName}/settings/branches`, 'blue');

  } catch (error) {
    log('', 'reset');
    log('💥 Branch protection setup failed!', 'red');
    log(`❌ Error: ${error.message}`, 'red');
    log('', 'reset');
    
    log('🔧 Troubleshooting:', 'yellow');
    log('1. Ensure you have admin permissions on the repository', 'yellow');
    log('2. Verify GitHub token has appropriate scopes', 'yellow');
    log('3. Check that target branches exist', 'yellow');
    log('4. Try manual setup via GitHub web interface', 'yellow');
    log('', 'reset');
    
    process.exit(1);
  }
};

// Handle interruptions
process.on('SIGINT', () => {
  log('\n⚠️  Setup interrupted by user', 'yellow');
  process.exit(130);
});

// Run the setup
main().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});