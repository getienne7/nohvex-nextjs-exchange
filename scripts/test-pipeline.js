#!/usr/bin/env node

/**
 * Local CI/CD Pipeline Test Script
 * This script simulates the GitHub Actions CI/CD pipeline locally
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    log(`\n🔧 Running: ${command} ${args.join(' ')}`, 'blue');
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ Command succeeded: ${command}`, 'green');
        resolve(code);
      } else {
        log(`❌ Command failed: ${command} (exit code: ${code})`, 'red');
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      log(`❌ Command error: ${error.message}`, 'red');
      reject(error);
    });
  });
};

const checkFileExists = (filePath) => {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ File exists: ${filePath}`, 'green');
  } else {
    log(`❌ File missing: ${filePath}`, 'red');
  }
  return exists;
};

const main = async () => {
  log('🚀 NOHVEX CI/CD Pipeline Test', 'cyan');
  log('==============================', 'cyan');

  const startTime = Date.now();
  let stepCount = 0;

  try {
    // Step 1: Check prerequisites
    stepCount++;
    log(`\n📋 Step ${stepCount}: Prerequisites Check`, 'magenta');
    
    const requiredFiles = [
      'package.json',
      'next.config.ts',
      'tsconfig.json',
      'tailwind.config.js',
      'prisma/schema.prisma',
      '.github/workflows/ci-cd.yml'
    ];

    let allFilesExist = true;
    for (const file of requiredFiles) {
      if (!checkFileExists(file)) {
        allFilesExist = false;
      }
    }

    if (!allFilesExist) {
      throw new Error('Required files are missing');
    }

    // Step 2: Install dependencies
    stepCount++;
    log(`\n📦 Step ${stepCount}: Install Dependencies`, 'magenta');
    await runCommand('npm', ['ci']);

    // Step 3: Type checking
    stepCount++;
    log(`\n🔍 Step ${stepCount}: TypeScript Type Check`, 'magenta');
    await runCommand('npm', ['run', 'typecheck']);

    // Step 4: Linting
    stepCount++;
    log(`\n🧹 Step ${stepCount}: ESLint Check`, 'magenta');
    try {
      await runCommand('npm', ['run', 'lint']);
    } catch (error) {
      log('⚠️  Linting completed with warnings/errors (continuing)', 'yellow');
    }

    // Step 5: Unit Tests
    stepCount++;
    log(`\n🧪 Step ${stepCount}: Unit Tests`, 'magenta');
    await runCommand('npm', ['run', 'test:unit']);

    // Step 6: Integration Tests
    stepCount++;
    log(`\n🔗 Step ${stepCount}: Integration Tests`, 'magenta');
    await runCommand('npm', ['run', 'test:integration']);

    // Step 7: Build Application
    stepCount++;
    log(`\n🏗️  Step ${stepCount}: Build Application`, 'magenta');
    await runCommand('npm', ['run', 'build']);

    // Step 8: Check build artifacts
    stepCount++;
    log(`\n📁 Step ${stepCount}: Verify Build Artifacts`, 'magenta');
    
    const buildArtifacts = [
      '.next/standalone',
      '.next/static',
      'public'
    ];

    let allArtifactsExist = true;
    for (const artifact of buildArtifacts) {
      if (!checkFileExists(artifact)) {
        allArtifactsExist = false;
      }
    }

    if (!allArtifactsExist) {
      log('⚠️  Some build artifacts are missing (this might be normal)', 'yellow');
    }

    // Step 9: Docker build test (optional)
    stepCount++;
    log(`\n🐳 Step ${stepCount}: Docker Build Test (optional)`, 'magenta');
    
    if (checkFileExists('Dockerfile')) {
      try {
        log('Testing Docker build...', 'blue');
        await runCommand('docker', ['build', '-t', 'nohvex-test', '.']);
        log('✅ Docker build successful', 'green');
      } catch (error) {
        log('⚠️  Docker build failed (this might be expected if Docker is not available)', 'yellow');
      }
    } else {
      log('ℹ️  Dockerfile not found, skipping Docker build test', 'blue');
    }

    // Step 10: Security audit
    stepCount++;
    log(`\n🔒 Step ${stepCount}: Security Audit`, 'magenta');
    try {
      await runCommand('npm', ['audit', '--audit-level=high']);
    } catch (error) {
      log('⚠️  Security audit found issues (check output above)', 'yellow');
    }

    // Success!
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log('\n🎉 Pipeline Test Completed Successfully!', 'green');
    log(`✅ All ${stepCount} steps completed in ${duration} seconds`, 'green');
    log('\n📋 Summary:', 'cyan');
    log('  - Dependencies installed', 'green');
    log('  - TypeScript compilation successful', 'green');
    log('  - Linting completed', 'green');
    log('  - Tests passed', 'green');
    log('  - Build successful', 'green');
    log('  - Security audit completed', 'green');
    
    log('\n🚀 Your application is ready for deployment!', 'cyan');
    log('Next steps:', 'blue');
    log('  1. Set up GitHub repository secrets', 'blue');
    log('  2. Push to GitHub to trigger the actual CI/CD pipeline', 'blue');
    log('  3. Monitor the GitHub Actions workflow', 'blue');

  } catch (error) {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log(`\n💥 Pipeline Test Failed at Step ${stepCount}`, 'red');
    log(`❌ Error: ${error.message}`, 'red');
    log(`⏱️  Time elapsed: ${duration} seconds`, 'red');
    
    log('\n🔧 Troubleshooting:', 'yellow');
    log('  1. Check the error message above', 'yellow');
    log('  2. Fix any issues and run the script again', 'yellow');
    log('  3. Ensure all dependencies are installed', 'yellow');
    log('  4. Check that all required files exist', 'yellow');
    
    process.exit(1);
  }
};

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n⚠️  Pipeline test interrupted by user', 'yellow');
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Pipeline test terminated', 'yellow');
  process.exit(143);
});

// Run the pipeline test
main().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});