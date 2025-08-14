#!/usr/bin/env node

/**
 * Database deployment script for production
 * This script will:
 * 1. Generate Prisma Client
 * 2. Deploy database schema (prisma db push)
 * 3. Verify the deployment
 */

import { exec } from 'child_process'
import util from 'util'
const execPromise = util.promisify(exec)

async function deployDatabase() {
  console.log('🚀 Starting database deployment...')

  try {
    // Step 1: Generate Prisma Client
    console.log('📦 Generating Prisma Client...')
    await execPromise('npx prisma generate')
    console.log('✅ Prisma Client generated successfully')

    // Step 2: Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not found. Skipping database deployment.')
      console.log('ℹ️  Application will use in-memory storage.')
      return
    }

    console.log('🗄️  DATABASE_URL found, proceeding with database deployment...')

    // Step 3: Deploy database schema (creates tables if they don't exist)
    console.log('📋 Deploying database schema...')
    const { stdout, stderr } = await execPromise('npx prisma db push --accept-data-loss')
    
    if (stderr && !stderr.includes('warnings')) {
      console.log('⚠️  Prisma warnings:', stderr)
    }
    
    console.log('✅ Database schema deployed successfully')
    
    // Step 4: Verify deployment
    console.log('🔍 Verifying database deployment...')
    const mod = await import('./init-db.js')
    await mod.initializeDatabase()
    
    console.log('🎉 Database deployment completed successfully!')

  } catch (error) {
    console.error('❌ Database deployment failed:', error.message)
    
    if (error.message.includes('P1001')) {
      console.log('💡 Database server is unreachable. Check your DATABASE_URL.')
    }
    
    if (error.message.includes('P3014')) {
      console.log('💡 Database does not exist. Make sure your database is created.')
    }

    // Don't fail the build - let the app run with in-memory storage
    console.log('🔄 Application will continue with in-memory storage fallback.')
    process.exit(0)
  }
}

// Run the deployment
if (process.argv[1] && new URL(import.meta.url).pathname.endsWith(new URL(`file://${process.argv[1]}`).pathname)) {
  deployDatabase()
}

export { deployDatabase }
