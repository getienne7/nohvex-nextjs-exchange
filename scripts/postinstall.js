#!/usr/bin/env node

/**
 * Custom postinstall script for Prisma
 * This script handles Prisma generation more gracefully to avoid issues in Vercel environment
 */

import { spawn } from 'child_process';
import { join } from 'path';

async function runPrismaGenerate() {
  console.log('📦 Running comprehensive Prisma generation script...');
  
  // Run the comprehensive Prisma generation script
  const scriptPath = join(process.cwd(), 'scripts/generate-prisma.js');
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Prisma generation completed successfully');
        resolve();
      } else {
        console.warn(`⚠️  Prisma generation exited with code ${code}`);
        resolve(); // Don't reject to avoid breaking the build
      }
    });
    
    child.on('error', (error) => {
      console.warn('⚠️  Prisma generation failed:', error.message);
      resolve(); // Don't reject to avoid breaking the build
    });
  });
}

// Run the script
runPrismaGenerate().then(() => {
  console.log('🏁 Postinstall script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Postinstall script failed:', error);
  process.exit(0); // Don't fail the build
});